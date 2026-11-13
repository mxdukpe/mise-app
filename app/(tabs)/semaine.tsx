import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../ThemeProvider';
import { useCatalog } from '../../features/catalog/CatalogProvider';
import { usePlanning } from '../../features/planning/planningStore';
import { DAYS, dayHasMeals, dayIndex, dayTitle, plannedMeals, sampleWeek, startOfWeek, weekRange } from '../../features/planning/week';
import { Slot } from '../../features/onboarding/settings';
import { TopAppBar, Button, StateView, useReduceMotion } from '../../components/ui';
import { DaySelector } from '../../components/DaySelector';
import { WavyProgress } from '../../components/WavyProgress';
import { MealSlot } from '../../components/MealSlot';

export default function SemaineScreen() {
  const { colors, type, shape, spacing, elevation, springs } = useTheme();
  const router = useRouter();
  const reduced = useReduceMotion();
  const { findRecipe, portionCost } = useCatalog();
  const { plan, slots, weeklyBudget, selectedDay, setSelectedDay, removeRecipe, togglePrepared, loadSample, clearWeek, isEmpty, weekCost } =
    usePlanning();

  const today = new Date();
  const monday = startOfWeek(today);
  const todayIndex = dayIndex(today);
  const selectedIndex = DAYS.findIndex((d) => d.id === selectedDay);
  // Comme dans le prototype : le jour choisi et le lendemain.
  const shownDays = selectedIndex < DAYS.length - 1 ? [selectedIndex, selectedIndex + 1] : [selectedIndex];
  const plannedCount = plannedMeals(plan).length;
  const sampleCount = plannedMeals(sampleWeek(slots)).length;

  const bumpScale = useSharedValue(1);
  const first = React.useRef(true);

  React.useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduced) return;
    bumpScale.value = 0.94;
    bumpScale.value = withSpring(1, springs.spatialFast);
  }, [weekCost, reduced, bumpScale, springs]);

  const bumpAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bumpScale.value }],
  }));

  const pick = (dayId: string, slot: Slot) => router.push(`/choisir-recette?day=${dayId}&slot=${slot}`);

  const handleSlotLongPress = (dayId: (typeof DAYS)[number]['id'], slot: Slot, recipeName?: string) => {
    if (!recipeName) return;
    Alert.alert(recipeName, 'Que veux-tu faire ?', [
      { text: 'Remplacer', onPress: () => pick(dayId, slot) },
      { text: 'Retirer du planning', style: 'destructive', onPress: () => removeRecipe(dayId, slot) },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.surface }]}>
      <TopAppBar
        title="Ta semaine"
        subtitle={weekRange(monday)}
        actions={
          isEmpty
            ? []
            : [
                {
                  icon: 'delete-outline',
                  label: 'Vider la semaine',
                  onPress: () =>
                    Alert.alert('Vider la semaine', 'Tous les repas prévus seront retirés.', [
                      { text: 'Annuler', style: 'cancel' },
                      { text: 'Vider', style: 'destructive', onPress: clearWeek },
                    ]),
                },
              ]
        }
      />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingHorizontal: spacing[4], paddingBottom: spacing[8], gap: spacing[4] },
        ]}
      >
        <Animated.View
          style={[
            elevation.level1,
            {
              backgroundColor: colors.surfaceContainerLow,
              borderRadius: shape.xl,
              padding: spacing[4],
              gap: spacing[2],
            },
            bumpAnimStyle,
          ]}
        >
          <View style={[styles.cardHeader, { marginBottom: spacing[1] }]}>
            <Text style={[type.labelMedium, { color: colors.onSurfaceVariant }]}>Coût prévu · {plannedCount} repas</Text>
            <Text style={[type.labelMedium, { color: colors.onSurfaceVariant }]}>Budget hebdo</Text>
          </View>
          <WavyProgress spent={weekCost} budget={weeklyBudget} />
        </Animated.View>

        {isEmpty ? (
          <View style={[styles.emptyContainer, { paddingVertical: spacing[6] }]}>
            <StateView
              title="Ta semaine est vide"
              text={`Laisse Mise proposer ${sampleCount} repas dans ton budget, ou choisis-les toi-même créneau par créneau.`}
              action={
                <View style={{ gap: spacing[3], width: '100%', alignItems: 'center' }}>
                  <Button
                    label="Planifier pour moi"
                    variant="filled"
                    size="m"
                    icon={<MaterialIcons name="auto-awesome" size={20} color={colors.onPrimary} />}
                    onPress={loadSample}
                  />
                  <Button label="Choisir moi-même" variant="text" size="m" onPress={() => pick(selectedDay, slots[slots.length - 1])} />
                </View>
              }
            />
          </View>
        ) : (
          <View style={{ gap: spacing[4] }}>
            <DaySelector selected={selectedDay} onSelect={setSelectedDay} hasMeals={(day) => dayHasMeals(plan, day)} />

            {shownDays.map((i) => {
              const day = DAYS[i];
              return (
                <View key={day.id} style={{ gap: spacing[2] }}>
                  <View style={[styles.dayHeaderRow, { gap: spacing[2], paddingHorizontal: spacing[1] }]}>
                    {i === todayIndex ? (
                      <Text style={[type.labelSmall, { color: colors.tertiary }]}>AUJOURD’HUI</Text>
                    ) : i === todayIndex + 1 ? (
                      <Text style={[type.labelSmall, { color: colors.onSurfaceVariant }]}>DEMAIN</Text>
                    ) : null}
                    <Text accessibilityRole="header" style={[type.titleMedium, { color: colors.onSurface }]}>
                      {dayTitle(monday, i)}
                    </Text>
                  </View>
                  {slots.map((slot, j) => {
                    const meal = plan.meals.find((m) => m.day === day.id && m.slot === slot);
                    const recipe = meal?.recipeId ? findRecipe(meal.recipeId) : undefined;
                    return (
                      <MealSlot
                        key={slot}
                        slot={slot}
                        recipe={recipe}
                        cost={recipe ? portionCost(recipe) : undefined}
                        prepared={!!meal?.prepared}
                        index={j}
                        onPress={() => (recipe ? router.push(`/recipe/${recipe.id}`) : pick(day.id, slot))}
                        onTogglePrepared={() => togglePrepared(day.id, slot)}
                        onLongPress={() => handleSlotLongPress(day.id, slot, recipe?.name)}
                      />
                    );
                  })}
                </View>
              );
            })}

            <Button
              label="Générer ma liste de courses"
              variant="filled"
              size="m"
              block
              icon={<MaterialIcons name="shopping-basket" size={22} color={colors.onPrimary} />}
              onPress={() => router.push('/(tabs)/courses')}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  dayHeaderRow: { flexDirection: 'row', alignItems: 'baseline' },
});
