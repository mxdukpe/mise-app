import React from 'react';
import { StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Fraunces_500Medium, Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import {
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
} from '@expo-google-fonts/hanken-grotesk';
import { ThemeProvider, useTheme } from '../ThemeProvider';
import { SettingsProvider, useSettings } from '../features/onboarding/SettingsProvider';
import { CatalogProvider } from '../features/catalog/CatalogProvider';
import { PlanningProvider } from '../features/planning/planningStore';

export default function RootLayout() {
  const [loaded] = useFonts({
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
  });
  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <ThemeProvider>
        <SettingsProvider>
          <CatalogProvider>
            <PlanningProvider>
              <ThemedStack />
            </PlanningProvider>
          </CatalogProvider>
        </SettingsProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function ThemedStack() {
  const { colors, isDark } = useTheme();
  const { loaded, settings } = useSettings();
  if (!loaded) return null;
  // Tant que l'onboarding n'est pas terminé, seules ses pages sont accessibles.
  const onboarded = !!settings?.onboardingDone;
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.surface },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Protected guard={onboarded}>
          <Stack.Screen name="(tabs)" options={{ title: 'Mise' }} />
          <Stack.Screen name="recipe/[id]" options={{ title: 'Fiche recette' }} />
          <Stack.Screen name="recipe/nouvelle" options={{ title: 'Nouvelle recette' }} />
          <Stack.Screen
            name="choisir-recette"
            options={{
              title: 'Choisir une recette',
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="modifier-prix"
            options={{
              title: 'Modifier un prix',
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen name="decouvrir" options={{ title: 'Découvrir' }} />
        </Stack.Protected>
        <Stack.Protected guard={!onboarded}>
          <Stack.Screen name="onboarding" options={{ title: 'Bienvenue', animation: 'fade' }} />
        </Stack.Protected>
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
