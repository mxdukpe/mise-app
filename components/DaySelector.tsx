import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '../ThemeProvider';
import { useReduceMotion } from './ui';
import { DayId, DAYS } from '../features/planning/week';

type Props = {
  selected: DayId;
  onSelect: (day: DayId) => void;
  hasMeals?: (day: DayId) => boolean;
};

// Barre horizontale des 7 jours de la semaine avec indicateur actif animé.
export function DaySelector({ selected, onSelect, hasMeals }: Props) {
  const { spacing } = useTheme();
  return (
    <View accessibilityRole="tablist" accessibilityLabel="Jours de la semaine" style={[styles.row, { gap: spacing[1] }]}>
      {DAYS.map((d) => (
        <DayChip
          key={d.id}
          day={d}
          selected={d.id === selected}
          hasMeal={hasMeals?.(d.id) ?? false}
          onPress={() => onSelect(d.id)}
        />
      ))}
    </View>
  );
}

type DayChipProps = {
  day: (typeof DAYS)[number];
  selected: boolean;
  hasMeal: boolean;
  onPress: () => void;
};

function DayChip({ day, selected, hasMeal, onPress }: DayChipProps) {
  const { colors, type, shape, size, spacing, springs } = useTheme();
  const reduced = useReduceMotion();
  const progress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(selected ? 1 : 0, reduced ? springs.effects : springs.spatialFast);
  }, [selected, reduced, progress, springs]);

  const bg = useAnimatedStyle(() => ({
    backgroundColor: progress.value > 0.5 ? colors.primary : 'transparent',
    opacity: reduced ? progress.value * 0.5 + 0.5 : 1,
  }));

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={day.long}
      accessibilityState={{ selected }}
      hitSlop={{ top: 4, bottom: 4 }}
      onPress={onPress}
      style={styles.chip}
    >
      <Animated.View style={[styles.chipInner, { minHeight: size.tapMin, paddingVertical: spacing[2], gap: spacing[1] / 2, borderRadius: shape.full }, bg]}>
        <Text style={[type.labelLarge, { color: selected ? colors.onPrimary : colors.onSurface }]}>{day.short}</Text>
        {hasMeal && !selected ? <View style={[styles.dot, { backgroundColor: colors.tertiary, borderRadius: shape.full }]} /> : null}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  chip: { flex: 1, alignItems: 'center' },
  chipInner: { alignItems: 'center', justifyContent: 'center', width: '100%' },
  dot: { width: 6, height: 6 },
});
