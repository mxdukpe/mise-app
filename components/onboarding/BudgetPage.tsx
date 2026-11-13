import React, { useEffect, useRef } from 'react';
import { AccessibilityInfo, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../ThemeProvider';
import { BUDGET, OnboardingAnswers, PREFERENCES, Preference, Slot, stepBudget } from '../../features/onboarding/settings';
import { Button, Chip, IconButton, useReduceMotion } from '../ui';
import { ButtonGroup } from './ButtonGroup';
import { PageDots } from './PageDots';

// Montant en Fraunces 57/64 (display-large M3) : pas de token à cette taille dans theme.ts.
const FIGURE = { fontSize: 57, lineHeight: 64 };

type Meals = 'midi' | 'soir' | 'both';
const MEALS: { value: Meals; label: string }[] = [
  { value: 'midi', label: 'Midi' },
  { value: 'soir', label: 'Soir' },
  { value: 'both', label: 'Les deux' },
];
const mealsOf = (slots: Slot[]): Meals => (slots.length === 2 ? 'both' : slots[0]);
const slotsOf = (meals: Meals): Slot[] => (meals === 'both' ? ['midi', 'soir'] : [meals]);

type Props = {
  index: number;
  answers: OnboardingAnswers;
  onChange: (answers: OnboardingAnswers) => void;
  onGoTo: (index: number) => void;
  onSkip: () => void;
};

// Le chiffre rebondit à chaque changement de budget ; rien en mouvement réduit.
function useBump(value: number, reduced: boolean) {
  const { springs } = useTheme();
  const scale = useSharedValue(1);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduced) return;
    scale.value = 0.86;
    scale.value = withSpring(1, springs.spatialFast);
  }, [value, reduced, scale, springs]);
  return useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
}

export function BudgetPage({ index, answers, onChange, onGoTo, onSkip }: Props) {
  const { colors, type, fonts, shape, spacing, size } = useTheme();
  const reduced = useReduceMotion();
  const bump = useBump(answers.weeklyBudget, reduced);

  const setBudget = (weeklyBudget: number) => {
    onChange({ ...answers, weeklyBudget });
    AccessibilityInfo.announceForAccessibility(`${weeklyBudget} euros par semaine`);
  };
  const togglePreference = (p: Preference) =>
    onChange({
      ...answers,
      preferences: answers.preferences.includes(p) ? answers.preferences.filter((x) => x !== p) : [...answers.preferences, p],
    });

  return (
    <ScrollView contentContainerStyle={[styles.page, { gap: spacing[5], paddingTop: spacing[4], paddingHorizontal: spacing[6], paddingBottom: spacing[8] }]}>
      <View style={[styles.header, { height: size.tapMin }]}>
        <IconButton icon="arrow-back" label="Retour" onPress={() => onGoTo(0)} />
        <Button label="Passer" variant="text" hint="Garde les réglages proposés et ouvre l’app" onPress={onSkip} />
      </View>

      <View style={{ gap: spacing[2] }}>
        <Text style={[type.labelMedium, styles.eyebrow, { color: colors.onSurfaceVariant }]}>Étape 2 sur 3</Text>
        <Text accessibilityRole="header" style={[type.headlineLarge, { color: colors.onSurface }]}>
          Combien veux-tu dépenser par semaine ?
        </Text>
        <Text style={[type.bodyLarge, { color: colors.onSurfaceVariant }]}>On te prévient quand tu t’en approches.</Text>
      </View>

      <View style={{ gap: spacing[4], paddingVertical: spacing[5], paddingHorizontal: spacing[4], borderRadius: shape.lgPlus, backgroundColor: colors.surfaceContainerLow }}>
        <View style={styles.between}>
          <IconButton
            icon="remove"
            label="Diminuer de 5 euros"
            variant="tonal"
            disabled={answers.weeklyBudget <= BUDGET.min}
            onPress={() => setBudget(stepBudget(answers.weeklyBudget, -1))}
          />
          <View style={styles.center} accessible accessibilityLabel={`Budget : ${answers.weeklyBudget} euros par semaine`}>
            <Animated.Text
              maxFontSizeMultiplier={1.4}
              style={[type.displaySmall, FIGURE, styles.num, { fontFamily: fonts.display, color: colors.onSurface }, bump]}
            >
              {answers.weeklyBudget} €
            </Animated.Text>
            <Text style={[type.bodyMedium, { color: colors.onSurfaceVariant }]}>par semaine</Text>
          </View>
          <IconButton
            icon="add"
            label="Augmenter de 5 euros"
            variant="filled"
            disabled={answers.weeklyBudget >= BUDGET.max}
            onPress={() => setBudget(stepBudget(answers.weeklyBudget, 1))}
          />
        </View>
        <View style={[styles.chips, { gap: spacing[2] }]}>
          {BUDGET.presets.map((b) => (
            <Chip key={b} label={`${b} €`} accessibilityLabel={`${b} euros`} selected={answers.weeklyBudget === b} onPress={() => setBudget(b)} />
          ))}
        </View>
      </View>

      <View style={{ gap: spacing[2] }}>
        <Text style={[type.labelLarge, { color: colors.onSurface }]}>Repas à planifier</Text>
        <ButtonGroup
          label="Repas à planifier"
          options={MEALS}
          value={mealsOf(answers.slots)}
          onChange={(m) => onChange({ ...answers, slots: slotsOf(m) })}
        />
      </View>

      <View style={{ gap: spacing[2] }}>
        <Text style={[type.labelLarge, { color: colors.onSurface }]}>
          Des préférences ? <Text style={[type.bodyMedium, { color: colors.onSurfaceVariant }]}>(facultatif)</Text>
        </Text>
        <View style={[styles.wrap, { gap: spacing[2] }]}>
          {PREFERENCES.map((p) => (
            <Chip key={p} label={p} accessibilityLabel={p} selected={answers.preferences.includes(p)} onPress={() => togglePreference(p)} />
          ))}
        </View>
      </View>

      <View style={styles.spacer} />
      <View style={styles.between}>
        <PageDots count={3} index={index} onSelect={onGoTo} />
        <Button
          label="Continuer"
          size="m"
          icon={<MaterialIcons name="arrow-forward" size={24} color={colors.onPrimary} />}
          onPress={() => onGoTo(2)}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { textTransform: 'uppercase' },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  center: { alignItems: 'center' },
  num: { fontVariant: ['tabular-nums'] },
  chips: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  spacer: { flexGrow: 1 },
});
