import { describe, expect, it } from '@jest/globals';
import { isEdited, packPrice, withLinePrice, withoutOverride } from './prices';

describe('prix corrigés en magasin', () => {
  it('utilise le prix de base tant que rien n’est corrigé', () => {
    expect(packPrice({}, 'poischiche', 'aldi')).toBe(0.59);
    expect(isEdited({}, 'poischiche', 'aldi')).toBe(false);
  });

  it('enregistre le prix de la ligne par conditionnement, pour un seul magasin', () => {
    // 1,30 € vus en rayon pour 2 boîtes de pois chiches → 0,65 € la boîte.
    const o = withLinePrice({}, 'poischiche', 'aldi', 1.3, 2);
    expect(packPrice(o, 'poischiche', 'aldi')).toBe(0.65);
    expect(packPrice(o, 'poischiche', 'auchan')).toBe(0.65); // prix de base Auchan, inchangé
    expect(isEdited(o, 'poischiche', 'auchan')).toBe(false);
  });

  it('revient au prix d’origine', () => {
    const o = withLinePrice({}, 'riz', 'aldi', 2.5, 1);
    expect(packPrice(withoutOverride(o, 'riz', 'aldi'), 'riz', 'aldi')).toBe(1.99);
  });
});
