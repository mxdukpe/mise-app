import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme, ThemeMode } from '../../ThemeProvider';
import { fetchRecipes, ListState, Recipe } from '../../data';
import { useCatalog } from '../../features/catalog/CatalogProvider';
import { RecipeCard } from '../../components/RecipeCard';
import { Chip, Fab, IconButton, SearchField, Skeleton, StateView, TopAppBar, entering, useReduceMotion } from '../../components/ui';

const FILTERS: { id: string; label: string }[] = [
  { id: 'toutes', label: 'Toutes' },
  { id: 'rapide', label: 'Rapide' },
  { id: 'pas cher', label: 'Pas cher' },
  { id: 'batch', label: 'Batch' },
  { id: 'mine', label: 'Mes recettes' },
];
const STATES: { id: ListState; label: string }[] = [
  { id: 'loading', label: 'Chargement' },
  { id: 'empty', label: 'Vide' },
  { id: 'error', label: 'Erreur' },
  { id: 'partial', label: 'Partiel' },
  { id: 'success', label: 'Succès' },
];
const MODES: { id: ThemeMode; label: string }[] = [
  { id: 'system', label: 'Auto' },
  { id: 'light', label: 'Clair' },
  { id: 'dark', label: 'Sombre' },
];

export default function RecipesScreen() {
  const { colors, type, shape, size, spacing, mode, setMode } = useTheme();
  const router = useRouter();
  const reduced = useReduceMotion();
  const { recipes: library } = useCatalog();
  const [forced, setForced] = useState<ListState>('success'); // outil de démo pour les captures
  const [showDemo, setShowDemo] = useState(false);
  const [state, setState] = useState<ListState>('loading');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('toutes');
  const [isExtended, setIsExtended] = useState(true);

  const [reloads, setReloads] = useState(0);

  // Relance le chargement ; `quiet` garde la liste affichée pendant « tirer pour rafraîchir ».
  const reload = (next: ListState = forced, quiet = false) => {
    if (!quiet) setState('loading');
    setForced(next);
    setReloads((n) => n + 1);
  };

  useEffect(() => {
    if (forced === 'loading') return;
    let active = true;
    fetchRecipes(library, forced)
      .then((res) => {
        if (!active) return;
        setRecipes(res.recipes);
        setState(res.recipes.length === 0 ? 'empty' : res.partial ? 'partial' : 'success');
      })
      .catch(() => active && setState('error'))
      .finally(() => active && setRefreshing(false));
    return () => {
      active = false;
    };
    // `library` est lu au chargement ; ses changements passent par `shown` ci-dessous.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forced, reloads]);

  // En état succès, la liste suit le carnet en direct (recette créée ou importée).
  const shown = state === 'success' ? library : recipes;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return shown.filter(
      (r) => (filter === 'toutes' || (filter === 'mine' ? !!r.mine : r.tags.includes(filter))) && (!q || r.name.toLowerCase().includes(q)),
    );
  }, [shown, query, filter]);

  const hasList = state === 'success' || state === 'partial';
  const mine = shown.filter((r) => r.mine).length;

  const header = (
    <View style={{ gap: spacing[4], paddingHorizontal: spacing[3], paddingBottom: spacing[4] }}>
      <TopAppBar
        title="Recettes"
        subtitle={hasList ? `${shown.length} recettes${mine ? ` · ${mine} à toi` : ''}` : undefined}
        actions={
          <>
            {__DEV__ ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={showDemo ? 'Masquer les outils de démo' : 'Afficher les outils de démo'}
                onPress={() => setShowDemo((v) => !v)}
                style={({ pressed }) => [
                  styles.demoBtn,
                  { minHeight: size.tapMin, paddingHorizontal: spacing[3], borderRadius: shape.full, opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <Text style={[type.labelMedium, { color: colors.onSurfaceVariant }]}>DÉMO</Text>
              </Pressable>
            ) : null}
            <IconButton
              icon="travel-explore"
              label="Découvrir des recettes"
              hint="Ouvre des idées de recettes à importer"
              onPress={() => router.push('/decouvrir')}
            />
          </>
        }
      />

      {/* Outils de démo (développement uniquement) : thème + forcer chacun des cinq états */}
      {__DEV__ && showDemo ? (
        <View style={[{ gap: spacing[2], padding: spacing[3], borderRadius: shape.lg, backgroundColor: colors.surfaceContainerHigh }]}>
          <Text style={[type.labelMedium, { color: colors.onSurfaceVariant }]}>THÈME</Text>
          <View style={[styles.wrap, { gap: spacing[2] }]}>
            {MODES.map((m) => <Chip key={m.id} label={m.label} selected={mode === m.id} onPress={() => setMode(m.id)} />)}
          </View>
          <Text style={[type.labelMedium, { color: colors.onSurfaceVariant }]}>ÉTAT DE LA LISTE</Text>
          <View style={[styles.wrap, { gap: spacing[2] }]}>
            {STATES.map((s) => <Chip key={s.id} label={s.label} selected={forced === s.id} onPress={() => reload(s.id)} />)}
          </View>
        </View>
      ) : null}

      <SearchField value={query} onChangeText={setQuery} placeholder="Pois chiches, pâtes, 15 min…" label="Rechercher une recette" trailing="tune" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        accessibilityLabel="Filtrer les recettes"
        style={{ marginHorizontal: -spacing[3], marginVertical: -spacing[2] }}
        contentContainerStyle={{ gap: spacing[2], paddingHorizontal: spacing[3], paddingVertical: spacing[2] }}
      >
        {FILTERS.map((f) => <Chip key={f.id} label={f.label} selected={filter === f.id} onPress={() => setFilter(f.id)} />)}
      </ScrollView>

      {state === 'partial' ? (
        <Animated.View
          entering={entering(0, reduced)}
          accessibilityRole="alert"
          style={[styles.banner, { gap: spacing[3], padding: spacing[3], borderRadius: shape.md, backgroundColor: colors.warningContainer }]}
        >
          <MaterialIcons name="cloud-off" size={20} color={colors.onWarningContainer} />
          <Text style={[type.labelLarge, styles.bannerText, { color: colors.onWarningContainer }]}>
            Hors ligne : seules les 2 recettes enregistrées sur ton téléphone sont affichées. Tire vers le bas pour réessayer.
          </Text>
        </Animated.View>
      ) : null}
    </View>
  );

  let body: React.ReactNode;
  if (state === 'loading') {
    body = (
      <View>
        {header}
        <View style={{ gap: spacing[2], paddingHorizontal: spacing[3] }} accessible accessibilityLabel="Chargement des recettes" accessibilityRole="progressbar">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} />)}
        </View>
      </View>
    );
  } else if (state === 'empty') {
    body = (
      <View>
        {header}
        <StateView
          title="Aucune recette pour l’instant"
          text="Ajoute ta première recette, ou commence avec les recettes de démarrage."
          action="Charger les recettes de démarrage"
          onAction={() => reload('success')}
        />
      </View>
    );
  } else if (state === 'error') {
    body = (
      <View>
        {header}
        <StateView
          tone="error"
          title="Impossible de charger les recettes"
          text="Vérifie ta connexion puis réessaie. Tes recettes enregistrées restent sur ton téléphone."
          action="Réessayer"
          onAction={() => reload(forced === 'error' ? 'success' : forced)}
        />
      </View>
    );
  } else {
    body = (
      <FlatList
        data={visible}
        keyExtractor={(r) => r.id}
        ListHeaderComponent={header}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingBottom: size.fab + spacing[8] }}
        ItemSeparatorComponent={() => <View style={{ height: spacing[2] }} />}
        onScroll={(e) => {
          const y = e.nativeEvent.contentOffset.y;
          if (y > 24 && isExtended) {
            setIsExtended(false);
          } else if (y <= 24 && !isExtended) {
            setIsExtended(true);
          }
        }}
        scrollEventThrottle={16}
        ListEmptyComponent={
          <StateView
            title="Aucune recette ne correspond"
            text="Essaie un autre mot ou retire le filtre."
            action="Tout afficher"
            onAction={() => {
              setQuery('');
              setFilter('toutes');
            }}
          />
        }
        renderItem={({ item, index }) => (
          <View style={{ paddingHorizontal: spacing[3] }}>
            <RecipeCard recipe={item} index={index} onPress={() => router.push(`/recipe/${item.id}`)} />
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              reload(forced === 'partial' ? 'success' : forced, true);
            }}
            tintColor={colors.primary}
          />
        }
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
      {body}
      {hasList ? (
        <Fab
          label="Nouvelle recette"
          icon="add"
          extended={isExtended}
          onPress={() => router.push('/recipe/nouvelle')}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  demoBtn: { alignItems: 'center', justifyContent: 'center' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  banner: { flexDirection: 'row', alignItems: 'flex-start' },
  bannerText: { flex: 1 },
});
