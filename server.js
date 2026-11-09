import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables before any module configuration
dotenv.config();

import { getDb, saveDb, resetDb } from './src/db.js';
import { handleChatMessage } from './src/agent.js';
import { executeTool } from './src/tools.js';
import { 
  createOrder, 
  captureOrder, 
  getOrder,
  refundCapture,
  getTransactionStatus,
  handlePayPalWebhook, 
  triggerDemoFailedDeductedPayment,
  validatePayPalConfig,
  CLIENT_ID,
  PAYPAL_ENV
} from './src/paypal.js';
import { getDashboardMetrics, approveRecommendedArticle } from './src/dashboard.js';
import { redactPII } from './src/guardrails.js';

// Startup check for PayPal credentials
validatePayPalConfig({ strict: false });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
// Serve static assets from both public and root
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// 1. Health check & Public Config (Exposes ONLY safe Client ID, NEVER Secret)
app.get('/api/config', (req, res) => {
  res.json({
    app: "PayPal Assist (ResolveAI)",
    version: "1.0.0",
    mode: process.env.ANTHROPIC_API_KEY ? "Anthropic Claude Live" : "PayPal Built-in ResolveAI Engine",
    paypal: {
      env: PAYPAL_ENV,
      clientId: CLIENT_ID ? CLIENT_ID : null, // Safe for browser PayPal SDK
      isConfigured: !!CLIENT_ID
    },
    userContext: {
      id: "usr_sarah_99",
      name: "Sarah Miller",
      email: "sarah.m@example.com"
    }
  });
});

// 2. Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [], context = {} } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: "Message string required" });
    }

    const response = await handleChatMessage({ message, history, context });

    // Redact & log conversation for dashboard metrics
    const db = getDb();
    const isEscalated = !!response.escalation;
    const durationMins = Number((1.5 + Math.random() * 2.5).toFixed(1));

    const loggedConv = {
      id: `CONV-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: new Date().toISOString(),
      userSnippet: redactPII(message.slice(0, 100)),
      status: isEscalated ? 'ESCALATED' : 'RESOLVED',
      category: response.escalation ? (response.escalation.priority === 'CRITICAL' ? 'unauthorized_fraud' : 'general_features') : 'failed_deducted',
      sentiment: response.sentiment || (isEscalated ? 'negative' : 'positive'),
      durationMinutes: durationMins,
      escalationCaseId: response.escalation ? response.escalation.caseId : null
    };

    db.conversations.unshift(loggedConv);
    if (db.conversations.length > 250) {
      db.conversations = db.conversations.slice(0, 250);
    }
    saveDb(db);

    res.json(response);
  } catch (err) {
    console.error("Chat API error:", err);
    res.status(500).json({ error: "Failed to generate support response" });
  }
});

// 3. Direct Tool Invocation Endpoint
app.post('/api/tools/execute', async (req, res) => {
  try {
    const { name, args, context } = req.body;
    const result = await executeTool(name, args, context);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Trigger Demo Failed-Deducted Payment
app.post('/api/demo/trigger-failed-payment', (req, res) => {
  const result = triggerDemoFailedDeductedPayment(req.body.userId || 'usr_sarah_99');
  res.json(result);
});

// -------------------------------------------------------------
// PayPal REST API Routes (Orders v2, Payments v2, Webhooks)
// -------------------------------------------------------------

// 5a. POST /api/paypal/create-order
app.post('/api/paypal/create-order', async (req, res) => {
  try {
    // Validate & compute amount on server; never trust arbitrary untrusted numbers
    const validAmount = req.body.amount ? String(parseFloat(req.body.amount) || "45.00") : "45.00";
    const validCurrency = (req.body.currency || 'USD').toUpperCase().slice(0, 3);

    const result = await createOrder(validAmount, validCurrency);
    res.json(result);
  } catch (err) {
    console.error("Error creating PayPal order:", err.message);
    res.status(err.status || 500).json({ 
      error: "Failed to create order with PayPal",
      message: err.message,
      debugId: err.debugId || null
    });
  }
});

// 5b. POST /api/paypal/capture-order
app.post('/api/paypal/capture-order', async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId || typeof orderId !== 'string') {
      return res.status(400).json({ error: "orderId is required" });
    }

    const result = await captureOrder(orderId.trim());
    res.json(result);
  } catch (err) {
    console.error(`Error capturing PayPal order:`, err.message);
    res.status(err.status || 500).json({
      error: "Failed to capture payment with PayPal",
      message: err.message,
      debugId: err.debugId || null
    });
  }
});

// 5c. GET /api/paypal/order/:orderId
app.get('/api/paypal/order/:orderId', async (req, res) => {
  try {
    const result = await getOrder(req.params.orderId);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// 5d. POST /api/paypal/refund-capture
app.post('/api/paypal/refund-capture', async (req, res) => {
  try {
    const { captureId, amount, currency } = req.body;
    if (!captureId) {
      return res.status(400).json({ error: "captureId is required" });
    }
    const result = await refundCapture(captureId, amount, currency);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message, debugId: err.debugId });
  }
});

// 5e. GET /api/paypal/transaction-status/:id
app.get('/api/paypal/transaction-status/:id', async (req, res) => {
  try {
    const result = await getTransactionStatus(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. POST /api/paypal/webhook (Signature Verified & Idempotent)
app.post('/api/paypal/webhook', async (req, res) => {
  try {
    const result = await handlePayPalWebhook(req.headers, req.body);
    res.status(200).json(result);
  } catch (err) {
    console.error("Webhook processing error:", err.message);
    res.status(400).json({ error: "Webhook verification or processing failed", message: err.message });
  }
});

// 7. Schedule Callback
app.post('/api/callback/schedule', async (req, res) => {
  const { caseId, slot, phoneNumber } = req.body;
  const result = await executeTool('schedule_callback', { caseId, slot, phoneNumber });
  res.json(result);
});

// 8. Insights Dashboard API
app.get('/api/dashboard/metrics', (req, res) => {
  const metrics = getDashboardMetrics();
  res.json(metrics);
});

// 9. Approve recommended help article
app.post('/api/dashboard/approve-article', (req, res) => {
  const { patternId } = req.body;
  const result = approveRecommendedArticle(patternId);
  res.json(result);
});

// 10. Reset DB
app.post('/api/db/reset', (req, res) => {
  resetDb();
  res.json({ success: true, message: "Database reset to initial state" });
});

// Fallback route for SPA static index (Express 5 compatible wildcard)
app.get('{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start local server
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 PayPal Assist running on http://localhost:${PORT}`);
    console.log(`PayPal Environment: ${PAYPAL_ENV.toUpperCase()} (${CLIENT_ID ? 'Configured' : 'Sandbox Mock Fallback'})`);
    console.log(`=======================================================`);
  });
}

export default app;
