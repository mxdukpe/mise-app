import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../ThemeProvider';
import { STORES, StoreId } from '../../data';
import { OnboardingAnswers } from '../../features/onboarding/settings';
import { Button, Chip, IconButton } from '../ui';
import { SwitchRow } from './SwitchRow';
import { PageDots } from './PageDots';

type Props = {
  index: number;
  answers: OnboardingAnswers;
  onChange: (answers: OnboardingAnswers) => void;
  onGoTo: (index: number) => void;
  onFinish: () => void;
  onSkip: () => void;
};

// Page 3 de l'onboarding : choix des magasins habituels et option « magasins proches ».
export function StoresPage({ index, answers, onChange, onGoTo, onFinish, onSkip }: Props) {
  const { colors, type, spacing, size, shape } = useTheme();

  const toggleStore = (id: StoreId) => {
    const stores = answers.stores.includes(id)
      ? answers.stores.filter((s) => s !== id)
      : [...answers.stores, id];
    if (stores.length === 0) return;
    onChange({ ...answers, stores });
  };

  return (
    <ScrollView contentContainerStyle={[styles.page, { gap: spacing[5], paddingTop: spacing[4], paddingHorizontal: spacing[6], paddingBottom: spacing[8] }]}>
      <View style={[styles.header, { height: size.tapMin }]}>
        <IconButton icon="arrow-back" label="Retour" onPress={() => onGoTo(1)} />
        <Button label="Passer" variant="text" hint="Garde les réglages proposés et ouvre l'app" onPress={onSkip} />
      </View>

      <View style={{ gap: spacing[2] }}>
        <Text style={[type.labelMedium, styles.eyebrow, { color: colors.onSurfaceVariant }]}>Étape 3 sur 3</Text>
        <Text accessibilityRole="header" style={[type.headlineLarge, { color: colors.onSurface }]}>
          Où fais-tu tes courses ?
        </Text>
        <Text style={[type.bodyLarge, { color: colors.onSurfaceVariant }]}>On compare les prix pour toi.</Text>
      </View>

      <View style={{ gap: spacing[3], padding: spacing[4], borderRadius: shape.lgPlus, backgroundColor: colors.surfaceContainerLow }}>
        <Text style={[type.labelLarge, { color: colors.onSurface }]}>Mes magasins</Text>
        <View style={[styles.wrap, { gap: spacing[2] }]}>
          {(Object.entries(STORES) as [StoreId, string][]).map(([id, name]) => (
            <Chip key={id} label={name} selected={answers.stores.includes(id)} onPress={() => toggleStore(id)} />
          ))}
        </View>
      </View>

      <SwitchRow
        label="Magasins à proximité"
        support="On te montre les supermarchés autour de toi pour choisir où faire tes courses."
        value={answers.nearbyStores}
        onChange={(nearbyStores) => onChange({ ...answers, nearbyStores })}
      />

      <View style={styles.spacer} />
      <View style={styles.between}>
        <PageDots count={3} index={index} onSelect={onGoTo} />
        <Button
          label="C'est parti"
          size="m"
          icon={<MaterialIcons name="check" size={24} color={colors.onPrimary} />}
          onPress={onFinish}
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
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  spacer: { flexGrow: 1 },
});
