import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_FILE = path.join(DATA_DIR, 'db.json');

// Initial seed template if not existing
const DEFAULT_STATE = {
  users: [
    { id: 'usr_sarah_99', name: 'Sarah Miller', email: 'sarah.m@example.com', country: 'US', tier: 'Personal Premier' },
    { id: 'usr_arjun_42', name: 'Arjun Sharma', email: 'arjun.s@example.in', country: 'IN', tier: 'Business' }
  ],
  transactions: [
    {
      id: 'TXN-88291034',
      userId: 'usr_sarah_99',
      recipient: 'Global Tech Electronics Ltd.',
      amount: 148.50,
      currency: 'USD',
      status: 'FAILED_DEDUCTED', // failed at merchant but bank card charged
      type: 'MERCHANT_CHECKOUT',
      paymentMethod: 'Chase Debit Card (...4921)',
      date: '2026-11-06T14:22:00Z',
      paypalFee: 0.00,
      merchantId: 'MCH-882194',
      statusReason: 'Payment authorization timed out on merchant gateway callback after bank hold was placed.',
      holdReleasedEstimated: '2026-11-09T18:00:00Z',
      actionableAdvice: 'This is a temporary authorization hold. Your bank will automatically release the funds back to your account within 3 to 5 business days without requiring dispute filing.'
    },
    {
      id: 'TXN-99120481',
      userId: 'usr_sarah_99',
      recipient: 'Nordic Design Studio ApS',
      amount: 420.00,
      currency: 'EUR',
      originalAmount: 462.15,
      originalCurrency: 'USD',
      status: 'HELD_RISK_REVIEW',
      type: 'INTERNATIONAL_PAYMENT',
      paymentMethod: 'PayPal Balance',
      date: '2026-11-05T09:15:00Z',
      fxRate: 1.1004,
      paypalFee: 18.48,
      statusReason: 'First-time cross-border transfer exceeding user 30-day velocity thresholds under standard fraud review.',
      holdReleasedEstimated: '2026-11-07T21:00:00Z',
      actionableAdvice: 'Standard 24-48 hour compliance safety hold. No document required unless notified in Resolution Center.'
    },
    {
      id: 'TXN-77312904',
      userId: 'usr_sarah_99',
      recipient: 'Freelance Cloud Dev Services',
      amount: 850.00,
      currency: 'USD',
      status: 'COMPLETED',
      type: 'DIRECT_PAYMENT',
      paymentMethod: 'Bank Account (...1089)',
      date: '2026-11-01T11:00:00Z',
      paypalFee: 29.75,
      statusReason: 'Completed normally.'
    },
    {
      id: 'TXN-66102941',
      userId: 'usr_arjun_42',
      recipient: 'DevTools Cloud Inc (San Francisco)',
      amount: 299.00,
      currency: 'USD',
      status: 'PENDING_BANK',
      type: 'INTERNATIONAL_PAYOUT',
      paymentMethod: 'HDFC Bank India (...3301)',
      date: '2026-11-06T08:30:00Z',
      statusReason: 'Awaiting local clearing network (FIRC / RBI Purpose Code regulatory clearance for cross-border inwards).',
      holdReleasedEstimated: '2026-11-10T12:00:00Z',
      actionableAdvice: 'Cross-border inwards take 2-3 business days. Purpose code P0802 attached automatically.'
    },
    {
      id: 'TXN-44910238',
      userId: 'usr_sarah_99',
      recipient: 'CryptoVibe Wallet TopUp',
      amount: 1250.00,
      currency: 'USD',
      status: 'SUSPICIOUS_UNAUTHORIZED',
      type: 'UNAUTHORIZED_LOGIN',
      paymentMethod: 'PayPal Balance',
      date: '2026-11-06T22:45:00Z',
      statusReason: 'Device login IP from unknown VPN proxy; unusual high velocity.',
      actionableAdvice: 'High risk detected. Immediate account freeze, password reset, and fraud escalation required.'
    }
  ],
  disputes: [
    {
      id: 'PP-D-883921',
      transactionId: 'TXN-77312904',
      userId: 'usr_sarah_99',
      reason: 'ITEM_NOT_RECEIVED',
      status: 'UNDER_MERCHANT_REVIEW',
      claimAmount: 850.00,
      currency: 'USD',
      filedDate: '2026-11-03T10:00:00Z',
      merchantDeadline: '2026-11-13T10:00:00Z',
      notes: 'Merchant has 10 days to provide tracking confirmation or refund. If no response, PayPal automatically decides in buyer favor.'
    }
  ],
  supportCases: [],
  callbacks: [],
  conversations: []
};

export function getDb() {
  if (!fs.existsSync(DB_FILE)) {
    saveDb(DEFAULT_STATE);
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading db.json, returning default state:', err);
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }
}

export function saveDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export function resetDb() {
  saveDb(DEFAULT_STATE);
  return DEFAULT_STATE;
}
