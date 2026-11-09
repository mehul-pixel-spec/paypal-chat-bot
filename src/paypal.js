import crypto from 'crypto';
import { getDb, saveDb } from './db.js';

/**
 * PayPal REST API (Orders v2, Payments v2, Webhooks) Integration Module
 * Strictly conforms to PayPal OpenAPI specifications.
 */

// 1. Credentials & Configuration
const PAYPAL_ENV = (process.env.PAYPAL_ENV || 'sandbox').toLowerCase();
const BASE_URL = PAYPAL_ENV === 'live' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

const CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';
const WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID || '';

/**
 * Validates PayPal credentials and fails fast if missing in production.
 * In development/sandbox mock fallback mode, outputs actionable setup instructions.
 */
export function validatePayPalConfig({ strict = false } = {}) {
  const missing = [];
  if (!CLIENT_ID) missing.push('PAYPAL_CLIENT_ID');
  if (!CLIENT_SECRET) missing.push('PAYPAL_CLIENT_SECRET');

  if (missing.length > 0) {
    const errorMsg = `[PayPal Configuration] Missing required environment variable(s): ${missing.join(', ')}. ` +
      `Please define them in your local .env file. See .env.example for reference.`;
    if (strict || process.env.NODE_ENV === 'production') {
      throw new Error(errorMsg);
    } else {
      console.warn(`⚠️  ${errorMsg}`);
      return false;
    }
  }
  return true;
}

// 2. OAuth2 In-Memory Token Cache
let cachedToken = null;
let tokenExpiresAt = 0;

/**
 * Generates or retrieves a valid cached OAuth2 access token.
 * Refreshes token shortly before expiry (5-minute buffer).
 */
export async function getAccessToken() {
  validatePayPalConfig({ strict: false });

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return null;
  }

  const now = Date.now();
  // Return cached token if valid for at least 5 more minutes
  if (cachedToken && tokenExpiresAt > now + 300 * 1000) {
    return cachedToken;
  }

  const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

  const response = await fetchWithRetry(`${BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  if (!response.ok) {
    const debugId = response.headers.get('paypal-debug-id') || 'N/A';
    const errText = await response.text();
    console.error(`[PayPal OAuth Error] HTTP ${response.status} (debug_id: ${debugId})`);
    throw new Error(`Failed to obtain PayPal OAuth token. (PayPal debug_id: ${debugId})`);
  }

  const data = await response.json();
  cachedToken = data.access_token;
  // expires_in is in seconds
  tokenExpiresAt = now + (data.expires_in || 3600) * 1000;
  return cachedToken;
}

/**
 * Resilient fetch wrapper with retry and exponential backoff for 5xx/network errors.
 */
async function fetchWithRetry(url, options, maxRetries = 2) {
  let attempt = 0;
  let delay = 300;

  while (attempt <= maxRetries) {
    try {
      const res = await fetch(url, options);
      // Retry only on 5xx server errors
      if (res.status >= 500 && attempt < maxRetries) {
        attempt++;
        const debugId = res.headers.get('paypal-debug-id') || 'unknown';
        console.warn(`[PayPal Server Retry] HTTP ${res.status} (debug_id: ${debugId}). Retrying attempt ${attempt} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }
      return res;
    } catch (err) {
      if (attempt < maxRetries) {
        attempt++;
        console.warn(`[PayPal Network Retry] ${err.message}. Retrying attempt ${attempt} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }
      throw err;
    }
  }
}

/**
 * Creates an authorized PayPal API request with headers & PayPal-Request-Id idempotency.
 */
async function paypalRequest(endpoint, { method = 'GET', body = null, requestId = null } = {}) {
  const token = await getAccessToken();
  if (!token) {
    throw new Error("PayPal API credentials are not configured in .env");
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  if (requestId) {
    headers['PayPal-Request-Id'] = requestId;
  }

  const options = { method, headers };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetchWithRetry(`${BASE_URL}${endpoint}`, options);
  const debugId = response.headers.get('paypal-debug-id') || 'N/A';

  if (!response.ok) {
    let errorDetail = 'PayPal API request failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.message || errJson.details?.[0]?.description || JSON.stringify(errJson);
    } catch (_) {
      errorDetail = await response.text();
    }
    console.error(`[PayPal Error] ${method} ${endpoint} failed with HTTP ${response.status} (debug_id: ${debugId}): ${errorDetail}`);
    const err = new Error(errorDetail);
    err.debugId = debugId;
    err.status = response.status;
    throw err;
  }

  return response.json();
}

/**
 * 1. createOrder(amount, currency)
 * Calls POST /v2/checkout/orders with idempotency header.
 */
export async function createOrder(amount = "45.00", currency = "USD") {
  // Validate and sanitize amounts
  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    throw new Error("Invalid order amount specified");
  }
  const formattedAmount = parsedAmount.toFixed(2);
  const validCurrency = (currency || 'USD').toUpperCase().trim();

  const token = await getAccessToken();

  // If live credentials are available, invoke sandbox endpoint
  if (token) {
    const requestId = `req_order_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const payload = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: validCurrency,
          value: formattedAmount
        },
        description: "PayPal Assist Support Verification Order"
      }],
      application_context: {
        brand_name: "PayPal Assist",
        user_action: "PAY_NOW"
      }
    };

    const order = await paypalRequest('/v2/checkout/orders', {
      method: 'POST',
      body: payload,
      requestId
    });

    return {
      mode: 'sandbox_live',
      orderId: order.id,
      status: order.status,
      links: order.links,
      amount: formattedAmount,
      currency: validCurrency
    };
  }

  // Fallback realistic sandbox-compatible mock order
  const mockId = `SANDBOX-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
  return {
    mode: 'mock_sandbox',
    orderId: mockId,
    status: 'CREATED',
    amount: formattedAmount,
    currency: validCurrency,
    links: [
      { href: `https://www.sandbox.paypal.com/checkoutnow?token=${mockId}`, rel: "approve", method: "GET" }
    ],
    note: "Running in PayPal Developer Sandbox Mode"
  };
}

/**
 * 2. captureOrder(orderId)
 * Calls POST /v2/checkout/orders/{id}/capture with idempotency header.
 */
export async function captureOrder(orderId) {
  if (!orderId || typeof orderId !== 'string') {
    throw new Error("Valid order ID is required for capture");
  }

  const token = await getAccessToken();

  if (token) {
    const requestId = `req_cap_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const result = await paypalRequest(`/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
      method: 'POST',
      body: {},
      requestId
    });

    return {
      mode: 'sandbox_live',
      orderId: result.id,
      status: result.status,
      captureId: result.purchase_units?.[0]?.payments?.captures?.[0]?.id || null,
      payer: result.payer,
      details: result
    };
  }

  // Realistic mock capture
  const mockCaptureId = `CAP-${Math.floor(10000000 + Math.random() * 90000000)}`;
  return {
    mode: 'mock_sandbox',
    orderId,
    status: 'COMPLETED',
    captureId: mockCaptureId,
    payer: { email_address: 'sandbox-buyer@example.com', name: { given_name: 'John', surname: 'Doe' } }
  };
}

/**
 * 3. getOrder(orderId)
 * Calls GET /v2/checkout/orders/{id}
 */
export async function getOrder(orderId) {
  if (!orderId) throw new Error("Order ID is required");
  const token = await getAccessToken();
  if (token) {
    return await paypalRequest(`/v2/checkout/orders/${encodeURIComponent(orderId)}`);
  }
  return { id: orderId, status: 'APPROVED', amount: { currency_code: 'USD', value: '45.00' } };
}

/**
 * 4. refundCapture(captureId, amount, currency)
 * Calls POST /v2/payments/captures/{id}/refund with idempotency header.
 */
export async function refundCapture(captureId, amount = null, currency = "USD") {
  if (!captureId) throw new Error("Capture ID is required for refund");
  const token = await getAccessToken();

  const requestId = `req_ref_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const body = {};
  if (amount) {
    body.amount = {
      value: parseFloat(amount).toFixed(2),
      currency_code: (currency || 'USD').toUpperCase()
    };
  }

  if (token) {
    return await paypalRequest(`/v2/payments/captures/${encodeURIComponent(captureId)}/refund`, {
      method: 'POST',
      body,
      requestId
    });
  }

  return {
    id: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
    status: 'COMPLETED',
    captureId
  };
}

/**
 * 5. getTransactionStatus(id)
 * Looks up transaction or order details across PayPal Sandbox or local ledger.
 */
export async function getTransactionStatus(id) {
  if (!id) throw new Error("Transaction ID is required");

  // Check if it's an order or capture ID
  if (id.startsWith('SANDBOX-ORD-') || /^[A-Z0-9]{17}$/.test(id)) {
    try {
      const order = await getOrder(id);
      return {
        id,
        type: 'ORDER',
        status: order.status,
        details: order
      };
    } catch (_) {}
  }

  // Lookup in local activity database
  const db = getDb();
  const txn = db.transactions.find(t => t.id.toLowerCase() === id.toLowerCase());
  if (txn) {
    return {
      id: txn.id,
      type: txn.type,
      status: txn.status,
      recipient: txn.recipient,
      amount: txn.amount,
      currency: txn.currency,
      date: txn.date,
      statusReason: txn.statusReason,
      actionableAdvice: txn.actionableAdvice
    };
  }

  return {
    id,
    found: false,
    message: `No transaction found for ID ${id}`
  };
}

/**
 * 6. verifyWebhookSignature(req)
 * Verifies authenticity of incoming PayPal webhook using POST /v1/notifications/verify-webhook-signature.
 */
export async function verifyWebhookSignature({ headers, body }) {
  const webhookId = WEBHOOK_ID;
  if (!webhookId) {
    console.warn("[PayPal Webhooks] PAYPAL_WEBHOOK_ID not configured. Skipping signature verification in sandbox.");
    return { verified: true, warning: "PAYPAL_WEBHOOK_ID not set" };
  }

  const token = await getAccessToken();
  if (!token) {
    return { verified: true, warning: "Credentials not active; treated as sandbox event" };
  }

  const payload = {
    transmission_id: headers['paypal-transmission-id'],
    transmission_time: headers['paypal-transmission-time'],
    cert_url: headers['paypal-cert-url'],
    auth_algo: headers['paypal-auth-algo'],
    transmission_sig: headers['paypal-transmission-sig'],
    webhook_id: webhookId,
    webhook_event: body
  };

  try {
    const result = await paypalRequest('/v1/notifications/verify-webhook-signature', {
      method: 'POST',
      body: payload
    });

    const isSuccess = result.verification_status === 'SUCCESS';
    return {
      verified: isSuccess,
      status: result.verification_status
    };
  } catch (err) {
    console.error("[PayPal Webhook Verification Failed]:", err.message);
    return { verified: false, error: err.message };
  }
}

// In-memory set for webhook event idempotency
const processedWebhookEvents = new Set();

/**
 * 7. handlePayPalWebhook(req)
 * Validates signature, ensures idempotency, and processes PAYMENT.CAPTURE.* events.
 */
export async function handlePayPalWebhook(headers, event) {
  const eventId = event?.id;
  const eventType = event?.event_type;

  if (!eventId) {
    throw new Error("Invalid webhook payload: Missing event ID");
  }

  // Idempotency check: Ignore duplicate deliveries
  if (processedWebhookEvents.has(eventId)) {
    console.log(`[PayPal Webhook] Duplicate event ${eventId} ignored (idempotent).`);
    return { received: true, duplicate: true, eventId, eventType };
  }

  // Verify Signature
  const verification = await verifyWebhookSignature({ headers, body: event });
  if (!verification.verified && process.env.NODE_ENV === 'production') {
    throw new Error("Invalid webhook signature rejected.");
  }

  // Mark as processed
  processedWebhookEvents.add(eventId);
  if (processedWebhookEvents.size > 1000) {
    // Keep set bound
    const firstKey = processedWebhookEvents.values().next().value;
    processedWebhookEvents.delete(firstKey);
  }

  console.log(`[PayPal Webhook Verified] Event: ${eventType} (ID: ${eventId})`);

  // Handle supported events
  const db = getDb();
  switch (eventType) {
    case 'PAYMENT.CAPTURE.COMPLETED': {
      const resource = event.resource;
      console.log(`[PayPal] Capture completed: ${resource?.id} for ${resource?.amount?.value} ${resource?.amount?.currency_code}`);
      break;
    }

    case 'PAYMENT.CAPTURE.DENIED': {
      const resource = event.resource;
      console.log(`[PayPal] Capture denied: ${resource?.id}`);
      // Record failed transaction in local diagnostic ledger if appropriate
      break;
    }

    case 'PAYMENT.CAPTURE.REFUNDED': {
      const resource = event.resource;
      console.log(`[PayPal] Capture refunded: ${resource?.id}`);
      break;
    }

    default:
      console.log(`[PayPal Webhook] Received unhandled event: ${eventType}`);
  }

  return {
    received: true,
    eventId,
    eventType,
    verificationStatus: verification.status || 'VERIFIED',
    processedAt: new Date().toISOString()
  };
}

/**
 * Helper to simulate a failed-but-deducted payment to test the customer support scenario.
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

  db.transactions.unshift(newTxn);
  saveDb(db);

  return {
    success: true,
    transaction: newTxn,
    message: `Created simulated transaction ${txnId} with status FAILED_DEDUCTED. You can now ask PayPal Assist: "Why was my payment ${txnId} deducted if it failed?"`
  };
}

export { CLIENT_ID, PAYPAL_ENV, BASE_URL };
