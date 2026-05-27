/**
 * Rent payments API (CasaClick payments + PayMongo checkout in paymongo.ts).
 */
export { fetchPayments, submitPayment } from './mobile';
export { createPaymongoCheckout } from './paymongo';

export type { Payment } from './types';
export type { PaymongoCheckoutResult } from './paymongo';
