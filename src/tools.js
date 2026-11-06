import { getDb, saveDb } from './db.js';
import { searchKnowledgeBase } from './knowledgeBase.js';

// FX conversion tables & fee logic
const FX_RATES = {
  USD_EUR: 0.92,
  EUR_USD: 1.087,
  USD_INR: 84.50,
  INR_USD: 0.0118,
  USD_GBP: 0.79,
  GBP_USD: 1.266,
  EUR_GBP: 0.86,
  GBP_EUR: 1.163
};

export const TOOL_DEFINITIONS = [
  {
    name: "get_transaction",
    description: "Look up full details, payment breakdown, status reasons, and timeline for a specific PayPal transaction ID (e.g. TXN-88291034).",
    parameters: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The transaction ID (e.g., TXN-88291034)."
        }
      },
      required: ["id"]
    }
  },
  {
    name: "list_recent_transactions",
    description: "Retrieve a list of recent transactions for a given user account to diagnose history, pending payments, or discrepancies.",
    parameters: {
      type: "object",
      properties: {
        userId: {
          type: "string",
          description: "The unique user account identifier, e.g. usr_sarah_99."
        },
        limit: {
          type: "number",
          description: "Maximum number of transactions to return (default 5)."
        }
      },
      required: ["userId"]
    }
  },
  {
    name: "check_fx_and_fees",
    description: "Calculate accurate currency conversion, PayPal FX spread (typically 3.5%-4%), cross-border fees, and net estimate.",
    parameters: {
      type: "object",
      properties: {
        amount: { type: "number", description: "The source amount to send or convert." },
        fromCurrency: { type: "string", description: "3-letter currency code, e.g. USD, EUR, INR, GBP." },
        toCurrency: { type: "string", description: "3-letter currency code, e.g. EUR, USD, INR, GBP." }
      },
      required: ["amount", "fromCurrency", "toCurrency"]
    }
  },
  {
    name: "get_dispute_status",
    description: "Check the active dispute status, reason, filed date, response deadline, and progress in the PayPal Resolution Center.",
    parameters: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The dispute reference ID (e.g., PP-D-883921) or transaction ID."
        }
      },
      required: ["id"]
    }
  },
  {
    name: "search_help_articles",
    description: "Search PayPal's official help knowledge base for policies, regulations, timelines, limits, and step-by-step procedures.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search phrase or topic keywords."
        }
      },
      required: ["query"]
    }
  },
  {
    name: "create_support_case",
    description: "Create an escalated human support case when the assistant cannot resolve the issue, customer is dissatisfied, or high fraud risk exists.",
    parameters: {
      type: "object",
      properties: {
        userId: { type: "string", description: "The user ID." },
        summary: { type: "string", description: "Concise handoff summary explaining the issue, diagnosis, steps already tried, and why escalated." },
        priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"], description: "Priority level based on urgency/risk." },
        category: { type: "string", description: "Issue category, e.g. failed_deducted, unauthorized_fraud, international_fx, disputes_refunds." }
      },
      required: ["userId", "summary", "priority"]
    }
  },
  {
    name: "schedule_callback",
    description: "Schedule a guaranteed telephone callback with a human PayPal senior support or fraud specialist.",
    parameters: {
      type: "object",
      properties: {
        caseId: { type: "string", description: "The support case reference ID (e.g. CAS-9102)." },
        slot: { type: "string", description: "The chosen time slot, e.g. 'Today at 3:00 PM EST' or 'Tomorrow at 10:30 AM EST'." },
        phoneNumber: { type: "string", description: "Contact phone number for the callback." }
      },
      required: ["caseId", "slot", "phoneNumber"]
    }
  }
];

export async function executeTool(name, args, context = {}) {
  const db = getDb();

  switch (name) {
    case "get_transaction": {
      const id = (args.id || '').trim();
      const txn = db.transactions.find(t => t.id.toLowerCase() === id.toLowerCase());
      if (!txn) {
        return {
          found: false,
          error: `No transaction found with ID "${id}". Please confirm the ID from your PayPal Activity tab.`
        };
      }
      return {
        found: true,
        transaction: txn,
        diagnosisTip: txn.status === 'FAILED_DEDUCTED'
          ? "This was captured as an authorization hold at the bank, but the merchant order was not completed. The bank will release funds automatically."
          : txn.status === 'HELD_RISK_REVIEW'
          ? "Held under standard risk review. Funds usually clear within 24-48 hours."
          : txn.statusReason
      };
    }

    case "list_recent_transactions": {
      const userId = args.userId || context.userId || 'usr_sarah_99';
      const limit = args.limit || 5;
      const userTxns = db.transactions
        .filter(t => t.userId === userId)
        .slice(0, limit);
      return {
        userId,
        count: userTxns.length,
        transactions: userTxns
      };
    }

    case "check_fx_and_fees": {
      const amount = parseFloat(args.amount) || 0;
      const from = (args.fromCurrency || 'USD').toUpperCase();
      const to = (args.toCurrency || 'EUR').toUpperCase();

      if (from === to) {
        return {
          amount,
          fromCurrency: from,
          toCurrency: to,
          exchangeRate: 1.0,
          spreadPct: "0%",
          crossBorderFee: 0,
          estimatedConvertedAmount: amount,
          notes: "Same currency transfer; standard commercial or P2P fees apply."
        };
      }

      const pair = `${from}_${to}`;
      const baseRate = FX_RATES[pair] || 1.0;
      // 3.75% PayPal conversion spread
      const effectiveRate = Number((baseRate * 0.9625).toFixed(4));
      const crossBorderFeePct = 0.02; // 2.0%
      const crossBorderFee = Number((amount * crossBorderFeePct).toFixed(2));
      const netConvertible = Math.max(0, amount - crossBorderFee);
      const estimatedConverted = Number((netConvertible * effectiveRate).toFixed(2));

      return {
        amount,
        fromCurrency: from,
        toCurrency: to,
        marketMidRate: baseRate,
        paypalEffectiveRate: effectiveRate,
        spread: "3.75% conversion spread included",
        crossBorderFee: `${crossBorderFee} ${from} (2%)`,
        estimatedReceivedAmount: `${estimatedConverted} ${to}`,
        userChoice: "Sender can choose PayPal conversion or Card Issuer conversion during checkout."
      };
    }

    case "get_dispute_status": {
      const id = (args.id || '').trim().toLowerCase();
      const dispute = db.disputes.find(d => 
        d.id.toLowerCase() === id || (d.transactionId && d.transactionId.toLowerCase() === id)
      );

      if (!dispute) {
        return {
          found: false,
          error: `No open dispute found for reference "${args.id}". You can open one in the Resolution Center within 180 days of payment.`
        };
      }

      return {
        found: true,
        dispute
      };
    }

    case "search_help_articles": {
      const results = searchKnowledgeBase(args.query, 3);
      return {
        query: args.query,
        count: results.length,
        citations: results
      };
    }

    case "create_support_case": {
      const caseId = `CAS-${Math.floor(1000 + Math.random() * 9000)}`;
      const newCase = {
        id: caseId,
        userId: args.userId || context.userId || 'usr_sarah_99',
        summary: args.summary,
        priority: args.priority || 'MEDIUM',
        category: args.category || 'general',
        status: 'OPEN_ESCALATED',
        createdAt: new Date().toISOString()
      };
      db.supportCases.push(newCase);
      saveDb(db);

      return {
        success: true,
        caseId: newCase.id,
        status: newCase.status,
        handoffSummary: newCase.summary,
        priority: newCase.priority,
        availableSlots: [
          "Today at 3:00 PM EST",
          "Today at 4:30 PM EST",
          "Tomorrow at 10:00 AM EST",
          "Tomorrow at 2:00 PM EST"
        ]
      };
    }

    case "schedule_callback": {
      const booking = {
        bookingId: `CBK-${Math.floor(10000 + Math.random() * 90000)}`,
        caseId: args.caseId,
        slot: args.slot,
        phoneNumber: args.phoneNumber,
        status: 'CONFIRMED',
        scheduledAt: new Date().toISOString()
      };
      db.callbacks.push(booking);
      saveDb(db);

      return {
        success: true,
        bookingId: booking.bookingId,
        caseId: booking.caseId,
        confirmedSlot: booking.slot,
        message: `Callback confirmed for ${booking.slot}. A PayPal specialist will call ${booking.phoneNumber} with your case notes ready.`
      };
    }

    default:
      return { error: `Tool ${name} not recognized.` };
  }
}
