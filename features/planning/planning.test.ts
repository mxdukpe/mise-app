import { describe, expect, it } from '@jest/globals';
import { DISCOVER_RECIPES, RECIPES, StoreId } from '../../data';
import { portionCost } from '../recipes/cost';
import { withLinePrice } from '../prices/prices';
import { aggregateShoppingList, shoppingTotal } from './shopping';
import {
  WeekPlan,
  currentStreak,
  dayIndex,
  dayTitle,
  emptyWeek,
  plannedMeals,
  preparedCount,
  sampleWeek,
  startOfWeek,
  weekCost,
  weekRange,
} from './week';

const find = (id: string) => RECIPES.find((r) => r.id === id) ?? DISCOVER_RECIPES.find((r) => r.id === id);
const cost = (plan: WeekPlan, store: StoreId) => weekCost(plan, find, (r) => portionCost(r, store));

// Valeurs de référence calculées avec le code du prototype (semaine d'exemple, 11 repas).
describe('semaine d’exemple', () => {
  it('reprend les 11 repas du prototype, limités aux créneaux choisis', () => {
    expect(plannedMeals(sampleWeek(['midi', 'soir']))).toHaveLength(11);
    expect(plannedMeals(sampleWeek(['midi']))).toHaveLength(6);
    expect(preparedCount(sampleWeek(['midi', 'soir']))).toBe(1);
  });

  it('coûte une portion par créneau, comme le prototype', () => {
    expect(cost(sampleWeek(['midi', 'soir']), 'aldi').toFixed(2)).toBe('12.12');
    expect(cost(sampleWeek(['midi', 'soir']), 'auchan').toFixed(2)).toBe('13.35');
    expect(cost(emptyWeek(), 'aldi')).toBe(0);
  });

  it('compte les jours d’affilée avec un repas préparé', () => {
    expect(currentStreak(sampleWeek(['midi', 'soir']))).toBe(1);
    expect(currentStreak(emptyWeek())).toBe(0);
  });
});

describe('liste de courses', () => {
  const week = sampleWeek(['midi', 'soir']);

  it('donne le même total que le prototype chez Aldi et chez Auchan', () => {
    const aldi = aggregateShoppingList(week, 'aldi', find);
    expect(aldi.flatMap((g) => g.items)).toHaveLength(22);
    expect(shoppingTotal(aldi).toFixed(2)).toBe('28.50');
    expect(shoppingTotal(aggregateShoppingList(week, 'auchan', find)).toFixed(2)).toBe('31.39');
  });

  it('range les rayons dans l’ordre de chaque magasin', () => {
    expect(aggregateShoppingList(week, 'aldi', find).map((g) => g.aisle)).toEqual(['epicerie', 'frais', 'fruits', 'boulangerie']);
    expect(aggregateShoppingList(week, 'auchan', find).map((g) => g.aisle)).toEqual(['fruits', 'frais', 'epicerie', 'boulangerie']);
  });

  it('additionne un ingrédient partagé puis arrondit au conditionnement', () => {
    const items = aggregateShoppingList(week, 'aldi', find).flatMap((g) => g.items);
    const oignon = items.find((i) => i.ingredientId === 'oignon')!;
    expect(oignon.packs).toBe(4);
    expect(oignon.qty).toBe('4 pièces');
    expect(items.find((i) => i.ingredientId === 'riz')!.qty).toBe('1 kg');
  });

  it('applique un prix corrigé et le signale', () => {
    // Œufs : 1 boîte de 6 dans la liste, vue à 2,19 € en rayon.
    const overrides = withLinePrice({}, 'oeuf', 'aldi', 2.19, 1);
    const items = aggregateShoppingList(week, 'aldi', find, overrides).flatMap((g) => g.items);
    const oeuf = items.find((i) => i.ingredientId === 'oeuf')!;
    expect(oeuf.totalPrice).toBeCloseTo(2.19, 10);
    expect(oeuf.edited).toBe(true);
    expect(shoppingTotal(aggregateShoppingList(week, 'aldi', find, overrides)).toFixed(2)).toBe('28.80');
  });

  it('est vide quand la semaine est vide', () => {
    expect(aggregateShoppingList(emptyWeek(), 'aldi', find)).toEqual([]);
  });
});

describe('dates de la semaine', () => {
  const jeudi = new Date(2026, 9, 29); // jeudi 29 octobre 2026

  it('part du lundi de la semaine en cours', () => {
    expect(dayIndex(jeudi)).toBe(3);
    expect(startOfWeek(jeudi).getDate()).toBe(26);
    expect(dayIndex(new Date(2026, 10, 1))).toBe(6); // dimanche
  });

  it('affiche les dates comme les maquettes', () => {
    const monday = startOfWeek(jeudi);
    expect(weekRange(monday)).toBe('26 oct. – 1 nov.');
    expect(dayTitle(monday, 3)).toBe('Jeudi 29');
    expect(dayTitle(monday, 6)).toBe('Dimanche 1er');
  });
});
