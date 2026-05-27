import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { COLORS, RADIUS, SPACING } from '../utils/theme';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'google'
  | 'save'
  | 'danger';

export type ButtonSize = 'md' | 'sm';

export type CustomButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

const CustomButton = ({
  label,
  onPress,
  disabled,
  loading = false,
  variant = 'primary',
  size = 'md',
  fullWidth = true,
  icon,
  containerStyle,
  textStyle,
}: CustomButtonProps) => {
  const busy = Boolean(disabled || loading);
  const variantStyles = styles[variant];
  const sizeStyles = size === 'sm' ? styles.sizeSm : styles.sizeMd;
  const textVariant = textStyles[variant];
  const textSize = size === 'sm' ? textStyles.sm : textStyles.md;
  const spinnerColor =
    variant === 'google' || variant === 'outline' || variant === 'secondary'
      ? COLORS.primary
      : COLORS.onPrimary;

  return (
    <View style={[fullWidth && styles.fullWidth, containerStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: busy, busy: loading }}
        accessibilityLabel={label}
        onPress={onPress}
        disabled={busy}
        style={({ pressed }) => [
          styles.base,
          sizeStyles,
          variantStyles,
          pressed && !busy && styles.pressed,
          busy && !loading && styles.disabledBtn,
          loading && styles.loadingBtn,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={spinnerColor} size="small" />
        ) : (
          <View style={styles.content}>
            {icon ? <View style={styles.iconSlot}>{icon}</View> : null}
            <Text
              style={[
                textStyles.base,
                textSize,
                textVariant,
                icon ? styles.labelWithIcon : null,
                textStyle,
                busy && !loading && styles.disabledText,
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  fullWidth: {
    alignSelf: 'stretch',
  },
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  iconSlot: {
    marginRight: 2,
  },
  labelWithIcon: {
    flexShrink: 1,
  },
  sizeMd: {
    paddingVertical: 15,
    paddingHorizontal: SPACING.lg,
    minHeight: 52,
  },
  sizeSm: {
    paddingVertical: 11,
    paddingHorizontal: SPACING.md,
    minHeight: 44,
  },
  primary: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  save: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 3,
  },
  secondary: {
    backgroundColor: COLORS.primarySoft,
    borderColor: COLORS.border,
  },
  outline: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  google: {
    backgroundColor: COLORS.surface,
    borderColor: '#DADCE0',
    shadowColor: '#3C4043',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 0,
  },
  danger: {
    backgroundColor: '#DC3545',
    borderColor: '#C82333',
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.985 }],
  },
  loadingBtn: {
    opacity: 0.92,
  },
  disabledBtn: {
    backgroundColor: COLORS.divider,
    borderColor: COLORS.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledText: {
    color: COLORS.textMuted,
  },
});

const textStyles = StyleSheet.create({
  base: {
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  md: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
  },
  sm: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  primary: {
    color: COLORS.onPrimary,
  },
  save: {
    color: COLORS.onPrimary,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  secondary: {
    color: COLORS.primaryDark,
  },
  outline: {
    color: COLORS.brown,
    fontWeight: '600',
  },
  google: {
    color: '#3C4043',
    fontWeight: '500',
    fontSize: 15,
  },
  ghost: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  danger: {
    color: COLORS.onPrimary,
  },
});

export default CustomButton;
