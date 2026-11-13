import React, { useEffect } from 'react';
import { AccessibilityInfo, StyleSheet, Text } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';
import { useTheme } from '../../ThemeProvider';
import { useReduceMotion } from '../ui';

// Message bref en inverseSurface, en bas de l'écran ; lu par VoiceOver à son apparition.
export function Snackbar({ message, bottom }: { message: string | null; bottom: number }) {
  const { colors, type, shape, spacing, elevation, springs } = useTheme();
  const reduced = useReduceMotion();

  useEffect(() => {
    if (message) AccessibilityInfo.announceForAccessibility(message);
  }, [message]);

  if (!message) return null;
  const { stiffness, damping, mass } = reduced ? springs.effects : springs.spatialFast;
  const enter = (reduced ? FadeIn : FadeInDown).springify().stiffness(stiffness).damping(damping).mass(mass);
  const exit = FadeOut.springify().stiffness(springs.effects.stiffness).damping(springs.effects.damping).mass(springs.effects.mass);

  return (
    <Animated.View
      key={message}
      entering={enter}
      exiting={exit}
      accessibilityLiveRegion="polite"
      style={[
        styles.bar,
        elevation.level3,
        {
          left: spacing[3],
          right: spacing[3],
          bottom,
          minHeight: 48,
          paddingHorizontal: spacing[4],
          paddingVertical: spacing[3],
          borderRadius: shape.xs,
          backgroundColor: colors.inverseSurface,
        },
      ]}
    >
      <Text style={[type.bodyMedium, { color: colors.inverseOnSurface }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: { position: 'absolute', justifyContent: 'center' },
});
