import { INGREDIENTS, Recipe, StoreId } from '../../data';
import { PriceOverrides, packPrice } from '../prices/prices';

// Coût d'une recette entière : pour chaque ingrédient, quantité ÷ taille du conditionnement × prix du conditionnement.
// `overrides` : prix corrigés en magasin ; sans eux, les prix de base de MiseData.
export function recipeCost(recipe: Recipe, store: StoreId, overrides: PriceOverrides = {}) {
  return recipe.ingredients.reduce((total, { id, qty }) => {
    return total + (qty / INGREDIENTS[id].pack) * packPrice(overrides, id, store);
  }, 0);
}

export function portionCost(recipe: Recipe, store: StoreId, overrides: PriceOverrides = {}) {
  return recipeCost(recipe, store, overrides) / recipe.servings;
}
