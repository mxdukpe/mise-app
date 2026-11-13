import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../ThemeProvider';
import { AnimatedPressable, useReduceMotion } from '../ui';

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

// Groupe de boutons connectés : segments surfaceContainerHighest, le choix passe en pilule secondaryContainer.
export function ButtonGroup<T extends string>({ label, options, value, onChange }: Props<T>) {
  const { spacing } = useTheme();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={[styles.group, { gap: 2 }]}>
      {options.map((o, i) => (
        <Segment
          key={o.value}
          label={o.label}
          selected={o.value === value}
          first={i === 0}
          last={i === options.length - 1}
          gap={spacing[2]}
          onPress={() => onChange(o.value)}
        />
      ))}
    </View>
  );
}

type SegmentProps = { label: string; selected: boolean; first: boolean; last: boolean; gap: number; onPress: () => void };

function Segment({ label, selected, first, last, gap, onPress }: SegmentProps) {
  const { colors, type, shape, size, springs } = useTheme();
  const reduced = useReduceMotion();
  const height = size.buttonS;
  const pill = height / 2; // rayon d'une pilule à cette hauteur
  const outer = first || last ? pill : shape.sm;
  const progress = useSharedValue(selected ? 1 : 0);
  useEffect(() => {
    progress.value = withSpring(selected ? 1 : 0, reduced ? springs.effects : springs.spatialFast);
  }, [selected, reduced, progress, springs]);

  // Côté extérieur du groupe en pilule, côtés intérieurs en shape.sm ; sélectionné : pilule partout.
  const radius = useAnimatedStyle(() => {
    const left = first ? pill : shape.sm + (pill - shape.sm) * progress.value;
    const right = last ? pill : shape.sm + (pill - shape.sm) * progress.value;
    return {
      borderTopLeftRadius: left,
      borderBottomLeftRadius: left,
      borderTopRightRadius: right,
      borderBottomRightRadius: right,
    };
  });

  return (
    <AnimatedPressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected }}
      hitSlop={{ top: (size.tapMin - height) / 2, bottom: (size.tapMin - height) / 2 }}
      onPress={onPress}
      style={[
        styles.segment,
        { height, gap, backgroundColor: selected ? colors.secondaryContainer : colors.surfaceContainerHighest, borderRadius: outer },
        radius,
      ]}
    >
      {selected ? <MaterialIcons name="check" size={18} color={colors.onSecondaryContainer} /> : null}
      <Text style={[type.labelLarge, { color: selected ? colors.onSecondaryContainer : colors.onSurfaceVariant }]}>{label}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  group: { flexDirection: 'row' },
  segment: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});
