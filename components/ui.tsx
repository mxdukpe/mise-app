import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform, Pressable, StyleSheet, Text, TextInput, View, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../ThemeProvider';
import { springs } from '../theme';
import { ExpressiveShape } from './ExpressiveShape';

export const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

// Suit le réglage « Réduire les animations » en direct.
export function useReduceMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduced);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => sub.remove();
  }, []);
  return reduced;
}

// Apparition en cascade : montée de 12 px en ressort, 40 ms entre éléments ; fondu seul si le mouvement est réduit.
// Pas d'apparition sur le web : Reanimated y laisse les éléments en position absolue et les listes se chevauchent.
export function entering(index: number, reduced: boolean) {
  if (Platform.OS === 'web') return undefined;
  if (reduced) {
    const { stiffness, damping, mass } = springs.effects;
    return FadeIn.springify().stiffness(stiffness).damping(damping).mass(mass);
  }
  const { stiffness, damping, mass } = springs.spatialDefault;
  return FadeInDown.withInitialValues({ opacity: 0, transform: [{ translateY: 12 }] })
    .springify()
    .stiffness(stiffness)
    .damping(damping)
    .mass(mass)
    .delay(index * 40);
}

// Pression Expressive : le composant rétrécit et sa forme change (ex. pilule → shape.md).
// Avec le mouvement réduit, seul un léger fondu signale la pression.
export function usePressShape(from: number, to: number, scaleTo = 0.96) {
  const reduced = useReduceMotion();
  const pressed = useSharedValue(0);
  const style = useAnimatedStyle(() =>
    reduced
      ? { borderRadius: from, opacity: 1 - pressed.value * 0.12 }
      : {
          borderRadius: from + (to - from) * pressed.value,
          transform: [{ scale: 1 - (1 - scaleTo) * pressed.value }],
        },
  );
  const animate = (v: number) => {
    pressed.value = withSpring(v, reduced ? springs.effects : springs.spatialFast);
  };
  return { style, onPressIn: () => animate(1), onPressOut: () => animate(0) };
}

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: 'filled' | 'tonal' | 'outlined' | 'text';
  size?: 's' | 'm' | 'l';
  icon?: React.ReactNode;
  hint?: string;
  disabled?: boolean;
  block?: boolean;
  style?: ViewStyle;
};

export function Button({ label, onPress, variant = 'filled', size: btnSize = 's', icon, hint, disabled, block, style }: ButtonProps) {
  const { colors, type, shape, size, spacing } = useTheme();
  const press = usePressShape(shape.full, shape.md);
  const bg = { filled: colors.primary, tonal: colors.secondaryContainer, outlined: 'transparent', text: 'transparent' }[variant];
  const fg = { filled: colors.onPrimary, tonal: colors.onSecondaryContainer, outlined: colors.onSurfaceVariant, text: colors.primary }[variant];
  const height = btnSize === 'l' ? 56 : btnSize === 'm' ? size.buttonM : size.buttonS;
  // Un bouton de 40 garde une zone tactile de 48.
  const slop = Math.max(0, (size.tapMin - height) / 2);
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      hitSlop={slop}
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      style={[
        styles.btn,
        {
          height,
          gap: spacing[2],
          paddingHorizontal: variant === 'text' ? spacing[3] : btnSize === 'm' ? spacing[6] : spacing[4],
          backgroundColor: bg,
          borderColor: variant === 'outlined' ? colors.outline : 'transparent',
          opacity: disabled ? 0.38 : 1,
        },
        block && styles.block,
        press.style,
        style,
      ]}
    >
      {icon}
      <Text style={[btnSize === 'm' ? type.titleMedium : type.labelLarge, { color: fg }]}>{label}</Text>
    </AnimatedPressable>
  );
}

type IconButtonProps = {
  icon: IconName;
  label: string;
  onPress?: () => void;
  variant?: 'standard' | 'tonal' | 'filled';
  hint?: string;
  disabled?: boolean;
};

export function IconButton({ icon, label, onPress, variant = 'standard', hint, disabled }: IconButtonProps) {
  const { colors, shape, size } = useTheme();
  const press = usePressShape(shape.full, shape.md, 1);
  const bg = { standard: 'transparent', tonal: colors.surfaceContainerHigh, filled: colors.primary }[variant];
  const fg = { standard: colors.onSurfaceVariant, tonal: colors.onSurface, filled: colors.onPrimary }[variant];
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      style={[
        styles.center,
        {
          width: size.tapMin,
          height: size.tapMin,
          backgroundColor: bg,
          opacity: disabled ? 0.38 : 1,
        },
        press.style,
      ]}
    >
      <MaterialIcons name={icon} size={24} color={fg} />
    </AnimatedPressable>
  );
}

export type TopAppBarAction = { icon: IconName; label: string; onPress: () => void };

// Barre d'application large : actions en icônes, titre headlineLarge, sous-titre.
export function TopAppBar({
  title,
  subtitle,
  actions,
  navigationIcon,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode | TopAppBarAction[];
  navigationIcon?: React.ReactNode | TopAppBarAction;
}) {
  const { colors, type, spacing, size } = useTheme();

  const renderedNav =
    navigationIcon && typeof navigationIcon === 'object' && 'icon' in navigationIcon ? (
      <IconButton
        icon={(navigationIcon as TopAppBarAction).icon}
        label={(navigationIcon as TopAppBarAction).label}
        onPress={(navigationIcon as TopAppBarAction).onPress}
      />
    ) : (
      (navigationIcon as React.ReactNode)
    );

  const renderedActions = Array.isArray(actions)
    ? actions.map((a, i) => (
        <IconButton key={i} icon={a.icon} label={a.label} onPress={a.onPress} />
      ))
    : actions;

  return (
    <View style={{ gap: spacing[2], paddingTop: spacing[2], paddingBottom: spacing[3] }}>
      <View style={[styles.appbarRow, { minHeight: size.tapMin, gap: spacing[1], justifyContent: 'space-between' }]}>
        <View>{renderedNav}</View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[1] }}>{renderedActions}</View>
      </View>
      <View style={{ paddingHorizontal: spacing[3], gap: 2 }}>
        <Text accessibilityRole="header" style={[type.headlineLarge, { color: colors.onSurface }]}>{title}</Text>
        {subtitle ? <Text style={[type.bodyMedium, { color: colors.onSurfaceVariant }]}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const TAG_TONES: Record<string, 'tertiary' | 'warning' | 'primary'> = { rapide: 'tertiary', 'pas cher': 'warning', batch: 'primary' };

export function Tag({ label }: { label: string }) {
  const { colors, type, shape, spacing } = useTheme();
  const tone = TAG_TONES[label];
  const [bg, fg] =
    tone === 'tertiary' ? [colors.tertiaryContainer, colors.onTertiaryContainer]
    : tone === 'warning' ? [colors.warningContainer, colors.onWarningContainer]
    : tone === 'primary' ? [colors.primaryContainer, colors.onPrimaryContainer]
    : [colors.surfaceContainerHighest, colors.onSurfaceVariant];
  return (
    <View style={[styles.tag, { backgroundColor: bg, borderRadius: shape.sm, paddingHorizontal: spacing[2] }]}>
      <Text style={[type.labelMedium, { color: fg, letterSpacing: 0 }]}>{label}</Text>
    </View>
  );
}

const SKELETON_HEIGHT = 88;

export function Skeleton({ height = SKELETON_HEIGHT }: { height?: number }) {
  const { colors, shape } = useTheme();
  const reduced = useReduceMotion();
  const opacity = useSharedValue(1);
  useEffect(() => {
    opacity.value = reduced ? 1 : withRepeat(withDelay(400, withSpring(0.45, springs.effects)), -1, true);
  }, [reduced, opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[{ height, borderRadius: shape.lg, backgroundColor: colors.surfaceContainerHigh }, style]} />;
}

export type StateViewProps = {
  title: string;
  text?: string;
  message?: string;
  action?: string | React.ReactNode;
  onAction?: () => void;
  tone?: 'neutral' | 'error';
  type?: 'empty' | 'error';
};

// États vide et erreur : formes Expressive, une phrase qui explique + une action.
export function StateView({ title, text, message, action, onAction, tone = 'neutral' }: StateViewProps) {
  const { colors, type, spacing } = useTheme();
  const description = text ?? message ?? '';
  return (
    <View style={[styles.state, { gap: spacing[3], paddingVertical: spacing[8], paddingHorizontal: spacing[4] }]}>
      <View style={[styles.art, { marginBottom: spacing[2] }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <View style={styles.artA}><ExpressiveShape name="flower" size={112} color={tone === 'error' ? colors.errorContainer : colors.primaryContainer} /></View>
        <View style={styles.artB}><ExpressiveShape name="cookie" size={64} color={colors.tertiaryContainer} /></View>
        <View style={styles.artC}><ExpressiveShape name="circle" size={36} color={colors.warningContainer} /></View>
      </View>
      <Text accessibilityRole="header" style={[type.headlineSmall, { color: tone === 'error' ? colors.error : colors.onSurface, textAlign: 'center' }]}>
        {title}
      </Text>
      {description ? <Text style={[type.bodyLarge, styles.stateText, { color: colors.onSurfaceVariant }]}>{description}</Text> : null}
      {typeof action === 'string' ? (
        <Button label={action} onPress={onAction} style={{ marginTop: spacing[2] }} />
      ) : (
        action
      )}
    </View>
  );
}

// Chip de filtre : shape.sm, sélectionnée en secondaryContainer avec une coche.
type ChipProps = { label: string; selected: boolean; onPress: () => void; accessibilityLabel?: string };

export function Chip({ label, selected, onPress, accessibilityLabel }: ChipProps) {
  const { colors, type, shape, size, spacing } = useTheme();
  const press = usePressShape(shape.sm, shape.md, 1);
  const height = 32;
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? `Filtre ${label}`}
      accessibilityState={{ selected }}
      hitSlop={{ top: (size.tapMin - height) / 2, bottom: (size.tapMin - height) / 2 }}
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      style={[
        styles.chip,
        {
          height,
          gap: spacing[2],
          paddingLeft: selected ? spacing[2] : spacing[4],
          paddingRight: spacing[4],
          backgroundColor: selected ? colors.secondaryContainer : 'transparent',
          borderColor: selected ? 'transparent' : colors.outline,
        },
        press.style,
      ]}
    >
      {selected ? <MaterialIcons name="check" size={18} color={colors.onSecondaryContainer} /> : null}
      <Text style={[type.labelLarge, { color: selected ? colors.onSecondaryContainer : colors.onSurfaceVariant }]}>{label}</Text>
    </AnimatedPressable>
  );
}

type SearchFieldProps = {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  label?: string;
  accessibilityLabel?: string;
  trailing?: IconName;
};

// Recherche en pilule ; `trailing` est une icône décorative, comme dans le design system.
export function SearchField({ value, onChangeText, placeholder, label, accessibilityLabel, trailing }: SearchFieldProps) {
  const { colors, type, shape, spacing, size } = useTheme();
  return (
    <View style={[styles.search, { height: size.buttonM, gap: spacing[3], paddingHorizontal: spacing[4], borderRadius: shape.full, backgroundColor: colors.surfaceContainerHigh }]}>
      <MaterialIcons name="search" size={24} color={colors.onSurfaceVariant} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.onSurfaceVariant}
        accessibilityLabel={accessibilityLabel ?? label}
        returnKeyType="search"
        clearButtonMode="while-editing"
        autoCorrect={false}
        style={[type.bodyLarge, styles.searchInput, { color: colors.onSurface }]}
      />
      {trailing ? (
        <MaterialIcons name={trailing} size={24} color={colors.onSurfaceVariant} accessibilityElementsHidden importantForAccessibility="no" />
      ) : null}
    </View>
  );
}

// Bouton flottant étendu ou rétracté (tertiary, shape.lg).
export function Fab({
  label,
  icon,
  onPress,
  extended = true,
}: {
  label: string;
  icon: IconName;
  onPress: () => void;
  extended?: boolean;
}) {
  const { colors, type, shape, size, spacing, elevation, springs: themeSprings } = useTheme();
  const reduced = useReduceMotion();
  const press = usePressShape(shape.lg, shape.md);
  const anim = useSharedValue(extended ? 1 : 0);

  useEffect(() => {
    anim.value = withSpring(extended ? 1 : 0, reduced ? themeSprings.effects : themeSprings.spatialFast);
  }, [extended, reduced, themeSprings, anim]);

  const labelAnimStyle = useAnimatedStyle(() => ({
    opacity: anim.value,
    maxWidth: anim.value * 160,
    marginLeft: anim.value * spacing[2],
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      style={[
        styles.fab,
        elevation.level2,
        {
          right: spacing[4],
          bottom: spacing[4],
          height: size.fab,
          paddingHorizontal: spacing[4],
          backgroundColor: colors.tertiary,
          borderRadius: shape.lg,
        },
        press.style,
      ]}
    >
      <MaterialIcons name={icon} size={24} color={colors.onTertiary} />
      <Animated.View style={[{ overflow: 'hidden' }, labelAnimStyle]}>
        <Text numberOfLines={1} style={[type.titleMedium, { color: colors.onTertiary }]}>
          {label}
        </Text>
      </Animated.View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  btn: { flexDirection: 'row', borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  block: { alignSelf: 'stretch' },
  appbarRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  chip: { flexDirection: 'row', borderWidth: 1, alignItems: 'center' },
  search: { flexDirection: 'row', alignItems: 'center' },
  searchInput: { flex: 1, minWidth: 0 },
  fab: { position: 'absolute', flexDirection: 'row', alignItems: 'center' },
  tag: { height: 24, justifyContent: 'center', alignSelf: 'flex-start' },
  state: { alignItems: 'center' },
  stateText: { textAlign: 'center', maxWidth: 300 },
  art: { width: 150, height: 120 },
  artA: { position: 'absolute', left: 10, top: 4 },
  artB: { position: 'absolute', right: 4, top: 0 },
  artC: { position: 'absolute', right: 22, bottom: 6 },
});
