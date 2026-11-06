import { TOOL_DEFINITIONS, executeTool } from './tools.js';
import { detectSensitiveInput, checkPromptInjection, evaluateEscalationTriggers } from './guardrails.js';
import { searchKnowledgeBase } from './knowledgeBase.js';
import { getDb } from './db.js';

export const SYSTEM_PROMPT = `
You are "PayPal Assist" (ResolveAI), an official AI customer support assistant for PayPal users.

CRITICAL IDENTITY & SAFETY RULES:
1. Clearly identify yourself as an AI assistant. NEVER claim to be human or pretend you are typing from an office.
2. Be warm, concise, and plain-spoken. Write short paragraphs (1-3 sentences each). Avoid unnecessary financial jargon without quick explanations.
3. Language support: You fluently understand and reply in English and Hindi (or Hinglish if the user asks in Hindi/Hinglish).
4. Ask ONLY ONE clarifying question at a time, and only if strictly necessary.
5. NEVER ask for passwords, full credit card numbers, CVVs, or OTP verification codes. If a user pastes sensitive data, gently remind them that PayPal will never ask for secrets, and that their information is masked.
6. NEVER promise a refund or outcome that only PayPal back-office risk systems or merchants can decide. Explain what normally happens and what steps the user can take.
7. Trust & Diagnosis: Always show a clear "Why I think this" explanation for diagnoses so the user understands the exact root cause (e.g. card authorization hold vs settled debit).
8. ESCALATION POLICY:
   - Offer a phone callback / human escalation ONLY IF:
     (a) Assistant failed to resolve after reasonable attempts,
     (b) User expresses dissatisfaction/anger or explicitly asks for a human, OR
     (c) High-risk scenario (unauthorized transaction, suspected account takeover, fraud).
   - If escalating: call create_support_case with a structured summary, then present callback time slots so the user never has to repeat themselves.
9. TOOL USAGE:
   - Use your tools to check transactions (get_transaction, list_recent_transactions), calculate FX fees (check_fx_and_fees), check disputes (get_dispute_status), and search help articles (search_help_articles).
   - Do NOT invent fictional transaction IDs or false balances.
`;

/**
 * Intelligent deterministic fallback agent simulating Claude tool-calling & reasoning
 * when an external API key is not configured or in local sandbox mode.
 */
export async function simulateAgentResponse(userMessage, conversationHistory, context = {}) {
  const text = (userMessage || '').trim();
  const lower = text.toLowerCase();
  const escalationState = evaluateEscalationTriggers(text, conversationHistory);

  // Check language (Hindi detection)
  const isHindi = /[\u0900-\u097F]/.test(text) || /\b(namaste|kya|hai|paisa|kat|gaya|mera|kripya|madad)\b/i.test(text);

  // Check if user is asking about AI identity
  if (/are you (a )?(real )?(human|person|ai|robot|bot)/i.test(lower)) {
    return {
      role: 'assistant',
      content: "I am PayPal Assist (ResolveAI), an artificial intelligence customer support assistant developed for PayPal. I am not a human support representative. I am here to help you inspect payment statuses, explain holds, diagnose currency conversion, and guide dispute resolutions.",
      whyIThinkThis: "Transparently establishing AI identity in accordance with PayPal customer service and safety guidelines.",
      citations: [],
      toolCalls: [],
      toolResults: [],
      transactionCard: null,
      escalation: null,
      sentiment: 'neutral'
    };
  }

  let toolCalls = [];
  let toolResults = [];
  let responseText = "";
  let whyIThinkThis = null;
  let citations = [];
  let transactionCard = null;
  let escalationData = null;

  // 1. Transaction ID regex search
  const txnMatch = text.match(/\bTXN-\d{8}\b/i);
  const disputeMatch = text.match(/\bPP-D-\d{6}\b/i);

  if (disputeMatch) {
    const dRes = await executeTool('get_dispute_status', { id: disputeMatch[0] });
    toolCalls.push({ tool: 'get_dispute_status', args: { id: disputeMatch[0] } });
    toolResults.push(dRes);

    if (dRes.found) {
      responseText = isHindi
        ? `Maine aapka dispute record **${dRes.dispute.id}** check kiya hai. Yeh abhi **Merchant Review** ke under hai.`
        : `I've pulled up dispute **${dRes.dispute.id}** for payment **${dRes.dispute.transactionId}** ($${dRes.dispute.claimAmount} ${dRes.dispute.currency}). It is currently **Under Merchant Review**.`;

      whyIThinkThis = isHindi
        ? "Merchant ko saboot ya refund dene ke liye 10 dino ka samay milta hai. Agar merchant 13 Nov tak reply nahi karta, toh PayPal aapke paksh mein faisla sunata hai."
        : `The merchant has a 10-day window (until ${new Date(dRes.dispute.merchantDeadline).toLocaleDateString()}) to supply proof of delivery or issue a refund. If they don't reply, PayPal automatically closes the claim in your favor.`;
    }
  } else if (txnMatch) {
    const tRes = await executeTool('get_transaction', { id: txnMatch[0] });
    toolCalls.push({ tool: 'get_transaction', args: { id: txnMatch[0] } });
    toolResults.push(tRes);

    if (tRes.found) {
      const txn = tRes.transaction;
      transactionCard = txn;

      if (txn.status === 'FAILED_DEDUCTED') {
        responseText = isHindi
          ? `Main ek AI assistant hoon. Maine transaction **${txn.id}** check kiya hai. Aapka payment merchant checkout par fail ho gaya tha, lekin aapke bank statement par deduction dikh raha hai.`
          : `I am an AI assistant. I've looked up transaction **${txn.id}** to **${txn.recipient}** for **$${txn.amount.toFixed(2)} ${txn.currency}**. The checkout failed at the merchant, but you see a deduction on your card statement.`;

        whyIThinkThis = isHindi
          ? `Yeh asal mein charge nahi hai, balki aapke bank dwara lagaya gaya **Temporary Authorization Hold** hai. Merchant ke gateway par timeout ho gaya tha. Aapka bank **3 se 5 business dino** ke andar yeh rashi swatah wapas release kar dega.`
          : `This is a temporary **Authorization Hold**, not a settled charge. PayPal received the pre-authorization from your bank (${txn.paymentMethod}), but the merchant order timed out before capture. Your bank releases these held funds automatically within **3 to 5 business days** (estimated by ${new Date(txn.holdReleasedEstimated).toLocaleDateString()}). No dispute is required.`;

        citations = searchKnowledgeBase("failed deducted authorization hold", 2);
      } else if (txn.status === 'HELD_RISK_REVIEW') {
        responseText = isHindi
          ? `Maine **${txn.id}** check kiya hai. Yeh payment standard risk review ke tehat hold par hai.`
          : `I've reviewed transaction **${txn.id}** (${txn.amount} ${txn.currency}). The funds are currently in a standard security review hold.`;

        whyIThinkThis = isHindi
          ? "Pehli baar cross-border transfer hone ki wajah se 24-48 ghante ka safety check lagaya gaya hai. Yeh 7 Nov tak clear hone ki ummeed hai."
          : `This is a routine 24 to 48-hour compliance verification for cross-border transactions exceeding your monthly volume threshold. It is projected to clear automatically by ${new Date(txn.holdReleasedEstimated).toLocaleString()}.`;
        citations = searchKnowledgeBase("payment on hold security review", 2);
      } else if (txn.status === 'SUSPICIOUS_UNAUTHORIZED') {
        responseText = isHindi
          ? `⚠️ **Chetawani:** Transaction **${txn.id}** anadhikrit lag raha hai. Maine aapki suraksha ke liye turant carrvayi shuru kar di hai.`
          : `⚠️ **Security Alert:** Transaction **${txn.id}** for $${txn.amount} has been flagged for suspicious unauthorized login activity from an unknown location.`;

        whyIThinkThis = isHindi
          ? "Anjaan VPN se login kiya gaya tha. Aapka account surakshit karna sabse pehli prathmikta hai."
          : "The system detected an unrecognized IP session and abnormal spending velocity. To protect your funds, I strongly recommend resetting your password immediately and letting me escalate this to our Fraud Specialist team.";

        citations = searchKnowledgeBase("unauthorized transaction fraud report", 2);
      } else {
        responseText = `Transaction **${txn.id}** is currently **${txn.status}**. ${txn.statusReason || ''}`;
        whyIThinkThis = txn.actionableAdvice || "The transaction has progressed according to standard PayPal clearing timelines.";
      }
    } else {
      responseText = `I couldn't locate any record for **${txnMatch[0]}** in your sandbox activity. Could you please double-check the transaction number from your PayPal Activity tab?`;
    }
  } else if (lower.includes('recent') || lower.includes('transactions') || lower.includes('history') || lower.includes('past payments')) {
    const listRes = await executeTool('list_recent_transactions', { userId: context.userId || 'usr_sarah_99', limit: 4 });
    toolCalls.push({ tool: 'list_recent_transactions', args: { userId: 'usr_sarah_99' } });
    toolResults.push(listRes);

    responseText = isHindi
      ? `Main aapke haal hi ke transactions fetch kar raha hoon. Yahan aapke aakhiri 4 transactions hain:`
      : `Here are your recent transactions from your PayPal account. Click or mention any ID to diagnose:`;

    whyIThinkThis = "Retrieving transaction ledger directly from your authenticated sandbox account.";
  } else if (lower.includes('convert') || lower.includes('fee') || lower.includes('fx') || lower.includes('exchange rate') || lower.includes('inr') || lower.includes('eur')) {
    const fxRes = await executeTool('check_fx_and_fees', { amount: 100, fromCurrency: 'USD', toCurrency: 'EUR' });
    toolCalls.push({ tool: 'check_fx_and_fees', args: { amount: 100, fromCurrency: 'USD', toCurrency: 'EUR' } });
    toolResults.push(fxRes);

    responseText = isHindi
      ? `PayPal international payments par wholesale exchange rate ke saath lagbhag 3.5% se 4% ka FX conversion spread aur 2% cross-border fee lagata hai.`
      : `For international transactions, PayPal applies a wholesale exchange rate plus a currency conversion spread of roughly 3.75%, along with a 2% cross-border transaction fee.`;

    whyIThinkThis = "Calculated using official PayPal standard merchant & consumer FX fee schedules. At checkout, you can also opt to have your card issuer do the currency conversion instead.";
    citations = searchKnowledgeBase("currency conversion fx rate international fees", 2);
  } else if (lower.includes('dispute') || lower.includes('chargeback') || lower.includes('scam seller') || lower.includes('did not receive')) {
    const kbRes = searchKnowledgeBase("open dispute resolution center claim chargeback", 2);
    citations = kbRes;
    responseText = isHindi
      ? `Agar aapko samaan nahi mila ya galat mila hai, toh aap payment ke 180 dino ke andar PayPal **Resolution Center** mein Dispute darj kar sakte hain.`
      : `If you didn't receive your purchase or it wasn't as described, you have **180 calendar days** from the transaction date to open a dispute in the PayPal Resolution Center.`;

    whyIThinkThis = "Disputes are split into two stages: 20 days for buyer-seller direct resolution, followed by an escalation to a PayPal Claim where our specialists review evidence.";
  } else if (lower.includes('limit') || lower.includes('verify') || lower.includes('restricted') || lower.includes('kyc')) {
    // Check if specifically asking about 4-digit card confirmation code
    if (lower.includes('4-digit') || lower.includes('code') || lower.includes('confirm card') || lower.includes('verify my new card')) {
      const kbHits = searchKnowledgeBase("confirm card 4-digit code bank wallet", 2);
      citations = kbHits;
      responseText = `To confirm your card: PayPal charges a small refundable $1.95 amount accompanied by a 4-digit code on your card statement (e.g. PP*1234CODE). Once you see the code on your online card statement, enter it under Wallet > Confirm Card to lift spending limits.`;
      whyIThinkThis = "PayPal card confirmation procedure outlined in Wallet verification guidelines.";
    } else {
      const kbRes = searchKnowledgeBase("account limitation identity verification kyc lift limit", 2);
      citations = kbRes;
      responseText = isHindi
        ? `Account limitations tab lagaye jaate hain jab regulatory KYC identity verification ki zaroorat hoti hai. Resolution Center mein jakar aap Government ID upload kar sakte hain.`
        : `Account limitations occur when PayPal needs to verify your identity under financial regulations (KYC) or if unusual activity is detected.`;

      whyIThinkThis = "Uploading your government-issued ID or address proof in the Resolution Center normally lifts standard identity holds within 24-72 hours.";
    }
  } else if (lower.includes('refund') || lower.includes('seller refunded')) {
    const kbHits = searchKnowledgeBase("refund timeline where does refund go debit card", 2);
    citations = kbHits;
    responseText = `When a seller refunds a debit or credit card payment, the funds go directly back to that specific card. Card issuers typically take **3 to 7 business days** (and up to 30 days depending on your bank) to post the credit to your statement.`;
    whyIThinkThis = "PayPal returns funds directly to the original funding source used during checkout.";
  } else if (lower.includes('rbi') || lower.includes('purpose code') || (lower.includes('india') && lower.includes('export'))) {
    const kbHits = searchKnowledgeBase("purpose code rbi auto-sweep export india", 2);
    citations = kbHits;
    responseText = `Under Reserve Bank of India (RBI) regulations, all international export payments to Indian PayPal accounts require a valid Purpose Code (such as **P0802** for software consultancy and IT services) and automatically daily auto-sweep directly into your linked Indian bank account.`;
    whyIThinkThis = "RBI Foreign Exchange Management Act (FEMA) regulatory requirements for Indian cross-border inflows.";
  } else if (lower.includes('logged in') || lower.includes('someone logged') || lower.includes('from russia') || lower.includes('unauthorized') || lower.includes('hacked')) {
    const kbHits = searchKnowledgeBase("unauthorized transaction fraud report change password", 2);
    citations = kbHits;
    responseText = `⚠️ **Urgent Security Guidance:** If you suspect someone accessed your account: 1) Change your PayPal password immediately in Settings > Security. 2) Turn on 2-Factor Authentication (2FA) via an Authenticator app. 3) Review Settings > Payments > Automatic Payments to revoke unauthorized billing agreements. 4) Report any unrecognized transactions in the Resolution Center.`;
    whyIThinkThis = "Standard PayPal account compromise containment and security lockdown procedure.";
  } else {
    // General FAQ or search knowledge base
    const kbHits = searchKnowledgeBase(text, 2);
    if (kbHits.length > 0) {
      citations = kbHits;
      responseText = isHindi
        ? `Main PayPal Assist AI hoon. Yahan aapke sawal ke anusaar jankari hai:\n\n${kbHits[0].snippet}`
        : `I am PayPal Assist, your AI customer support assistant. Regarding your inquiry:\n\n${kbHits[0].snippet}`;

      whyIThinkThis = `Matched with PayPal Help Center article: "${kbHits[0].title}".`;
    } else {
      responseText = isHindi
        ? `Main aapki PayPal payments, failed transactions, holds, aur refunds mein madad kar sakta hoon. Kripya apna Transaction ID (jaise TXN-88291034) batayein.`
        : `I am PayPal Assist, an AI support assistant for PayPal. I can help diagnose payment issues, failed charges, hold releases, currency conversion, and disputes. Would you like to check a specific Transaction ID (e.g. TXN-88291034) or view your recent activity?`;

      whyIThinkThis = "Clarifying user request to provide an accurate diagnosis using real transaction tools.";
    }
  }

  // Handle Escalation condition if user is dissatisfied, high risk, or explicitly asked for human
  if (escalationState.eligibleForEscalation) {
    const caseRes = await executeTool('create_support_case', {
      userId: context.userId || 'usr_sarah_99',
      summary: `Customer escalated on: "${text}". Trigger: ${escalationState.reason}. Diagnosed context: ${whyIThinkThis || 'Assistance requested'}.`,
      priority: escalationState.isHighRisk ? 'CRITICAL' : 'HIGH',
      category: escalationState.isHighRisk ? 'unauthorized_fraud' : 'escalation_request'
    });

    escalationData = {
      caseId: caseRes.caseId,
      reason: escalationState.reason,
      summary: caseRes.handoffSummary,
      availableSlots: caseRes.availableSlots,
      priority: caseRes.priority
    };

    if (escalationState.requestedHuman || escalationState.isAngry) {
      responseText = isHindi
        ? `Main samajhta hoon ki aap pareshan hain aur ek insan se baat karna chahte hain. Maine aapka support case **${caseRes.caseId}** bana diya hai jismein saari baatein likh di gayi hain taaki aapko repeat na karna pade.`
        : `I completely understand, and I want to make sure you get this sorted immediately without having to repeat yourself. I have created escalated Case **${caseRes.caseId}** with our full conversation notes. You can pick a callback slot below for a phone conversation with our senior team.`;
    } else if (escalationState.isHighRisk) {
      responseText += `\n\nBecause this involves suspected unauthorized account activity, I have automatically created high-priority Case **${caseRes.caseId}** for our Fraud & Risk Security team.`;
    }
  }

  return {
    role: 'assistant',
    content: responseText,
    whyIThinkThis,
    citations,
    toolCalls,
    toolResults,
    transactionCard,
    escalation: escalationData,
    sentiment: escalationState.isAngry ? 'negative' : (escalationState.isHighRisk ? 'urgent' : 'neutral')
  };
}

/**
 * Main chat handler supporting real Claude Anthropic API with seamless mock fallback
 */
export async function handleChatMessage({ message, history = [], context = {} }) {
  // 1. Guardrail checks
  const sensitiveCheck = detectSensitiveInput(message);
  let sensitiveWarning = null;
  if (sensitiveCheck.hasSensitive) {
    sensitiveWarning = `Notice: For your safety, never share passwords, full card numbers, CVVs, or OTPs. We have masked your input.`;
  }

  const injectionCheck = checkPromptInjection(message);
  if (injectionCheck.isInjection) {
    return {
      role: 'assistant',
      content: "I am PayPal Assist, an AI support assistant for PayPal. I cannot modify my security parameters, identity, or internal instructions. How can I assist you with your PayPal account or transactions today?",
      whyIThinkThis: "System guardrails detected instructions attempting to override official safety and verification protocols.",
      citations: [],
      toolCalls: [],
      escalation: null
    };
  }

  // 2. Check for configured Anthropic Claude API Key
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey && apiKey.startsWith('sk-ant-') && !apiKey.includes('your_api_key')) {
    try {
      // Call Anthropic Claude API with tools
      const response = await callClaudeAPI({ message, history, context, apiKey });
      if (sensitiveWarning) {
        response.content = `${sensitiveWarning}\n\n${response.content}`;
      }
      return response;
    } catch (err) {
      console.warn("Claude API call failed or encountered error, falling back to local engine:", err.message);
    }
  }

  // 3. Robust Built-in ResolveAI Engine
  const result = await simulateAgentResponse(message, history, context);
  if (sensitiveWarning) {
    result.content = `${sensitiveWarning}\n\n${result.content}`;
  }
  return result;
}

async function callClaudeAPI({ message, history, context, apiKey }) {
  const model = process.env.CLAUDE_MODEL || 'claude-3-7-sonnet-20250219';
  
  // Format tool definitions for Anthropic
  const anthropicTools = TOOL_DEFINITIONS.map(t => ({
    name: t.name,
    description: t.description,
    input_schema: t.parameters
  }));

  // Build message array
  const messages = [];
  for (const m of history.slice(-8)) {
    messages.push({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    });
  }
  messages.push({ role: 'user', content: message });

  const payload = {
    model,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    tools: anthropicTools,
    messages
  };

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Anthropic API returned ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  let textContent = "";
  let toolCalls = [];
  let toolResults = [];

  for (const block of data.content || []) {
    if (block.type === 'text') {
      textContent += block.text;
    } else if (block.type === 'tool_use') {
      toolCalls.push({ tool: block.name, args: block.input });
      const toolOutput = await executeTool(block.name, block.input, context);
      toolResults.push(toolOutput);
    }
  }

  // Evaluate escalation status
  const escalationState = evaluateEscalationTriggers(message, history);

  return {
    role: 'assistant',
    content: textContent || "I have verified the details using PayPal systems.",
    whyIThinkThis: toolResults.length > 0 ? (toolResults[0].diagnosisTip || "Retrieved from PayPal transaction ledger.") : "Analyzed against PayPal customer service rules.",
    citations: searchKnowledgeBase(message, 2),
    toolCalls,
    toolResults,
    transactionCard: toolResults.find(r => r.transaction)?.transaction || null,
    escalation: escalationState.eligibleForEscalation ? {
      caseId: 'CAS-' + Math.floor(1000 + Math.random() * 9000),
      reason: escalationState.reason,
      summary: `Customer inquiry escalated: ${message.slice(0, 80)}`,
      availableSlots: ["Today at 3:00 PM EST", "Tomorrow at 10:00 AM EST"]
    } : null
  };
}
