import { StyleSheet, Text, View } from 'react-native';

import BrandLogo from '../BrandLogo';
import RoleBadge from './RoleBadge';
import { COLORS, ELEVATION, FONT, RADIUS, SPACING } from '../../utils/theme';

type Props = {
  eyebrow: string;
  title: string;
  subtitle: string;
  role: string;
  userName?: string | null;
};

const DashboardHero = ({ eyebrow, title, subtitle, role, userName }: Props) => (
  <View style={styles.hero}>
    <BrandLogo size="sm" style={styles.logo} />
    <Text style={styles.eyebrow}>{eyebrow}</Text>
    <Text style={styles.title}>{title}</Text>
    <View style={styles.metaRow}>
      {userName ? <Text style={styles.userName}>{userName}</Text> : null}
      <RoleBadge role={role} />
    </View>
    <Text style={styles.subtitle}>{subtitle}</Text>
  </View>
);

const styles = StyleSheet.create({
  hero: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...ELEVATION.authCard,
  },
  logo: {
    alignSelf: 'center',
    marginBottom: SPACING.sm,
  },
  eyebrow: {
    ...FONT.eyebrow,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  title: {
    ...FONT.title,
    color: COLORS.brown,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  userName: {
    ...FONT.bodyStrong,
    color: COLORS.text,
  },
  subtitle: {
    ...FONT.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default DashboardHero;
