import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '../ThemeProvider';
import { Recipe, euro, euroSpoken } from '../data';
import { AnimatedPressable, entering, usePressShape, useReduceMotion } from './ui';
import { ExpressiveShape } from './ExpressiveShape';
import { Palette } from '../theme';

const SHAPE_SIZE = 48;
const HAIRLINE = 2;

// Aplat de la vignette selon le ton de la recette.
const TONE_FILL: Record<Recipe['tone'], keyof Palette> = {
  primary: 'primaryContainer',
  secondary: 'secondaryContainer',
  tertiary: 'tertiaryContainer',
  warning: 'warningContainer',
};

type Props = {
  slot: 'midi' | 'soir';
  recipe: Recipe | undefined;
  cost?: number; // coût d'une portion dans le magasin courant
  prepared: boolean;
  index: number;
  onPress: () => void;
  onTogglePrepared?: () => void;
  onLongPress?: () => void;
};

// Créneau repas : vide (ajout), rempli (nom + temps), ou préparé (coche verte).
export function MealSlot({ slot, recipe, cost, prepared, index, onPress, onTogglePrepared, onLongPress }: Props) {
  const { colors, type, shape, spacing, elevation, springs } = useTheme();
  const reduced = useReduceMotion();
  const press = usePressShape(shape.lg, shape.xl, 0.98);
  const slotLabel = slot === 'midi' ? 'Midi' : 'Soir';

  const burstScale = useSharedValue(1);
  const burstRotate = useSharedValue(0);

  React.useEffect(() => {
    if (prepared && !reduced) {
      burstScale.value = 0.6;
      burstRotate.value = -30;
      burstScale.value = withSpring(1, springs.spatialFast);
      burstRotate.value = withSpring(-8, springs.spatialFast);
    } else {
      burstScale.value = 1;
      burstRotate.value = 0;
    }
  }, [prepared, reduced, springs, burstScale, burstRotate]);

  const burstAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: burstScale.value }, { rotate: `${burstRotate.value}deg` }],
  }));

  if (!recipe) {
    return (
      <Animated.View entering={entering(index, reduced)}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${slotLabel} : ajouter un repas`}
          onPress={onPress}
          style={({ pressed }) => [
            styles.empty,
            {
              gap: spacing[2],
              padding: spacing[4],
              borderRadius: shape.lg,
              borderColor: colors.outlineVariant,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <MaterialIcons name="add" size={24} color={colors.onSurfaceVariant} />
          <View>
            <Text style={[type.labelLarge, { color: colors.onSurfaceVariant }]}>{slotLabel}</Text>
            <Text style={[type.bodySmall, { color: colors.onSurfaceVariant }]}>Ajouter un repas</Text>
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  const costText = cost !== undefined ? ` · ${euro(cost)}` : '';
  const label = `${slotLabel} : ${recipe.name}, ${recipe.time} minutes${cost !== undefined ? `, ${euroSpoken(cost)} la portion` : ''}${prepared ? ', préparé' : ''}`;

  return (
    <Animated.View entering={entering(index, reduced)}>
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint="Appuie pour ouvrir la fiche recette, ou sur la coche pour marquer comme préparé"
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        style={[
          styles.filled,
          elevation.level1,
          {
            gap: spacing[3],
            padding: spacing[3],
            backgroundColor: prepared ? colors.primaryContainer : colors.surfaceContainerLow,
          },
          press.style,
        ]}
      >
        <View style={styles.media} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <ExpressiveShape name={recipe.shape} size={SHAPE_SIZE} color={colors[TONE_FILL[recipe.tone]]} />
        </View>
        <View style={[styles.body, { gap: HAIRLINE }]}>
          <Text style={[type.labelMedium, { color: prepared ? colors.onPrimaryContainer : colors.onSurfaceVariant }]}>{slotLabel}</Text>
          <Text style={[type.titleMedium, { color: prepared ? colors.onPrimaryContainer : colors.onSurface }]} numberOfLines={1}>
            {recipe.name}
          </Text>
          <Text style={[type.bodySmall, { color: prepared ? colors.onPrimaryContainer : colors.onSurfaceVariant }]}>{recipe.time} min{costText}</Text>
        </View>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityLabel={`${prepared ? 'Annuler : ' : 'Marquer comme préparé : '}${recipe.name}`}
          accessibilityState={{ checked: prepared }}
          hitSlop={12}
          onPress={(e) => {
            e.stopPropagation();
            if (onTogglePrepared) onTogglePrepared();
            else onPress();
          }}
          style={[
            styles.check,
            {
              backgroundColor: prepared ? colors.primary : colors.surfaceContainerHighest,
              borderRadius: shape.full,
            },
          ]}
        >
          <Animated.View style={burstAnimStyle}>
            <MaterialIcons
              name="check"
              size={18}
              color={prepared ? colors.onPrimary : colors.onSurfaceVariant}
            />
          </Animated.View>
        </Pressable>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  empty: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderStyle: 'dashed' },
  filled: { flexDirection: 'row', alignItems: 'center' },
  media: { width: SHAPE_SIZE, height: SHAPE_SIZE, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, minWidth: 0 },
  check: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
});
