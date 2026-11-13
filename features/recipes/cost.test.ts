import { describe, expect, it } from '@jest/globals';
import { DISCOVER_RECIPES, RECIPES } from '../../data';
import { portionCost, recipeCost } from './cost';

const recipe = (id: string) => RECIPES.find((r) => r.id === id)!;

describe('coût des recettes', () => {
  it('calcule le curry de pois chiches chez Aldi comme le prototype', () => {
    const curry = recipe('curry');
    // 800/400 × 0,59 + 400/400 × 1,29 + 300/1000 × 1,99 + 200/400 × 1,79 + 1/1 × 0,30 + 30/190 × 2,49
    expect(recipeCost(curry, 'aldi')).toBeCloseTo(4.655, 3);
    expect(recipeCost(curry, 'aldi').toFixed(2)).toBe('4.66');
    expect(portionCost(curry, 'aldi').toFixed(2)).toBe('1.16');
  });

  it('divise par le nombre de portions de la recette', () => {
    const pesto = recipe('pesto');
    expect(portionCost(pesto, 'aldi')).toBeCloseTo(recipeCost(pesto, 'aldi') / 2, 10);
  });

  it('utilise les prix du magasin demandé', () => {
    const curry = recipe('curry');
    expect(recipeCost(curry, 'auchan')).toBeGreaterThan(recipeCost(curry, 'aldi'));
  });

  it('a un prix Aldi et Auchan pour chaque ingrédient des recettes et des idées de Découvrir', () => {
    for (const r of [...RECIPES, ...DISCOVER_RECIPES]) {
      expect(Number.isFinite(recipeCost(r, 'aldi'))).toBe(true);
      expect(Number.isFinite(recipeCost(r, 'auchan'))).toBe(true);
    }
  });

  it('donne le coût par portion des idées de Découvrir comme le prototype', () => {
    const dal = DISCOVER_RECIPES.find((r) => r.id === 'dal')!;
    expect(portionCost(dal, 'aldi').toFixed(2)).toBe('0.81');
  });
});
