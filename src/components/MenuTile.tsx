import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONT, RADIUS, SPACING } from '../utils/theme';

export type MenuTileProps = {
  title: string;
  subtitle?: string;
  badge?: number;
  onPress: () => void;
};

const MenuTile = ({ title, subtitle, badge, onPress }: MenuTileProps) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
  >
    <View style={styles.textWrap}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
    {badge != null && badge > 0 ? (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
      </View>
    ) : null}
  </Pressable>
);

const styles = StyleSheet.create({
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  pressed: {
    opacity: 0.9,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    ...FONT.bodyStrong,
    color: COLORS.text,
  },
  subtitle: {
    ...FONT.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  badge: {
    backgroundColor: COLORS.error,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: COLORS.onPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
});

export default MenuTile;
