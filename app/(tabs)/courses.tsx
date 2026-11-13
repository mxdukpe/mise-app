import React, { useMemo, useState } from 'react';
import { ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { useTheme } from '../../ThemeProvider';
import { STORES, StoreId, euro } from '../../data';
import { useCatalog } from '../../features/catalog/CatalogProvider';
import { useSettings } from '../../features/onboarding/SettingsProvider';
import { usePlanning } from '../../features/planning/planningStore';
import { aggregateShoppingList, shoppingTotal } from '../../features/planning/shopping';
import { shortDate, startOfWeek } from '../../features/planning/week';
import { Button, StateView, TopAppBar, entering, useReduceMotion } from '../../components/ui';
import { StoreSelector } from '../../components/StoreSelector';
import { ShoppingItem } from '../../components/ShoppingItem';
import { WavyProgress } from '../../components/WavyProgress';

export default function CoursesScreen() {
  const { colors, type, shape, spacing, elevation } = useTheme();
  const router = useRouter();
  const reduced = useReduceMotion();
  const { plan } = usePlanning();
  const { settings, setCurrentStore } = useSettings();
  const { findRecipe, overrides, store } = useCatalog();
  // Cases cochées pendant les courses, en mémoire (enregistrées dans SQLite en phase 1).
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const groups = useMemo(() => aggregateShoppingList(plan, store, findRecipe, overrides), [plan, store, findRecipe, overrides]);
  const items = groups.flatMap((g) => g.items);
  const total = shoppingTotal(groups);
  const doneCount = items.filter((i) => checked[i.ingredientId]).length;
  const myStores = (settings?.stores ?? []) as StoreId[];
  const subtitle = `Semaine du ${shortDate(startOfWeek(new Date()))}`;

  const toggleItem = (id: string) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleShare = () => {
    const lines = groups.map((g) => `${g.label}\n${g.items.map((i) => `• ${i.name} (${i.qty}) : ${euro(i.totalPrice)}`).join('\n')}`);
    const message = `Ma liste de courses (${STORES[store]})\n\n${lines.join('\n\n')}\n\nTotal estimé : ${euro(total)}`;
    // Fermer la feuille de partage n'est pas une erreur : rien à signaler.
    Share.share({ message }).catch(() => {});
  };

  if (items.length === 0) {
    return (
      <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.surface }]}>
        <TopAppBar title="Courses" subtitle={subtitle} />
        <View style={styles.emptyWrap}>
          <StateView
            title="Ta liste est vide"
            text="Planifie quelques repas : la liste se remplit toute seule, rayon par rayon."
            action={
              <Button
                label="Planifier ma semaine"
                variant="filled"
                size="m"
                icon={<MaterialIcons name="calendar-month" size={20} color={colors.onPrimary} />}
                onPress={() => router.push('/(tabs)/semaine')}
              />
            }
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.surface }]}>
      <TopAppBar title="Courses" subtitle={subtitle} actions={[{ icon: 'ios-share', label: 'Partager la liste', onPress: handleShare }]} />

      <ScrollView contentContainerStyle={[styles.list, { padding: spacing[4], gap: spacing[4], paddingBottom: spacing[8] }]}>
        {myStores.length > 1 ? <StoreSelector stores={myStores} currentStore={store} onSelect={setCurrentStore} /> : null}

        <View
          style={[
            elevation.level1,
            {
              backgroundColor: colors.surfaceContainerLow,
              borderRadius: shape.lgPlus,
              padding: spacing[4],
              gap: spacing[2],
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={[type.bodyMedium, { color: colors.onSurfaceVariant }]}>Total estimé chez {STORES[store]}</Text>
            <Text style={[type.bodyMedium, { color: colors.onSurfaceVariant }]}>
              {doneCount} / {items.length} dans le panier
            </Text>
          </View>
          <Text style={[type.displaySmall, { color: colors.onSurface, fontVariant: ['tabular-nums'] }]}>{euro(total)}</Text>
          <WavyProgress spent={doneCount} budget={items.length} label="Articles dans le panier" bare tiered={false} />
        </View>

        {groups.map((group) => (
          <View key={group.aisle} style={{ gap: spacing[2] }}>
            <Text style={[type.labelMedium, { color: colors.onSurfaceVariant, textTransform: 'uppercase', paddingHorizontal: spacing[1] }]}>
              {group.label} · {group.items.length}
            </Text>
            <View style={{ gap: spacing[1] }}>
              {group.items.map((item, idx) => (
                <Animated.View key={item.ingredientId} entering={entering(idx, reduced)}>
                  <ShoppingItem
                    item={item}
                    checked={!!checked[item.ingredientId]}
                    onToggle={() => toggleItem(item.ingredientId)}
                    onEditPrice={() => router.push(`/modifier-prix?ingredientId=${item.ingredientId}`)}
                  />
                </Animated.View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { flexGrow: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
});
