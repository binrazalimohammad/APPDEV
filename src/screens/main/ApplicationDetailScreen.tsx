import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';
import { useSelector } from 'react-redux';

import { createPaymongoCheckout } from '../../app/api/paymongo';
import type { PaymongoCheckoutBody } from '../../app/api/paymongo';
import { fetchApplication, submitPayment } from '../../app/api/mobile';
import type { Application } from '../../app/api/types';
import type { RootState } from '../../app/store';
import CustomButton from '../../components/CustomButton';
import CustomTextInput from '../../components/CustomTextInput';
import FormCard from '../../components/FormCard';
import PaymongoPaymentForm from '../../components/PaymongoPaymentForm';
import { paymentMethodLabel } from '../../constants/paymongoPayment';
import type { MainStackParamList } from '../../navigation/types';
import { isCustomerRole } from '../../utils/roleNavigation';
import { COLORS, FONT, RADIUS, SPACING } from '../../utils';
import { runSafe } from '../../utils/runSafe';
import { ROUTES } from '../../utils/routes';

type Props = StackScreenProps<MainStackParamList, typeof ROUTES.APPLICATION_DETAIL>;

const statusLabel: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  completed: 'Complete',
  refunded: 'Refund',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
};

type DetailContentProps = {
  app: Application;
  user: RootState['auth']['user'];
  notes: string;
  setNotes: (value: string) => void;
  showPaymongo: boolean;
  setShowPaymongo: (value: boolean | ((prev: boolean) => boolean)) => void;
  paying: boolean;
  onManualPay: () => void;
  onPaymongoCheckout: (details: PaymongoCheckoutBody) => void;
};

/** Presentational — no hooks (keeps parent hook order stable). */
function ApplicationDetailContent({
  app,
  user,
  notes,
  setNotes,
  showPaymongo,
  setShowPaymongo,
  paying,
  onManualPay,
  onPaymongoCheckout,
}: DetailContentProps) {
  const isCustomer = isCustomerRole(user);
  const bookingStatus = statusLabel[app.status] ?? app.status;
  const canPayRent = isCustomer && app.status === 'approved';

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{app.listing?.name}</Text>
      <Text style={styles.status}>Booking: {bookingStatus}</Text>
      {app.message ? <Text style={styles.body}>Message: {app.message}</Text> : null}
      {app.landlord?.name ? (
        <Text style={styles.body}>Landlord: {app.landlord.name}</Text>
      ) : null}

      <Text style={styles.section}>Payments</Text>
      {app.payments?.length ? (
        app.payments.map(p => (
          <View key={String(p.id)} style={styles.card}>
            <Text style={styles.body}>
              ₱{p.amount} — {p.status} ({paymentMethodLabel(p.paymentMethod)})
            </Text>
          </View>
        ))
      ) : (
        <Text style={styles.muted}>No payments yet</Text>
      )}

      {canPayRent ? (
        <FormCard title="Pay rent" subtitle="Choose Paymongo or record payment manually">
          <View style={showPaymongo ? undefined : styles.hidden}>
            <PaymongoPaymentForm disabled={paying} onSubmit={onPaymongoCheckout} />
          </View>
          <View style={styles.formActions}>
            <CustomButton
              variant="primary"
              label={showPaymongo ? 'Hide Paymongo options' : 'Pay with Paymongo'}
              onPress={() => setShowPaymongo(v => !v)}
              disabled={paying}
            />
            <CustomTextInput
              label="Manual payment notes (optional)"
              labelVariant="form"
              icon="📝"
              value={notes}
              onChangeText={setNotes}
              placeholder="Reference for GCash/bank transfer"
              multiline
            />
            <CustomButton
              variant="outline"
              label="Record manual payment"
              onPress={onManualPay}
              disabled={paying}
            />
          </View>
        </FormCard>
      ) : null}
    </ScrollView>
  );
}

const ApplicationDetailScreen = ({ route }: Props) => {
  const { id } = route.params;
  const token = useSelector((s: RootState) => s.auth.token);
  const user = useSelector((s: RootState) => s.auth.user);
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [notes, setNotes] = useState('');
  const [showPaymongo, setShowPaymongo] = useState(false);

  const load = useCallback(async () => {
    if (!token || token === 'demo') {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setApp(await fetchApplication(token, id));
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  useFocusEffect(
    useCallback(() => {
      runSafe(load());
    }, [load]),
  );

  const onManualPay = useCallback(async () => {
    if (!token || token === 'demo') {
      return;
    }
    setPaying(true);
    try {
      await submitPayment(token, id, {
        paymentMethod: 'gcash',
        notes: notes.trim() || undefined,
      });
      Alert.alert('Submitted', 'Payment recorded — landlord can confirm on the website.');
      await load();
    } catch (e) {
      Alert.alert('Payment failed', e instanceof Error ? e.message : 'Error');
    } finally {
      setPaying(false);
    }
  }, [token, id, notes, load]);

  const onPaymongoCheckout = useCallback(
    async (details: PaymongoCheckoutBody) => {
      if (!token || token === 'demo') {
        return;
      }
      setPaying(true);
      try {
        const result = await createPaymongoCheckout(token, id, details);
        const opened = await Linking.openURL(result.checkoutUrl);
        const channel = result.channelLabel ?? details.paymentChannel;
        const hint = result.mock
          ? `${channel}: training checkout — confirm payment in the browser, then refresh here.`
          : `${channel}: complete payment in the browser, then refresh here.`;
        if (!opened) {
          Alert.alert('Paymongo', `${hint}\n\n${result.checkoutUrl}`);
        } else {
          Alert.alert('Paymongo', hint);
        }
        setShowPaymongo(false);
        await load();
      } catch (e) {
        Alert.alert('Paymongo', e instanceof Error ? e.message : 'Could not start checkout');
      } finally {
        setPaying(false);
      }
    },
    [token, id, load],
  );

  const showSpinner = loading || !app;

  return (
    <View style={styles.root}>
      {showSpinner ? (
        <View style={styles.centered}>
          <ActivityIndicator color={COLORS.primary} />
        </View>
      ) : (
        <ApplicationDetailContent
          app={app}
          user={user}
          notes={notes}
          setNotes={setNotes}
          showPaymongo={showPaymongo}
          setShowPaymongo={setShowPaymongo}
          paying={paying}
          onManualPay={onManualPay}
          onPaymongoCheckout={onPaymongoCheckout}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { ...FONT.headline, color: COLORS.text },
  status: { ...FONT.bodyStrong, color: COLORS.primary, marginVertical: SPACING.sm },
  body: { ...FONT.body, color: COLORS.textSecondary, marginBottom: SPACING.xs },
  section: { ...FONT.bodyStrong, color: COLORS.text, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  card: {
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  muted: { ...FONT.caption, color: COLORS.textMuted },
  formActions: { marginTop: SPACING.sm, gap: SPACING.sm },
  hidden: {
    height: 0,
    overflow: 'hidden',
    opacity: 0,
  },
});

export default ApplicationDetailScreen;
