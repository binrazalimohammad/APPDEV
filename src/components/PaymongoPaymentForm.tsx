import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  PAYMONGO_PAYMENT_OPTIONS,
  type PaymongoCategoryId,
  type PaymongoCategoryOption,
  type PaymongoFieldKey,
  type PaymongoPaymentChannel,
  validatePaymongoForm,
} from '../constants/paymongoPayment';
import CustomTextInput from './CustomTextInput';
import { COLORS, FONT, RADIUS, SPACING } from '../utils';

type Props = {
  categories?: PaymongoCategoryOption[];
  disabled?: boolean;
  onSubmit: (payload: {
    paymentChannel: PaymongoPaymentChannel;
    payerName: string;
    payerContact?: string;
    payerEmail?: string;
    referenceNote?: string;
  }) => void;
};

const INITIAL_FIELDS: Record<PaymongoFieldKey, string> = {
  payerName: '',
  payerContact: '',
  payerEmail: '',
  referenceNote: '',
};

const PaymongoPaymentForm = ({
  categories = PAYMONGO_PAYMENT_OPTIONS,
  disabled,
  onSubmit,
}: Props) => {
  const [categoryId, setCategoryId] = useState<PaymongoCategoryId | null>(null);
  const [channel, setChannel] = useState<PaymongoPaymentChannel | null>(null);
  const [fields, setFields] = useState(INITIAL_FIELDS);
  const [error, setError] = useState<string | null>(null);

  const category = useMemo(
    () => categories.find(c => c.id === categoryId) ?? null,
    [categories, categoryId],
  );

  const channelDef = useMemo(
    () => category?.channels.find(c => c.id === channel) ?? null,
    [category, channel],
  );

  const onSelectCategory = (id: PaymongoCategoryId) => {
    setCategoryId(id);
    setChannel(null);
    setFields({ ...INITIAL_FIELDS });
    setError(null);
    const cat = categories.find(c => c.id === id);
    if (cat?.channels.length === 1) {
      setChannel(cat.channels[0].id);
    }
  };

  const onSelectChannel = (id: PaymongoPaymentChannel) => {
    setChannel(id);
    setFields({ ...INITIAL_FIELDS });
    setError(null);
  };

  const setField = (key: PaymongoFieldKey, value: string) => {
    setFields(prev => ({ ...prev, [key]: value }));
    setError(null);
  };

  const handleContinue = () => {
    const requirements = channelDef?.requirements ?? [];
    const validationError = validatePaymongoForm(channel, fields, requirements);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!channel) {
      return;
    }
    onSubmit({
      paymentChannel: channel,
      payerName: fields.payerName.trim(),
      payerContact: fields.payerContact.trim() || undefined,
      payerEmail: fields.payerEmail.trim() || undefined,
      referenceNote: fields.referenceNote.trim() || undefined,
    });
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.step}>1. Payment type</Text>
      <View style={styles.row}>
        {categories.map(cat => (
          <Pressable
            key={cat.id}
            style={[styles.chip, categoryId === cat.id && styles.chipActive]}
            onPress={() => onSelectCategory(cat.id)}
            disabled={disabled}
          >
            <Text style={[styles.chipTitle, categoryId === cat.id && styles.chipTextActive]}>
              {cat.label}
            </Text>
            <Text style={[styles.chipSub, categoryId === cat.id && styles.chipSubActive]}>
              {cat.description}
            </Text>
          </Pressable>
        ))}
      </View>

      {category && category.channels.length > 1 ? (
        <>
          <Text style={styles.step}>2. Online provider</Text>
          <View style={styles.rowInline}>
            {category.channels.map(ch => (
              <Pressable
                key={ch.id}
                style={[styles.chipSmall, channel === ch.id && styles.chipActive]}
                onPress={() => onSelectChannel(ch.id)}
                disabled={disabled}
              >
                <Text style={[styles.chipSmallText, channel === ch.id && styles.chipTextActive]}>
                  {ch.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}

      {channelDef ? (
        <>
          <Text style={styles.step}>
            {category && category.channels.length > 1 ? '3' : '2'}. Required details
          </Text>
          {channelDef.requirements.map(req => (
            <CustomTextInput
              key={req.key}
              label={req.label + (req.required ? '' : ' (optional)')}
              labelVariant="form"
              value={fields[req.key]}
              onChangeText={v => setField(req.key, v)}
              placeholder={req.placeholder}
              keyboardType={
                req.type === 'phone'
                  ? 'phone-pad'
                  : req.type === 'email'
                    ? 'email-address'
                    : 'default'
              }
              autoCapitalize={req.type === 'email' ? 'none' : 'words'}
              editable={!disabled}
            />
          ))}
          <Text style={styles.hint}>
            {channel === 'card'
              ? 'You will enter card details on the secure Paymongo page next.'
              : 'Use the same name and mobile number registered on your e-wallet.'}
          </Text>
        </>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {channelDef ? (
        <Pressable
          style={[styles.submit, disabled && styles.submitDisabled]}
          onPress={handleContinue}
          disabled={disabled}
        >
          <Text style={styles.submitText}>Continue to Paymongo checkout</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: SPACING.sm },
  step: { ...FONT.bodyStrong, color: COLORS.text, marginTop: SPACING.xs },
  row: { gap: SPACING.sm },
  rowInline: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  chip: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  chipSmall: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  chipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryMuted,
  },
  chipTitle: { ...FONT.bodyStrong, color: COLORS.text },
  chipSub: { ...FONT.caption, color: COLORS.textMuted, marginTop: 4 },
  chipSubActive: { color: COLORS.textSecondary },
  chipSmallText: { ...FONT.body, color: COLORS.text },
  chipTextActive: { color: COLORS.primary },
  hint: { ...FONT.caption, color: COLORS.textMuted, marginTop: SPACING.xs },
  error: { ...FONT.caption, color: COLORS.error },
  submit: {
    marginTop: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  submitDisabled: { opacity: 0.5 },
  submitText: { ...FONT.bodyStrong, color: '#fff' },
});

export default PaymongoPaymentForm;
