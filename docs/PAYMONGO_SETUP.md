# Paymongo payments (CasaClick)

Mobile and website use the same Symfony API for Paymongo checkout links.

## Demo mode (no Paymongo account)

With `PAYMONGO_DEV_MOCK=1` and no secret key (default in `websitedev/.env`), the app opens a **local training checkout** in the browser — tap **Confirm payment**, then refresh the booking in the app.

1. `npm run sync:pc-ip` — updates mobile IP **and** `websitedev/.env.local` `DEFAULT_URI`
2. `npm run server` — Symfony on `0.0.0.0:8000`
3. `npm run android:reverse` (USB) or use `usb-lan` in `config.ts`
4. Approved booking → **Pay with Paymongo** → pick **online (GCash/Maya)** or **card**, enter required details → **Continue to checkout**

## Real Paymongo (GCash, card)

1. Create a [Paymongo](https://www.paymongo.com/) account and get a **Secret key** (`sk_test_...` for testing).
2. In `websitedev/.env.local`:

   ```
   PAYMONGO_SECRET_KEY=sk_test_your_key_here
   PAYMONGO_DEV_MOCK=0
   ```

3. `php bin/console cache:clear` (in `websitedev`)
4. Restart `npm run server`
5. **Pay with Paymongo** → choose channel + requirements → opens the real Paymongo hosted page.

## Webhook (optional, production)

Register webhook URL: `https://your-domain/api/paymongo/webhook`  
Event: `link.payment.paid` — marks payment **completed** automatically.

## Manual payment

If Paymongo is not configured, customers can still use **Record manual payment** (GCash, etc.) — landlord confirms on the website.
