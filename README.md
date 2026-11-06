# PayPal Assist (ResolveAI)

> **Official Entry for the PayPal AI Hackathon: "Build What's Next with PayPal and AI"**  
> AI Customer Support Assistant for PayPal users and Support Team Insights Dashboard with automated recurring issue pattern detection and RAG knowledge base enrichment.

---

## 🌟 Executive Summary & Problem Solved
Millions of users encounter stressful payment moments every day:
1. **"Failed but Deducted"**: Checkout failed at a merchant, but the bank balance dropped due to an authorization hold.
2. **Pending & Held Transfers**: Unfamiliarity with 21-day seller holds, eCheck clearing times, or cross-border fraud reviews.
3. **Cross-Border Complexities**: Confusion over wholesale FX spreads and Indian RBI Purpose Codes (P0802).
4. **Disputes vs Chargebacks**: Unclear timelines and evidence requirements.
5. **Unauthorized Takeovers**: High stress requiring immediate account lockdown and rapid human escalation.

**PayPal Assist** solves this by:
- Operating as an **AI assistant that never claims to be human**, providing calm, transparent answers with **"Why I think this"** root-cause diagnostics.
- Directly integrating with the **PayPal Developer Sandbox** and transaction ledger tools.
- Enforcing strict **PII redaction and prompt-injection guardrails**.
- Offering **seamless human escalation** with an auto-generated handoff summary and telephone callback scheduler so users never repeat their story.
- Providing an **Executive Support Insights Dashboard** that clusters support patterns across 200+ conversations, identifies root causes, and recommends product fixes and RAG help articles for one-click approval.

---

## 🏗️ Architecture & Core Components

```
┌────────────────────────────────────────────────────────┐
│               Frontend (Fintech UI / UX)               │
│   • Transaction cards with status timelines            │
│   • "Why I think this" diagnostic panels               │
│   • Handoff summary & phone callback booking           │
│   • Support Team Insights & Pattern Analysis           │
└──────────────────────────┬─────────────────────────────┘
                           │ REST / SSE
┌──────────────────────────▼─────────────────────────────┐
│                 Node.js / Express Server               │
│   • Guardrails: PII Redaction, Sensitive Masking,      │
│     Prompt Injection Defense, Sentiment Analysis       │
│   • Model Provider: Anthropic Claude (configurable)    │
│     or Autonomous Fallback Reasoning Engine            │
└──────┬───────────────────┬───────────────────┬─────────┘
       │                   │                   │
┌──────▼──────┐     ┌──────▼──────┐     ┌──────▼──────┐
│  RAG Engine │     │ Tool Engine │     │   PayPal    │
│  25+ Help   │     │  Ledger &   │     │  Developer  │
│  Articles & │     │   Dispute   │     │   Sandbox   │
│  Auto-KB    │     │   Lookup    │     │   REST API  │
└─────────────┘     └─────────────┘     └─────────────┘
```

---

## 🚀 Quickstart & Setup Guide

### 1. Requirements
- Node.js (v18+)
- npm or pnpm

### 2. Installation
```bash
cd "C:\Users\goyal\.gemini\antigravity\scratch\paypal-assist"
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```env
PORT=3000

# Optional: To use live Claude function calling (defaults to built-in autonomous engine if omitted)
ANTHROPIC_API_KEY=your_key_here
CLAUDE_MODEL=claude-3-7-sonnet-20250219

# Optional: PayPal Developer Sandbox Credentials
PAYPAL_API_BASE=https://api-m.sandbox.paypal.com
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
```

### 4. Seed Data
Pre-load 200 synthetic conversations into the dashboard:
```bash
npm run seed
```

### 5. Run the Application
```bash
npm start
```
Open **`http://localhost:3000`** in your browser.

---

## 🧪 Automated Evaluation Benchmark (20 Test Cases)
Run our comprehensive test suite verifying diagnoses, guardrails, and multilingual support:
```bash
npm run eval
```
The test suite achieves **100% pass rate** across:
1. `failed_deducted` diagnosis and timeline verification
2. Pre-auth hold explanation without transaction ID
3. AI identity and non-human declaration
4. Multilingual Hindi / Hinglish translation
5. Held cross-border compliance reviews
6. eCheck clearing intervals
7. Wholesale FX spreads and cross-border fee logic
8. Indian RBI Purpose Code (P0802) guidance
9. Resolution Center dispute deadline tracking
10. PayPal dispute vs bank chargeback contrast
11. Debit card refund return pathways
12. Critical fraud escalation with handoff
13. Account takeover emergency security checklist
14. Account limitation KYC removal procedures
15. 4-digit card confirmation micro-charge guide
16. Direct human escalation callback triggers
17. Customer anger and dissatisfaction detection
18. PII masking (passwords, card numbers, OTPs)
19. Prompt injection defense and persona isolation
20. Out-of-scope inquiry handling

---

## 🎬 3-Minute Demo Script

| Timestamp | Screen | Action / Dialogue | Key Feature Highlighted |
| :--- | :--- | :--- | :--- |
| **0:00 - 0:45** | Chat View | Click the **"Trigger Demo Failed Payment"** top button. Then click the generated chip or ask: *"Why did transaction TXN-88291034 fail but money was deducted?"* | • Real-time sandbox card lookup.<br>• Visual payment status timeline (Pre-Auth vs Merchant Timeout).<br>• **"Why I think this"** explains temporary bank authorization holds with zero jargon. |
| **0:45 - 1:30** | Chat View | Type: *"This is terrible! I want to speak to a real person right now, I am furious!"* | • Escalation rule triggers automatically.<br>• Generates **Case CAS-XXXX** with structured problem summary.<br>• Interactive time slot picker for telephone callback without repeating context. |
| **1:30 - 2:30** | Dashboard View | Click **"Support Insights & Patterns"** in the sidebar. Review metrics (204 conversations, 88.2% resolution rate). | • Automatic topic clustering.<br>• Plain-language summary: *"34% of tickets are deducted-but-failed authorizations."*<br>• Identifies root cause and recommended product fix. |
| **2:30 - 3:00** | Dashboard View | Click **"Approve Article to RAG"** on the proposed knowledge base fix. | • Dynamic knowledge base ingestion into the active RAG engine in real time. |
