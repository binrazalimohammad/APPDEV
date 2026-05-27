import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import { useSelector } from 'react-redux';

import { trackMobileActivity } from '../../app/api/activity';
import { applyToListing, fetchListing, fetchListingsRevision } from '../../app/api/mobile';
import { LISTINGS_SYNC_INTERVAL_MS } from '../../constants/sync';
import { useRevisionPolling } from '../../hooks/useRevisionPolling';
import type { RootState } from '../../app/store';
import CustomButton from '../../components/CustomButton';
import CustomTextInput from '../../components/CustomTextInput';
import FormCard from '../../components/FormCard';
import type { Listing } from '../../app/api/types';
import type { MainStackParamList } from '../../navigation/types';
import { COLORS, ELEVATION, FONT, RADIUS, SPACING } from '../../utils';
import { runSafe } from '../../utils/runSafe';
import { ROUTES } from '../../utils/routes';

type Props = StackScreenProps<MainStackParamList, typeof ROUTES.LISTING_DETAIL>;

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

const ListingDetailScreen = ({ route }: Props) => {
  const { id } = route.params;
  const token = useSelector((s: RootState) => s.auth.token);
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [applying, setApplying] = useState(false);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) {
        setError(null);
        setLoading(true);
      }
      try {
        setListing(await fetchListing(id));
      } catch (e) {
        if (!silent) {
          setError(e instanceof Error ? e.message : 'Could not load listing');
        }
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [id],
  );

  const silentReload = useCallback(() => load(true), [load]);

  useRevisionPolling(fetchListingsRevision, silentReload, true, LISTINGS_SYNC_INTERVAL_MS);

  useFocusEffect(
    useCallback(() => {
      runSafe(load());
    }, [load]),
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !listing) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error ?? 'Listing not found'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {listing.imageUrl ? (
        <Image source={{ uri: listing.imageUrl }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Text style={styles.placeholderText}>No image</Text>
        </View>
      )}

      <View style={[styles.card, ELEVATION.card]}>
        {listing.occupied ? (
          <View style={styles.badgeOccupied}>
            <Text style={styles.badgeText}>Occupied — same as web</Text>
          </View>
        ) : (
          <View style={styles.badgeAvailable}>
            <Text style={styles.badgeTextAvailable}>Available</Text>
          </View>
        )}
        <Text style={styles.name}>{listing.name}</Text>
        {listing.category ? <Text style={styles.category}>{listing.category}</Text> : null}
        <Text style={styles.price}>{formatPrice(listing.price)}</Text>
        {listing.landlord?.name ? (
          <Text style={styles.landlord}>Landlord: {listing.landlord.name}</Text>
        ) : null}
        {listing.description ? (
          <Text style={styles.description}>{listing.description}</Text>
        ) : null}

        {!listing.occupied && token && token !== 'demo' ? (
          <FormCard
            title="Apply for this listing"
            subtitle="Same application form as on the website"
            style={styles.applyBox}
          >
            <CustomTextInput
              label="Message to landlord"
              labelVariant="form"
              value={message}
              onChangeText={setMessage}
              placeholder="Optional message"
              multiline
            />
            <CustomButton
              variant="save"
              label="Submit application"
              disabled={applying}
              onPress={async () => {
                setApplying(true);
                try {
                  const app = await applyToListing(token, id, message);
                  void trackMobileActivity(
                    'MOBILE_APPLY',
                    `Listing #${id}: ${listing.name}`,
                    `Application #${app.id}`,
                    token,
                  );
                  Alert.alert('Success', 'Application submitted — check My applications');
                  setMessage('');
                } catch (e) {
                  Alert.alert('Apply failed', e instanceof Error ? e.message : 'Error');
                } finally {
                  setApplying(false);
                }
              }}
            />
          </FormCard>
        ) : null}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: SPACING.xxl,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  image: {
    width: '100%',
    height: 220,
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
  card: {
    margin: SPACING.lg,
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badgeOccupied: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.errorMuted,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  badgeAvailable: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  badgeText: {
    ...FONT.caption,
    color: COLORS.error,
    fontWeight: '600',
  },
  badgeTextAvailable: {
    ...FONT.caption,
    color: COLORS.success,
    fontWeight: '600',
  },
  name: {
    ...FONT.headline,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  category: {
    ...FONT.caption,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  price: {
    ...FONT.title,
    fontSize: 24,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  landlord: {
    ...FONT.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  description: {
    ...FONT.body,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  error: {
    ...FONT.body,
    color: COLORS.error,
    textAlign: 'center',
  },
  applyBox: {
    marginTop: SPACING.lg,
    marginHorizontal: -SPACING.lg,
    marginBottom: 0,
  },
});

export default ListingDetailScreen;
