import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '../ThemeProvider';
import { euro, euroSpoken } from '../data';
import { ShoppingEntry } from '../features/planning/shopping';
import { useReduceMotion } from './ui';

type Props = {
  item: ShoppingEntry;
  checked: boolean;
  onToggle: () => void;
  onEditPrice: () => void;
};

const CHECKBOX = 22;

export function ShoppingItem({ item, checked, onToggle, onEditPrice }: Props) {
  const { colors, type, shape, size, spacing, springs } = useTheme();
  const reduced = useReduceMotion();

  const checkScale = useSharedValue(checked ? 1 : 0);

  React.useEffect(() => {
    checkScale.value = withSpring(checked ? 1 : 0, reduced ? springs.effects : springs.spatialFast);
  }, [checked, reduced, springs, checkScale]);

  const checkAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));

  return (
    <View
      style={[
        styles.row,
        {
          minHeight: size.tapMin,
          paddingVertical: spacing[1],
          paddingHorizontal: spacing[3],
          backgroundColor: checked ? colors.surfaceContainerLowest : colors.surfaceContainerLow,
          borderRadius: shape.md,
          gap: spacing[3],
          opacity: checked ? 0.6 : 1,
        },
      ]}
    >
      {/* Checkbox tap area */}
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel={`${item.name}, ${item.qty}, ${euroSpoken(item.totalPrice)}${item.edited ? ', prix mis à jour' : ''}`}
        accessibilityState={{ checked: checked }}
        onPress={onToggle}
        style={[styles.mainPressable, { minHeight: size.tapMin, gap: spacing[3] }]}
      >
        <View
          style={[
            styles.checkbox,
            {
              borderRadius: shape.xs,
              borderColor: checked ? colors.primary : colors.outline,
              backgroundColor: checked ? colors.primary : 'transparent',
            },
          ]}
        >
          <Animated.View style={checkAnimStyle}>
            <MaterialIcons name="check" size={16} color={colors.onPrimary} />
          </Animated.View>
        </View>

        <View style={styles.textContainer}>
          <Text
            style={[
              type.bodyLarge,
              {
                color: colors.onSurface,
                textDecorationLine: checked ? 'line-through' : 'none',
              },
            ]}
          >
            {item.name}
          </Text>
          <Text style={[type.bodySmall, { color: colors.onSurfaceVariant }]}>
            {item.qty}
            {item.edited ? ' · prix mis à jour' : ''}
          </Text>
        </View>
      </Pressable>

      {/* Price with edit button */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Modifier le prix de ${item.name}, actuellement ${euroSpoken(item.totalPrice)}`}
        onPress={onEditPrice}
        style={[
          styles.priceButton,
          {
            minHeight: size.tapMin,
            gap: spacing[1],
            borderRadius: shape.full,
            paddingHorizontal: spacing[2],
          },
        ]}
      >
        <Text style={[type.labelMedium, { color: colors.onSurface, fontVariant: ['tabular-nums'] }]}>
          {euro(item.totalPrice)}
        </Text>
        <MaterialIcons name="edit" size={16} color={colors.onSurfaceVariant} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mainPressable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: CHECKBOX,
    height: CHECKBOX,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  priceButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
