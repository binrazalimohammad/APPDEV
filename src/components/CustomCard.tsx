import { Alert, StyleSheet, Text, View } from 'react-native';

import { COLORS, ELEVATION, RADIUS, SPACING } from '../utils/theme';
import CustomButton from './CustomButton';

export type CustomCardProps = {
  label: string;
  subtitle?: string;
};

const CustomCard = ({ label, subtitle }: CustomCardProps) => {
  return (
    <View style={[styles.card, ELEVATION.card]}>
      <View style={styles.accent} />
      <View style={styles.body}>
        <Text style={styles.title}>{label}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <View style={styles.actions}>
          <CustomButton
            variant="outline"
            size="sm"
            label="Explore"
            onPress={() => {
              Alert.alert('CasaClick', 'Welcome aboard.');
            }}
            fullWidth={false}
            containerStyle={styles.ctaWrap}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    alignSelf: 'stretch',
    maxWidth: 400,
    marginBottom: SPACING.lg,
  },
  accent: {
    height: 4,
    backgroundColor: COLORS.primary,
    width: '100%',
  },
  body: {
    padding: SPACING.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    letterSpacing: -0.2,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  ctaWrap: {
    alignSelf: 'flex-start',
  },
});

export default CustomCard;
