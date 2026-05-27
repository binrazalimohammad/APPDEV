import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

import type { NotificationItem } from '../../app/api/types';
import type { RootState } from '../../app/store';
import { useNotifications } from '../../hooks/useNotifications';
import BellIcon from '../icons/BellIcon';
import { COLORS, FONT, RADIUS, SPACING } from '../../utils/theme';
import { formatTimeAgo } from '../../utils/formatTimeAgo';
import { getNotificationVisual } from '../../utils/notificationMeta';

const PANEL_WIDTH = Math.min(360, Dimensions.get('window').width - SPACING.lg * 2);
const HEADER_HEIGHT = 56;

type Props = {
  compact?: boolean;
};

const NotificationBell = ({ compact = false }: Props) => {
  const token = useSelector((s: RootState) => s.auth.token);
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const { items, unreadCount, loading, markRead, markAllRead, refresh } = useNotifications(token, {
    poll: true,
  });

  const toggle = useCallback(() => {
    setOpen(prev => {
      if (!prev) {
        void refresh();
      }
      return !prev;
    });
  }, [refresh]);

  const close = useCallback(() => setOpen(false), []);

  const onItemPress = useCallback(
    (item: NotificationItem) => {
      if (!item.isRead) {
        void markRead(item.id);
      }
    },
    [markRead],
  );

  const badgeLabel =
    unreadCount > 99 ? '99+' : unreadCount > 0 ? String(unreadCount) : null;

  return (
    <>
      <Pressable
        style={({ pressed }) => [styles.bellBtn, compact && styles.bellBtnCompact, pressed && styles.pressed]}
        onPress={toggle}
        accessibilityRole="button"
        accessibilityLabel={
          unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'
        }
        hitSlop={8}
      >
        <BellIcon size={compact ? 18 : 20} color={COLORS.primary} />
        {unreadCount > 0 ? (
          <View style={[styles.badge, badgeLabel ? styles.badgeCount : styles.badgeDot]}>
            {badgeLabel ? <Text style={styles.badgeText}>{badgeLabel}</Text> : null}
          </View>
        ) : null}
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <Pressable style={styles.backdrop} onPress={close} accessibilityLabel="Close notifications">
          <Pressable
            style={[
              styles.panel,
              {
                top: insets.top + HEADER_HEIGHT + SPACING.xs,
                right: SPACING.md,
                width: PANEL_WIDTH,
                maxHeight: Dimensions.get('window').height * 0.62,
              },
            ]}
            onPress={e => e.stopPropagation()}
          >
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>Notifications</Text>
              {items.some(n => !n.isRead) ? (
                <Pressable onPress={() => void markAllRead()} hitSlop={8}>
                  <Text style={styles.markAll}>Mark all as read</Text>
                </Pressable>
              ) : null}
            </View>

            {loading && items.length === 0 ? (
              <View style={styles.centered}>
                <ActivityIndicator color={COLORS.primary} />
              </View>
            ) : (
              <FlatList
                data={items}
                keyExtractor={item => String(item.id)}
                style={styles.list}
                contentContainerStyle={items.length === 0 ? styles.emptyList : undefined}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => {
                  const visual = getNotificationVisual(item.type);
                  return (
                    <Pressable
                      style={[styles.item, !item.isRead && styles.itemUnread]}
                      onPress={() => onItemPress(item)}
                    >
                      <View style={styles.itemIconWrap}>
                        <Text style={styles.itemIcon}>{visual.icon}</Text>
                        <View style={[styles.statusDot, { backgroundColor: visual.dotColor }]} />
                      </View>
                      <View style={styles.itemBody}>
                        <Text style={styles.itemMessage} numberOfLines={3}>
                          {item.message}
                        </Text>
                        <Text style={styles.itemTime}>{formatTimeAgo(item.createdAt)}</Text>
                      </View>
                    </Pressable>
                  );
                }}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No notifications yet</Text>
                }
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  bellBtn: {
    padding: SPACING.xs,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primarySoft,
    position: 'relative',
  },
  bellBtnCompact: {
    padding: 6,
  },
  pressed: {
    opacity: 0.85,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badgeCount: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
  },
  badgeText: {
    color: COLORS.onPrimary,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(62, 39, 35, 0.35)',
    zIndex: 9998,
  },
  panel: {
    position: 'absolute',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#3E2723',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 24,
    zIndex: 9999,
    overflow: 'hidden',
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  panelTitle: {
    ...FONT.bodyStrong,
    color: COLORS.text,
  },
  markAll: {
    ...FONT.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  list: {
    flexGrow: 0,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  centered: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.line,
    gap: SPACING.sm,
  },
  itemUnread: {
    backgroundColor: COLORS.primaryMuted,
  },
  itemIconWrap: {
    width: 36,
    alignItems: 'center',
    paddingTop: 2,
  },
  itemIcon: {
    fontSize: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },
  itemBody: {
    flex: 1,
  },
  itemMessage: {
    ...FONT.body,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.text,
  },
  itemTime: {
    ...FONT.caption,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  emptyText: {
    ...FONT.body,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});

export default NotificationBell;
