export const KNOWLEDGE_BASE = [
  {
    id: "kb-01",
    title: "Money deducted from bank or card but payment marked as failed",
    category: "failed_deducted",
    tags: ["failed", "deducted", "pending", "authorization hold", "declined", "charge"],
    content: "When an online payment fails at checkout but you see a deduction on your bank or card statement, it is almost always a temporary 'Authorization Hold' rather than an actual settled charge. PayPal sends an authorization request to your card issuer/bank to secure the funds. If the checkout fails or times out before final capture, PayPal automatically cancels the authorization. However, banks may take 3 to 5 business days (and up to 30 days for some debit cards) to release the hold and reflect the balance. No dispute is required; the funds automatically drop back into your available balance."
  },
  {
    id: "kb-02",
    title: "Why is my payment pending or held?",
    category: "pending_held",
    tags: ["held", "pending", "21-day hold", "security review", "funds on hold", "delay"],
    content: "PayPal places payments on hold for several safety reasons: 1) New seller or low selling history (standard 21-day safety hold). 2) Unusual sales pattern or sudden spike in payment volume. 3) Cross-border payment requiring manual risk assessment. 4) The payment was sent as an 'eCheck' directly from a bank, which takes 3 to 6 business days to clear. For goods, adding valid carrier tracking in the transaction details releases funds 1 day after confirmed delivery."
  },
  {
    id: "kb-03",
    title: "How PayPal currency conversion and cross-border FX rates work",
    category: "international_fx",
    tags: ["fx", "currency conversion", "exchange rate", "international", "cross-border", "fees"],
    content: "When sending or receiving money in a different currency, PayPal applies a wholesale exchange rate adjusted by a currency conversion spread (typically 3.0% to 4.5% above the wholesale base rate). During checkout, users can choose between PayPal's conversion rate or having their card issuer perform the currency conversion. International transactions may also incur an additional cross-border fee (usually 1.5% to 3.0% depending on source and destination countries)."
  },
  {
    id: "kb-04",
    title: "Cross-border payment limits and country restrictions",
    category: "international_fx",
    tags: ["blocked country", "limits", "sanctions", "international limit", "rbi", "firc"],
    content: "PayPal complies with global financial sanctions (OFAC) and local regulations. Certain jurisdictions (e.g. sanctioned countries or specific restricted regions) cannot send or receive payments. Additionally, unverified accounts have an annual sending limit. In India, RBI regulations require individual exports to have a valid Purpose Code (e.g. P0802 for software services) and auto-sweep to a linked Indian bank account daily; PayPal balances cannot be held by Indian personal accounts."
  },
  {
    id: "kb-05",
    title: "How to open and manage a dispute or claim in Resolution Center",
    category: "disputes_refunds",
    tags: ["dispute", "resolution center", "chargeback", "claim", "item not received", "unauthorized"],
    content: "If you did not receive an item or the item was significantly not as described, you have 180 calendar days from the payment date to open a dispute in the PayPal Resolution Center. Stage 1 is 'Dispute', where buyer and seller communicate directly for 20 days. If the seller does not cooperate or refund, either party can escalate to Stage 2 ('Claim') for PayPal to review and make a final ruling within 30 days."
  },
  {
    id: "kb-06",
    title: "Chargeback vs PayPal Dispute: Key differences",
    category: "disputes_refunds",
    tags: ["chargeback", "bank dispute", "card issuer", "buyer protection", "seller protection"],
    content: "A dispute is handled internally by PayPal's Resolution Center. A chargeback is filed directly by the buyer through their credit card company or bank. If a chargeback is filed, the card issuer decides the outcome under their own rules, not PayPal. PayPal will notify the seller and request proof of shipment or delivery within 10 days to contest the chargeback under PayPal Seller Protection."
  },
  {
    id: "kb-07",
    title: "What to do if you suspect unauthorized activity or fraud",
    category: "unauthorized_fraud",
    tags: ["unauthorized", "hacked", "fraud", "suspicious", "stolen", "account takeover", "otp"],
    content: "If you notice an unrecognized payment or suspect unauthorized account access: 1) Immediately change your PayPal password and security questions. 2) Review and revoke any active 'Automatic Payments' or billing agreements in Settings > Payments. 3) Report the unauthorized transaction in the Resolution Center within 60 days to be covered under PayPal's $0 unauthorized liability protection. 4) Turn on 2-Factor Authentication (2FA) via SMS or an Authenticator app. 5) Contact your bank if a linked card or bank account was debited."
  },
  {
    id: "kb-08",
    title: "Understanding account limitations and how to remove them",
    category: "account_verification",
    tags: ["limitation", "restricted", "account limited", "kyc", "identity verification", "lift limit"],
    content: "An account limitation restricts sending, withdrawing, or receiving money. Limitations occur when: PayPal needs to verify your identity (KYC requirements), risk algorithms detect high-risk activity, or your account has a high dispute rate. To lift the limitation, visit the Resolution Center, click 'Go to Account Limitations', and complete the required steps (such as uploading government-issued photo ID, proof of address, or supplier invoices). Verification usually takes 24 to 72 business hours."
  },
  {
    id: "kb-09",
    title: "Linking and confirming bank accounts and cards",
    category: "account_verification",
    tags: ["link bank", "confirm card", "4-digit code", "micro-deposits", "verification"],
    content: "To confirm a bank account, PayPal sends two small deposits (between $0.01 and $0.99) within 2-3 business days. Once you see them on your bank statement, enter both amounts in PayPal under Wallet > Confirm Bank. For credit/debit cards, PayPal charges a refundable $1.95 amount accompanied by a 4-digit code on your card statement (e.g. PP*1234CODE). Enter this 4-digit code in Wallet to confirm the card and remove spending limits."
  },
  {
    id: "kb-10",
    title: "Refund timeline: Where does my refund go?",
    category: "disputes_refunds",
    tags: ["refund time", "where is refund", "refunded", "card refund", "balance refund"],
    content: "When a merchant issues a refund, where the money goes depends on how you originally paid: 1) Paid with PayPal Balance: refunded instantly back to PayPal balance. 2) Paid with Credit or Debit Card: refunded directly to the card. It typically takes 3 to 7 business days, but some card issuers may take up to 30 days. 3) Paid with Bank Account: takes 3 to 5 business days to clear back to the bank. PayPal does not retain refunded amounts."
  },
  {
    id: "kb-11",
    title: "Why was my payment declined by PayPal or my bank?",
    category: "failed_deducted",
    tags: ["declined", "payment declined", "card declined", "risk filter", "insufficient funds"],
    content: "Common reasons a payment is declined: 1) Your card issuer or bank blocked the transaction due to automated security or fraud filters. 2) Insufficient available balance or credit limit. 3) The card has expired or the billing address does not match your bank records. 4) PayPal's automated internal security model flagged the payment as risky (try paying with a different linked funding source or wait 24-48 hours before retrying)."
  },
  {
    id: "kb-12",
    title: "PayPal Seller Protection policy and criteria",
    category: "disputes_refunds",
    tags: ["seller protection", "unauthorized payment", "item not received", "proof of shipment"],
    content: "PayPal Seller Protection shields eligible sellers from losing money on claims, chargebacks, and reversals for 'Unauthorized Transaction' and 'Item Not Received'. To qualify: the item must be a tangible physical good (or eligible digital service), shipped to the address provided on the Transaction Details page, with valid online tracking showing dispatch and delivery. You must respond to any dispute inquiry within 10 days."
  },
  {
    id: "kb-13",
    title: "eCheck payments: Why they take 3 to 6 days to clear",
    category: "pending_held",
    tags: ["echeck", "electronic check", "clearing", "pending transfer", "bank clearing"],
    content: "An eCheck is an electronic funds transfer directly from your bank account to another PayPal user's account. Unlike Instant Transfer, an eCheck does not have a backup card linked. Therefore, the payment remains 'Pending' until the money actually clears through the Automated Clearing House (ACH) network, which typically takes 3 to 6 business days. Sellers are advised not to ship items until the eCheck shows 'Completed'."
  },
  {
    id: "kb-14",
    title: "PayPal Payouts and withdrawal delays to bank accounts",
    category: "pending_held",
    tags: ["payout", "withdrawal", "withdraw to bank", "bank transfer delay", "instant transfer"],
    content: "Standard bank withdrawals initiated from your PayPal balance take 1 to 3 business days to reach your bank account (excluding weekends and bank holidays). Instant transfers to eligible debit cards or bank accounts arrive in minutes for a 1.75% fee (capped). If a withdrawal is delayed past 4 business days, verify your bank account details or contact your bank's wire/ACH clearing department."
  },
  {
    id: "kb-15",
    title: "How to spot and report PayPal phishing scams and spoof emails",
    category: "unauthorized_fraud",
    tags: ["phishing", "spoof", "fake email", "scam", "suspicious link", "impersonation"],
    content: "Legitimate PayPal emails will always address you by your registered first and last name or business name, never 'Dear Customer' or 'Hello User'. PayPal will never ask you to send your password, bank account details, card CVV, or one-time SMS verification code via email or text. Forward suspicious emails as an attachment to phishing@paypal.com and delete them immediately without clicking any links."
  },
  {
    id: "kb-16",
    title: "Goods and Services vs Friends and Family payments",
    category: "general_features",
    tags: ["friends and family", "goods and services", "purchase protection", "fees", "p2p"],
    content: "When sending money: 'Friends and Family' is designed for personal transfers between acquaintances, is free when funding with a linked bank or balance in the same country, but is NOT covered by PayPal Buyer Protection. 'Goods and Services' is for purchasing items or paying freelancers/contractors; the seller pays a small commercial transaction fee, and the buyer is protected under PayPal Purchase Protection in case of disputes."
  },
  {
    id: "kb-17",
    title: "Automatic Payments, Subscriptions, and Billing Agreements",
    category: "general_features",
    tags: ["recurring payment", "subscription", "autopay", "cancel subscription", "billing agreement"],
    content: "To view or cancel active subscriptions and automatic payments: log in, go to Settings (gear icon) > Payments > 'Automatic Payments'. Select the merchant name from the left sidebar and click 'Cancel' or 'Turn Off'. This stops future recurring billings immediately. Any charge already billed must be resolved directly with the merchant or reported via Resolution Center if unauthorized."
  },
  {
    id: "kb-18",
    title: "Payment status glossary: Pending vs Processing vs On Hold vs Completed",
    category: "general_features",
    tags: ["status meaning", "glossary", "on hold", "pending", "completed", "cancelled", "reversed"],
    content: "Understanding transaction statuses: 1) 'Pending': awaiting payment source clearing (e.g. eCheck or bank ACH). 2) 'Processing': PayPal has authorized the funds and is completing the transaction. 3) 'On Hold': funds are received but held for security review or shipping verification. 4) 'Completed': transaction successfully settled. 5) 'Reversed' or 'Refunded': payment returned to the sender. 6) 'Failed': transaction could not be processed."
  },
  {
    id: "kb-19",
    title: "Negative PayPal balance: Causes and how to restore",
    category: "account_verification",
    tags: ["negative balance", "owed", "deficit", "chargeback loss", "restore balance"],
    content: "Your PayPal balance can become negative if a buyer wins a dispute/chargeback after you withdrew funds, or if a bank transfer bounces due to insufficient funds while an instant purchase proceeded. When your balance is negative, subsequent incoming payments are automatically applied to the deficit. You can restore your balance by clicking 'Resolve Negative Balance' in your Wallet and transferring funds via card or bank."
  },
  {
    id: "kb-20",
    title: "Two-Factor Authentication (2FA) setup and recovery",
    category: "unauthorized_fraud",
    tags: ["2fa", "mfa", "authenticator app", "sms otp", "security key", "login security"],
    content: "Enhance account protection by enabling 2FA: Go to Settings > Security > '2-step verification'. You can register an Authenticator App (like Google Authenticator or 1Password) or opt for SMS text passcodes. We strongly recommend app-based authenticators to defend against SIM-swap attacks. Keep backup codes in a secure physical location."
  },
  {
    id: "kb-21",
    title: "Invoice and Payment Request: Paying safely",
    category: "general_features",
    tags: ["invoice", "payment request", "pay bill", "buyer protection invoice"],
    content: "When paying an official PayPal invoice received by email or in your dashboard, check the seller name and item description carefully. Invoices paid with PayPal are eligible for Purchase Protection if the transaction qualifies. Never pay an invoice requesting gift cards or cryptocurrency, or instructions to pay to a personal email using Friends and Family."
  },
  {
    id: "kb-22",
    title: "Updating expired credit or debit cards",
    category: "account_verification",
    tags: ["update card", "expired card", "change expiration date", "cvv update"],
    content: "To update an expiring card: Navigate to Wallet, click on the card, and select 'Update Card'. Enter the new expiration date, CVV, and confirm billing address. If your card number has changed, remove the old card and link the new card as a fresh payment method."
  },
  {
    id: "kb-23",
    title: "Tax reporting and 1099-K forms for US accounts",
    category: "general_features",
    tags: ["1099k", "tax", "irs", "reporting", "form 1099", "gross payments"],
    content: "In the United States, PayPal is required by IRS regulations to issue a Form 1099-K to sellers who meet statutory reporting thresholds for goods and services transactions. Personal transfers (Friends & Family) are excluded from 1099-K calculations. You can download your tax documents under Activity > Statements > Tax Documents."
  },
  {
    id: "kb-24",
    title: "Closing a PayPal account safely",
    category: "general_features",
    tags: ["close account", "delete account", "cancel paypal", "remove data"],
    content: "Before closing your PayPal account: 1) Withdraw any remaining balance to your bank account. 2) Resolve any open disputes, claims, or negative balances. 3) Cancel active automatic payments and subscriptions. Then go to Settings > Account > 'Close your account' at the bottom. Once closed, the account cannot be reopened."
  },
  {
    id: "kb-25",
    title: "Support escalation policy and callback assistance",
    category: "general_features",
    tags: ["support", "call paypal", "human agent", "escalate", "phone callback", "customer service"],
    content: "PayPal Assist AI can handle most common account and transaction inquiries. In cases of complex disputes, suspected unauthorized account takeovers, or when the automated assistant cannot resolve your problem, you can request an escalation. An automated handoff summary is generated so you never have to repeat your problem, and you can schedule a direct phone callback or connect with our specialized human fraud & risk team."
  }
];

// Simple BM25-inspired term-overlap & keyword RAG search with scoring
export function searchKnowledgeBase(query, topK = 3) {
  if (!query || typeof query !== 'string') return [];
  const normalizedQuery = query.toLowerCase();

  const stopWords = new Set(['what', 'when', 'where', 'which', 'who', 'whom', 'this', 'that', 'with', 'from', 'have', 'your', 'about', 'will', 'into', 'does', 'find', 'make', 'right', 'should', 'here', 'there', 'some', 'someone', 'somebody']);
  const queryTokens = normalizedQuery
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !stopWords.has(t));

  const scored = KNOWLEDGE_BASE.map(article => {
    let score = 0;
    const titleLower = article.title.toLowerCase();
    const contentLower = article.content.toLowerCase();
    const tagsLower = article.tags.map(t => t.toLowerCase());

    // Exact phrase match bonus
    if (titleLower.includes(normalizedQuery)) score += 30;
    if (contentLower.includes(normalizedQuery)) score += 15;

    // Token matching
    queryTokens.forEach(token => {
      if (titleLower.includes(token)) score += 12;
      if (tagsLower.some(t => t.includes(token))) score += 10;
      if (contentLower.includes(token)) score += 2;
    });

    return { article, score };
  });

  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(item => ({
      id: item.article.id,
      title: item.article.title,
      category: item.article.category,
      snippet: item.article.content.slice(0, 220) + '...',
      fullContent: item.article.content,
      score: item.score
    }));
}
