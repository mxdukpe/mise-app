import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../ThemeProvider';
import { INGREDIENTS, Recipe, euro } from '../data';
import { useCatalog } from '../features/catalog/CatalogProvider';
import { usePlanning } from '../features/planning/planningStore';
import { DayId, DAYS } from '../features/planning/week';
import { Slot } from '../features/onboarding/settings';
import { Chip, IconButton, SearchField } from '../components/ui';
import { RecipeCard } from '../components/RecipeCard';

const FILTER_TAGS = ['rapide', 'pas cher', 'batch', 'végé'] as const;

export default function ChoisirRecetteModal() {
  const { colors, type, spacing } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ day?: DayId; slot?: Slot }>();
  const { assignRecipe, weekCost, weeklyBudget } = usePlanning();
  const { recipes } = useCatalog();

  const dayId: DayId = (params.day as DayId) || 'lun';
  const slot: Slot = (params.slot as Slot) || 'soir';
  const dayName = DAYS.find((d) => d.id === dayId)?.long || 'Lundi';
  const slotName = slot === 'midi' ? 'Midi' : 'Soir';

  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const budgetRemaining = Math.max(0, weeklyBudget - weekCost);

  const filteredRecipes = useMemo(() => {
    const q = query.trim().toLowerCase();
    return recipes.filter((r) => {
      const matchesQuery =
        !q || r.name.toLowerCase().includes(q) || r.ingredients.some((i) => INGREDIENTS[i.id].name.toLowerCase().includes(q));
      return matchesQuery && (!activeTag || r.tags.includes(activeTag));
    });
  }, [recipes, query, activeTag]);

  const handleSelect = (recipe: Recipe) => {
    assignRecipe(dayId, slot, recipe.id);
    router.back();
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Modal Header */}
      <View style={[styles.header, { paddingHorizontal: spacing[4], paddingVertical: spacing[3] }]}>
        <View style={styles.headerTitle}>
          <Text style={[type.labelMedium, { color: colors.onSurfaceVariant, textTransform: 'uppercase' }]}>
            {dayName} · {slotName}
          </Text>
          <Text accessibilityRole="header" style={[type.titleLarge, { color: colors.onSurface }]}>
            Choisir une recette
          </Text>
        </View>
        <IconButton icon="close" label="Fermer" onPress={() => router.back()} />
      </View>

      {/* Search Bar */}
      <View style={{ paddingHorizontal: spacing[4], marginBottom: spacing[2] }}>
        <SearchField
          value={query}
          placeholder="Rechercher une recette…"
          accessibilityLabel="Rechercher une recette"
          onChangeText={setQuery}
        />
      </View>

      {/* Filter Chips */}
      <View style={[styles.chipsRow, { paddingHorizontal: spacing[4], gap: spacing[2], marginBottom: spacing[3] }]}>
        {FILTER_TAGS.map((tag) => (
          <Chip
            key={tag}
            label={tag.charAt(0).toUpperCase() + tag.slice(1)}
            selected={activeTag === tag}
            onPress={() => setActiveTag(activeTag === tag ? null : tag)}
          />
        ))}
      </View>

      {/* Budget Info */}
      <View style={[styles.infoRow, { paddingHorizontal: spacing[4], marginBottom: spacing[3] }]}>
        <Text style={[type.bodyMedium, { color: colors.onSurfaceVariant }]}>
          Reste dans le budget : <Text style={[type.labelLarge, { color: colors.primary }]}>{euro(budgetRemaining)}</Text>
        </Text>
        <Text style={[type.bodySmall, { color: colors.onSurfaceVariant }]}>
          {filteredRecipes.length} {filteredRecipes.length > 1 ? 'recettes' : 'recette'}
        </Text>
      </View>

      {/* Recipe List */}
      <FlatList
        data={filteredRecipes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingHorizontal: spacing[4], paddingBottom: spacing[6], gap: spacing[3] }]}
        renderItem={({ item, index }) => (
          <RecipeCard
            recipe={item}
            index={index}
            onPress={() => handleSelect(item)}
          />
        )}
        ListEmptyComponent={
          <View style={[styles.empty, { paddingVertical: spacing[8] }]}>
            <Text style={[type.bodyLarge, { color: colors.onSurfaceVariant, textAlign: 'center' }]}>
              Aucune recette ne correspond. Essaie un autre mot ou retire le filtre.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    flex: 1,
  },
  chipsRow: {
    flexDirection: 'row',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  list: {
    flexGrow: 1,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
