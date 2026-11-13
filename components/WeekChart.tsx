import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';
import { useTheme } from '../ThemeProvider';
import { useReduceMotion } from './ui';

export type WeekDataPoint = {
  label: string;
  value: number;
  max: number;
  isCurrent?: boolean;
};

type Props = {
  data: WeekDataPoint[];
};

const CHART_HEIGHT = 130;
const BAR_MAX = 72;

// Barres des repas préparés par semaine ; la semaine en cours en `primary`.
export function WeekChart({ data }: Props) {
  const { spacing } = useTheme();

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Repas préparés par semaine : ${data.map((d) => `semaine du ${d.label}, ${d.value} sur ${d.max}`).join(' ; ')}`}
      style={[styles.container, { height: CHART_HEIGHT, paddingHorizontal: spacing[2], gap: spacing[4] }]}
    >
      {data.map((item, index) => (
        <BarItem key={item.label} item={item} index={index} />
      ))}
    </View>
  );
}

function BarItem({ item, index }: { item: WeekDataPoint; index: number }) {
  const { colors, type, shape, spacing, springs } = useTheme();
  const reduced = useReduceMotion();
  const targetPct = item.max > 0 ? item.value / item.max : 0;
  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = withDelay(
      index * 80,
      withSpring(targetPct, reduced ? springs.effects : springs.spatialDefault),
    );
  }, [targetPct, reduced, index, progress, springs]);

  const animatedBarStyle = useAnimatedStyle(() => ({
    height: Math.max(spacing[2], progress.value * BAR_MAX),
  }));

  return (
    <View style={[styles.barCol, { gap: spacing[1] }]}>
      <Text style={[type.labelLarge, { color: colors.onSurface, fontVariant: ['tabular-nums'] }]}>
        {item.value}
      </Text>
      <View style={styles.barTrack}>
        <Animated.View
          style={[
            styles.bar,
            {
              backgroundColor: item.isCurrent ? colors.primary : colors.primaryContainer,
              borderTopLeftRadius: shape.md,
              borderTopRightRadius: shape.md,
              borderBottomLeftRadius: shape.xs,
              borderBottomRightRadius: shape.xs,
            },
            animatedBarStyle,
          ]}
        />
      </View>
      <Text style={[type.labelSmall, { color: colors.onSurfaceVariant }]}>{item.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  // Quatre colonnes au plus, comme dans la maquette (4 dernières semaines).
  barCol: {
    flex: 1,
    maxWidth: '25%',
    alignItems: 'center',
  },
  barTrack: {
    width: '100%',
    height: BAR_MAX,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
  },
});
