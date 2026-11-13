// Liste de courses calculée à partir du planning de la semaine, comme dans le prototype :
// une portion par créneau, quantités additionnées puis arrondies au conditionnement, rayons dans l'ordre du magasin.

import { AISLES, AISLE_ORDER, Aisle, INGREDIENTS, Recipe, StoreId, listQty } from '../../data';
import { PriceOverrides, isEdited, packPrice } from '../prices/prices';
import { WeekPlan, plannedMeals } from './week';

export type ShoppingEntry = {
  ingredientId: string;
  name: string;
  aisle: Aisle;
  packs: number;
  qty: string; // « 2 × 400 g »
  totalPrice: number;
  edited: boolean; // prix corrigé en magasin
};

export type AisleGroup = {
  aisle: Aisle;
  label: string;
  items: ShoppingEntry[];
};

export function aggregateShoppingList(
  plan: WeekPlan,
  store: StoreId,
  findRecipe: (id: string) => Recipe | undefined,
  overrides: PriceOverrides = {},
): AisleGroup[] {
  const need: Record<string, number> = {};
  for (const meal of plannedMeals(plan)) {
    const recipe = findRecipe(meal.recipeId!);
    if (!recipe) continue;
    for (const { id, qty } of recipe.ingredients) {
      need[id] = (need[id] ?? 0) + qty / recipe.servings;
    }
  }

  const entries: ShoppingEntry[] = Object.entries(need).map(([id, qty]) => {
    const ing = INGREDIENTS[id];
    // La petite marge évite d'acheter un conditionnement de plus à cause d'un arrondi (ex. 2,0000001).
    const packs = Math.max(1, Math.ceil(qty / ing.pack - 1e-6));
    return {
      ingredientId: id,
      name: ing.name,
      aisle: ing.aisle,
      packs,
      qty: listQty(ing, packs),
      totalPrice: packs * packPrice(overrides, id, store),
      edited: isEdited(overrides, id, store),
    };
  });

  return AISLE_ORDER[store]
    .map((aisle) => ({
      aisle,
      label: AISLES[aisle],
      items: entries.filter((e) => e.aisle === aisle).sort((a, b) => a.name.localeCompare(b.name, 'fr')),
    }))
    .filter((g) => g.items.length > 0);
}

export const shoppingTotal = (groups: AisleGroup[]) =>
  groups.reduce((sum, g) => sum + g.items.reduce((s, i) => s + i.totalPrice, 0), 0);
