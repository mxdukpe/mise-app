import React, { useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { useTheme } from '../ThemeProvider';
import { useSettings } from '../features/onboarding/SettingsProvider';
import { DEFAULT_ANSWERS, OnboardingAnswers } from '../features/onboarding/settings';
import { WelcomePage } from '../components/onboarding/WelcomePage';
import { BudgetPage } from '../components/onboarding/BudgetPage';
import { StoresPage } from '../components/onboarding/StoresPage';
import { useReduceMotion } from '../components/ui';

const PAGES = 3;
const SWIPE_START = 12; // points avant que le glissement ne démarre
const EDGE_RESISTANCE = 0.3; // résistance au-delà de la première et de la dernière page
const FLING = 500; // vitesse (points par seconde) d'un geste rapide

export default function OnboardingScreen() {
  const { colors, springs } = useTheme();
  const router = useRouter();
  const { finish, skip } = useSettings();
  const reduced = useReduceMotion();
  const { width } = useWindowDimensions();

  const [page, setPage] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>(DEFAULT_ANSWERS);

  const offset = useSharedValue(0);

  const goTo = (index: number) => {
    setPage(index);
    offset.value = withSpring(
      -index * width,
      reduced ? springs.effects : springs.spatialDefault,
    );
  };

  // Glisser d'une page à l'autre, comme dans le prototype : le doigt déplace les pages,
  // au relâché on passe à la page suivante au-delà d'un quart d'écran ou d'un geste rapide.
  const swipe = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-SWIPE_START, SWIPE_START])
    .failOffsetY([-SWIPE_START, SWIPE_START])
    .onUpdate((e) => {
      const atEdge = (page === 0 && e.translationX > 0) || (page === PAGES - 1 && e.translationX < 0);
      offset.value = -page * width + e.translationX * (atEdge ? EDGE_RESISTANCE : 1);
    })
    .onEnd((e) => {
      const next =
        e.translationX < -width / 4 || e.velocityX < -FLING ? page + 1 : e.translationX > width / 4 || e.velocityX > FLING ? page - 1 : page;
      goTo(Math.max(0, Math.min(PAGES - 1, next)));
    });

  // Seule la page affichée est lue par VoiceOver.
  const pageProps = (i: number) => ({
    style: { width, flex: 1 },
    accessibilityElementsHidden: i !== page,
    importantForAccessibility: i !== page ? ('no-hide-descendants' as const) : ('auto' as const),
  });

  const handleSkip = async () => {
    await skip();
    router.replace('/(tabs)');
  };

  const handleFinish = async () => {
    await finish(answers);
    router.replace('/(tabs)');
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: offset.value }],
    };
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
      <GestureDetector gesture={swipe}>
        <View style={styles.pagerContainer}>
          <Animated.View style={[styles.pagesRow, { width: width * PAGES }, animatedStyle]}>
            <View {...pageProps(0)}>
              <WelcomePage index={page} onGoTo={goTo} onSkip={handleSkip} />
            </View>
            <View {...pageProps(1)}>
              <BudgetPage
                index={page}
                answers={answers}
                onChange={setAnswers}
                onGoTo={goTo}
                onSkip={handleSkip}
              />
            </View>
            <View {...pageProps(2)}>
              <StoresPage
                index={page}
                answers={answers}
                onChange={setAnswers}
                onGoTo={goTo}
                onFinish={handleFinish}
                onSkip={handleSkip}
              />
            </View>
          </Animated.View>
        </View>
      </GestureDetector>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pagerContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  pagesRow: {
    flex: 1,
    flexDirection: 'row',
  },
});
