import type { PaymongoPaymentChannel } from '../../constants/paymongoPayment';
import { API_ORIGIN, MOBILE_API_BASE_URL } from './config';
import { apiFetch } from './client';
import type { ApiEnvelope } from './types';

export type PaymongoCheckoutResult = {
  paymentId: number | string;
  checkoutUrl: string;
  amount: string;
  /** True when server uses local demo checkout (no Paymongo account). */
  mock?: boolean;
  paymentChannel?: PaymongoPaymentChannel;
  channelLabel?: string;
};

export type PaymongoCheckoutBody = {
  paymentChannel: PaymongoPaymentChannel;
  payerName: string;
  payerContact?: string;
  payerEmail?: string;
  referenceNote?: string;
};

/** POST /api/mobile/applications/:id/payments/paymongo */
export async function createPaymongoCheckout(
  token: string,
  applicationId: number,
  details: PaymongoCheckoutBody,
): Promise<PaymongoCheckoutResult> {
  const envelope = await apiFetch<ApiEnvelope<PaymongoCheckoutResult>>(
    `/applications/${applicationId}/payments/paymongo`,
    {
      method: 'POST',
      token,
      baseUrl: MOBILE_API_BASE_URL,
      body: { ...details, appOrigin: API_ORIGIN },
    },
  );
  const data = envelope.data;
  if (!data?.checkoutUrl) {
    throw new Error('Paymongo checkout URL missing from server');
  }
  return data;
}
