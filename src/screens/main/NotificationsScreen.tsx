import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';

import type { RootState } from '../../app/store';
import CustomButton from '../../components/CustomButton';
import { useNotifications } from '../../hooks/useNotifications';
import { COLORS, FONT, RADIUS, SPACING } from '../../utils';
import { formatTimeAgo } from '../../utils/formatTimeAgo';
import { getNotificationVisual } from '../../utils/notificationMeta';

const NotificationsScreen = () => {
  const token = useSelector((s: RootState) => s.auth.token);
  const [refreshing, setRefreshing] = useState(false);
  const { items, loading, markRead, markAllRead, reload } = useNotifications(token, {
    poll: false,
  });

  const load = useCallback(async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }, [reload]);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.hint}>Synced with website notifications</Text>
        <CustomButton
          variant="outline"
          size="sm"
          label="Mark all read"
          onPress={() => void markAllRead()}
          fullWidth={false}
        />
      </View>
      <FlatList
        data={items}
        keyExtractor={i => String(i.id)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={load} tintColor={COLORS.primary} />
        }
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const visual = getNotificationVisual(item.type);
          return (
            <Pressable
              style={[styles.card, !item.isRead && styles.unread]}
              onPress={() => void markRead(item.id)}
            >
              <View style={styles.cardRow}>
                <Text style={styles.itemIcon}>{visual.icon}</Text>
                <View style={styles.cardBody}>
                  <View style={styles.typeRow}>
                    <Text style={styles.type}>{visual.label}</Text>
                    <View style={[styles.statusDot, { backgroundColor: visual.dotColor }]} />
                  </View>
                  <Text style={styles.message}>{item.message}</Text>
                  <Text style={styles.date}>{formatTimeAgo(item.createdAt)}</Text>
                </View>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>No notifications yet</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hint: { ...FONT.caption, color: COLORS.textSecondary, flex: 1 },
  list: { padding: SPACING.lg, paddingTop: SPACING.sm },
  card: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  unread: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryMuted },
  cardRow: { flexDirection: 'row', gap: SPACING.sm },
  itemIcon: { fontSize: 22, marginTop: 2 },
  cardBody: { flex: 1 },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  type: { ...FONT.caption, color: COLORS.primary, fontWeight: '600' },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  message: { ...FONT.body, color: COLORS.text, marginTop: 4 },
  date: { ...FONT.caption, color: COLORS.textMuted, marginTop: 4 },
  empty: { textAlign: 'center', color: COLORS.textMuted, padding: SPACING.xl },
});

export default NotificationsScreen;
