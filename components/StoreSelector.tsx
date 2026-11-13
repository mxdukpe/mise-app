import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../ThemeProvider';
import { STORES, StoreId } from '../data';

type Props = {
  stores: StoreId[]; // magasins choisis à l'onboarding
  currentStore: StoreId;
  onSelect: (store: StoreId) => void;
};

// Groupe de boutons connectés : le magasin courant, dont les prix servent à toute l'app.
export function StoreSelector({ stores, currentStore, onSelect }: Props) {
  const { colors, type, shape, size, spacing } = useTheme();

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel="Magasin"
      style={[
        styles.container,
        {
          borderRadius: shape.full,
          backgroundColor: colors.surfaceContainerHigh,
          padding: spacing[1],
        },
      ]}
    >
      {stores.map((id) => {
        const label = STORES[id];
        const isSelected = currentStore === id;
        return (
          <Pressable
            key={id}
            accessibilityRole="radio"
            accessibilityLabel={label}
            accessibilityState={{ checked: isSelected }}
            onPress={() => onSelect(id)}
            style={[
              styles.tab,
              {
                borderRadius: shape.full,
                backgroundColor: isSelected ? colors.surface : 'transparent',
                minHeight: size.tapMin,
                paddingHorizontal: spacing[4],
              },
            ]}
          >
            <Text
              style={[type.labelLarge, { color: isSelected ? colors.primary : colors.onSurfaceVariant }]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignSelf: 'stretch',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
