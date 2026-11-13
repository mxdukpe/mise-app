// Données de démonstration : mêmes recettes, ingrédients et prix que l'objet MiseData du prototype.
// Prix d'exemple par conditionnement (`pack`), chez Aldi et Auchan ; `unit` est l'unité de base.

export type StoreId = 'aldi' | 'auchan';
export type Unit = 'g' | 'ml' | 'pc';
export type Aisle = 'fruits' | 'epicerie' | 'frais' | 'boulangerie';

export type Ingredient = {
  name: string; // nom en liste de courses
  recipeName?: string; // nom affiché dans une recette, s'il diffère
  aisle: Aisle;
  unit: Unit;
  pack: number; // taille du conditionnement, dans l'unité de base
  show?: 'boite' | 'cas'; // affichage en boîtes ou en cuillères à soupe dans une recette
  price: Record<StoreId, number>; // prix d'un conditionnement
};

export type IngredientId = string;
export type RecipeIngredient = { id: IngredientId; qty: number };

export type Recipe = {
  id: string;
  name: string;
  time: number;
  servings: number;
  shape: 'flower' | 'cookie' | 'clover' | 'sunny';
  tone: 'primary' | 'secondary' | 'tertiary' | 'warning';
  tags: string[];
  ingredients: RecipeIngredient[];
  steps: string[];
  mine?: boolean; // recette créée par l'utilisatrice
  featured?: boolean; // « Idée du jour » de l'écran Découvrir
};

export const STORES = { aldi: 'Aldi', auchan: 'Auchan' } as const;

export const AISLES: Record<Aisle, string> = {
  fruits: 'Fruits et légumes',
  epicerie: 'Épicerie',
  frais: 'Frais',
  boulangerie: 'Boulangerie',
};

// Ordre des rayons dans chaque magasin, comme dans le prototype.
export const AISLE_ORDER: Record<StoreId, Aisle[]> = {
  aldi: ['epicerie', 'frais', 'fruits', 'boulangerie'],
  auchan: ['fruits', 'frais', 'epicerie', 'boulangerie'],
};

export const INGREDIENTS: Record<string, Ingredient> = {
  poischiche: { name: 'Pois chiches (boîte)', recipeName: 'Pois chiches', aisle: 'epicerie', unit: 'g', pack: 400, show: 'boite', price: { aldi: 0.59, auchan: 0.65 } },
  coco: { name: 'Lait de coco', aisle: 'epicerie', unit: 'ml', pack: 400, price: { aldi: 1.29, auchan: 1.42 } },
  riz: { name: 'Riz basmati', aisle: 'epicerie', unit: 'g', pack: 1000, price: { aldi: 1.99, auchan: 2.19 } },
  epinard: { name: 'Épinards frais', recipeName: 'Épinards', aisle: 'fruits', unit: 'g', pack: 400, price: { aldi: 1.79, auchan: 1.97 } },
  oignon: { name: 'Oignons', recipeName: 'Oignon', aisle: 'fruits', unit: 'pc', pack: 1, price: { aldi: 0.3, auchan: 0.33 } },
  curry: { name: 'Pâte de curry', aisle: 'epicerie', unit: 'g', pack: 190, show: 'cas', price: { aldi: 2.49, auchan: 2.74 } },
  pates: { name: 'Pâtes penne', aisle: 'epicerie', unit: 'g', pack: 500, price: { aldi: 0.79, auchan: 0.87 } },
  pesto: { name: 'Pesto alla genovese', recipeName: 'Pesto', aisle: 'epicerie', unit: 'g', pack: 190, price: { aldi: 1.49, auchan: 1.64 } },
  courgette: { name: 'Courgettes', aisle: 'fruits', unit: 'pc', pack: 1, price: { aldi: 0.75, auchan: 0.83 } },
  oeuf: { name: 'Œufs plein air', recipeName: 'Œufs', aisle: 'frais', unit: 'pc', pack: 6, price: { aldi: 1.89, auchan: 2.08 } },
  poivron: { name: 'Poivrons', recipeName: 'Poivron', aisle: 'fruits', unit: 'pc', pack: 1, price: { aldi: 0.69, auchan: 0.76 } },
  emmental: { name: 'Emmental râpé', aisle: 'frais', unit: 'g', pack: 200, price: { aldi: 1.27, auchan: 1.4 } },
  petitpois: { name: 'Petits pois (boîte)', recipeName: 'Petits pois', aisle: 'epicerie', unit: 'g', pack: 400, price: { aldi: 0.89, auchan: 0.98 } },
  soja: { name: 'Sauce soja', aisle: 'epicerie', unit: 'ml', pack: 250, price: { aldi: 1.49, auchan: 1.64 } },
  lentille: { name: 'Lentilles corail', aisle: 'epicerie', unit: 'g', pack: 500, price: { aldi: 1.79, auchan: 1.97 } },
  carotte: { name: 'Carottes', recipeName: 'Carotte', aisle: 'fruits', unit: 'pc', pack: 1, price: { aldi: 0.15, auchan: 0.17 } },
  tortilla: { name: 'Tortillas de blé', recipeName: 'Tortillas', aisle: 'boulangerie', unit: 'pc', pack: 8, price: { aldi: 1.39, auchan: 1.53 } },
  poulet: { name: 'Émincés de poulet', aisle: 'frais', unit: 'g', pack: 250, price: { aldi: 3.49, auchan: 3.84 } },
  concombre: { name: 'Concombre', aisle: 'fruits', unit: 'pc', pack: 1, price: { aldi: 0.79, auchan: 0.87 } },
  haricot: { name: 'Haricots rouges (boîte)', recipeName: 'Haricots rouges', aisle: 'epicerie', unit: 'g', pack: 500, show: 'boite', price: { aldi: 0.79, auchan: 0.87 } },
  tomate: { name: 'Tomates concassées', aisle: 'epicerie', unit: 'g', pack: 400, price: { aldi: 0.65, auchan: 0.72 } },
  mais: { name: 'Maïs doux', recipeName: 'Maïs', aisle: 'epicerie', unit: 'g', pack: 140, price: { aldi: 0.69, auchan: 0.76 } },
  citron: { name: 'Citrons', recipeName: 'Citron', aisle: 'fruits', unit: 'pc', pack: 1, price: { aldi: 0.35, auchan: 0.39 } },
  feta: { name: 'Feta', aisle: 'frais', unit: 'g', pack: 200, price: { aldi: 1.99, auchan: 2.19 } },
  champi: { name: 'Champignons de Paris', recipeName: 'Champignons', aisle: 'fruits', unit: 'g', pack: 250, price: { aldi: 1.19, auchan: 1.31 } },
  thon: { name: 'Thon au naturel', aisle: 'epicerie', unit: 'g', pack: 140, price: { aldi: 1.23, auchan: 1.35 } },
};

export const RECIPES: Recipe[] = [
  {
    id: 'curry', name: 'Curry de pois chiches', time: 25, servings: 4, shape: 'cookie', tone: 'tertiary',
    tags: ['batch', 'pas cher', 'végé'],
    ingredients: [{ id: 'poischiche', qty: 800 }, { id: 'coco', qty: 400 }, { id: 'riz', qty: 300 }, { id: 'epinard', qty: 200 }, { id: 'oignon', qty: 1 }, { id: 'curry', qty: 30 }],
    steps: [
      'Fais revenir l’oignon émincé avec la pâte de curry pendant 3 minutes.',
      'Ajoute les pois chiches égouttés et le lait de coco, laisse mijoter 15 minutes.',
      'Incorpore les épinards à la fin et sers avec le riz.',
    ],
  },
  {
    id: 'pesto', name: 'Pâtes pesto et courgettes', time: 15, servings: 2, shape: 'flower', tone: 'primary',
    tags: ['rapide', 'végé'],
    ingredients: [{ id: 'pates', qty: 200 }, { id: 'pesto', qty: 90 }, { id: 'courgette', qty: 2 }],
    steps: [
      'Fais cuire les pâtes.',
      'Poêle les courgettes en fines rondelles 5 minutes.',
      'Mélange le tout avec le pesto.',
    ],
  },
  {
    id: 'omelette', name: 'Omelette aux légumes', time: 15, servings: 2, shape: 'sunny', tone: 'warning',
    tags: ['rapide', 'pas cher', 'végé'],
    ingredients: [{ id: 'oeuf', qty: 4 }, { id: 'poivron', qty: 1 }, { id: 'oignon', qty: 1 }, { id: 'emmental', qty: 30 }],
    steps: [
      'Fais revenir l’oignon et le poivron en dés 5 minutes.',
      'Verse les œufs battus, parsème d’emmental, plie l’omelette.',
    ],
  },
  {
    id: 'riz', name: 'Riz sauté aux œufs', time: 20, servings: 2, shape: 'clover', tone: 'primary',
    tags: ['pas cher', 'batch'],
    ingredients: [{ id: 'riz', qty: 150 }, { id: 'oeuf', qty: 2 }, { id: 'petitpois', qty: 150 }, { id: 'oignon', qty: 1 }, { id: 'soja', qty: 20 }],
    steps: [
      'Utilise du riz cuit la veille si possible.',
      'Saute l’oignon et les petits pois, ajoute le riz puis les œufs brouillés.',
      'Assaisonne avec la sauce soja.',
    ],
  },
  {
    id: 'soupe', name: 'Soupe de lentilles corail', time: 30, servings: 4, shape: 'clover', tone: 'secondary',
    tags: ['pas cher', 'batch', 'végé'],
    ingredients: [{ id: 'lentille', qty: 250 }, { id: 'carotte', qty: 3 }, { id: 'oignon', qty: 1 }, { id: 'coco', qty: 200 }],
    steps: [
      'Fais revenir l’oignon et les carottes en dés.',
      'Ajoute les lentilles et 1 litre d’eau, cuis 20 minutes.',
      'Mixe avec le lait de coco.',
    ],
  },
  {
    id: 'chili', name: 'Chili sin carne', time: 40, servings: 6, shape: 'sunny', tone: 'tertiary',
    tags: ['batch', 'pas cher', 'végé'],
    ingredients: [{ id: 'haricot', qty: 1000 }, { id: 'tomate', qty: 800 }, { id: 'mais', qty: 280 }, { id: 'oignon', qty: 2 }, { id: 'riz', qty: 450 }],
    steps: [
      'Fais revenir les oignons.',
      'Ajoute haricots, tomates et maïs, laisse mijoter 25 minutes.',
      'Sers avec le riz.',
    ],
  },
  {
    id: 'wraps', name: 'Wraps poulet crudités', time: 20, servings: 2, shape: 'cookie', tone: 'primary',
    tags: ['rapide'],
    ingredients: [{ id: 'tortilla', qty: 4 }, { id: 'poulet', qty: 250 }, { id: 'carotte', qty: 1 }, { id: 'concombre', qty: 1 }],
    steps: [
      'Saisis les émincés de poulet 6 minutes.',
      'Garnis les tortillas de poulet, carotte râpée et concombre, roule.',
    ],
  },
];

// Idées de l'écran Découvrir : exemples du prototype, en attendant le choix d'une API (phase 8).
export const DISCOVER_RECIPES: Recipe[] = [
  {
    id: 'dal', name: 'Dal de lentilles au citron', time: 35, servings: 4, shape: 'clover', tone: 'secondary', featured: true,
    tags: ['pas cher', 'végé', 'batch'],
    ingredients: [{ id: 'lentille', qty: 300 }, { id: 'coco', qty: 200 }, { id: 'oignon', qty: 1 }, { id: 'curry', qty: 20 }, { id: 'citron', qty: 1 }, { id: 'riz', qty: 300 }],
    steps: [
      'Fais revenir l’oignon avec la pâte de curry.',
      'Ajoute les lentilles, le lait de coco et 70 cl d’eau, cuis 20 minutes.',
      'Termine avec le jus de citron, sers avec le riz.',
    ],
  },
  {
    id: 'shak', name: 'Shakshuka', time: 25, servings: 2, shape: 'sunny', tone: 'tertiary',
    tags: ['végé'],
    ingredients: [{ id: 'tomate', qty: 400 }, { id: 'poivron', qty: 1 }, { id: 'oignon', qty: 1 }, { id: 'oeuf', qty: 4 }, { id: 'feta', qty: 50 }],
    steps: [
      'Fais compoter l’oignon, le poivron et les tomates 10 minutes.',
      'Creuse 4 puits, casse les œufs, couvre 6 minutes.',
      'Émiette la feta avant de servir.',
    ],
  },
  {
    id: 'bibim', name: 'Bibimbap express', time: 30, servings: 2, shape: 'flower', tone: 'primary',
    tags: ['rapide'],
    ingredients: [{ id: 'riz', qty: 200 }, { id: 'oeuf', qty: 2 }, { id: 'carotte', qty: 2 }, { id: 'epinard', qty: 150 }, { id: 'champi', qty: 250 }, { id: 'soja', qty: 30 }],
    steps: [
      'Cuis le riz.',
      'Saute séparément carottes en bâtonnets, épinards et champignons.',
      'Dispose sur le riz avec un œuf au plat et la sauce soja.',
    ],
  },
];

// Semaine d'exemple de « Planifier pour moi » (11 repas), comme SAMPLE dans le prototype.
// Jour 0 = lundi ; `prepared` : repas déjà marqué comme préparé.
export const SAMPLE_WEEK: { day: number; slot: 'midi' | 'soir'; recipeId: string; prepared?: boolean }[] = [
  { day: 0, slot: 'midi', recipeId: 'curry', prepared: true },
  { day: 0, slot: 'soir', recipeId: 'pesto' },
  { day: 1, slot: 'midi', recipeId: 'curry' },
  { day: 2, slot: 'midi', recipeId: 'soupe' },
  { day: 2, slot: 'soir', recipeId: 'omelette' },
  { day: 3, slot: 'midi', recipeId: 'soupe' },
  { day: 3, slot: 'soir', recipeId: 'riz' },
  { day: 4, slot: 'midi', recipeId: 'chili' },
  { day: 5, slot: 'midi', recipeId: 'chili' },
  { day: 5, slot: 'soir', recipeId: 'wraps' },
  { day: 6, slot: 'soir', recipeId: 'riz' },
];

// Les cinq états de la liste
export type ListState = 'loading' | 'empty' | 'error' | 'partial' | 'success';

// Fausse API du TP3 : `forced` permet de forcer un état pour les captures. Remplacée par SQLite en phase 1.
export async function fetchRecipes(
  library: Recipe[],
  forced: ListState = 'success',
): Promise<{ recipes: Recipe[]; partial: boolean }> {
  await new Promise((r) => setTimeout(r, 900));
  if (forced === 'error') throw new Error('network');
  if (forced === 'empty') return { recipes: [], partial: false };
  if (forced === 'partial') return { recipes: library.slice(0, 2), partial: true };
  return { recipes: library, partial: false };
}

// Espace insécable : le « € » ne passe jamais seul à la ligne.
export const euro = (n: number) => n.toFixed(2).replace('.', ',') + '\u00a0€';

// Version lue par VoiceOver / TalkBack : « 1 euro 35 »
export const euroSpoken = (n: number) => {
  const e = Math.floor(n);
  const c = Math.round((n - e) * 100);
  return c ? `${e} euro ${c}` : `${e} euros`;
};

const decimal = (n: number) => String(n).replace('.', ',');

// Lit un prix saisi (« 1,89 », « 1.89 € ») ; null si ce n'est pas un nombre.
export function parsePrice(text: string): number | null {
  const n = parseFloat(text.replace(/\s|€/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function unitText(q: number, unit: Unit) {
  if (unit === 'g') return q >= 1000 ? `${decimal(+(q / 1000).toFixed(2))} kg` : `${q} g`;
  if (unit === 'ml') return q >= 1000 ? `${decimal(+(q / 1000).toFixed(2))} L` : `${q} ml`;
  return `${q} ${q > 1 ? 'pièces' : 'pièce'}`;
}

// Quantité affichée dans la liste de courses, comme dans le prototype : « 2 × 400 g », « 6 », « 3 pièces ».
export function listQty(i: Ingredient, packs: number) {
  const times = packs > 1 ? `${packs} × ` : '';
  if (i.unit === 'pc') return i.pack > 1 ? `${times}${i.pack}` : unitText(packs, 'pc');
  return `${times}${unitText(i.pack, i.unit)}`;
}

// Quantité affichée dans une recette, comme dans le prototype : « 2 boîtes », « 40 cl », « 2 c. à s. ».
export function recipeQty(item: RecipeIngredient) {
  const i = INGREDIENTS[item.id];
  const q = item.qty;
  if (i.show === 'boite') {
    const b = Math.round((q / i.pack) * 2) / 2;
    return `${decimal(b)} ${b > 1 ? 'boîtes' : 'boîte'}`;
  }
  if (i.show === 'cas') return `${Math.max(1, Math.round(q / 15))} c. à s.`;
  if (i.unit === 'pc') {
    const p = Math.round(q * 2) / 2;
    return `${decimal(p)} ${p > 1 ? 'pièces' : 'pièce'}`;
  }
  if (i.unit === 'ml') return q >= 100 ? `${decimal(+(q / 10).toFixed(1))} cl` : `${q} ml`;
  return unitText(Math.round(q), 'g');
}
