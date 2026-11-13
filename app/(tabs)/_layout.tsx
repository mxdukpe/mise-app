import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../ThemeProvider';
import { IconName, useReduceMotion } from '../../components/ui';

const TABS: { name: string; title: string; icon: IconName }[] = [
  { name: 'semaine', title: 'Semaine', icon: 'calendar-month' },
  { name: 'index', title: 'Recettes', icon: 'menu-book' },
  { name: 'courses', title: 'Courses', icon: 'shopping-basket' },
  { name: 'bilan', title: 'Bilan', icon: 'insights' },
];

export const unstable_settings = { anchor: 'index' };

// Indicateur pilule de l'onglet actif : il s'élargit en ressort, ou apparaît en fondu si le mouvement est réduit.
function TabIcon({ icon, focused }: { icon: IconName; focused: boolean }) {
  const { colors, shape, size, springs } = useTheme();
  const reduced = useReduceMotion();
  const progress = useSharedValue(focused ? 1 : 0);
  useEffect(() => {
    progress.value = withSpring(focused ? 1 : 0, reduced ? springs.effects : springs.spatialFast);
  }, [focused, reduced, progress, springs]);
  const indicator = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scaleX: reduced ? 1 : 0.5 + 0.5 * progress.value }],
  }));
  return (
    <Animated.View style={[styles.icon, { width: size.navIndicatorW, height: size.navIndicatorH }]}>
      <Animated.View
        style={[StyleSheet.absoluteFill, { borderRadius: shape.full, backgroundColor: colors.secondaryContainer }, indicator]}
      />
      <MaterialIcons name={icon} size={24} color={focused ? colors.onSecondaryContainer : colors.onSurfaceVariant} />
    </Animated.View>
  );
}

export default function TabsLayout() {
  const { colors, type, size, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      backBehavior="initialRoute"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.onSurface,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: colors.surfaceContainer,
          borderTopWidth: 0,
          height: size.navBar + insets.bottom,
          paddingTop: spacing[2],
        },
        tabBarLabelStyle: [type.labelMedium, { marginTop: spacing[1] }],
      }}
    >
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarAccessibilityLabel: t.title,
            tabBarIcon: ({ focused }) => <TabIcon icon={t.icon} focused={focused} />,
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  icon: { alignItems: 'center', justifyContent: 'center' },
});
