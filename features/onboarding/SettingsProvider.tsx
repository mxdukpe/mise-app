import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import Storage from 'expo-sqlite/kv-store';
import { StoreId } from '../../data';
import { OnboardingAnswers, Settings, loadSettings, saveAnswers, saveSettings, skipOnboarding } from './settings';

type SettingsContextValue = {
  loaded: boolean;
  settings: Settings | null;
  finish: (answers: OnboardingAnswers) => Promise<void>;
  skip: () => Promise<void>;
  setCurrentStore: (store: StoreId) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

// Réglages enregistrés en local (SQLite clé-valeur), lus une fois au lancement.
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    loadSettings(Storage)
      .then(setSettings)
      .finally(() => setLoaded(true));
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({
      loaded,
      settings,
      finish: async (answers) => setSettings(await saveAnswers(Storage, answers)),
      skip: async () => setSettings(await skipOnboarding(Storage)),
      // Magasin choisi dans Courses : il sert à tous les prix de l'app et reste enregistré.
      setCurrentStore: (currentStore) => {
        if (!settings) return;
        const next = { ...settings, currentStore };
        setSettings(next);
        saveSettings(Storage, next);
      },
    }),
    [loaded, settings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings doit être utilisé à l’intérieur de <SettingsProvider>.');
  return ctx;
}
