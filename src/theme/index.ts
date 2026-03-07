import type { ViewStyle } from 'react-native';

export const colors = {
  primary: {
    50: '#FFF5F6',
    100: '#FDE8EA',
    200: '#F9B4BA',
    300: '#FF6B77',
    400: '#F03345',
    500: '#E8192C',
    600: '#CC1426',
    700: '#B01020',
    800: '#8D0D1A',
    900: '#6D0A14',
  },
  accent: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#2563EB',
    600: '#1D4ED8',
    700: '#1E40AF',
  },
  neutral: {
    50: '#F7F8FC',
    100: '#F0F2F7',
    200: '#E4E7F0',
    300: '#C8CEDC',
    400: '#A3AABE',
    500: '#7C8499',
    600: '#555C70',
    700: '#363C4E',
    800: '#1F2330',
    900: '#111318',
  },
  success: {
    DEFAULT: '#1A9E5C',
    light: '#E3F7ED',
  },
  warning: {
    DEFAULT: '#D97706',
    light: '#FEF3C7',
  },
  info: {
    DEFAULT: '#2563EB',
    light: '#DBEAFE',
  },
  error: {
    DEFAULT: '#E8192C',
    light: '#FDE8EA',
  },
  'price-drop': {
    DEFAULT: '#1A9E5C',
    bg: '#E3F7ED',
  },
  'price-up': {
    DEFAULT: '#E8192C',
    bg: '#FDE8EA',
  },
  'stock-in': '#1A9E5C',
  'stock-out': '#D97706',
  'stock-unknown': '#A3AABE',
  bgApp: '#F0F2F7',
  bgCard: '#FFFFFF',
  white: '#FFFFFF',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  xxxxl: 64,
} as const;

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const;

export const typography = {
  fontFamily: 'DMSans_400Regular',
  fontFamilyMedium: 'DMSans_500Medium',
  fontFamilySemiBold: 'DMSans_600SemiBold',
  fontFamilyBold: 'DMSans_700Bold',
  fontFamilyExtraBold: 'DMSans_800ExtraBold',
  fontFamilyMono: 'DMMono_500Medium',
  sizes: {
    xs: 11,
    sm: 12,
    md: 13,
    base: 14,
    lg: 15,
    xl: 16,
    xxl: 20,
    display: 28,
    hero: 42,
  },
} as const;

function makeShadow(
  shadowColor: string,
  shadowOffsetHeight: number,
  shadowOpacity: number,
  shadowRadius: number,
  elevation: number,
): ViewStyle {
  return {
    shadowColor,
    shadowOffset: { width: 0, height: shadowOffsetHeight },
    shadowOpacity,
    shadowRadius,
    elevation,
  };
}

export const shadow = {
  xs: makeShadow(colors.neutral[900], 1, 0.06, 2, 1),
  sm: makeShadow(colors.neutral[900], 2, 0.08, 8, 2),
  md: makeShadow(colors.neutral[900], 4, 0.1, 16, 4),
  lg: makeShadow(colors.neutral[900], 8, 0.12, 32, 8),
  xl: makeShadow(colors.neutral[900], 16, 0.16, 48, 16),
  red: makeShadow(colors.primary[500], 8, 0.28, 24, 8),
} as const;

export const theme = {
  colors,
  spacing,
  radius,
  typography,
  shadow,
} as const;
