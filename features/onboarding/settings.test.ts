import { describe, expect, it } from '@jest/globals';
import { DEFAULT_ANSWERS, KeyValueStore, loadSettings, saveAnswers, saveSettings, skipOnboarding, stepBudget } from './settings';

const memoryStore = (): KeyValueStore => {
  const data = new Map<string, string>();
  return {
    getItem: async (key) => data.get(key) ?? null,
    setItem: async (key, value) => {
      data.set(key, value);
    },
  };
};

describe('réponses de l’onboarding', () => {
  it('ne trouve rien tant que l’onboarding n’est pas terminé', async () => {
    expect(await loadSettings(memoryStore())).toBeNull();
  });

  it('enregistre les réponses et les relit telles quelles', async () => {
    const store = memoryStore();
    await saveAnswers(store, { weeklyBudget: 55, slots: ['soir'], preferences: ['Halal', 'Sans gluten'], stores: ['auchan'], nearbyStores: false });
    expect(await loadSettings(store)).toEqual({
      weeklyBudget: 55,
      slots: ['soir'],
      preferences: ['Halal', 'Sans gluten'],
      stores: ['auchan'],
      nearbyStores: false,
      currentStore: 'auchan',
      onboardingDone: true,
    });
  });

  it('garde Aldi comme magasin courant quand il est choisi', async () => {
    const settings = await saveAnswers(memoryStore(), { ...DEFAULT_ANSWERS, stores: ['auchan', 'aldi'] });
    expect(settings.currentStore).toBe('aldi');
  });

  it('« Passer » enregistre les valeurs par défaut', async () => {
    const store = memoryStore();
    await skipOnboarding(store);
    expect(await loadSettings(store)).toEqual({
      weeklyBudget: 40,
      slots: ['midi', 'soir'],
      preferences: ['Végétarien'],
      stores: ['aldi', 'auchan'],
      nearbyStores: true,
      currentStore: 'aldi',
      onboardingDone: true,
    });
  });

  it('change le budget par pas de 5 €, entre 10 et 200 €', () => {
    expect(stepBudget(40, 1)).toBe(45);
    expect(stepBudget(40, -1)).toBe(35);
    expect(stepBudget(10, -1)).toBe(10);
    expect(stepBudget(200, 1)).toBe(200);
  });

  it('garde le magasin choisi dans Courses', async () => {
    const store = memoryStore();
    const settings = await saveAnswers(store, DEFAULT_ANSWERS);
    await saveSettings(store, { ...settings, currentStore: 'auchan' });
    expect((await loadSettings(store))?.currentStore).toBe('auchan');
  });
});
