// PII Regex Patterns
const CARD_REGEX = /\b(?:\d[ -]*?){13,16}\b/g;
const CVV_REGEX = /\b\d{3,4}\b(?=.*(?:cvv|cvc|security code))/gi;
const OTP_REGEX = /\b\d{6}\b(?=.*(?:otp|verification|passcode|code))/gi;
const PASSWORD_REGEX = /(?:password|pwd|pass)\s*[:=]\s*([^\s,;]+)/gi;
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g;

/**
 * Detects if the text contains high-risk sensitive data (passwords, CVV, OTP, full card numbers)
 */
export function detectSensitiveInput(text) {
  if (!text || typeof text !== 'string') return { hasSensitive: false };

  const reasons = [];

  // 13-16 digits card match check (ignoring transaction ids like TXN-12345678)
  const plainDigits = text.replace(/TXN-\d+/gi, '').match(/\b\d{13,19}\b/);
  if (plainDigits) {
    reasons.push("credit/debit card number");
  }

  if (/(?:cvv|cvc|security code)\s*[:=]?\s*\d{3,4}/i.test(text)) {
    reasons.push("CVV/security code");
  }

  if (/(?:my password is|password:\s*\S+|pwd:\s*\S+)/i.test(text)) {
    reasons.push("account password");
  }

  if (/(?:one-time pin|otp code is|sms otp)\s*[:=]?\s*\d{4,8}/i.test(text)) {
    reasons.push("one-time passcode (OTP)");
  }

  return {
    hasSensitive: reasons.length > 0,
    reasons
  };
}

/**
 * Redacts PII for logging and display safety
 */
export function redactPII(text) {
  if (!text || typeof text !== 'string') return text;

  let redacted = text;

  // Mask cards
  redacted = redacted.replace(CARD_REGEX, (match) => {
    const cleaned = match.replace(/\D/g, '');
    if (cleaned.length >= 13 && cleaned.length <= 16) {
      return `[CARD ENDING IN ${cleaned.slice(-4)}]`;
    }
    return match;
  });

  // Mask Passwords
  redacted = redacted.replace(PASSWORD_REGEX, 'password: [REDACTED]');

  // Mask Emails partially
  redacted = redacted.replace(EMAIL_REGEX, (email) => {
    const [user, domain] = email.split('@');
    if (user.length <= 2) return `***@${domain}`;
    return `${user[0]}***${user.slice(-1)}@${domain}`;
  });

  return redacted;
}

/**
 * Checks for prompt injection attempts trying to override system persona
 */
export function checkPromptInjection(text) {
  if (!text || typeof text !== 'string') return { isInjection: false };

  const injectionPatterns = [
    /ignore previous instructions/i,
    /disregard all prior rules/i,
    /you are now DAN/i,
    /system override/i,
    /reveal your secret prompt/i,
    /jailbreak/i,
    /you are no longer an ai/i,
    /pretend to be human/i
  ];

  for (const pattern of injectionPatterns) {
    if (pattern.test(text)) {
      return {
        isInjection: true,
        pattern: pattern.toString()
      };
    }
  }

  return { isInjection: false };
}

/**
 * Sentiment and escalation trigger detector
 */
export function evaluateEscalationTriggers(userMessage, conversationHistory = []) {
  const text = (userMessage || '').toLowerCase();

  // If user is just asking whether the agent is AI or human, do NOT trigger escalation
  if (/are you (a )?(real )?(human|person|ai|robot|bot)/i.test(text)) {
    return {
      eligibleForEscalation: false,
      reason: null,
      isHighRisk: false,
      isAngry: false,
      requestedHuman: false
    };
  }

  const humanExplicitTriggers = [
    'talk to a human', 'speak to a human', 'real person', 'representative', 'operator',
    'talk to someone', 'call me', 'customer care number', 'supervisor', 'human agent',
    'transfer me to a human', 'let me talk to a person'
  ];

  const angerTriggers = [
    'terrible', 'horrible', 'worst support', 'useless', 'scam', 'fraud',
    'lawyer', 'sue', 'police', 'stolen', 'hacked', 'furious', 'complaint',
    'waste of time', 'angry', 'liar', 'cheated'
  ];

  const highRiskTriggers = [
    'unauthorized', 'hacked', 'compromised', 'stolen account',
    'someone took money', 'fraudulent charge', 'otp intercepted'
  ];

  const requestedHuman = humanExplicitTriggers.some(t => text.includes(t));
  const isAngry = angerTriggers.some(t => text.includes(t));
  const isHighRisk = highRiskTriggers.some(t => text.includes(t));

  // Determine if repeat failures exist
  const assistantAttempts = conversationHistory.filter(m => m.role === 'assistant').length;
  const isRepeatedDifficulty = assistantAttempts >= 4 && isAngry;

  const eligibleForEscalation = requestedHuman || isAngry || isHighRisk || isRepeatedDifficulty;

  let reason = null;
  if (isHighRisk) reason = "High-risk security or fraud indicators detected";
  else if (requestedHuman) reason = "Direct customer request for a human support agent";
  else if (isAngry) reason = "Customer frustration / dissatisfaction detected";
  else if (isRepeatedDifficulty) reason = "Issue unresolved after multiple assistant turns";

  return {
    eligibleForEscalation,
    reason,
    isHighRisk,
    isAngry,
    requestedHuman
  };
}
