import type { TextStyle, ViewStyle } from 'react-native';

/**
 * CasaClick brand — matches websitedev/assets/styles/casaclick-brand.css
 * Auth/login/register + form-card patterns from .cc-auth-card / .form-group
 */
export const COLORS = {
  background: '#FFFDF7',
  backgroundSoft: '#F9F7F4',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  cream: '#FFFDF7',
  primary: '#8B4513',
  primaryDark: '#6D3710',
  primaryMid: '#9A5A2E',
  primaryLight: '#B8733A',
  primarySoft: '#F5E6D3',
  primaryMuted: '#F5EAD8',
  onPrimary: '#FFFFFF',
  brown: '#5C4033',
  text: '#3E2723',
  textSecondary: '#6D4C41',
  textMuted: '#A0825C',
  textDisabled: '#D2B48C',
  border: '#E8DCC0',
  borderFocus: '#D2B48C',
  line: 'rgba(92, 64, 51, 0.12)',
  divider: '#E8DCC0',
  error: '#AA3333',
  errorBright: '#EB5E28',
  errorMuted: '#FFF0F0',
  errorBorder: '#F5C2C2',
  success: '#1E5C2E',
  successMuted: '#F0FFF4',
  successBorder: '#B8E0C8',
  info: '#2C5282',
  infoSoft: '#F4F8FF',
  warning: '#7A5A00',
  warningSoft: '#FFF8E6',
  /** Legacy dashboard teal — secondary UI only */
  accentTeal: '#427C89',
} as const;

export type ColorKey = keyof typeof COLORS;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const ELEVATION: { card: ViewStyle; authCard: ViewStyle } = {
  card: {
    shadowColor: '#5C4033',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  authCard: {
    shadowColor: '#5C4033',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
};

export const FONT: Record<string, TextStyle> = {
  display: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  headline: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  bodyStrong: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  button: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  eyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
};

export const FONT_FAMILY = {
  sans: undefined as string | undefined,
  display: undefined as string | undefined,
};

export default COLORS;
