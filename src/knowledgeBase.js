import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const KB_DIR = path.join(__dirname, '..', 'knowledge_base');

if (!fs.existsSync(KB_DIR)) {
  fs.mkdirSync(KB_DIR, { recursive: true });
}

export const FAQ_ARTICLES = [
  {
    id: "faq-01",
    title: "How to send money to friends, family, or merchants",
    category: "send_money",
    tags: ["send money", "transfer", "friends and family", "goods and services", "pay someone"],
    content: `To send money on PayPal:
1. Log in to your PayPal account and click "Send & Request".
2. Enter the recipient's name, email address, or mobile number and click "Next".
3. Enter the amount, choose the currency, and select payment type: "Friends and Family" (for personal gifts/reimbursements) or "Goods and Services" (for purchases covered by Buyer Protection).
4. Select your payment method (PayPal balance, bank account, or card) and review details before clicking "Send Payment Now".

*Notice: This is a demo article for educational/support simulation purposes and does not represent official PayPal policy.*`
  },
  {
    id: "faq-02",
    title: "How to receive money and request payments",
    category: "receive_money",
    tags: ["receive money", "request payment", "paypal.me", "get paid", "invoicing"],
    content: `To receive money on PayPal:
1. Provide the sender with the email address or mobile number linked to your PayPal account.
2. You can also create a personalized PayPal.Me link (paypal.me/YourName) and share it directly with buyers or acquaintances.
3. To invoice clients, click "Send & Request" > "Manage Invoices" > "Create Invoice".
4. When money is sent to you, you will receive an email confirmation and the funds appear in your PayPal balance or auto-transfer to your bank.

*Notice: This is a demo article for educational/support simulation purposes and does not represent official PayPal policy.*`
  },
  {
    id: "faq-03",
    title: "PayPal fees breakdown: Domestic transfers, commercial, and cards",
    category: "fees",
    tags: ["fees", "cost", "rates", "percentage", "commercial fee", "transaction fee"],
    content: `Standard PayPal fee guidelines:
1. Sending money domestically to friends and family using a PayPal balance or linked bank account is free.
2. Sending money with a credit or debit card incurs a standard fee (typically 2.9% + fixed currency fee).
3. Receiving commercial payments for Goods and Services carries a merchant rate (typically 2.99% to 3.49% + fixed fee).
4. Withdrawing funds to a local bank via standard ACH (1-3 business days) is free. Instant transfers to eligible debit cards incur a 1.75% fee (capped).

*Notice: This is a demo article for educational/support simulation purposes and does not represent official PayPal policy.*`
  },
  {
    id: "faq-04",
    title: "Payment failed at checkout but money was deducted from bank/card",
    category: "failed_deducted",
    tags: ["failed", "deducted", "temporary hold", "authorization hold", "declined", "charge"],
    content: `If your payment shows as failed or unsuccessful during checkout but your bank or card shows a deduction:
1. This is almost always a temporary "Authorization Hold", not an actual completed charge.
2. When you initiate payment, PayPal requests a pre-authorization hold from your bank to ensure funds exist.
3. If checkout drops or times out before capture, PayPal immediately voids the pre-authorization.
4. Your bank or card issuer will release the held funds automatically within 3 to 5 business days (some debit cards may take up to 30 days). No dispute is required.

*Notice: This is a demo article for educational/support simulation purposes and does not represent official PayPal policy.*`
  },
  {
    id: "faq-05",
    title: "Why is my payment pending or placed on a 21-day hold?",
    category: "pending_payments",
    tags: ["pending", "held", "21-day hold", "seller hold", "risk hold", "delayed funds"],
    content: `Payments may be marked "Pending" or "On Hold" for several reasons:
1. New or infrequent sellers often encounter a standard temporary 21-day safety hold while establishing trust.
2. The payment was sent as an eCheck, which requires 3 to 6 business days for the payer's bank to clear via ACH.
3. The payment is undergoing standard cross-border regulatory or anti-fraud security review (typically 24 to 48 hours).
4. Sellers can expedite fund release for physical goods by adding valid tracking; funds typically release 24 hours after carrier confirms delivery.

*Notice: This is a demo article for educational/support simulation purposes and does not represent official PayPal policy.*`
  },
  {
    id: "faq-06",
    title: "Refunds timeline: Where does my refund go and when does it arrive?",
    category: "refunds",
    tags: ["refund", "refund timeline", "where is refund", "credit card refund", "bank refund"],
    content: `When a merchant or sender issues a refund:
1. If paid with PayPal Balance: The refund is posted back to your PayPal balance immediately.
2. If paid with Credit or Debit Card: The refund goes directly back to that card. Card issuers typically take 3 to 7 business days to post, though some card networks take up to 30 days.
3. If paid with Bank Account: Funds clear back to your bank within 3 to 5 business days.
4. PayPal returns money to the original funding source and never retains refunded amounts.

*Notice: This is a demo article for educational/support simulation purposes and does not represent official PayPal policy.*`
  },
  {
    id: "faq-07",
    title: "How to open and resolve disputes and claims in Resolution Center",
    category: "disputes",
    tags: ["dispute", "resolution center", "chargeback", "claim", "item not received", "unauthorized"],
    content: `To resolve transaction issues:
1. You have 180 calendar days from the date of payment to open a dispute in the Resolution Center.
2. In Stage 1 ("Dispute"), you communicate directly with the seller for up to 20 days to negotiate a resolution or replacement.
3. If the seller does not reply or reach an agreement, you can escalate the dispute to a PayPal "Claim" within those 20 days.
4. Once escalated to a Claim, PayPal investigates evidence (carrier tracking, invoices) and issues a binding decision, typically within 30 days.

*Notice: This is a demo article for educational/support simulation purposes and does not represent official PayPal policy.*`
  },
  {
    id: "faq-08",
    title: "PayPal Dispute vs Bank Chargeback: Rules and differences",
    category: "disputes",
    tags: ["chargeback", "bank dispute", "card issuer", "seller protection", "buyer protection"],
    content: `Understanding disputes vs chargebacks:
1. A PayPal Dispute is filed directly within PayPal's Resolution Center and decided under PayPal Buyer/Seller Protection policies.
2. A Chargeback is filed directly by the cardholder through their credit card company or issuing bank.
3. If a chargeback is opened, the credit card company makes the final decision under Visa/Mastercard rules, not PayPal.
4. Sellers covered by PayPal Seller Protection can submit proof of delivery within 10 days to contest unwarranted chargebacks.

*Notice: This is a demo article for educational/support simulation purposes and does not represent official PayPal policy.*`
  },
  {
    id: "faq-09",
    title: "International payments: Currency conversion, FX rates, and cross-border fees",
    category: "international",
    tags: ["international", "fx rate", "currency conversion", "cross-border fee", "exchange rate"],
    content: `When sending or receiving money across international borders:
1. Currency Conversion: PayPal uses a wholesale base rate plus a currency conversion spread (typically 3.0% to 4.5%).
2. At checkout, buyers can choose between PayPal's conversion rate or letting their card issuer perform the FX conversion.
3. Cross-Border Fees: Transactions between accounts registered in different countries incur an international transaction fee (typically 1.5% to 3.0%).
4. Currency balances can be held in multiple supported foreign currencies within your PayPal wallet.

*Notice: This is a demo article for educational/support simulation purposes and does not represent official PayPal policy.*`
  },
  {
    id: "faq-10",
    title: "Cross-border payment limits, blocked countries, and RBI Purpose Codes (India)",
    category: "international",
    tags: ["purpose code", "rbi", "firc", "india export", "sanctions", "limits"],
    content: `International regulatory policies:
1. Blocked Countries: PayPal complies with OFAC sanctions; transactions to or from embargoed jurisdictions cannot be processed.
2. Unverified Accounts: Annual sending/withdrawal limits apply until identity verification is completed.
3. Indian Accounts (RBI Regulations): Under Reserve Bank of India rules, personal PayPal balances cannot be held. All incoming export payments must specify an RBI Purpose Code (such as P0802 for software services) and automatically daily sweep directly into your linked Indian bank account.

*Notice: This is a demo article for educational/support simulation purposes and does not represent official PayPal policy.*`
  },
  {
    id: "faq-11",
    title: "Understanding account limitations and steps to restore full access",
    category: "account_limitations",
    tags: ["account limitation", "restricted account", "identity verification", "kyc", "lift limit"],
    content: `When an account is limited, you may temporarily be unable to send, withdraw, or receive money:
1. Common causes: KYC compliance requirements, sudden spike in sales volume, high dispute rate, or suspected unauthorized logins.
2. To lift the limitation, log in, navigate to the Resolution Center, and review the "Account Limitations" checklist.
3. Upload required verification documents (such as government photo ID, proof of address, or supplier purchase invoices).
4. PayPal reviews submitted documentation within 24 to 72 business hours.

*Notice: This is a demo article for educational/support simulation purposes and does not represent official PayPal policy.*`
  },
  {
    id: "faq-12",
    title: "How to link and confirm a bank account or credit/debit card",
    category: "linking_bank_card",
    tags: ["link bank", "confirm card", "4-digit code", "micro deposits", "wallet"],
    content: `To link and verify funding methods:
1. Go to Wallet > "Link a card or bank".
2. Bank Confirmation: PayPal sends two small deposits (between $0.01 and $0.99) within 2-3 business days. Once seen on your bank statement, enter both amounts under Wallet > Confirm Bank.
3. Card Confirmation: PayPal initiates a temporary $1.95 refundable charge with a 4-digit code (e.g., PP*1234CODE). Enter this 4-digit code in Wallet to confirm card ownership and lift spending caps.

*Notice: This is a demo article for educational/support simulation purposes and does not represent official PayPal policy.*`
  },
  {
    id: "faq-13",
    title: "Essential security tips: Phishing protection, spoof emails, and 2FA",
    category: "security",
    tags: ["security tips", "phishing", "fake email", "2fa", "authenticator", "spoof"],
    content: `Keep your PayPal account safe:
1. Official PayPal emails always greet you with your full name or registered business name, never "Dear Customer".
2. Never share your password, OTP codes, CVV, or card PIN with anyone. PayPal will NEVER ask for secrets.
3. Enable 2-Step Verification (2FA) via Settings > Security > 2-step verification using an Authenticator app.
4. Forward suspicious spoof or phishing emails to phishing@paypal.com and delete them immediately without clicking links.

*Notice: This is a demo article for educational/support simulation purposes and does not represent official PayPal policy.*`
  },
  {
    id: "faq-14",
    title: "What to do if you suspect unauthorized activity or an account takeover",
    category: "security",
    tags: ["unauthorized", "hacked", "stolen", "account takeover", "fraud alert"],
    content: `If you detect unrecognized transactions or unauthorized logins:
1. Immediately change your PayPal password and update your security questions.
2. Navigate to Settings > Payments > "Automatic Payments" and cancel any active agreements you do not recognize.
3. Report unauthorized charges in the Resolution Center within 60 days to qualify for $0 unauthorized liability protection.
4. Contact your bank or card issuer immediately if linked financial sources were debited.

*Notice: This is a demo article for educational/support simulation purposes and does not represent official PayPal policy.*`
  },
  {
    id: "faq-15",
    title: "How to contact customer support and schedule a phone callback",
    category: "contact_support",
    tags: ["contact support", "customer care", "phone number", "callback", "human agent"],
    content: `Ways to contact PayPal Support:
1. PayPal Assist AI is available 24/7 for instant transaction diagnostics, hold explanations, and dispute guidance.
2. In-App Message Center: Connect with customer support specialists under Help > Message Center.
3. Telephone Callback: If an inquiry cannot be resolved or involves high-risk unauthorized activity, you can request an escalated support ticket with a callback time slot so you never have to repeat your issue.

*Notice: This is a demo article for educational/support simulation purposes and does not represent official PayPal policy.*`
  },
  {
    id: "faq-16",
    title: "Goods & Services vs Friends & Family: Which should you choose?",
    category: "send_money",
    tags: ["goods and services", "friends and family", "buyer protection", "seller fee"],
    content: `Comparing payment types:
1. Goods and Services: Intended for commercial transactions (buying items, hiring contractors). Covered by PayPal Purchase Protection. The seller pays the transaction processing fee.
2. Friends and Family: Intended solely for personal transfers between acquaintances. Free within the same country using bank/balance. Not covered by Purchase Protection. Never use Friends & Family for purchases from strangers.

*Notice: This is a demo article for educational/support simulation purposes and does not represent official PayPal policy.*`
  },
  {
    id: "faq-17",
    title: "eCheck payments: Why they take 3 to 6 business days to complete",
    category: "pending_payments",
    tags: ["echeck", "electronic check", "clearing time", "ach transfer", "pending check"],
    content: `Understanding eChecks:
1. An eCheck is an electronic funds transfer directly from your bank account without a backup card on file.
2. Unlike instant transfers, eChecks rely on standard ACH bank clearing networks.
3. It takes 3 to 6 business days for the funds to arrive in the recipient's PayPal account.
4. Sellers should not ship merchandise until the transaction status updates from "Pending" to "Completed".

*Notice: This is a demo article for educational/support simulation purposes and does not represent official PayPal policy.*`
  },
  {
    id: "faq-18",
    title: "How to cancel automatic payments, subscriptions, and billing agreements",
    category: "send_money",
    tags: ["automatic payments", "cancel subscription", "billing agreement", "recurring payment"],
    content: `To cancel recurring merchant billings:
1. Go to Settings (gear icon) > Payments.
2. Click "Automatic Payments" (or "Manage Automatic Payments").
3. Select the merchant from the list on the left side of the screen.
4. Click "Cancel" or "Turn Off" to prevent future automatic charges. Any past charge must be settled directly with the seller.

*Notice: This is a demo article for educational/support simulation purposes and does not represent official PayPal policy.*`
  },
  {
    id: "faq-19",
    title: "Why was my payment declined by PayPal or my card issuer?",
    category: "failed_deducted",
    tags: ["payment declined", "card declined", "bank declined", "risk filter", "insufficient funds"],
    content: `Common reasons for payment declines:
1. Card issuer security filters blocked the charge due to unusual online or overseas location.
2. Insufficient balance or available credit limit on the selected funding source.
3. Card expiration date or billing address mismatch.
4. PayPal internal risk models flagged the checkout session (try using another linked card or wait 24 hours before reattempting).

*Notice: This is a demo article for educational/support simulation purposes and does not represent official PayPal policy.*`
  },
  {
    id: "faq-20",
    title: "Understanding PayPal Seller Protection policy and eligibility criteria",
    category: "disputes",
    tags: ["seller protection", "unauthorized claim", "item not received", "proof of delivery"],
    content: `PayPal Seller Protection helps shield sellers against chargebacks and claims:
1. Covers eligible physical items and select digital goods for "Unauthorized Transaction" and "Item Not Received" claims.
2. Requires shipping to the address specified on the Transaction Details page with verifiable online tracking.
3. High-value orders ($750 USD or equivalent) require signature confirmation upon delivery.

*Notice: This is a demo article for educational/support simulation purposes and does not represent official PayPal policy.*`
  },
  {
    id: "faq-21",
    title: "PayPal balance withdrawals: Standard ACH vs Instant Debit Card transfer",
    category: "receive_money",
    tags: ["withdraw money", "transfer to bank", "instant transfer", "withdrawal fee", "cash out"],
    content: `Withdrawing funds from your PayPal balance:
1. Standard Bank Transfer: Free, transfers funds via ACH to your linked bank within 1 to 3 business days.
2. Instant Transfer: Sends funds to an eligible debit card or bank account in approximately 30 minutes for a 1.75% fee (capped).
3. If an ACH withdrawal is delayed past 4 business days, verify routing numbers with your bank.

*Notice: This is a demo article for educational/support simulation purposes and does not represent official PayPal policy.*`
  },
  {
    id: "faq-22",
    title: "How to resolve a negative PayPal balance",
    category: "account_limitations",
    tags: ["negative balance", "owed balance", "deficit", "chargeback deficit", "restore balance"],
    content: `If your PayPal balance becomes negative:
1. This can happen if a buyer wins a claim or chargeback after you withdrew funds, or if an ACH deposit failed.
2. Future incoming payments are automatically applied toward the negative deficit.
3. You can clear the balance immediately by clicking "Resolve Negative Balance" in Wallet and paying with a linked debit card or bank.

*Notice: This is a demo article for educational/support simulation purposes and does not represent official PayPal policy.*`
  },
  {
    id: "faq-23",
    title: "Updating expired credit or debit cards in your Wallet",
    category: "linking_bank_card",
    tags: ["update card", "expired card", "expiration date", "new card"],
    content: `To update card expiration or billing details:
1. Go to Wallet and click on the card you wish to update.
2. Click "Update Card".
3. Enter the new expiration date and CVV/security code, then click "Save".
4. If your card number has changed, remove the old card and link the new card as a fresh payment method.

*Notice: This is a demo article for educational/support simulation purposes and does not represent official PayPal policy.*`
  },
  {
    id: "faq-24",
    title: "How to download PayPal account statements and 1099-K tax documents",
    category: "fees",
    tags: ["statements", "1099k", "taxes", "reports", "transaction history statement"],
    content: `Accessing statements and tax forms:
1. Go to Activity > Statements > "Custom" or "Standard Monthly Statement".
2. Select your desired date range and download in PDF or CSV format.
3. US accounts meeting IRS reporting thresholds can download Form 1099-K under Activity > Statements > Tax Documents.

*Notice: This is a demo article for educational/support simulation purposes and does not represent official PayPal policy.*`
  },
  {
    id: "faq-25",
    title: "How to permanently close a PayPal account",
    category: "account_limitations",
    tags: ["close account", "delete account", "cancel paypal", "terminate account"],
    content: `Steps before closing your account:
1. Withdraw any remaining positive balance to your bank account.
2. Resolve any pending disputes, claims, or negative balances.
3. Cancel all active subscriptions and billing agreements in Settings > Payments.
4. Go to Settings (gear icon) > Account > "Close your account" at the bottom of the page. Once closed, an account cannot be reopened.

*Notice: This is a demo article for educational/support simulation purposes and does not represent official PayPal policy.*`
  },
  {
    id: "faq-26",
    title: "Payment statuses explained: Pending vs On Hold vs Completed vs Reversed",
    category: "pending_payments",
    tags: ["payment status", "glossary", "on hold", "pending", "reversed", "completed"],
    content: `Guide to PayPal transaction statuses:
- Pending: Funds are clearing through the payment gateway or bank ACH network.
- On Hold: Funds were received but are temporarily held for risk review or seller delivery confirmation.
- Completed: Payment was successfully captured and delivered to the recipient.
- Reversed / Refunded: Funds were returned to the original payment source.

*Notice: This is a demo article for educational/support simulation purposes and does not represent official PayPal policy.*`
  },
  {
    id: "faq-27",
    title: "Paying official PayPal invoices and money requests safely",
    category: "send_money",
    tags: ["pay invoice", "money request", "invoice safety", "seller invoice"],
    content: `When paying an invoice:
1. Verify the seller name, item description, and total amount before submitting payment.
2. Paying official PayPal invoices using your PayPal balance or linked card is covered by Buyer Protection for eligible goods.
3. Never accept an invoice asking you to pay via wire transfer, cryptocurrency, or gift cards.

*Notice: This is a demo article for educational/support simulation purposes and does not represent official PayPal policy.*`
  },
  {
    id: "faq-28",
    title: "How to update your primary email address, phone number, and mailing address",
    category: "linking_bank_card",
    tags: ["change email", "update phone", "change address", "profile settings"],
    content: `Updating personal account information:
1. Click Settings (gear icon) on the top right.
2. To update email: click "+" next to Email to add a new address, confirm via email link, and click "Make Primary".
3. To update phone or address: click "Edit" next to the respective field and verify changes with SMS code verification.

*Notice: This is a demo article for educational/support simulation purposes and does not represent official PayPal policy.*`
  },
  {
    id: "faq-29",
    title: "PayPal Buyer Protection: Coverage scope, criteria, and exclusions",
    category: "disputes",
    tags: ["buyer protection", "purchase protection", "item not received", "significantly not as described"],
    content: `PayPal Buyer Protection covers buyers if:
1. An item purchased online was not received by the estimated delivery date.
2. The item received is significantly different from what the seller described.
3. Eligible purchases paid in full with PayPal are covered for the full purchase price plus original shipping costs.
4. Exclusions include vehicles, industrial machinery, real estate, and payments sent using Friends and Family.

*Notice: This is a demo article for educational/support simulation purposes and does not represent official PayPal policy.*`
  },
  {
    id: "faq-30",
    title: "How PayPal Assist AI escalates to human voice support",
    category: "contact_support",
    tags: ["escalation", "human support", "voice call", "callback", "support escalation"],
    content: `PayPal Assist AI escalation protocol:
1. PayPal Assist AI resolves common questions about transactions, holds, fees, and procedures.
2. Human support callback is offered if: the assistant cannot resolve the issue, the customer expresses dissatisfaction, or high fraud risk is detected.
3. When escalating, the assistant generates an automated handoff case summary and allows users to schedule a phone callback without repeating themselves.

*Notice: This is a demo article for educational/support simulation purposes and does not represent official PayPal policy.*`
  }
];

// Write individual markdown files to knowledge_base directory
export function syncMarkdownKnowledgeBase() {
  FAQ_ARTICLES.forEach(art => {
    const filename = `${art.id}-${art.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 45)}.md`;
    const filePath = path.join(KB_DIR, filename);
    const mdContent = `---
id: "${art.id}"
title: "${art.title}"
category: "${art.category}"
tags: [${art.tags.map(t => `"${t}"`).join(', ')}]
---

# ${art.title}

${art.content}
`;
    fs.writeFileSync(filePath, mdContent, 'utf-8');
  });
  console.log(`✅ Synced ${FAQ_ARTICLES.length} FAQ markdown articles into /knowledge_base`);
}

// In-memory BM25-inspired retrieval with exact token boundary matching
export function searchKnowledgeBase(query, topK = 3) {
  if (!query || typeof query !== 'string') return [];
  const normalizedQuery = query.toLowerCase();

  const stopWords = new Set([
    'what', 'when', 'where', 'which', 'who', 'whom', 'this', 'that', 'with', 
    'from', 'have', 'your', 'about', 'will', 'into', 'does', 'find', 'make', 
    'right', 'should', 'here', 'there', 'some', 'someone', 'somebody', 'please', 
    'tell', 'could', 'would', 'give', 'know', 'received', 'claiming', 'can', 'you',
    'for', 'how', 'why', 'are', 'was', 'the', 'and', 'but'
  ]);
  const queryTokens = normalizedQuery
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !stopWords.has(t));

  if (queryTokens.length === 0) return [];

  const scored = FAQ_ARTICLES.map(article => {
    let score = 0;
    const titleWords = new Set(article.title.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/));
    const tagWords = new Set(article.tags.flatMap(t => t.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/)));
    const contentLower = article.content.toLowerCase();

    // Exact phrase match bonus
    if (article.title.toLowerCase().includes(normalizedQuery)) score += 40;
    if (contentLower.includes(normalizedQuery)) score += 15;

    // Exact token matching against title & tags words
    queryTokens.forEach(token => {
      if (tagWords.has(token)) score += 15;
      if (titleWords.has(token)) score += 12;
      if (contentLower.includes(token)) score += 1;
    });

    return { article, score };
  });

  return scored
    .filter(item => item.score >= 12)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(item => ({
      id: item.article.id,
      title: item.article.title,
      category: item.article.category,
      snippet: item.article.content.slice(0, 240) + '...',
      fullContent: item.article.content,
      score: item.score
    }));
}
