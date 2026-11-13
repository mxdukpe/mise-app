import React, { useMemo, useState } from 'react';
import { AccessibilityInfo, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../ThemeProvider';
import { DISCOVER_RECIPES, INGREDIENTS, Recipe, euro } from '../data';
import { useCatalog } from '../features/catalog/CatalogProvider';
import { Button, Chip, SearchField, TopAppBar } from '../components/ui';
import { ExpressiveShape } from '../components/ExpressiveShape';
import { RecipeCard } from '../components/RecipeCard';

const CLOVER = 150;
const CHEAP = 2; // « Moins de 2 € » la portion
const QUICK = 30; // « Moins de 30 min »

// Découvrir : idées d'exemple du prototype, filtrées en local. La recherche en ligne viendra avec l'API (phase 8).
export default function DecouvrirScreen() {
  const { colors, type, shape, spacing } = useTheme();
  const router = useRouter();
  const { inLibrary, addRecipe, portionCost } = useCatalog();

  const [query, setQuery] = useState('');
  const [cheap, setCheap] = useState(true);
  const [vege, setVege] = useState(false);
  const [quick, setQuick] = useState(false);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DISCOVER_RECIPES.filter(
      (r) =>
        (!cheap || portionCost(r) < CHEAP) &&
        (!vege || r.tags.includes('végé')) &&
        (!quick || r.time < QUICK) &&
        (!q || r.name.toLowerCase().includes(q) || r.ingredients.some((i) => INGREDIENTS[i.id].name.toLowerCase().includes(q))),
    );
  }, [query, cheap, vege, quick, portionCost]);
  const featured = list.find((r) => r.featured);
  const rest = list.filter((r) => r !== featured);

  const handleImport = (recipe: Recipe) => {
    addRecipe(recipe);
    AccessibilityInfo.announceForAccessibility(`${recipe.name} ajouté à tes recettes`);
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.surface }]}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing[3], paddingBottom: spacing[8], gap: spacing[4] }}>
        <TopAppBar
          title="Découvrir"
          subtitle="Des idées venues d’ailleurs, à importer"
          navigationIcon={{ icon: 'arrow-back', label: 'Retour', onPress: () => router.back() }}
        />
        <SearchField value={query} onChangeText={setQuery} placeholder="Un ingrédient, un plat…" label="Rechercher parmi les idées" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          accessibilityLabel="Filtrer les idées"
          contentContainerStyle={{ gap: spacing[2] }}
        >
          <Chip label="Moins de 2 €" selected={cheap} onPress={() => setCheap(!cheap)} />
          <Chip label="Végé" selected={vege} onPress={() => setVege(!vege)} />
          <Chip label="Moins de 30 min" selected={quick} onPress={() => setQuick(!quick)} />
        </ScrollView>
        <Text style={[type.bodySmall, { color: colors.onSurfaceVariant }]}>
          Exemples enregistrés dans l’app : la recherche en ligne arrivera plus tard.
        </Text>

        {featured ? (
          <View style={[styles.featured, { backgroundColor: colors.secondaryContainer, borderRadius: shape.xl, padding: spacing[5], gap: spacing[2] }]}>
            <View style={styles.clover} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              <ExpressiveShape name="clover" size={CLOVER} color={colors.secondary} />
            </View>
            <Text style={[type.labelMedium, { color: colors.onSecondaryContainer, textTransform: 'uppercase' }]}>Idée du jour</Text>
            <Text accessibilityRole="header" style={[type.headlineMedium, styles.featuredTitle, { color: colors.onSecondaryContainer }]}>
              {featured.name}
            </Text>
            <Text style={[type.bodyMedium, { color: colors.onSecondaryContainer }]}>
              {featured.time} min · {featured.servings} pers. · ≈ {euro(portionCost(featured))} / portion
            </Text>
            <View style={[styles.row, { gap: spacing[2], marginTop: spacing[1] }]}>
              {inLibrary(featured.id) ? (
                <View style={[styles.row, { gap: spacing[1], minHeight: spacing[8] }]}>
                  <MaterialIcons name="check" size={18} color={colors.onSecondaryContainer} />
                  <Text style={[type.labelLarge, { color: colors.onSecondaryContainer }]}>Dans tes recettes</Text>
                </View>
              ) : (
                <Button
                  label="Importer"
                  icon={<MaterialIcons name="download" size={20} color={colors.onPrimary} />}
                  onPress={() => handleImport(featured)}
                />
              )}
              <Button label="Voir" variant="text" onPress={() => router.push(`/recipe/${featured.id}`)} />
            </View>
          </View>
        ) : null}

        {list.length === 0 ? (
          <Text style={[type.bodyMedium, styles.center, { color: colors.onSurfaceVariant, paddingVertical: spacing[6] }]}>
            Rien trouvé. Essaie un ingrédient que tu as déjà ou retire un filtre.
          </Text>
        ) : (
          <View style={{ gap: spacing[2] }}>
            {rest.map((r, i) => (
              <RecipeCard key={r.id} recipe={r} index={i} onPress={() => router.push(`/recipe/${r.id}`)} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  featured: { overflow: 'hidden' },
  featuredTitle: { maxWidth: 220 },
  clover: { position: 'absolute', right: -24, top: -20 },
  row: { flexDirection: 'row', alignItems: 'center' },
  center: { textAlign: 'center' },
});
