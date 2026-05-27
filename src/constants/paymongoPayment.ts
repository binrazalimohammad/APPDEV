/** Paymongo checkout channel — must match websitedev PaymongoPaymentDetailsValidator. */
export type PaymongoPaymentChannel = 'gcash' | 'paymaya' | 'card';

export type PaymongoCategoryId = 'online' | 'card';

export type PaymongoFieldKey = 'payerName' | 'payerContact' | 'payerEmail' | 'referenceNote';

export type PaymongoRequirementField = {
  key: PaymongoFieldKey;
  label: string;
  required: boolean;
  type: 'text' | 'phone' | 'email';
  placeholder?: string;
};

export type PaymongoChannelOption = {
  id: PaymongoPaymentChannel;
  label: string;
  requirements: PaymongoRequirementField[];
};

export type PaymongoCategoryOption = {
  id: PaymongoCategoryId;
  label: string;
  description: string;
  channels: PaymongoChannelOption[];
};

/** Fallback when options API is unreachable. */
export const PAYMONGO_PAYMENT_OPTIONS: PaymongoCategoryOption[] = [
  {
    id: 'online',
    label: 'Online payment',
    description: 'Pay with GCash or Maya e-wallet',
    channels: [
      {
        id: 'gcash',
        label: 'GCash',
        requirements: [
          { key: 'payerName', label: 'Full name (GCash account)', required: true, type: 'text' },
          {
            key: 'payerContact',
            label: 'GCash mobile number',
            required: true,
            type: 'phone',
            placeholder: '09XX XXX XXXX',
          },
          {
            key: 'referenceNote',
            label: 'Reference note (optional)',
            required: false,
            type: 'text',
          },
        ],
      },
      {
        id: 'paymaya',
        label: 'Maya / PayMaya',
        requirements: [
          { key: 'payerName', label: 'Full name (Maya account)', required: true, type: 'text' },
          {
            key: 'payerContact',
            label: 'Maya mobile number',
            required: true,
            type: 'phone',
            placeholder: '09XX XXX XXXX',
          },
          {
            key: 'referenceNote',
            label: 'Reference note (optional)',
            required: false,
            type: 'text',
          },
        ],
      },
    ],
  },
  {
    id: 'card',
    label: 'Credit / debit card',
    description: 'Visa, Mastercard via Paymongo secure checkout',
    channels: [
      {
        id: 'card',
        label: 'Card',
        requirements: [
          { key: 'payerName', label: 'Name on card', required: true, type: 'text' },
          { key: 'payerEmail', label: 'Billing email', required: true, type: 'email' },
          {
            key: 'referenceNote',
            label: 'Billing note (optional)',
            required: false,
            type: 'text',
          },
        ],
      },
    ],
  },
];

export const paymentMethodLabel = (method?: string): string => {
  switch (method) {
    case 'paymongo_gcash':
      return 'Paymongo · GCash';
    case 'paymongo_paymaya':
      return 'Paymongo · Maya';
    case 'paymongo_card':
      return 'Paymongo · Card';
    case 'paymongo':
      return 'Paymongo';
    case 'gcash':
      return 'GCash';
    case 'paymaya':
      return 'Maya';
    case 'credit_card':
      return 'Card';
    default:
      return method ?? 'Payment';
  }
};

const PH_MOBILE = /^(?:63|0)?9\d{9}$/;

export function normalizePhilippineMobile(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.startsWith('63') && digits.length === 12) {
    return `0${digits.slice(2)}`;
  }
  if (digits.startsWith('9') && digits.length === 10) {
    return `0${digits}`;
  }
  return digits;
}

export function isValidPhilippineMobile(value: string): boolean {
  return PH_MOBILE.test(normalizePhilippineMobile(value));
}

export function validatePaymongoForm(
  channel: PaymongoPaymentChannel | null,
  values: Record<PaymongoFieldKey, string>,
  requirements: PaymongoRequirementField[],
): string | null {
  if (!channel) {
    return 'Select how you will pay: online (GCash or Maya) or card.';
  }
  for (const field of requirements) {
    const v = values[field.key]?.trim() ?? '';
    if (field.required && !v) {
      return `${field.label} is required.`;
    }
    if (field.key === 'payerContact' && v && !isValidPhilippineMobile(v)) {
      return 'Enter a valid Philippine mobile number (09XXXXXXXXX).';
    }
    if (field.key === 'payerEmail' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      return 'Enter a valid billing email.';
    }
  }
  return null;
}
