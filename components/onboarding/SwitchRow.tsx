import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../ThemeProvider';
import { useReduceMotion } from '../ui';

// Dimensions de l'interrupteur Material 3.
const TRACK_W = 52;
const TRACK_H = 32;
const BORDER = 2;
const THUMB_OFF = 16;
const THUMB_ON = 24;
const LEFT_OFF = 6;
const LEFT_ON = 22;
const ROW_MIN_HEIGHT = 56;

type Props = { label: string; support?: string; value: boolean; onChange: (value: boolean) => void };

// Ligne avec libellé, texte d'aide et interrupteur M3 ; toute la ligne est touchable.
export function SwitchRow({ label, support, value, onChange }: Props) {
  const { colors, type, spacing, shape, springs } = useTheme();
  const reduced = useReduceMotion();
  const on = useSharedValue(value ? 1 : 0);
  useEffect(() => {
    on.value = withSpring(value ? 1 : 0, reduced ? springs.effects : springs.spatialFast);
  }, [value, reduced, on, springs]);

  const thumb = useAnimatedStyle(() => {
    const d = THUMB_OFF + (THUMB_ON - THUMB_OFF) * on.value;
    return { width: d, height: d, left: LEFT_OFF + (LEFT_ON - LEFT_OFF) * on.value, top: (TRACK_H - 2 * BORDER - d) / 2 };
  });

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityHint={support}
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      style={[styles.row, { gap: spacing[4], minHeight: ROW_MIN_HEIGHT }]}
    >
      <View style={styles.text}>
        <Text style={[type.bodyLarge, { color: colors.onSurface }]}>{label}</Text>
        {support ? <Text style={[type.bodyMedium, { color: colors.onSurfaceVariant }]}>{support}</Text> : null}
      </View>
      <View
        style={[
          styles.track,
          {
            borderRadius: shape.full,
            backgroundColor: value ? colors.primary : colors.surfaceContainerHighest,
            borderColor: value ? colors.primary : colors.outline,
          },
        ]}
      >
        <Animated.View style={[styles.thumb, { borderRadius: shape.full, backgroundColor: value ? colors.onPrimary : colors.outline }, thumb]}>
          {value ? <MaterialIcons name="check" size={16} color={colors.primary} /> : null}
        </Animated.View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  text: { flex: 1, minWidth: 0 },
  track: { width: TRACK_W, height: TRACK_H, borderWidth: BORDER },
  thumb: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
});
