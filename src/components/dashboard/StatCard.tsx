import { StyleSheet, Text, View } from 'react-native';

import { COLORS, ELEVATION, FONT, RADIUS, SPACING } from '../../utils/theme';

const ICON_GLYPH: Record<string, string> = {
  home: '🏠',
  money: '💰',
  users: '👥',
  user: '👤',
  file: '📄',
  bell: '🔔',
  clock: '⏳',
  list: '📋',
  cog: '⚙️',
};

type Props = {
  title: string;
  value: string;
  hint: string;
  icon?: string;
};

const StatCard = ({ title, value, hint, icon = 'home' }: Props) => (
  <View style={styles.card}>
    <View style={styles.topBar} />
    <View style={styles.header}>
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>{ICON_GLYPH[icon] ?? '•'}</Text>
      </View>
    </View>
    <Text style={styles.value}>{value}</Text>
    <Text style={styles.hint}>{hint}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...ELEVATION.card,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: COLORS.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
    gap: SPACING.xs,
  },
  title: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    lineHeight: 16,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 16,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.brown,
    marginBottom: 4,
  },
  hint: {
    ...FONT.caption,
    color: COLORS.textMuted,
  },
});

export default StatCard;
