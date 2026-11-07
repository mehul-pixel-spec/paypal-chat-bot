import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { getDb, saveDb, resetDb } from './src/db.js';
import { handleChatMessage } from './src/agent.js';
import { executeTool } from './src/tools.js';
import { createPayPalOrder, triggerDemoFailedDeductedPayment, handlePayPalWebhook } from './src/paypal.js';
import { getDashboardMetrics, approveRecommendedArticle } from './src/dashboard.js';
import { redactPII } from './src/guardrails.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 1. Health check & Config
app.get('/api/config', (req, res) => {
  res.json({
    app: "PayPal Assist (ResolveAI)",
    version: "1.0.0",
    mode: process.env.ANTHROPIC_API_KEY ? "Anthropic Claude Live" : "PayPal Built-in ResolveAI Engine",
    paypalSandboxActive: !!process.env.PAYPAL_CLIENT_ID,
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

// 5. PayPal Sandbox Orders
app.post('/api/paypal/create-order', async (req, res) => {
  const { amount, currency } = req.body;
  const result = await createPayPalOrder({ amount, currency });
  res.json(result);
});

// 6. PayPal Webhook endpoint
app.post('/api/paypal/webhook', (req, res) => {
  const result = handlePayPalWebhook(req.body);
  res.json(result);
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

// Only listen when executed directly (not in serverless export)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 PayPal Assist running on http://localhost:${PORT}`);
  });
}

export default app;
