import { getDb, saveDb } from '../src/db.js';

const TOPICS = [
  'failed_deducted',
  'pending_held',
  'international_fx',
  'disputes_refunds',
  'unauthorized_fraud',
  'account_verification',
  'general_features'
];

const SNIPPETS = {
  failed_deducted: [
    "Checkout timed out on Merchant site but $148.50 missing from Chase debit card",
    "Card was debited twice on failed shoe purchase",
    "Payment declined on Zara but bank SMS says payment made",
    "Money deducted from HDFC account but showing failed on PayPal",
    "Why was my card charged if the order was cancelled immediately?",
    "Failed payment on eBay but money got cut from my checking account"
  ],
  pending_held: [
    "Buyer paid 3 days ago but money is still in pending hold",
    "First time seller payment on 21 day hold",
    "Why is my eCheck payment taking 5 days to clear?",
    "Withdrawal to my local bank account is delayed past 48 hours",
    "Payment received but status says Security Review hold"
  ],
  international_fx: [
    "What is the conversion rate when sending USD to INR in India?",
    "Why is there a 4% fee on my European transfer?",
    "Cross border payment to Germany has high fees",
    "What purpose code do I need for software export under RBI rules?",
    "Difference between card conversion and PayPal currency conversion"
  ],
  disputes_refunds: [
    "Merchant refunded me yesterday, when will it show on my credit card?",
    "Opened a dispute for item not received, how long does seller have?",
    "Seller sent fake product, need to escalate dispute to a claim",
    "Can I file a chargeback with my bank if PayPal dispute is still open?",
    "Refund timeline for bank account vs card payment"
  ],
  unauthorized_fraud: [
    "Unrecognized charge of $450 from a crypto merchant at 3 AM",
    "Someone logged into my account from another country",
    "Got a fake PayPal email asking for my password and card CVV",
    "Suspicious transaction on my balance that I never authorized",
    "Account compromised, please freeze withdrawals immediately"
  ],
  account_verification: [
    "How do I confirm the 4-digit code on my debit card statement?",
    "My account is limited, what documents are required for KYC?",
    "How to remove annual sending limit on personal account",
    "Pending 2 micro-deposits to confirm my local bank account"
  ],
  general_features: [
    "How do I cancel an automatic subscription to Netflix?",
    "Difference between Friends & Family and Goods & Services",
    "How to download my annual 1099-K tax form?",
    "How do I close my PayPal account permanently?"
  ]
};

export function seedSyntheticConversations(count = 200) {
  const db = getDb();
  const convs = [];

  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;

  for (let i = 0; i < count; i++) {
    // Bias: 34% failed_deducted, 23% international_fx, 16% unauthorized, 14% disputes, remainder others
    const rand = Math.random();
    let topic;
    if (rand < 0.34) topic = 'failed_deducted';
    else if (rand < 0.57) topic = 'international_fx';
    else if (rand < 0.73) topic = 'unauthorized_fraud';
    else if (rand < 0.87) topic = 'disputes_refunds';
    else if (rand < 0.94) topic = 'pending_held';
    else topic = 'account_verification';

    const snippets = SNIPPETS[topic];
    const snippet = snippets[Math.floor(Math.random() * snippets.length)];

    // Escalation probabilities: unauthorized high, others low
    const isEscalated = topic === 'unauthorized_fraud' ? Math.random() < 0.75 : Math.random() < 0.12;
    const sentiment = isEscalated 
      ? (Math.random() < 0.7 ? 'negative' : 'neutral')
      : (Math.random() < 0.8 ? 'positive' : 'neutral');

    const duration = Number((1.2 + Math.random() * 4.5).toFixed(1));
    const daysAgo = Math.random() * 7;
    const timestamp = new Date(now - daysAgo * ONE_DAY).toISOString();

    convs.push({
      id: `CONV-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp,
      userSnippet: snippet,
      status: isEscalated ? 'ESCALATED' : 'RESOLVED',
      category: topic,
      sentiment,
      durationMinutes: duration,
      escalationCaseId: isEscalated ? `CAS-${Math.floor(1000 + Math.random() * 9000)}` : null
    });
  }

  // Sort descending by timestamp
  convs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  db.conversations = convs;
  saveDb(db);

  console.log(`✅ Successfully seeded ${convs.length} synthetic support conversations into data/db.json.`);
}

// Run if called directly
if (process.argv[1]?.endsWith('seed.js')) {
  seedSyntheticConversations(200);
}
