import React, { createContext, useContext, useMemo, useState } from 'react';
import { DISCOVER_RECIPES, IngredientId, RECIPES, Recipe, StoreId } from '../../data';
import { useSettings } from '../onboarding/SettingsProvider';
import { PriceOverrides, withLinePrice, withoutOverride } from '../prices/prices';
import { portionCost, recipeCost } from '../recipes/cost';

type CatalogContextValue = {
  recipes: Recipe[]; // carnet : recettes de démarrage, créées et importées
  findRecipe: (id: string) => Recipe | undefined; // carnet ou idées de Découvrir
  inLibrary: (id: string) => boolean;
  addRecipe: (recipe: Recipe) => void;
  store: StoreId; // magasin courant, lu dans les réglages
  overrides: PriceOverrides;
  setLinePrice: (id: IngredientId, linePrice: number, packs: number) => void;
  resetPrice: (id: IngredientId) => void;
  recipeCost: (recipe: Recipe) => number;
  portionCost: (recipe: Recipe) => number;
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

// Recettes et prix de l'app, en mémoire : ils seront enregistrés dans SQLite en phase 1.
export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const [recipes, setRecipes] = useState<Recipe[]>(RECIPES);
  const [overrides, setOverrides] = useState<PriceOverrides>({});
  const store = settings?.currentStore ?? 'aldi';

  const value = useMemo<CatalogContextValue>(() => {
    const inLibrary = (id: string) => recipes.some((r) => r.id === id);
    return {
      recipes,
      findRecipe: (id) => recipes.find((r) => r.id === id) ?? DISCOVER_RECIPES.find((r) => r.id === id),
      inLibrary,
      addRecipe: (recipe) => setRecipes((prev) => (prev.some((r) => r.id === recipe.id) ? prev : [...prev, recipe])),
      store,
      overrides,
      setLinePrice: (id, linePrice, packs) => setOverrides((prev) => withLinePrice(prev, id, store, linePrice, packs)),
      resetPrice: (id) => setOverrides((prev) => withoutOverride(prev, id, store)),
      recipeCost: (recipe) => recipeCost(recipe, store, overrides),
      portionCost: (recipe) => portionCost(recipe, store, overrides),
    };
  }, [recipes, overrides, store]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog doit être utilisé à l’intérieur de <CatalogProvider>.');
  return ctx;
}
