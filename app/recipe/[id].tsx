import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../ThemeProvider';
import { INGREDIENTS, STORES, euro, euroSpoken, recipeQty } from '../../data';
import { useCatalog } from '../../features/catalog/CatalogProvider';
import { Button, IconButton, StateView, Tag, entering, useReduceMotion } from '../../components/ui';
import { ExpressiveShape } from '../../components/ExpressiveShape';
import { usePlanning } from '../../features/planning/planningStore';
import { DAYS, dayIndex, dayTitle, startOfWeek } from '../../features/planning/week';

const HERO_HEIGHT = 216;
const FLOWER = 200;
const COOKIE = 80;
const STEP_BADGE = 32;
const LINE_MIN_HEIGHT = 44;
const HAIRLINE_GAP = 2;
// Tour complet de la fleur décorative : rotation continue, ornementale, comme dans la maquette.
const SPIN_MS = 40000;

// Fleur de l'en-tête : tourne lentement, reste fixe si « Réduire les animations » est activé.
function SpinningFlower({ color }: { color: string }) {
  const reduced = useReduceMotion();
  const rotation = useSharedValue(0);
  useEffect(() => {
    if (reduced) {
      cancelAnimation(rotation);
      rotation.value = 0;
    } else {
      rotation.value = withRepeat(withTiming(360, { duration: SPIN_MS, easing: Easing.linear }), -1, false);
    }
  }, [reduced, rotation]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));
  return (
    <Animated.View style={[styles.flower, style]}>
      <ExpressiveShape name="flower" size={FLOWER} color={color} />
    </Animated.View>
  );
}

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const reduced = useReduceMotion();
  const { colors, type, shape, spacing } = useTheme();
  const { plan, slots, assignRecipe } = usePlanning();
  const { findRecipe, inLibrary, addRecipe, store, recipeCost, portionCost } = useCatalog();
  const recipe = findRecipe(id);
  const [message, setMessage] = useState<string | null>(null);

  const say = (text: string) => {
    setMessage(text);
    AccessibilityInfo.announceForAccessibility(text);
  };

  // Prochain créneau libre de la semaine, à partir d'aujourd'hui, parmi les créneaux choisis à l'onboarding.
  const handleAddToPlan = () => {
    if (!recipe) return;
    const today = new Date();
    for (let i = dayIndex(today); i < DAYS.length; i++) {
      const free = slots.find((slot) => !plan.meals.find((m) => m.day === DAYS[i].id && m.slot === slot)?.recipeId);
      if (free) {
        assignRecipe(DAYS[i].id, free, recipe.id);
        say(`Ajouté au planning : ${dayTitle(startOfWeek(today), i)}, ${free}`);
        return;
      }
    }
    say('Ta semaine est complète. Retire un repas dans l’onglet Semaine pour faire de la place.');
  };

  const handleImport = () => {
    if (!recipe) return;
    addRecipe(recipe);
    say(`${recipe.name} ajouté à tes recettes`);
  };

  if (!recipe) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
        <StateView tone="error" title="Recette introuvable" text="Elle a peut-être été supprimée." action="Retour aux recettes" onAction={() => router.back()} />
      </SafeAreaView>
    );
  }

  const total = recipeCost(recipe);
  const perPortion = portionCost(recipe);
  const storeName = STORES[store];
  const imported = inLibrary(recipe.id);

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing[4] }}>
        <View
          style={[
            styles.hero,
            {
              height: HERO_HEIGHT + insets.top,
              backgroundColor: colors.tertiaryContainer,
              borderBottomLeftRadius: shape.xxl,
              borderBottomRightRadius: shape.xxl,
            },
          ]}
        >
          <View style={[styles.decor, { top: insets.top + spacing[5] }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <SpinningFlower color={colors.tertiary} />
          </View>
          <View style={styles.cookie} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <ExpressiveShape name="cookie" size={COOKIE} color={colors.warningContainer} />
          </View>
          <View style={[styles.heroBar, { top: insets.top + spacing[2], left: spacing[3], right: spacing[3] }]}>
            <IconButton icon="arrow-back" label="Retour" variant="tonal" onPress={() => router.back()} />
          </View>
          <View style={[styles.heroTitle, { left: spacing[6], bottom: spacing[5], gap: spacing[2] }]}>
            <Text accessibilityRole="header" style={[type.headlineLarge, { color: colors.onTertiaryContainer }]}>{recipe.name}</Text>
            <View style={[styles.wrap, { gap: spacing[1] }]}>{recipe.tags.map((t) => <Tag key={t} label={t} />)}</View>
          </View>
        </View>

        <Animated.View entering={entering(1, reduced)} style={{ padding: spacing[4], gap: spacing[4] }}>
          <View style={[styles.inline, { gap: spacing[2] }]}>
            <Stat value={`${recipe.time} min`} label="préparation" spoken={`${recipe.time} minutes de préparation`} />
            <Stat value={String(recipe.servings)} label="portions" spoken={`${recipe.servings} portions`} />
            <Stat value={euro(perPortion)} label="par portion" spoken={`${euroSpoken(perPortion)} par portion`} />
          </View>

          <View style={[styles.between, styles.baseline]}>
            <Text accessibilityRole="header" style={[type.titleLarge, { color: colors.onSurface }]}>Ingrédients</Text>
            <Text
              style={[type.bodyMedium, styles.num, { color: colors.onSurfaceVariant }]}
              accessibilityLabel={`Pour ${recipe.servings} portions, ${euroSpoken(total)} chez ${storeName}`}
            >
              pour {recipe.servings} · {euro(total)} chez {storeName}
            </Text>
          </View>

          <View style={[styles.lines, { gap: HAIRLINE_GAP, borderRadius: shape.lg }]}>
            {recipe.ingredients.map((item) => {
              const ing = INGREDIENTS[item.id];
              const name = ing.recipeName ?? ing.name;
              const qty = recipeQty(item);
              return (
                <View
                  key={item.id}
                  accessible
                  accessibilityLabel={`${name}, ${qty}`}
                  style={[styles.between, { minHeight: LINE_MIN_HEIGHT, paddingHorizontal: spacing[4], gap: spacing[3], backgroundColor: colors.surfaceContainerLowest }]}
                >
                  <Text style={[type.bodyLarge, { color: colors.onSurface }]}>{name}</Text>
                  <Text style={[type.bodyMedium, styles.num, { color: colors.onSurfaceVariant }]}>{qty}</Text>
                </View>
              );
            })}
          </View>

          <Text accessibilityRole="header" style={[type.titleLarge, { color: colors.onSurface }]}>Étapes</Text>
          {recipe.steps.map((s, i) => (
            <View key={i} style={[styles.row, { gap: spacing[3] }]} accessible accessibilityLabel={`Étape ${i + 1} : ${s}`}>
              <View style={[styles.stepBadge, { borderRadius: shape.full, backgroundColor: colors.primaryContainer }]}>
                <Text style={[type.labelLarge, { color: colors.onPrimaryContainer, fontFamily: type.titleMedium.fontFamily }]}>{i + 1}</Text>
              </View>
              <Text style={[type.bodyLarge, styles.stepText, { color: colors.onSurface }]}>{s}</Text>
            </View>
          ))}
        </Animated.View>
      </ScrollView>

      <View
        style={{
          paddingTop: spacing[3],
          paddingHorizontal: spacing[4],
          paddingBottom: Math.max(insets.bottom, spacing[8]),
          gap: spacing[2],
          backgroundColor: colors.surface,
        }}
      >
        {message ? (
          <Animated.Text entering={entering(0, true)} accessibilityLiveRegion="polite" style={[type.labelLarge, { color: colors.primary, textAlign: 'center' }]}>
            {message}
          </Animated.Text>
        ) : null}
        {imported ? (
          <Button
            label="Ajouter au planning"
            hint="Ajoute cette recette au prochain créneau libre de ta semaine"
            size="m"
            block
            icon={<MaterialCommunityIcons name="calendar-plus" size={24} color={colors.onPrimary} />}
            onPress={handleAddToPlan}
          />
        ) : (
          <Button
            label="Importer dans mes recettes"
            size="m"
            block
            icon={<MaterialIcons name="download" size={24} color={colors.onPrimary} />}
            onPress={handleImport}
          />
        )}
      </View>
    </View>
  );
}

function Stat({ value, label, spoken }: { value: string; label: string; spoken: string }) {
  const { colors, type, shape, spacing } = useTheme();
  return (
    <View
      accessible
      accessibilityLabel={spoken}
      style={[styles.stat, { borderRadius: shape.lgPlus, paddingVertical: spacing[3], paddingHorizontal: spacing[2], backgroundColor: colors.surfaceContainerLow }]}
    >
      <Text style={[type.headlineSmall, styles.num, { color: colors.onSurface }]}>{value}</Text>
      <Text style={[type.bodySmall, { color: colors.onSurfaceVariant }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { overflow: 'hidden' },
  decor: { position: 'absolute', right: -56 },
  flower: { width: FLOWER, height: FLOWER },
  cookie: { position: 'absolute', left: 170, bottom: -34 },
  heroBar: { position: 'absolute', flexDirection: 'row', justifyContent: 'space-between' },
  heroTitle: { position: 'absolute', right: 150 },
  row: { flexDirection: 'row' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  inline: { flexDirection: 'row', alignItems: 'center' },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  baseline: { alignItems: 'baseline' },
  stat: { flex: 1, alignItems: 'center' },
  num: { fontVariant: ['tabular-nums'] },
  lines: { overflow: 'hidden' },
  stepBadge: { width: STEP_BADGE, height: STEP_BADGE, alignItems: 'center', justifyContent: 'center' },
  stepText: { flex: 1 },
});
