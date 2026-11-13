import React, { createContext, useContext, useMemo, useState } from 'react';
import { useCatalog } from '../catalog/CatalogProvider';
import { useSettings } from '../onboarding/SettingsProvider';
import { DEFAULT_ANSWERS, Slot } from '../onboarding/settings';
import { DayId, WeekPlan, dayIndex, DAYS, emptyWeek, sampleWeek, weekCost } from './week';

type PlanningContextValue = {
  plan: WeekPlan;
  slots: Slot[]; // créneaux choisis à l'onboarding
  weeklyBudget: number;
  selectedDay: DayId;
  setSelectedDay: (day: DayId) => void;
  assignRecipe: (day: DayId, slot: Slot, recipeId: string) => void;
  removeRecipe: (day: DayId, slot: Slot) => void;
  togglePrepared: (day: DayId, slot: Slot) => void;
  loadSample: () => void;
  clearWeek: () => void;
  isEmpty: boolean;
  weekCost: number;
};

const PlanningContext = createContext<PlanningContextValue | null>(null);

const setMeal = (plan: WeekPlan, day: DayId, slot: Slot, change: (m: WeekPlan['meals'][number]) => WeekPlan['meals'][number]) => ({
  meals: plan.meals.map((m) => (m.day === day && m.slot === slot ? change(m) : m)),
});

// Planning de la semaine en cours, en mémoire : il sera enregistré dans SQLite en phase 1.
export function PlanningProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const { findRecipe, portionCost } = useCatalog();
  const [plan, setPlan] = useState<WeekPlan>(emptyWeek);
  const [selectedDay, setSelectedDay] = useState<DayId>(DAYS[dayIndex(new Date())].id);
  const slots = settings?.slots ?? DEFAULT_ANSWERS.slots;
  const weeklyBudget = settings?.weeklyBudget ?? DEFAULT_ANSWERS.weeklyBudget;

  const value = useMemo<PlanningContextValue>(
    () => ({
      plan,
      slots,
      weeklyBudget,
      selectedDay,
      setSelectedDay,
      assignRecipe: (day, slot, recipeId) => setPlan((prev) => setMeal(prev, day, slot, (m) => ({ ...m, recipeId, prepared: false }))),
      removeRecipe: (day, slot) => setPlan((prev) => setMeal(prev, day, slot, (m) => ({ ...m, recipeId: null, prepared: false }))),
      togglePrepared: (day, slot) =>
        setPlan((prev) => setMeal(prev, day, slot, (m) => (m.recipeId ? { ...m, prepared: !m.prepared } : m))),
      loadSample: () => setPlan(sampleWeek(slots)),
      clearWeek: () => setPlan(emptyWeek()),
      isEmpty: plan.meals.every((m) => !m.recipeId),
      weekCost: weekCost(plan, findRecipe, portionCost),
    }),
    [plan, slots, weeklyBudget, selectedDay, findRecipe, portionCost],
  );

  return <PlanningContext.Provider value={value}>{children}</PlanningContext.Provider>;
}

export function usePlanning() {
  const ctx = useContext(PlanningContext);
  if (!ctx) throw new Error('usePlanning doit être utilisé à l’intérieur de <PlanningProvider>.');
  return ctx;
}
