import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { fetchCategories, fetchListings, fetchListingsRevision } from '../../app/api/mobile';
import { useRevisionPolling } from '../../hooks/useRevisionPolling';
import { LISTINGS_SYNC_INTERVAL_MS } from '../../constants/sync';
import type { Category, Listing } from '../../app/api/types';
import type { MainStackParamList } from '../../navigation/types';
import { COLORS, ELEVATION, FONT, RADIUS, SPACING } from '../../utils';
import { runSafe } from '../../utils/runSafe';
import { ROUTES } from '../../utils/routes';

type ListingsNav = StackNavigationProp<MainStackParamList, typeof ROUTES.LISTINGS>;

const formatPrice = (value: number | string | null | undefined): string => {
  if (value == null || value === '') {
    return '—';
  }
  const num = Number(value);
  if (Number.isNaN(num)) {
    return String(value);
  }
  return `₱${num.toLocaleString()}`;
};

type ListingCardProps = {
  item: Listing;
  onPress: () => void;
};

const ListingCard = ({ item, onPress }: ListingCardProps) => (
  <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.cardPressed]}>
    <View style={[styles.card, ELEVATION.card]}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Text style={styles.placeholderText}>No image</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        {item.occupied ? (
          <Text style={styles.occupiedBadge}>Occupied</Text>
        ) : null}
        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>
        {item.category ? <Text style={styles.category}>{item.category}</Text> : null}
        <Text style={styles.price}>{formatPrice(item.price)}</Text>
        {item.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
      </View>
    </View>
  </Pressable>
);

const ListingsScreen = () => {
  const navigation = useNavigation<ListingsNav>();
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false, silent = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else if (!silent) {
      setLoading(true);
    }
    if (!silent) {
      setError(null);
    }
    try {
      const [listingData, categoryData] = await Promise.all([
        fetchListings(),
        fetchCategories(),
      ]);
      setListings(listingData);
      setCategories(categoryData);
    } catch (e) {
      if (!silent) {
        setError(e instanceof Error ? e.message : 'Could not load listings');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const silentReload = useCallback(() => load(true, true), [load]);

  useRevisionPolling(fetchListingsRevision, silentReload, true, LISTINGS_SYNC_INTERVAL_MS);

  useFocusEffect(
    useCallback(() => {
      runSafe(load(true));
    }, [load]),
  );

  const filteredListings = useMemo(() => {
    if (!categoryFilter) {
      return listings;
    }
    return listings.filter(item => item.category === categoryFilter);
  }, [listings, categoryFilter]);

  if (loading && !refreshing && listings.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.syncNote}>
        Same approved listings as the website — auto-updates every {LISTINGS_SYNC_INTERVAL_MS / 1000}s
        (pull down to refresh anytime).
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {categories.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          <Pressable
            style={[styles.chip, !categoryFilter && styles.chipActive]}
            onPress={() => setCategoryFilter(null)}
          >
            <Text style={[styles.chipText, !categoryFilter && styles.chipTextActive]}>All</Text>
          </Pressable>
          {categories.map(cat => (
            <Pressable
              key={String(cat.id)}
              style={[styles.chip, categoryFilter === cat.name && styles.chipActive]}
              onPress={() => setCategoryFilter(cat.name)}
            >
              <Text
                style={[
                  styles.chipText,
                  categoryFilter === cat.name && styles.chipTextActive,
                ]}
              >
                {cat.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      <FlatList
        data={filteredListings}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <ListingCard
            item={item}
            onPress={() =>
              navigation.navigate(ROUTES.LISTING_DETAIL, { id: Number(item.id) })
            }
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          !error ? (
            <Text style={styles.empty}>
              No approved listings in this category. Approve a listing on the web admin, then
              refresh here.
            </Text>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  syncNote: {
    ...FONT.caption,
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
    lineHeight: 18,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  chips: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    marginRight: SPACING.sm,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    ...FONT.caption,
    color: COLORS.text,
    fontWeight: '600',
  },
  chipTextActive: {
    color: COLORS.onPrimary,
  },
  list: {
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xxl,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  cardPressed: {
    opacity: 0.92,
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: COLORS.primaryMuted,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    ...FONT.caption,
    color: COLORS.textMuted,
  },
  cardBody: {
    padding: SPACING.md,
  },
  occupiedBadge: {
    ...FONT.caption,
    color: COLORS.error,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  name: {
    ...FONT.bodyStrong,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  category: {
    ...FONT.caption,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  price: {
    ...FONT.headline,
    fontSize: 18,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  description: {
    ...FONT.body,
    color: COLORS.textSecondary,
  },
  error: {
    ...FONT.caption,
    color: COLORS.error,
    backgroundColor: COLORS.errorMuted,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  empty: {
    ...FONT.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    padding: SPACING.xl,
  },
});

export default ListingsScreen;
