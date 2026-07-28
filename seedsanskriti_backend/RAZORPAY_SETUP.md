# Razorpay Integration — Setup Notes

This adds real Razorpay Checkout to the existing payment flow, **without changing any
existing endpoint's behavior**. Everything below is additive.

## 1. Environment variables

Set these before starting the backend (never commit real values):

```
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

They're read in `application.properties`:

```properties
razorpay.key.id=${RAZORPAY_KEY_ID:}
razorpay.key.secret=${RAZORPAY_KEY_SECRET:}
```

If they're left unset, the app still boots and every existing feature keeps working —
the `RazorpayClient` bean (`config/RazorpayConfig.java`) is `@Lazy`, so it's only
constructed the first time a Razorpay endpoint is actually called.

## 2. What changed

- **`pom.xml`** — added `com.razorpay:razorpay-java` (1.4.5).
- **`entity/Payment.java`** — added two nullable columns: `razorpayOrderId`,
  `razorpaySignature`. Auto-migrated by `spring.jpa.hibernate.ddl-auto=update`; existing
  rows are unaffected (both are `NULL` for old/COD payments).
- **New DTOs**: `RazorpayOrderRequest`, `RazorpayOrderResponse`, `RazorpayVerifyRequest`.
  `PaymentResponse` gained one additive nullable field: `razorpayOrderId`.
- **`PaymentService` / `PaymentServiceImpl`** — two new methods, `createRazorpayOrder`
  and `verifyRazorpayPayment`. The existing `pay()` method's logic (order confirmation +
  delivery creation) was extracted into a shared private `finalizePayment(...)` helper so
  both flows behave identically after a successful payment — `pay()` itself still returns
  the exact same response shape and transaction ID format as before.
- **`PaymentController`** — two new endpoints, existing ones untouched:
  - `POST /api/payments/razorpay/create-order` — body `{ orderId }` → creates a Razorpay
    order server-side (amount taken from the order itself, not from the client) and returns
    `{ orderId, razorpayOrderId, amount, currency, keyId }` for the frontend to open Checkout.
  - `POST /api/payments/razorpay/verify` — body `{ orderId, razorpayOrderId,
    razorpayPaymentId, razorpaySignature }` → verifies the HMAC signature server-side with
    the key secret before ever touching the database. Only on a valid signature does it
    confirm the order and create the delivery record (same as the existing `/pay` flow).

The pre-existing `POST /api/payments/pay` endpoint is untouched and still works exactly as
before — it remains the path used for Cash on Delivery.

## 3. Frontend

`VITE_RAZORPAY_KEY` in the frontend's `.env` only needs to hold the **public** key id — the
secret never goes anywhere near the browser. See the frontend's own notes for the Checkout
flow.
