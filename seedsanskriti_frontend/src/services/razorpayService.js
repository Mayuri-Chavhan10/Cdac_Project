const CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

let scriptPromise = null;

/**
 * Loads Razorpay's Checkout script exactly once, no matter how many times
 * this is called across the app.
 */
export function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true);

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = CHECKOUT_SRC;
      script.onload = () => resolve(true);
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error('Could not load Razorpay Checkout. Please check your connection and try again.'));
      };
      document.body.appendChild(script);
    });
  }

  return scriptPromise;
}

/**
 * Opens the Razorpay Checkout modal and resolves with the payment result on
 * success, or rejects if the user closes the modal / a client-side error
 * occurs. The actual charge is only ever confirmed server-side afterwards
 * via paymentService.verifyRazorpayPayment().
 *
 * @param {object} params
 * @param {string} params.keyId - public Razorpay key (from the backend response)
 * @param {number} params.amount - amount in paise
 * @param {string} params.currency
 * @param {string} params.razorpayOrderId
 * @param {string} [params.name] - shown in the checkout modal header
 * @param {string} [params.description]
 * @param {{name?: string, email?: string, contact?: string}} [params.prefill]
 */
export async function openRazorpayCheckout({
  keyId,
  amount,
  currency,
  razorpayOrderId,
  name = 'SeedSanskriti',
  description = 'Order Payment',
  prefill = {},
}) {
  await loadRazorpayScript();

  return new Promise((resolve, reject) => {
    const options = {
      key: keyId,
      amount,
      currency,
      name,
      description,
      order_id: razorpayOrderId,
      prefill,
      theme: { color: '#2f5233' },
      handler: (response) => {
        resolve({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss: () => reject(new Error('Payment was cancelled.')),
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.on('payment.failed', (response) => {
      reject(new Error(response?.error?.description || 'Payment failed. Please try again.'));
    });
    razorpay.open();
  });
}
