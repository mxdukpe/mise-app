import React, { useMemo, useState } from 'react';
import { AccessibilityInfo, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../ThemeProvider';
import { AISLES, STORES, euro, parsePrice } from '../data';
import { useCatalog } from '../features/catalog/CatalogProvider';
import { usePlanning } from '../features/planning/planningStore';
import { aggregateShoppingList, shoppingTotal } from '../features/planning/shopping';
import { Button, IconButton, StateView } from '../components/ui';

const INPUT_HEIGHT = 64;
const MAX_PRICE = 1000;

// Feuille « Modifier un prix » : on saisit le prix de la ligne vu en rayon, il est enregistré par conditionnement.
export default function ModifierPrixModal() {
  const { colors, type, shape, spacing } = useTheme();
  const router = useRouter();
  const { ingredientId } = useLocalSearchParams<{ ingredientId: string }>();
  const { plan } = usePlanning();
  const { findRecipe, overrides, store, setLinePrice, resetPrice } = useCatalog();

  const groups = useMemo(() => aggregateShoppingList(plan, store, findRecipe, overrides), [plan, store, findRecipe, overrides]);
  const item = groups.flatMap((g) => g.items).find((i) => i.ingredientId === ingredientId);
  const total = shoppingTotal(groups);
  const [typed, setTyped] = useState(item ? item.totalPrice.toFixed(2).replace('.', ',') : '');
  const [error, setError] = useState<string | null>(null);

  if (!item) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
        <StateView tone="error" title="Article introuvable" text="Il n’est plus dans ta liste de courses." action="Fermer" onAction={() => router.back()} />
      </SafeAreaView>
    );
  }

  const value = parsePrice(typed);
  const delta = value === null ? 0 : value - item.totalPrice;
  const isUp = delta > 0.004;
  const isDown = delta < -0.004;
  const notice =
    !isUp && !isDown
      ? 'Même prix que celui enregistré.'
      : `${isUp ? '+' : '−'}${euro(Math.abs(delta))} sur ce produit. Ton total passe à ${euro(total + delta)}.`;

  const handleSave = () => {
    if (value === null || value <= 0 || value >= MAX_PRICE) {
      setError('Entre un prix valide, par exemple 1,79');
      AccessibilityInfo.announceForAccessibility('Entre un prix valide, par exemple 1,79');
      return;
    }
    setLinePrice(item.ingredientId, value, item.packs);
    AccessibilityInfo.announceForAccessibility('Prix enregistré, total recalculé');
    router.back();
  };

  const handleRevert = () => {
    resetPrice(item.ingredientId);
    AccessibilityInfo.announceForAccessibility('Prix d’origine rétabli');
    router.back();
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={[styles.header, { paddingHorizontal: spacing[4], paddingVertical: spacing[3] }]}>
        <View style={styles.flex}>
          <Text style={[type.labelMedium, { color: colors.onSurfaceVariant, textTransform: 'uppercase' }]}>
            {STORES[store]} · {AISLES[item.aisle]}
          </Text>
          <Text accessibilityRole="header" style={[type.titleLarge, { color: colors.onSurface }]}>
            {item.name} {item.qty}
          </Text>
        </View>
        <IconButton icon="close" label="Fermer" onPress={() => router.back()} />
      </View>

      <View style={[styles.flex, { padding: spacing[4], gap: spacing[4] }]}>
        <View style={{ gap: spacing[2] }}>
          <Text style={[type.labelMedium, { color: error ? colors.error : colors.onSurfaceVariant }]}>Prix en rayon</Text>
          <View
            style={[
              styles.inputBox,
              {
                borderColor: error ? colors.error : colors.outline,
                borderRadius: shape.lg,
                backgroundColor: colors.surfaceContainerLowest,
                paddingHorizontal: spacing[4],
              },
            ]}
          >
            <TextInput
              value={typed}
              onChangeText={(t) => {
                setTyped(t);
                setError(null);
              }}
              keyboardType="decimal-pad"
              autoFocus
              accessibilityLabel={`Prix en rayon de ${item.name}, en euros`}
              style={[type.displaySmall, styles.input, { color: colors.onSurface, fontVariant: ['tabular-nums'] }]}
            />
            <Text style={[type.headlineMedium, { color: colors.onSurfaceVariant }]}>€</Text>
          </View>
          <Text accessibilityLiveRegion="polite" style={[type.bodySmall, { color: error ? colors.error : colors.onSurfaceVariant }]}>
            {error ?? `Prix enregistré : ${euro(item.totalPrice)}`}
          </Text>
        </View>

        <View
          style={[
            styles.notice,
            {
              backgroundColor: isUp ? colors.warningContainer : colors.secondaryContainer,
              borderRadius: shape.lg,
              paddingVertical: spacing[3],
              paddingHorizontal: spacing[4],
              gap: spacing[2],
            },
          ]}
        >
          <MaterialIcons
            name={isUp ? 'trending-up' : isDown ? 'trending-down' : 'check-circle'}
            size={24}
            color={isUp ? colors.onWarningContainer : colors.onSecondaryContainer}
          />
          <Text style={[type.bodyMedium, styles.flex, { color: isUp ? colors.onWarningContainer : colors.onSecondaryContainer }]}>{notice}</Text>
        </View>

        <View style={[styles.actionRow, { gap: spacing[2], paddingTop: spacing[2] }]}>
          {item.edited ? <Button label="Prix d’origine" variant="text" size="m" onPress={handleRevert} /> : null}
          <Button label="Annuler" variant="text" size="m" onPress={() => router.back()} />
          <Button
            label="Enregistrer"
            variant="filled"
            size="m"
            icon={<MaterialIcons name="check" size={20} color={colors.onPrimary} />}
            onPress={handleSave}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  input: { flex: 1, minWidth: 0 },
  header: { flexDirection: 'row', alignItems: 'center' },
  inputBox: { flexDirection: 'row', alignItems: 'center', height: INPUT_HEIGHT, borderWidth: 1 },
  notice: { flexDirection: 'row', alignItems: 'center' },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap' },
});
