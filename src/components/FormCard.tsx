import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { formStyles } from '../utils/formStyles';
import { COLORS, FONT, SPACING } from '../utils/theme';

type FormCardProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** In-app forms — mirrors .form-card / .form-container on website */
const FormCard = ({ title, subtitle, children, style }: FormCardProps) => (
  <View style={[formStyles.formCard, style]}>
    {title ? <Text style={styles.title}>{title}</Text> : null}
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    {children}
  </View>
);

const styles = StyleSheet.create({
  title: {
    ...FONT.headline,
    color: COLORS.brown,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...FONT.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
});

export default FormCard;
