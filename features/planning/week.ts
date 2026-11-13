// Semaine de repas : 7 jours × créneaux midi / soir, et dates de la semaine en cours.

import { Recipe, SAMPLE_WEEK } from '../../data';
import { Slot } from '../onboarding/settings';

export type DayId = 'lun' | 'mar' | 'mer' | 'jeu' | 'ven' | 'sam' | 'dim';

export const DAYS: { id: DayId; short: string; long: string }[] = [
  { id: 'lun', short: 'L', long: 'Lundi' },
  { id: 'mar', short: 'M', long: 'Mardi' },
  { id: 'mer', short: 'Me', long: 'Mercredi' },
  { id: 'jeu', short: 'J', long: 'Jeudi' },
  { id: 'ven', short: 'V', long: 'Vendredi' },
  { id: 'sam', short: 'S', long: 'Samedi' },
  { id: 'dim', short: 'D', long: 'Dimanche' },
];

export type MealSlotData = {
  day: DayId;
  slot: Slot;
  recipeId: string | null;
  prepared: boolean;
};

export type WeekPlan = { meals: MealSlotData[] };

// Semaine vide : 14 créneaux (7 jours × 2 repas), tous sans recette.
export function emptyWeek(): WeekPlan {
  const meals: MealSlotData[] = [];
  for (const day of DAYS) {
    meals.push({ day: day.id, slot: 'midi', recipeId: null, prepared: false });
    meals.push({ day: day.id, slot: 'soir', recipeId: null, prepared: false });
  }
  return { meals };
}

// Semaine d'exemple du prototype (« Planifier pour moi »), limitée aux créneaux choisis à l'onboarding.
export function sampleWeek(slots: Slot[]): WeekPlan {
  const week = emptyWeek();
  for (const s of SAMPLE_WEEK) {
    if (!slots.includes(s.slot)) continue;
    const meal = week.meals.find((m) => m.day === DAYS[s.day].id && m.slot === s.slot);
    if (meal) {
      meal.recipeId = s.recipeId;
      meal.prepared = !!s.prepared;
    }
  }
  return week;
}

export const plannedMeals = (plan: WeekPlan) => plan.meals.filter((m) => m.recipeId);

export const preparedCount = (plan: WeekPlan) => plan.meals.filter((m) => m.recipeId && m.prepared).length;

// Jours d'affilée, depuis lundi, avec au moins un repas préparé.
export function currentStreak(plan: WeekPlan): number {
  let streak = 0;
  for (const day of DAYS) {
    if (plan.meals.some((m) => m.day === day.id && m.recipeId && m.prepared)) streak++;
    else break;
  }
  return streak;
}

export function dayHasMeals(plan: WeekPlan, day: DayId): boolean {
  return plan.meals.some((m) => m.day === day && m.recipeId);
}

// Coût de la semaine : une portion par créneau planifié, comme dans le prototype.
export function weekCost(plan: WeekPlan, findRecipe: (id: string) => Recipe | undefined, portionCost: (r: Recipe) => number) {
  return plannedMeals(plan).reduce((total, m) => {
    const recipe = findRecipe(m.recipeId!);
    return recipe ? total + portionCost(recipe) : total;
  }, 0);
}

/* ---------- Dates de la semaine en cours ---------- */

const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

// Index du jour dans la semaine (lundi = 0).
export const dayIndex = (date: Date) => (date.getDay() + 6) % 7;

export function startOfWeek(date: Date): Date {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  monday.setDate(monday.getDate() - dayIndex(date));
  return monday;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// « 26 oct. »
export const shortDate = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]}`;

// « 26 oct. – 1 nov. »
export const weekRange = (monday: Date) => `${shortDate(monday)} – ${shortDate(addDays(monday, 6))}`;

// « Jeudi 29 », « Dimanche 1er »
export const dayTitle = (monday: Date, index: number) => {
  const n = addDays(monday, index).getDate();
  return `${DAYS[index].long} ${n === 1 ? '1er' : n}`;
};
