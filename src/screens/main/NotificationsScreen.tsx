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

import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../app/api/mobile';
import type { NotificationItem } from '../../app/api/types';
import type { RootState } from '../../app/store';
import CustomButton from '../../components/CustomButton';
import { COLORS, FONT, RADIUS, SPACING } from '../../utils';
import { runSafe } from '../../utils/runSafe';

const NotificationsScreen = () => {
  const token = useSelector((s: RootState) => s.auth.token);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!token || token === 'demo') {
      setLoading(false);
      return;
    }
    try {
      const res = await fetchNotifications(token);
      setItems(res.items);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      setRefreshing(true);
      runSafe(load());
    }, [load]),
  );

  const markRead = async (id: number) => {
    if (!token) return;
    try {
      await markNotificationRead(token, id);
      runSafe(load());
    } catch {
      // ignore
    }
  };

  const markAll = async () => {
    if (!token) return;
    try {
      await markAllNotificationsRead(token);
      runSafe(load());
    } catch {
      // ignore
    }
  };

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
        <CustomButton variant="outline" size="sm" label="Mark all read" onPress={markAll} fullWidth={false} />
      </View>
      <FlatList
        data={items}
        keyExtractor={i => String(i.id)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={load} tintColor={COLORS.primary} />
        }
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.card, !item.isRead && styles.unread]}
            onPress={() => markRead(Number(item.id))}
          >
            <Text style={styles.type}>{item.type}</Text>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.date}>{item.createdAt.slice(0, 16).replace('T', ' ')}</Text>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No notifications</Text>}
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
  type: { ...FONT.caption, color: COLORS.primary, fontWeight: '600' },
  message: { ...FONT.body, color: COLORS.text, marginTop: 4 },
  date: { ...FONT.caption, color: COLORS.textMuted, marginTop: 4 },
  empty: { textAlign: 'center', color: COLORS.textMuted, padding: SPACING.xl },
});

export default NotificationsScreen;
