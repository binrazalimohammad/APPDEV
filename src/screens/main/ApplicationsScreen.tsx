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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useSelector } from 'react-redux';

import { fetchApplications } from '../../app/api/application';
import { fetchApplicationsRevision } from '../../app/api/sync';
import { useOrderStatusListener } from '../../hooks/useOrderStatusListener';
import { useRevisionPolling } from '../../hooks/useRevisionPolling';
import { orderStatusLabel } from '../../constants/orderStatus';
import { LISTINGS_SYNC_INTERVAL_MS } from '../../constants/sync';
import type { Application } from '../../app/api/types';
import type { RootState } from '../../app/store';
import type { MainStackParamList } from '../../navigation/types';
import { COLORS, FONT, RADIUS, SPACING } from '../../utils';
import { runSafe } from '../../utils/runSafe';
import { ROUTES } from '../../utils/routes';

type Nav = StackNavigationProp<MainStackParamList, typeof ROUTES.APPLICATIONS>;

const ApplicationsScreen = () => {
  const navigation = useNavigation<Nav>();
  const token = useSelector((s: RootState) => s.auth.token);
  const [items, setItems] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token || token === 'demo') {
      setError('Sign in to see applications');
      setLoading(false);
      return;
    }
    setError(null);
    try {
      setItems(await fetchApplications(token));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useRevisionPolling(
    () => fetchApplicationsRevision(token!),
    () => load(),
    Boolean(token && token !== 'demo'),
    LISTINGS_SYNC_INTERVAL_MS,
  );

  useOrderStatusListener({
    onStatusChange: payload => {
      setItems(prev =>
        prev.map(item =>
          Number(item.id) === payload.order_id ? { ...item, status: payload.status } : item,
        ),
      );
    },
  });

  useFocusEffect(
    useCallback(() => {
      setRefreshing(true);
      runSafe(load());
    }, [load]),
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.hint}>Same list as /application on the website</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={items}
        keyExtractor={i => String(i.id)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={load} tintColor={COLORS.primary} />
        }
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              navigation.navigate(ROUTES.APPLICATION_DETAIL, { id: Number(item.id) })
            }
          >
            <Text style={styles.name}>{item.listing?.name ?? 'Listing'}</Text>
            <Text style={styles.status}>Status: {orderStatusLabel(item.status)}</Text>
            <Text style={styles.meta}>{item.createdAt?.slice(0, 10)}</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          !error ? <Text style={styles.empty}>No applications yet. Apply from a listing.</Text> : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hint: {
    ...FONT.caption,
    color: COLORS.textSecondary,
    padding: SPACING.lg,
    paddingBottom: 0,
  },
  list: { padding: SPACING.lg },
  card: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  name: { ...FONT.bodyStrong, color: COLORS.text },
  status: { ...FONT.caption, color: COLORS.primary, marginTop: 4 },
  meta: { ...FONT.caption, color: COLORS.textMuted, marginTop: 4 },
  error: { color: COLORS.error, padding: SPACING.lg },
  empty: { textAlign: 'center', color: COLORS.textMuted, padding: SPACING.xl },
});

export default ApplicationsScreen;
