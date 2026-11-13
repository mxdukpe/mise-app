import { StoreId } from '../../data';

export type Slot = 'midi' | 'soir';

export const PREFERENCES = ['Végétarien', 'Sans porc', 'Sans lactose', 'Halal', 'Sans gluten'] as const;
export type Preference = (typeof PREFERENCES)[number];

export const BUDGET = { min: 10, max: 200, step: 5, presets: [30, 40, 50, 60] } as const;

export type OnboardingAnswers = {
  weeklyBudget: number;
  slots: Slot[];
  preferences: Preference[];
  stores: StoreId[];
  nearbyStores: boolean;
};

export type Settings = OnboardingAnswers & { currentStore: StoreId; onboardingDone: boolean };

// Valeurs proposées à l'ouverture de l'onboarding, et enregistrées par « Passer ».
export const DEFAULT_ANSWERS: OnboardingAnswers = {
  weeklyBudget: 40,
  slots: ['midi', 'soir'],
  preferences: ['Végétarien'],
  stores: ['aldi', 'auchan'],
  nearbyStores: true,
};

// Le même contrat que `expo-sqlite/kv-store` : l'app passe Storage, les tests un stockage en mémoire.
export type KeyValueStore = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
};

const KEY = 'settings';

export const stepBudget = (budget: number, direction: 1 | -1) =>
  Math.max(BUDGET.min, Math.min(BUDGET.max, budget + direction * BUDGET.step));

export async function saveSettings(store: KeyValueStore, settings: Settings): Promise<Settings> {
  await store.setItem(KEY, JSON.stringify(settings));
  return settings;
}

export function saveAnswers(store: KeyValueStore, answers: OnboardingAnswers): Promise<Settings> {
  return saveSettings(store, {
    ...answers,
    // Aldi reste le magasin courant s'il est choisi, comme dans le prototype.
    currentStore: answers.stores.includes('aldi') ? 'aldi' : answers.stores[0],
    onboardingDone: true,
  });
}

export const skipOnboarding = (store: KeyValueStore) => saveAnswers(store, DEFAULT_ANSWERS);

export async function loadSettings(store: KeyValueStore): Promise<Settings | null> {
  const raw = await store.getItem(KEY);
  return raw ? (JSON.parse(raw) as Settings) : null;
}
