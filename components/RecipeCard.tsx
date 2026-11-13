import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTheme } from '../ThemeProvider';
import { Palette } from '../theme';
import { Recipe, euro, euroSpoken } from '../data';
import { useCatalog } from '../features/catalog/CatalogProvider';
import { AnimatedPressable, Tag, entering, usePressShape, useReduceMotion } from './ui';
import { ExpressiveShape } from './ExpressiveShape';

const MEDIA = 64;

// Aplat de la vignette selon le ton de la recette (design system : mi-shape--<ton>).
const TONE_FILL: Record<Recipe['tone'], keyof Palette> = {
  primary: 'primaryContainer',
  secondary: 'secondaryContainer',
  tertiary: 'tertiaryContainer',
  warning: 'warningContainer',
};

type Props = { recipe: Recipe; index: number; onPress: () => void };

export function RecipeCard({ recipe, index, onPress }: Props) {
  const { colors, type, shape, spacing, elevation } = useTheme();
  const reduced = useReduceMotion();
  const press = usePressShape(shape.lg, shape.xl, 0.98);
  const { portionCost } = useCatalog();
  const cost = portionCost(recipe);
  const label = `${recipe.name}. ${recipe.time} minutes, ${recipe.servings} portions, ${euroSpoken(cost)} par portion.`;

  return (
    <Animated.View entering={entering(index, reduced)}>
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint="Ouvre la fiche recette"
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        style={[
          styles.card,
          elevation.level1,
          { gap: spacing[3], padding: spacing[3], backgroundColor: colors.surfaceContainerLow },
          press.style,
        ]}
      >
        <View style={styles.media} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <View style={StyleSheet.absoluteFill}>
            <ExpressiveShape name={recipe.shape} size={MEDIA} color={colors[TONE_FILL[recipe.tone]]} />
          </View>
          <Text maxFontSizeMultiplier={1} style={[type.headlineSmall, { color: colors.onTertiaryContainer }]}>{recipe.name.charAt(0)}</Text>
        </View>
        <View style={[styles.body, { gap: spacing[1] }]}>
          <Text style={[type.titleMedium, { color: colors.onSurface }]}>{recipe.name}</Text>
          <Text style={[type.bodyMedium, styles.num, { color: colors.onSurfaceVariant }]}>
            {recipe.time} min · {recipe.servings} pers. · {euro(cost)} / portion
          </Text>
          {recipe.tags.length ? (
            <View style={[styles.tags, { gap: spacing[1] }]}>
              {recipe.tags.map((t) => (
                <Tag key={t} label={t} />
              ))}
            </View>
          ) : null}
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row' },
  media: { width: MEDIA, height: MEDIA, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, minWidth: 0, justifyContent: 'center' },
  num: { fontVariant: ['tabular-nums'] },
  tags: { flexDirection: 'row', flexWrap: 'wrap' },
});
