import { INGREDIENTS, IngredientId, StoreId } from '../../data';

// Prix corrigés en magasin, par conditionnement : clé « magasin:ingrédient ».
// Les prix de base restent ceux de MiseData ; une correction se retire pour revenir au prix d'origine.
export type PriceOverrides = Record<string, number>;

const key = (store: StoreId, id: IngredientId) => `${store}:${id}`;

export function packPrice(overrides: PriceOverrides, id: IngredientId, store: StoreId) {
  return overrides[key(store, id)] ?? INGREDIENTS[id].price[store];
}

export function isEdited(overrides: PriceOverrides, id: IngredientId, store: StoreId) {
  return key(store, id) in overrides;
}

// Prix saisi pour toute la ligne (ex. 1,89 € pour 2 boîtes) → prix d'un conditionnement, arrondi au centime.
export function withLinePrice(overrides: PriceOverrides, id: IngredientId, store: StoreId, linePrice: number, packs: number) {
  return { ...overrides, [key(store, id)]: Math.round((linePrice / packs) * 100) / 100 };
}

export function withoutOverride(overrides: PriceOverrides, id: IngredientId, store: StoreId) {
  const next = { ...overrides };
  delete next[key(store, id)];
  return next;
}
