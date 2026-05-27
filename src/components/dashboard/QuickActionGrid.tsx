import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { DashboardQuickLink } from '../../app/api/content';
import { COLORS, ELEVATION, FONT, RADIUS, SPACING } from '../../utils/theme';

const ICON_GLYPH: Record<string, string> = {
  list: '▦',
  home: '⌂',
  file: '☰',
  user: '◎',
  bell: '◉',
  money: '₱',
};

type Props = {
  items: DashboardQuickLink[];
  onPress: (id: string) => void;
};

const QuickActionGrid = ({ items, onPress }: Props) => (
  <View style={styles.grid}>
    {items.map(item => (
      <Pressable
        key={item.id}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() => onPress(item.id)}
      >
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>{ICON_GLYPH[item.icon ?? 'list'] ?? '•'}</Text>
        </View>
        <Text style={styles.label} numberOfLines={2}>
          {item.label}
        </Text>
        {item.subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {item.subtitle}
          </Text>
        ) : null}
        {item.badge != null && item.badge > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.badge > 99 ? '99+' : item.badge}</Text>
          </View>
        ) : null}
      </Pressable>
    ))}
  </View>
);

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  card: {
    width: '47.5%',
    flexGrow: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 108,
    ...ELEVATION.card,
  },
  cardPressed: {
    opacity: 0.92,
    borderColor: COLORS.primary,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  icon: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: '600',
  },
  label: {
    ...FONT.bodyStrong,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 18,
  },
  subtitle: {
    ...FONT.caption,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  badge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.error,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    color: COLORS.onPrimary,
    fontSize: 10,
    fontWeight: '700',
  },
});

export default QuickActionGrid;
