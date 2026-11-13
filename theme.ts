// Thèmes de référence Mise · Material 3 Expressive (généré depuis design-de-reference/tokens.json, version 2).
// Seul fichier de l'app autorisé à contenir des couleurs en dur. Les composants lisent les rôles via useTheme().

const light = {
  primary: '#2E6A47',
  onPrimary: '#FFFFFF',
  primaryContainer: '#C4EBCF',
  onPrimaryContainer: '#0B3A20',
  secondary: '#4E6354',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#D1E8D5',
  onSecondaryContainer: '#0C2015',
  tertiary: '#A33C21',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#FFDBCF',
  onTertiaryContainer: '#5C1A07',
  warning: '#7A5200',
  onWarning: '#FFFFFF',
  warningContainer: '#F6CE6A',
  onWarningContainer: '#2B1D00',
  error: '#B42339',
  onError: '#FFFFFF',
  errorContainer: '#FFDAD8',
  onErrorContainer: '#5C0013',
  surface: '#FBF6EE',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#F6F0E6',
  surfaceContainer: '#F1EADF',
  surfaceContainerHigh: '#EBE4D8',
  surfaceContainerHighest: '#E5DDD1',
  onSurface: '#231C15',
  onSurfaceVariant: '#574C40',
  outline: '#867969',
  outlineVariant: '#D6CCBD',
  inverseSurface: '#383029',
  inverseOnSurface: '#FAEFE4',
  inversePrimary: '#93D6A9',
  scrim: 'rgba(0, 0, 0, 0.32)',
};

export type Palette = typeof light;

const dark: Palette = {
  primary: '#93D6A9',
  onPrimary: '#003920',
  primaryContainer: '#155234',
  onPrimaryContainer: '#B0F1C4',
  secondary: '#B5CCBA',
  onSecondary: '#213528',
  secondaryContainer: '#374B3D',
  onSecondaryContainer: '#D1E8D5',
  tertiary: '#FFB59F',
  onTertiary: '#5E1703',
  tertiaryContainer: '#85301A',
  onTertiaryContainer: '#FFDBCF',
  warning: '#F3C766',
  onWarning: '#402D00',
  warningContainer: '#5C4300',
  onWarningContainer: '#FFDEA1',
  error: '#FFB3B0',
  onError: '#68000F',
  errorContainer: '#93001E',
  onErrorContainer: '#FFDAD8',
  surface: '#17130F',
  surfaceContainerLowest: '#110E0B',
  surfaceContainerLow: '#1F1A16',
  surfaceContainer: '#241E19',
  surfaceContainerHigh: '#2E2823',
  surfaceContainerHighest: '#39322C',
  onSurface: '#EDE1D6',
  onSurfaceVariant: '#D3C6B6',
  outline: '#9C8F80',
  outlineVariant: '#4F4539',
  inverseSurface: '#EDE1D6',
  inverseOnSurface: '#362F29',
  inversePrimary: '#2E6A47',
  scrim: 'rgba(0, 0, 0, 0.6)',
};

export const palettes = { light, dark };

// Espacements (base 4) : space-4 = marge d'écran
export const spacing = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 12: 48 } as const;

// Échelle de formes Material 3 Expressive
export const shape = { xs: 4, sm: 8, md: 12, lg: 16, lgPlus: 20, xl: 28, xlPlus: 32, xxl: 48, full: 999 } as const;

// Dimensions d'interface
export const size = { tapMin: 48, buttonS: 40, buttonM: 56, fab: 56, navBar: 64, navIndicatorW: 56, navIndicatorH: 32 } as const;

// Ressorts Expressive pour Reanimated : withSpring(valeur, springs.spatialDefault)
export const springs = {
  spatialFast: { stiffness: 800, damping: 34, mass: 1 },
  spatialDefault: { stiffness: 380, damping: 31, mass: 1 },
  spatialSlow: { stiffness: 200, damping: 23, mass: 1 },
  effects: { stiffness: 1600, damping: 80, mass: 1 },
} as const;

// Polices chargées avec @expo-google-fonts/fraunces et @expo-google-fonts/hanken-grotesk
export const fonts = {
  display: 'Fraunces_600SemiBold',
  displayMedium: 'Fraunces_500Medium',
  body: 'HankenGrotesk_400Regular',
  bodyMedium: 'HankenGrotesk_500Medium',
  bodySemi: 'HankenGrotesk_600SemiBold',
  bodyBold: 'HankenGrotesk_700Bold',
};

// Échelle typographique Material 3 (titres en version emphasized, Fraunces)
export const type = {
  displayLarge: { fontFamily: fonts.display, fontSize: 57, lineHeight: 64, letterSpacing: -0.25 },
  displayMedium: { fontFamily: fonts.display, fontSize: 45, lineHeight: 52 },
  displaySmall: { fontFamily: fonts.display, fontSize: 36, lineHeight: 44, letterSpacing: -0.72 },
  headlineLarge: { fontFamily: fonts.display, fontSize: 32, lineHeight: 40, letterSpacing: -0.64 },
  headlineMedium: { fontFamily: fonts.display, fontSize: 28, lineHeight: 36, letterSpacing: -0.28 },
  headlineSmall: { fontFamily: fonts.display, fontSize: 24, lineHeight: 32 },
  titleLarge: { fontFamily: fonts.bodySemi, fontSize: 22, lineHeight: 28 },
  titleMedium: { fontFamily: fonts.bodySemi, fontSize: 16, lineHeight: 24, letterSpacing: 0.16 },
  titleSmall: { fontFamily: fonts.bodySemi, fontSize: 14, lineHeight: 20, letterSpacing: 0.14 },
  bodyLarge: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  bodyMedium: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  bodySmall: { fontFamily: fonts.body, fontSize: 12, lineHeight: 16 },
  labelLarge: { fontFamily: fonts.bodySemi, fontSize: 14, lineHeight: 20, letterSpacing: 0.14 },
  labelMedium: { fontFamily: fonts.bodySemi, fontSize: 12, lineHeight: 16, letterSpacing: 0.48 },
  labelSmall: { fontFamily: fonts.bodySemi, fontSize: 11, lineHeight: 16, letterSpacing: 0.44 },
};

// Élévations Material 3 (iOS : shadow*, Android : elevation)
export const elevation = {
  level1: { shadowColor: '#000000', shadowOpacity: 0.12, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  level2: { shadowColor: '#000000', shadowOpacity: 0.14, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  level3: { shadowColor: '#000000', shadowOpacity: 0.16, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
} as const;
