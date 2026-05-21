import { StyleSheet, Text, View } from 'react-native';

import { COLORS, FONT, RADIUS, SPACING } from '../utils/theme';

type Variant = 'error' | 'success' | 'warning' | 'info';

type FormFlashProps = {
  message: string;
  variant?: Variant;
};

const variantStyle: Record<Variant, { bg: string; border: string; text: string }> = {
  error: { bg: COLORS.errorMuted, border: COLORS.errorBorder, text: COLORS.error },
  success: { bg: COLORS.successMuted, border: COLORS.successBorder, text: COLORS.success },
  warning: { bg: COLORS.warningSoft, border: '#E6D08C', text: COLORS.warning },
  info: { bg: COLORS.infoSoft, border: '#C5D8F0', text: COLORS.info },
};

const FormFlash = ({ message, variant = 'error' }: FormFlashProps) => {
  const v = variantStyle[variant];
  return (
    <View style={[styles.box, { backgroundColor: v.bg, borderColor: v.border }]}>
      <Text style={[styles.text, { color: v.text }]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  text: {
    ...FONT.caption,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default FormFlash;
