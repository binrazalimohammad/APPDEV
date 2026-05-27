import { StyleSheet, Text, View, type ViewProps } from 'react-native';

import { COLORS, ELEVATION, FONT, RADIUS, SPACING } from '../../utils/theme';

type Props = ViewProps & {
  title: string;
  hint?: string;
  children: React.ReactNode;
};

const DashboardPanel = ({ title, hint, children, style, ...rest }: Props) => (
  <View style={[styles.panel, style]} {...rest}>
    <View style={styles.head}>
      <Text style={styles.title}>{title}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
    {children}
  </View>
);

const styles = StyleSheet.create({
  panel: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...ELEVATION.card,
  },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    ...FONT.headline,
    fontSize: 18,
    color: COLORS.brown,
  },
  hint: {
    ...FONT.caption,
    color: COLORS.textMuted,
  },
});

export default DashboardPanel;
