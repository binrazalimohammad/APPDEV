import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';

import { fetchPayments } from '../../app/api/mobile';
import type { Payment } from '../../app/api/types';
import type { RootState } from '../../app/store';
import { COLORS, FONT, RADIUS, SPACING } from '../../utils';
import { runSafe } from '../../utils/runSafe';

const PaymentsScreen = () => {
  const token = useSelector((s: RootState) => s.auth.token);
  const [items, setItems] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!token || token === 'demo') {
      setLoading(false);
      return;
    }
    try {
      setItems(await fetchPayments(token));
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

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.hint}>Same data as /payment on the website</Text>
      <FlatList
        data={items}
        keyExtractor={i => String(i.id)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={load} tintColor={COLORS.primary} />
        }
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.amount}>₱{item.amount}</Text>
            <Text style={styles.meta}>
              {item.status} · {item.paymentMethod}
            </Text>
            <Text style={styles.meta}>
              {item.application?.listing?.name ?? 'Application'}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No payments yet</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hint: { ...FONT.caption, color: COLORS.textSecondary, padding: SPACING.lg, paddingBottom: 0 },
  list: { padding: SPACING.lg },
  card: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  amount: { ...FONT.bodyStrong, color: COLORS.text },
  meta: { ...FONT.caption, color: COLORS.textSecondary, marginTop: 4 },
  empty: { textAlign: 'center', color: COLORS.textMuted, padding: SPACING.xl },
});

export default PaymentsScreen;
