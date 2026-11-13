import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../ThemeProvider';
import { useReduceMotion } from '../ui';

const DOT = 8;
const ACTIVE = 24;
const GAP = 6;

type Props = { count: number; index: number; onSelect: (index: number) => void };

// Points de pagination : l'actif s'élargit en ressort ; chaque point mène à son étape.
export function PageDots({ count, index, onSelect }: Props) {
  return (
    <View accessibilityRole="tablist" accessibilityLabel={`Étape ${index + 1} sur ${count}`} style={[styles.row, { gap: GAP }]}>
      {Array.from({ length: count }, (_, i) => (
        <Dot key={i} label={`Étape ${i + 1} sur ${count}`} active={i === index} onPress={() => onSelect(i)} />
      ))}
    </View>
  );
}

function Dot({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { colors, shape, size, springs } = useTheme();
  const reduced = useReduceMotion();
  const width = useSharedValue(active ? ACTIVE : DOT);
  useEffect(() => {
    width.value = reduced ? (active ? ACTIVE : DOT) : withSpring(active ? ACTIVE : DOT, springs.spatialFast);
  }, [active, reduced, width, springs]);
  const style = useAnimatedStyle(() => ({ width: width.value }));
  // Zone tactile de 48 de haut autour d'un point de 8.
  const slop = (size.tapMin - DOT) / 2;
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      hitSlop={{ top: slop, bottom: slop, left: GAP / 2, right: GAP / 2 }}
      onPress={onPress}
    >
      <Animated.View style={[styles.dot, { borderRadius: shape.full, backgroundColor: active ? colors.primary : colors.outlineVariant }, style]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  dot: { height: DOT },
});
