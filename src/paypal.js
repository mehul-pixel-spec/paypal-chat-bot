import { getDb, saveDb } from './db.js';

const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

/**
 * Obtains OAuth2 token from PayPal Sandbox
 */
export async function getPayPalAccessToken() {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    return null;
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  try {
    const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    if (!res.ok) {
      console.warn(`PayPal OAuth failed: ${res.status}`);
      return null;
    }
    const data = await res.json();
    return data.access_token;
  } catch (err) {
    console.warn(`PayPal connection unavailable: ${err.message}`);
    return null;
  }
}

/**
 * Creates an order in PayPal Sandbox
 */
export async function createPayPalOrder({ amount = "45.00", currency = "USD" }) {
  const token = await getPayPalAccessToken();

  if (token) {
    try {
      const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{
            amount: {
              currency_code: currency,
              value: amount
            },
            description: "PayPal Assist Demo Order"
          }]
        })
      });

      if (res.ok) {
        const order = await res.json();
        return {
          mode: 'sandbox',
          orderId: order.id,
          status: order.status,
          links: order.links
        };
      }
    } catch (e) {
      console.warn("Error calling sandbox createOrder:", e.message);
    }
  }

  // Realistic mock order fallback
  const mockId = `SANDBOX-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
  return {
    mode: 'mock_sandbox',
    orderId: mockId,
    status: 'CREATED',
    links: [
      { href: `https://www.sandbox.paypal.com/checkoutnow?token=${mockId}`, rel: "approve", method: "GET" }
    ],
    note: "Running in PayPal Developer Sandbox Mode"
  };
}

/**
 * Creates a Demo Payment deliberately set to a 'failed-but-deducted' state
 * so the user can easily test the #1 hackathon challenge scenario in one click.
 */
export function triggerDemoFailedDeductedPayment(userId = 'usr_sarah_99') {
  const db = getDb();
  const txnId = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;

  const newTxn = {
    id: txnId,
    userId,
    recipient: 'Apex Digital Gear Corp.',
    amount: 189.99,
    currency: 'USD',
    status: 'FAILED_DEDUCTED',
    type: 'MERCHANT_CHECKOUT',
    paymentMethod: 'Visa Debit Card (...7712)',
    date: new Date().toISOString(),
    paypalFee: 0.00,
    merchantId: 'MCH-APEX-49',
    statusReason: 'Gateway timeout during capture callback after pre-auth bank reserve was placed.',
    holdReleasedEstimated: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    actionableAdvice: 'This was an authorization hold. The merchant did not capture the funds. Your bank will release the held funds automatically within 3 to 5 business days.'
  };

  // Add to top of transactions
  db.transactions.unshift(newTxn);
  saveDb(db);

  return {
    success: true,
    transaction: newTxn,
    message: `Created simulated transaction ${txnId} with status FAILED_DEDUCTED. You can now ask PayPal Assist: "Why was my payment ${txnId} deducted if it failed?"`
  };
}

/**
 * Handle incoming PayPal webhook events
 */
export function handlePayPalWebhook(event) {
  const eventType = event.event_type || 'PAYMENT.CAPTURE.DENIED';
  console.log(`[PayPal Webhook Received] Type: ${eventType}, ID: ${event.id}`);

  return {
    received: true,
    eventType,
    timestamp: new Date().toISOString()
  };
}
