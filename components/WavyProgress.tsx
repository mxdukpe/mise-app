import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../ThemeProvider';
import { useReduceMotion } from './ui';
import { euro, euroSpoken } from '../data';

const SVG_WIDTH = 320;
const SVG_HEIGHT = 16;
const MID = 8;
const AMPLITUDE = 3;
const WAVELENGTH = 26;

// Génère le chemin SVG de la vague sinusoïdale comme dans le prototype Mise
function generateWavyPath(width: number): string {
  let d = `M0 ${MID}`;
  for (let x = 2; x <= width; x += 2) {
    const y = (MID + AMPLITUDE * Math.sin((x / WAVELENGTH) * Math.PI * 2)).toFixed(2);
    d += ` L${x} ${y}`;
  }
  return d;
}

type Props = {
  spent: number;
  budget: number;
  label?: string;
  // `bare` : la vague seule, sans montants ni message (panier des courses, carte budget du bilan).
  bare?: boolean;
  // `tiered` : couleur selon le palier du budget (moins de 85 %, jusqu'à 100 %, au-delà).
  tiered?: boolean;
};

export function WavyProgress({ spent, budget, label = 'Budget de la semaine', bare = false, tiered = true }: Props) {
  const { colors, type, spacing, springs } = useTheme();
  const reduced = useReduceMotion();

  const ratio = budget > 0 ? spent / budget : 0;
  const clampedFill = Math.min(1, Math.max(0, ratio));

  const progress = useSharedValue(clampedFill);

  useEffect(() => {
    progress.value = withSpring(
      clampedFill,
      reduced ? springs.effects : springs.spatialDefault,
    );
  }, [clampedFill, reduced, progress, springs]);

  const tone = !tiered ? 'primary' : ratio > 1 ? 'error' : ratio >= 0.85 ? 'warning' : 'primary';
  const strokeColor =
    tone === 'error' ? colors.error : tone === 'warning' ? colors.warning : colors.primary;

  const fullWaveD = useMemo(() => generateWavyPath(SVG_WIDTH), []);

  const animatedWaveStyle = useAnimatedStyle(() => ({
    width: `${Math.max(0, Math.min(100, progress.value * 100))}%`,
  }));

  const msg =
    tone === 'error'
      ? `Budget dépassé de ${euro(spent - budget)}`
      : tone === 'warning'
      ? 'Presque au budget'
      : `Il te reste ${euro(budget - spent)}`;

  const spokenLabel = bare
    ? `${label} : ${Math.round(clampedFill * 100)} %`
    : `${label} : ${euroSpoken(spent)} dépensés sur ${euroSpoken(budget)}`;

  const wave = (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={spokenLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clampedFill * 100) }}
      style={styles.svgContainer}
    >
      <Svg width="100%" height={SVG_HEIGHT} viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} preserveAspectRatio="none">
        <Line
          x1="0"
          y1={MID}
          x2={SVG_WIDTH - 4}
          y2={MID}
          stroke={colors.surfaceContainerHighest}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <Circle cx={SVG_WIDTH - 2} cy={MID} r={2} fill={colors.surfaceContainerHighest} />
      </Svg>
      <Animated.View style={[styles.activeOverlay, animatedWaveStyle]}>
        <Svg width={SVG_WIDTH} height={SVG_HEIGHT} viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} preserveAspectRatio="none">
          <Path d={fullWaveD} stroke={strokeColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Svg>
      </Animated.View>
    </View>
  );

  if (bare) return wave;

  return (
    <View style={{ gap: spacing[2] }}>
      <View style={styles.topRow}>
        <Text style={[type.titleLarge, { color: strokeColor, fontVariant: ['tabular-nums'] }]}>
          {euro(spent)}
        </Text>
        <Text style={[type.bodyMedium, { color: colors.onSurfaceVariant, fontVariant: ['tabular-nums'] }]}>
          sur {euro(budget)}
        </Text>
      </View>

      {wave}

      {/* Tier Feedback Message */}
      <View style={[styles.msgRow, { gap: spacing[1] }]}>
        {tone !== 'primary' ? (
          <MaterialIcons
            name={tone === 'error' ? 'error' : 'warning'}
            size={18}
            color={strokeColor}
          />
        ) : null}
        <Text style={[type.labelMedium, { color: strokeColor }]}>{msg}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  svgContainer: {
    height: SVG_HEIGHT,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  activeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
