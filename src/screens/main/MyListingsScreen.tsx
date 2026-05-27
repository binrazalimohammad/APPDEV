import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useSelector } from 'react-redux';

import { fetchMyListings, fetchMyListingsRevision, resolveMediaUrl } from '../../app/api/mobile';
import { LISTINGS_SYNC_INTERVAL_MS } from '../../constants/sync';
import { useRevisionPolling } from '../../hooks/useRevisionPolling';
import type { Listing } from '../../app/api/types';
import type { RootState } from '../../app/store';
import type { MainStackParamList } from '../../navigation/types';
import { COLORS, FONT, RADIUS, SPACING } from '../../utils';
import { runSafe } from '../../utils/runSafe';
import { ROUTES } from '../../utils/routes';

type Nav = StackNavigationProp<MainStackParamList, typeof ROUTES.MY_LISTINGS>;

const MyListingsScreen = () => {
  const navigation = useNavigation<Nav>();
  const token = useSelector((s: RootState) => s.auth.token);
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (silent = false) => {
      if (!token || token === 'demo') {
        setError('Sign in as a landlord to see your listings');
        setLoading(false);
        return;
      }
      if (!silent) {
        setError(null);
      }
      try {
        setItems(await fetchMyListings(token));
      } catch (e) {
        if (!silent) {
          setError(e instanceof Error ? e.message : 'Could not load listings');
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  const silentReload = useCallback(() => {
    setRefreshing(true);
    return load(true);
  }, [load]);

  useRevisionPolling(
    () => fetchMyListingsRevision(token!),
    silentReload,
    Boolean(token && token !== 'demo'),
    LISTINGS_SYNC_INTERVAL_MS,
  );

  useFocusEffect(
    useCallback(() => {
      setRefreshing(true);
      runSafe(load());
    }, [load]),
  );

  if (loading && items.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={item => String(item.id)}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            runSafe(load());
          }}
          tintColor={COLORS.primary}
        />
      }
      ListHeaderComponent={
        error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <Text style={styles.hint}>
            Synced with the website — updates every {LISTINGS_SYNC_INTERVAL_MS / 1000}s.
          </Text>
        )
      }
      ListEmptyComponent={
        !error ? (
          <Text style={styles.empty}>No listings yet. Create one on the CasaClick website.</Text>
        ) : null
      }
      renderItem={({ item }) => {
        const imageUri = item.imageUrl ?? resolveMediaUrl(item.image);
        return (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            onPress={() => navigation.navigate(ROUTES.LISTING_DETAIL, { id: Number(item.id) })}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.thumb} />
            ) : (
              <View style={[styles.thumb, styles.thumbPlaceholder]}>
                <Text>🏠</Text>
              </View>
            )}
            <View style={styles.cardBody}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>
                {item.category ?? 'Uncategorized'} · {item.status ?? 'draft'}
              </Text>
              <Text style={styles.price}>₱{Number(item.price ?? 0).toLocaleString()}/mo</Text>
            </View>
          </Pressable>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  list: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hint: { ...FONT.caption, color: COLORS.textMuted, marginBottom: SPACING.md },
  errorBox: {
    backgroundColor: COLORS.errorMuted,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  errorText: { color: COLORS.error },
  empty: { ...FONT.body, color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.xl },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  },
  pressed: { opacity: 0.92 },
  thumb: { width: 96, height: 96 },
  thumbPlaceholder: {
    backgroundColor: COLORS.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1, padding: SPACING.md, justifyContent: 'center' },
  name: { ...FONT.bodyStrong, color: COLORS.text },
  meta: { ...FONT.caption, color: COLORS.textMuted, marginTop: 2 },
  price: { ...FONT.bodyStrong, color: COLORS.primary, marginTop: SPACING.xs },
});

export default MyListingsScreen;
