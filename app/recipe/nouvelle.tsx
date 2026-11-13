import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../ThemeProvider';
import { INGREDIENTS, IngredientId, Recipe, RecipeIngredient, recipeQty } from '../../data';
import { useCatalog } from '../../features/catalog/CatalogProvider';
import { Button, Chip, IconButton, TopAppBar, useReduceMotion } from '../../components/ui';

const TAG_OPTIONS = ['rapide', 'pas cher', 'batch', 'végé'] as const;
const FIELD_HEIGHT = 52;
const STEP_FIELD_MIN = 80;
const PICKER_MAX = 200;
const STEP_BADGE = 28;
const HAIRLINE = 2;
const ALL_INGREDIENTS = Object.keys(INGREDIENTS) as IngredientId[];

export default function NouvelleRecetteScreen() {
  const { colors, type, shape, spacing } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const reduced = useReduceMotion();
  const { addRecipe } = useCatalog();

  // Formulaire vide, comme le brouillon du prototype.
  const [name, setName] = useState('');
  const [time, setTime] = useState('');
  const [portions, setPortions] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [steps, setSteps] = useState<string[]>([]);

  // Feuille « Ajouter un ingrédient »
  const [showIngModal, setShowIngModal] = useState(false);
  const [selectedIngId, setSelectedIngId] = useState<IngredientId>(ALL_INGREDIENTS[0]);
  const [ingQty, setIngQty] = useState('');

  // Feuille « Ajouter une étape »
  const [showStepModal, setShowStepModal] = useState(false);
  const [stepText, setStepText] = useState('');

  const toggleTag = (t: string) => {
    setSelectedTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const removeIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddIngredient = () => {
    const q = parseFloat(ingQty.replace(',', '.'));
    if (!(q > 0)) {
      Alert.alert('Quantité manquante', 'Indique une quantité, par exemple 200.');
      return;
    }
    setIngredients((prev) => [...prev, { id: selectedIngId, qty: q }]);
    setShowIngModal(false);
    setIngQty('');
  };

  const handleAddStep = () => {
    if (stepText.trim()) {
      setSteps((prev) => [...prev, stepText.trim()]);
      setStepText('');
      setShowStepModal(false);
    }
  };

  const handleSave = () => {
    const minutes = parseInt(time, 10);
    const servings = parseInt(portions, 10);
    if (!name.trim() || !(minutes > 0) || !(servings > 0) || ingredients.length === 0) {
      Alert.alert('Recette incomplète', 'Donne-lui un nom, un temps, un nombre de portions et au moins un ingrédient.');
      return;
    }
    const newRecipe: Recipe = {
      id: `perso-${Date.now()}`,
      name: name.trim(),
      time: minutes,
      servings,
      tone: selectedTags.includes('rapide') ? 'tertiary' : 'primary',
      shape: 'cookie',
      tags: selectedTags,
      ingredients,
      steps,
      mine: true,
    };
    addRecipe(newRecipe);
    Alert.alert('Recette enregistrée', `${newRecipe.name} est dans tes recettes.`, [{ text: 'OK', onPress: () => router.back() }]);
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.surface }]}>
      <TopAppBar
        title="Nouvelle recette"
        navigationIcon={{
          icon: 'arrow-back',
          label: 'Retour',
          onPress: () => router.back(),
        }}
      />

      <ScrollView contentContainerStyle={[styles.scroll, { padding: spacing[4], gap: spacing[5] }]}>
        {/* Name input */}
        <View style={{ gap: spacing[1] }}>
          <Text style={[type.labelMedium, { color: colors.onSurfaceVariant }]}>Nom de la recette</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ex. Gratin de pâtes au thon"
            accessibilityLabel="Nom de la recette"
            placeholderTextColor={colors.onSurfaceVariant}
            style={[
              styles.input,
              type.bodyLarge,
              {
                borderRadius: shape.md,
                borderColor: colors.outline,
                backgroundColor: colors.surfaceContainerLowest,
                color: colors.onSurface,
                paddingHorizontal: spacing[3],
                height: FIELD_HEIGHT,
              },
            ]}
          />
        </View>

        {/* Time and Servings Row */}
        <View style={[styles.row, { gap: spacing[3] }]}>
          <View style={[styles.flex1, { gap: spacing[1] }]}>
            <Text style={[type.labelMedium, { color: colors.onSurfaceVariant }]}>Temps (min)</Text>
            <TextInput
              value={time}
              onChangeText={setTime}
              keyboardType="numeric"
              accessibilityLabel="Temps de préparation, en minutes"
              placeholder="25"
              placeholderTextColor={colors.onSurfaceVariant}
              style={[
                styles.input,
                type.bodyLarge,
                {
                  borderRadius: shape.md,
                  borderColor: colors.outline,
                  backgroundColor: colors.surfaceContainerLowest,
                  color: colors.onSurface,
                  paddingHorizontal: spacing[3],
                  height: FIELD_HEIGHT,
                },
              ]}
            />
          </View>
          <View style={[styles.flex1, { gap: spacing[1] }]}>
            <Text style={[type.labelMedium, { color: colors.onSurfaceVariant }]}>Portions</Text>
            <TextInput
              value={portions}
              onChangeText={setPortions}
              keyboardType="numeric"
              accessibilityLabel="Nombre de portions"
              placeholder="4"
              placeholderTextColor={colors.onSurfaceVariant}
              style={[
                styles.input,
                type.bodyLarge,
                {
                  borderRadius: shape.md,
                  borderColor: colors.outline,
                  backgroundColor: colors.surfaceContainerLowest,
                  color: colors.onSurface,
                  paddingHorizontal: spacing[3],
                  height: FIELD_HEIGHT,
                },
              ]}
            />
          </View>
        </View>

        {/* Tags */}
        <View style={{ gap: spacing[2] }}>
          <Text style={[type.labelMedium, { color: colors.onSurfaceVariant }]}>Étiquettes</Text>
          <View style={[styles.wrap, { gap: spacing[2] }]}>
            {TAG_OPTIONS.map((tag) => (
              <Chip
                key={tag}
                label={tag.charAt(0).toUpperCase() + tag.slice(1)}
                selected={selectedTags.includes(tag)}
                onPress={() => toggleTag(tag)}
              />
            ))}
          </View>
        </View>

        {/* Ingredients section */}
        <View style={{ gap: spacing[3] }}>
          <View style={styles.between}>
            <Text accessibilityRole="header" style={[type.titleMedium, { color: colors.onSurface }]}>
              Ingrédients · {ingredients.length}
            </Text>
          </View>

          <View style={[styles.listGroup, { borderRadius: shape.lg, gap: HAIRLINE }]}>
            {ingredients.map((item, index) => {
              const ing = INGREDIENTS[item.id];
              const ingName = ing.recipeName ?? ing.name;
              return (
                <View
                  key={index}
                  style={[
                    styles.between,
                    {
                      minHeight: FIELD_HEIGHT,
                      paddingHorizontal: spacing[3],
                      backgroundColor: colors.surfaceContainerLowest,
                    },
                  ]}
                >
                  <Text style={[type.bodyMedium, { color: colors.onSurface, flex: 1 }]}>
                    {ingName}
                  </Text>
                  <Text style={[type.bodySmall, { color: colors.onSurfaceVariant, marginRight: spacing[2] }]}>
                    {recipeQty(item)}
                  </Text>
                  <IconButton
                    icon="close"
                    label={`Retirer ${ingName}`}
                    onPress={() => removeIngredient(index)}
                  />
                </View>
              );
            })}
          </View>

          <Button
            label="Ajouter un ingrédient"
            variant="outlined"
            icon={<MaterialIcons name="add" size={20} color={colors.primary} />}
            onPress={() => setShowIngModal(true)}
          />
        </View>

        {/* Steps section */}
        <View style={{ gap: spacing[3] }}>
          <Text accessibilityRole="header" style={[type.titleMedium, { color: colors.onSurface }]}>
            Étapes · {steps.length}
          </Text>

          <View style={{ gap: spacing[2] }}>
            {steps.map((s, index) => (
              <View
                key={index}
                style={[
                  styles.stepRow,
                  {
                    padding: spacing[3],
                    borderRadius: shape.lg,
                    backgroundColor: colors.surfaceContainerLowest,
                    gap: spacing[3],
                  },
                ]}
              >
                <View
                  style={[
                    styles.stepBadge,
                    {
                      borderRadius: shape.full,
                      backgroundColor: colors.primaryContainer,
                    },
                  ]}
                >
                  <Text style={[type.labelLarge, { color: colors.onPrimaryContainer }]}>
                    {index + 1}
                  </Text>
                </View>
                <Text style={[type.bodyMedium, { color: colors.onSurface, flex: 1 }]}>{s}</Text>
              </View>
            ))}
          </View>

          <Button
            label="Ajouter une étape"
            variant="outlined"
            icon={<MaterialIcons name="add" size={20} color={colors.primary} />}
            onPress={() => setShowStepModal(true)}
          />
        </View>

        {/* Save button */}
        <View style={{ marginTop: spacing[4], paddingBottom: Math.max(insets.bottom, spacing[4]) }}>
          <Button
            label="Enregistrer la recette"
            variant="filled"
            size="l"
            icon={<MaterialIcons name="check" size={22} color={colors.onPrimary} />}
            onPress={handleSave}
          />
        </View>
      </ScrollView>

      {/* Modal Add Ingredient */}
      <Modal visible={showIngModal} animationType={reduced ? 'fade' : 'slide'} transparent onRequestClose={() => setShowIngModal(false)}>
        <View style={styles.modalBackdrop}>
          {/* Le voile ferme la feuille ; il reste à côté du contenu pour que VoiceOver lise chaque élément. */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fermer"
            style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }]}
            onPress={() => setShowIngModal(false)}
          />
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.surface,
                borderTopLeftRadius: shape.xl,
                borderTopRightRadius: shape.xl,
                padding: spacing[4],
                gap: spacing[3],
              },
            ]}
          >
            <Text accessibilityRole="header" style={[type.titleMedium, { color: colors.onSurface }]}>Ajouter un ingrédient</Text>
            <ScrollView style={{ maxHeight: PICKER_MAX }}>
              <View style={[styles.wrap, { gap: spacing[1] }]}>
                {ALL_INGREDIENTS.map((id) => {
                  const ing = INGREDIENTS[id];
                  const sel = selectedIngId === id;
                  return (
                    <Chip
                      key={id}
                      label={ing.recipeName ?? ing.name}
                      selected={sel}
                      onPress={() => setSelectedIngId(id)}
                    />
                  );
                })}
              </View>
            </ScrollView>
            <View style={{ gap: spacing[1] }}>
              <Text style={[type.labelMedium, { color: colors.onSurfaceVariant }]}>
                Quantité ({INGREDIENTS[selectedIngId].unit === 'pc' ? 'pièces' : INGREDIENTS[selectedIngId].unit})
              </Text>
              <TextInput
                value={ingQty}
                onChangeText={setIngQty}
                keyboardType="numeric"
                placeholder="200"
                placeholderTextColor={colors.onSurfaceVariant}
                accessibilityLabel={`Quantité, en ${INGREDIENTS[selectedIngId].unit === 'pc' ? 'pièces' : INGREDIENTS[selectedIngId].unit}`}
                style={[
                  styles.input,
                  type.bodyLarge,
                  {
                    borderRadius: shape.md,
                    borderColor: colors.outline,
                    backgroundColor: colors.surfaceContainerLowest,
                    color: colors.onSurface,
                    paddingHorizontal: spacing[3],
                    height: FIELD_HEIGHT,
                  },
                ]}
              />
            </View>
            <View style={[styles.row, { justifyContent: 'flex-end', gap: spacing[2] }]}>
              <Button label="Annuler" variant="text" onPress={() => setShowIngModal(false)} />
              <Button label="Ajouter" variant="filled" onPress={handleAddIngredient} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Add Step */}
      <Modal visible={showStepModal} animationType={reduced ? 'fade' : 'slide'} transparent onRequestClose={() => setShowStepModal(false)}>
        <View style={styles.modalBackdrop}>
          {/* Le voile ferme la feuille ; il reste à côté du contenu pour que VoiceOver lise chaque élément. */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fermer"
            style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }]}
            onPress={() => setShowStepModal(false)}
          />
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.surface,
                borderTopLeftRadius: shape.xl,
                borderTopRightRadius: shape.xl,
                padding: spacing[4],
                gap: spacing[3],
              },
            ]}
          >
            <Text accessibilityRole="header" style={[type.titleMedium, { color: colors.onSurface }]}>Ajouter une étape</Text>
            <TextInput
              value={stepText}
              onChangeText={setStepText}
              placeholder="Décris l’étape de préparation…"
              accessibilityLabel="Texte de l’étape"
              placeholderTextColor={colors.onSurfaceVariant}
              multiline
              style={[
                styles.input,
                type.bodyMedium,
                {
                  borderRadius: shape.md,
                  borderColor: colors.outline,
                  backgroundColor: colors.surfaceContainerLowest,
                  color: colors.onSurface,
                  padding: spacing[3],
                  minHeight: STEP_FIELD_MIN,
                },
              ]}
            />
            <View style={[styles.row, { justifyContent: 'flex-end', gap: spacing[2] }]}>
              <Button label="Annuler" variant="text" onPress={() => setShowStepModal(false)} />
              <Button label="Ajouter" variant="filled" onPress={handleAddStep} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1 },
  input: { borderWidth: 1 },
  row: { flexDirection: 'row' },
  flex1: { flex: 1 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  listGroup: { overflow: 'hidden' },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start' },
  stepBadge: { width: STEP_BADGE, height: STEP_BADGE, alignItems: 'center', justifyContent: 'center' },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { maxHeight: '80%' },
});
