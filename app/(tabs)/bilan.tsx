import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../ThemeProvider';
import { euro } from '../../data';
import { usePlanning } from '../../features/planning/planningStore';
import { currentStreak, plannedMeals, preparedCount, shortDate, startOfWeek, weekRange } from '../../features/planning/week';
import { Button, StateView, TopAppBar, useReduceMotion } from '../../components/ui';
import { ExpressiveShape } from '../../components/ExpressiveShape';
import { WavyProgress } from '../../components/WavyProgress';
import { WeekChart } from '../../components/WeekChart';

const SUN = 150;
const MEAL_BLOCK = 12;
const MEAL_GAP = 4;

// Bilan de la semaine en cours, calculé à partir du planning. L'historique arrivera avec SQLite (phases 1 et 4).
export default function BilanScreen() {
  const { colors, type, shape, spacing, elevation, springs } = useTheme();
  const router = useRouter();
  const reduced = useReduceMotion();
  const { plan, weekCost, weeklyBudget } = usePlanning();

  const monday = startOfWeek(new Date());
  const planned = plannedMeals(plan).length;
  const prepared = preparedCount(plan);
  const streak = currentStreak(plan);
  const margin = weeklyBudget - weekCost;

  // Rebond du chiffre des repas à l'ouverture ; fondu seul si le mouvement est réduit.
  const numScale = useSharedValue(reduced ? 1 : 0.8);
  useEffect(() => {
    numScale.value = reduced ? 1 : withSpring(1, springs.spatialFast);
  }, [reduced, numScale, springs]);
  const numAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: numScale.value }] }));

  if (planned === 0) {
    return (
      <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.surface }]}>
        <TopAppBar title="Bilan" subtitle={`Semaine du ${weekRange(monday)}`} />
        <View style={styles.emptyWrap}>
          <StateView
            title="Pas encore de bilan"
            text="Planifie des repas cette semaine : tu verras ici ce que tu as préparé et ton budget."
            action={
              <Button
                label="Planifier ma semaine"
                size="m"
                icon={<MaterialIcons name="calendar-month" size={20} color={colors.onPrimary} />}
                onPress={() => router.push('/(tabs)/semaine')}
              />
            }
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.surface }]}>
      <TopAppBar title="Bilan" subtitle={`Semaine du ${weekRange(monday)}`} />

      <ScrollView contentContainerStyle={[styles.scroll, { padding: spacing[4], gap: spacing[4], paddingBottom: spacing[8] }]}>
        <View
          accessible
          accessibilityLabel={`Repas préparés : ${prepared} sur ${planned} prévus`}
          style={[styles.hero, elevation.level2, { backgroundColor: colors.primary, borderRadius: shape.xl, padding: spacing[5], gap: spacing[3] }]}
        >
          <View style={styles.sun} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <ExpressiveShape name="sunny" size={SUN} color={colors.primaryContainer} />
          </View>
          <Text style={[type.labelMedium, { color: colors.onPrimary, textTransform: 'uppercase' }]}>Repas préparés</Text>
          <View style={[styles.heroRow, { gap: spacing[2] }]}>
            <Animated.Text style={[type.displayLarge, { color: colors.onPrimary, fontVariant: ['tabular-nums'] }, numAnimStyle]}>
              {prepared}
            </Animated.Text>
            <Text style={[type.titleMedium, { color: colors.onPrimary }]}>sur {planned} prévus</Text>
          </View>
          <View style={[styles.blocks, { gap: MEAL_GAP }]}>
            {Array.from({ length: planned }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.block,
                  { borderRadius: shape.xs, backgroundColor: i < prepared ? colors.primaryContainer : colors.onPrimary, opacity: i < prepared ? 1 : 0.25 },
                ]}
              />
            ))}
          </View>
        </View>

        <View style={[styles.twoCols, { gap: spacing[2] }]}>
          <View
            accessible
            accessibilityLabel={`Série : ${streak} ${streak > 1 ? 'jours' : 'jour'} d’affilée à suivre ton plan`}
            style={[styles.col, { backgroundColor: colors.tertiaryContainer, borderRadius: shape.lgPlus, padding: spacing[4], gap: spacing[1] }]}
          >
            <Text style={[type.labelMedium, { color: colors.onTertiaryContainer, textTransform: 'uppercase' }]}>Série</Text>
            <Text style={[type.headlineMedium, { color: colors.onTertiaryContainer }]}>
              {streak} {streak > 1 ? 'jours' : 'jour'}
            </Text>
            <Text style={[type.bodyMedium, { color: colors.onTertiaryContainer }]}>d’affilée à suivre ton plan</Text>
          </View>

          <View style={[styles.col, { backgroundColor: colors.surfaceContainerLow, borderRadius: shape.lgPlus, padding: spacing[4], gap: spacing[1] }]}>
            <Text style={[type.labelMedium, { color: colors.onSurfaceVariant, textTransform: 'uppercase' }]}>Budget</Text>
            <Text style={[type.headlineMedium, { color: colors.onSurface, fontVariant: ['tabular-nums'] }]}>{euro(weekCost)}</Text>
            <WavyProgress spent={weekCost} budget={weeklyBudget} label="Budget utilisé" bare />
            <Text style={[type.bodyMedium, { color: colors.onSurfaceVariant }]}>
              sur {euro(weeklyBudget)} · {margin >= 0 ? `${euro(margin)} de marge` : `${euro(-margin)} de dépassement`}
            </Text>
          </View>
        </View>

        <View style={[elevation.level1, { backgroundColor: colors.surfaceContainerLow, borderRadius: shape.lgPlus, padding: spacing[4], gap: spacing[3] }]}>
          <View style={styles.chartHeader}>
            <Text accessibilityRole="header" style={[type.titleMedium, { color: colors.onSurface }]}>Tes semaines</Text>
            <Text style={[type.bodySmall, { color: colors.onSurfaceVariant }]}>repas préparés</Text>
          </View>
          <WeekChart data={[{ label: shortDate(monday), value: prepared, max: planned, isCurrent: true }]} />
          <Text style={[type.bodySmall, { color: colors.onSurfaceVariant }]}>Tes semaines précédentes s’ajouteront ici.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1 },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hero: { overflow: 'hidden' },
  sun: { position: 'absolute', right: -36, top: -36 },
  heroRow: { flexDirection: 'row', alignItems: 'baseline' },
  blocks: { flexDirection: 'row', height: MEAL_BLOCK },
  block: { flex: 1 },
  twoCols: { flexDirection: 'row' },
  col: { flex: 1 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
});
