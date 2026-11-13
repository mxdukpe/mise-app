import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../ThemeProvider';
import { springs } from '../../theme';
import { Button, useReduceMotion } from '../ui';
import { ExpressiveShape } from '../ExpressiveShape';
import { PageDots } from './PageDots';

// Illustration de la page Bienvenue, aux dimensions du prototype.
const ART_HEIGHT = 380;
const SLAB = { left: 40, top: 56, width: 236, height: 252 };
const TILE_GAP = 10;
const FLOWER = 132;
const COOKIE = 96;
const DISC = 40;
// Tour complet de la fleur décorative, rotation continue comme dans le prototype.
const SPIN_MS = 30000;

type Spring = (typeof springs)[keyof typeof springs];

// Progression 0 → 1 d'une entrée animée ; en mouvement réduit, seule l'opacité s'en sert (fondu).
function useEntrance(delay: number, spring: Spring, reduced: boolean) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(delay, withSpring(1, reduced ? springs.effects : spring));
  }, [delay, spring, reduced, p]);
  return p;
}

function Tile({ index, color, reduced }: { index: number; color: string; reduced: boolean }) {
  const { shape } = useTheme();
  const p = useEntrance(250 + index * 60, springs.spatialFast, reduced);
  const style = useAnimatedStyle(() => (reduced ? { opacity: p.value } : { transform: [{ scale: p.value }] }));
  return <Animated.View style={[styles.tile, { borderRadius: shape.sm, backgroundColor: color }, style]} />;
}

function Art() {
  const { colors, shape, spacing } = useTheme();
  const reduced = useReduceMotion();
  const slab = useEntrance(0, springs.spatialDefault, reduced);
  const flower = useEntrance(100, springs.spatialDefault, reduced);
  const cookie = useEntrance(400, springs.spatialFast, reduced);
  const disc = useEntrance(1000, springs.spatialFast, reduced);
  const spin = useSharedValue(0);

  useEffect(() => {
    if (reduced) {
      cancelAnimation(spin);
      spin.value = 0;
    } else {
      spin.value = withRepeat(withTiming(360, { duration: SPIN_MS, easing: Easing.linear }), -1, false);
    }
  }, [reduced, spin]);

  const slabStyle = useAnimatedStyle(() =>
    reduced ? { opacity: slab.value } : { opacity: Math.min(1, slab.value), transform: [{ translateY: 12 * (1 - slab.value) }] },
  );
  const flowerIn = useAnimatedStyle(() =>
    reduced
      ? { opacity: flower.value }
      : {
          transform: [
            { translateX: 90 * (1 - flower.value) },
            { translateY: -90 * (1 - flower.value) },
            { rotate: `${-90 * (1 - flower.value)}deg` },
          ],
        },
  );
  const flowerSpin = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value}deg` }] }));
  const cookieStyle = useAnimatedStyle(() =>
    reduced ? { opacity: cookie.value } : { transform: [{ translateX: 160 * (1 - cookie.value) }, { rotate: `${120 * (1 - cookie.value)}deg` }] },
  );
  const discStyle = useAnimatedStyle(() => (reduced ? { opacity: disc.value } : { transform: [{ scale: disc.value }] }));

  // 5 × 2 tuiles : la 3e en tertiary, la 5e et la 9e en surface, les autres en primaryContainer.
  const tileColor = (i: number) => (i === 2 ? colors.tertiary : i === 4 || i === 8 ? colors.surface : colors.primaryContainer);

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.art, { marginTop: spacing[2], marginHorizontal: -spacing[6] }]}
    >
      <Animated.View
        style={[
          styles.slab,
          { borderRadius: shape.xl, backgroundColor: colors.primary, paddingVertical: spacing[8], paddingHorizontal: spacing[6], gap: TILE_GAP },
          slabStyle,
        ]}
      >
        {[0, 1].map((row) => (
          <View key={row} style={[styles.tileRow, { gap: TILE_GAP }]}>
            {[0, 1, 2, 3, 4].map((col) => {
              const i = row * 5 + col;
              return <Tile key={i} index={i} color={tileColor(i)} reduced={reduced} />;
            })}
          </View>
        ))}
      </Animated.View>
      <Animated.View style={[styles.flower, flowerIn]}>
        <Animated.View style={flowerSpin}>
          <ExpressiveShape name="flower" size={FLOWER} color={colors.tertiary} />
        </Animated.View>
      </Animated.View>
      <Animated.View style={[styles.cookie, cookieStyle]}>
        <ExpressiveShape name="cookie" size={COOKIE} color={colors.warningContainer} />
      </Animated.View>
      <Animated.View style={[styles.disc, { borderRadius: shape.full, backgroundColor: colors.onSurface }, discStyle]} />
    </View>
  );
}

type Props = { index: number; onGoTo: (index: number) => void; onSkip: () => void };

export function WelcomePage({ index, onGoTo, onSkip }: Props) {
  const { colors, type, fonts, spacing, size } = useTheme();
  return (
    <ScrollView contentContainerStyle={[styles.page, { paddingTop: spacing[4], paddingHorizontal: spacing[6], paddingBottom: spacing[8] }]}>
      <View style={[styles.header, { height: size.tapMin }]}>
        <Text style={[type.titleLarge, { fontFamily: fonts.display, color: colors.onSurface }]}>Mise</Text>
        <Button label="Passer" variant="text" hint="Garde les réglages proposés et ouvre l’app" onPress={onSkip} />
      </View>
      <Art />
      <View style={styles.spacer} />
      <View style={{ gap: spacing[3] }}>
        <Text accessibilityRole="header" style={[type.displaySmall, { color: colors.onSurface }]}>
          Planifie ta semaine en 5 minutes.
        </Text>
        <Text style={[type.bodyLarge, { color: colors.onSurfaceVariant }]}>
          Mise choisit tes repas selon ton budget et ton temps, puis prépare ta liste de courses rangée par rayon.
        </Text>
      </View>
      <View style={[styles.footer, { marginTop: spacing[8] }]}>
        <PageDots count={3} index={index} onSelect={onGoTo} />
        <Button
          label="Suivant"
          size="m"
          icon={<MaterialIcons name="arrow-forward" size={24} color={colors.onPrimary} />}
          onPress={() => onGoTo(1)}
        />
      </View>
      <Text style={[type.bodySmall, styles.hint, { marginTop: spacing[3], color: colors.onSurfaceVariant }]}>
        Glisse vers la gauche pour continuer
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  art: { height: ART_HEIGHT },
  slab: { position: 'absolute', ...SLAB },
  tileRow: { flex: 1, flexDirection: 'row' },
  tile: { flex: 1 },
  flower: { position: 'absolute', right: 18, top: 8 },
  cookie: { position: 'absolute', right: 56, bottom: 12 },
  disc: { position: 'absolute', left: 22, bottom: 40, width: DISC, height: DISC },
  spacer: { flexGrow: 1 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hint: { textAlign: 'center' },
});
