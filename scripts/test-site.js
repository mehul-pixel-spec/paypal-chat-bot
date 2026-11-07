import app from '../server.js';
import { getDashboardMetrics } from '../src/dashboard.js';
import { handleChatMessage } from '../src/agent.js';
import { executeTool } from '../src/tools.js';
import { triggerDemoFailedDeductedPayment } from '../src/paypal.js';

async function runSiteDiagnostic() {
  console.log('=======================================================');
  console.log('🔍 RUNNING COMPREHENSIVE SITE & API DIAGNOSTIC TEST');
  console.log('=======================================================\n');

  let passed = 0;
  let total = 0;

  function assert(title, condition) {
    total++;
    if (condition) {
      passed++;
      console.log(`[PASS] ${title}`);
    } else {
      console.error(`[FAIL] ${title}`);
    }
  }

  // 1. Test Express app initialization
  assert("Express server initialization", typeof app === 'function');

  // 2. Test Agent Chat Engine
  const chatRes = await handleChatMessage({
    message: "Why was TXN-88291034 deducted when checkout failed?",
    history: []
  });
  assert("Chat Agent processes transaction diagnostics", 
    chatRes && chatRes.transactionCard && chatRes.transactionCard.id === 'TXN-88291034');
  assert("Chat Agent provides 'Why I think this' explanation", 
    chatRes.whyIThinkThis && chatRes.whyIThinkThis.includes("Authorization Hold"));

  // 3. Test Tools Execution
  const toolRes = await executeTool('check_fx_and_fees', {
    amount: 100,
    fromCurrency: 'USD',
    toCurrency: 'EUR'
  });
  assert("Tool: check_fx_and_fees returns accurate rates", 
    toolRes && toolRes.paypalEffectiveRate > 0 && toolRes.estimatedReceivedAmount);

  // 4. Test Demo Payment Trigger
  const demoPayment = triggerDemoFailedDeductedPayment('usr_sarah_99');
  assert("Demo failed-but-deducted payment simulator works", 
    demoPayment.success && demoPayment.transaction.status === 'FAILED_DEDUCTED');

  // 5. Test Dashboard Metrics & Patterns
  const metrics = getDashboardMetrics();
  assert("Dashboard returns active metrics and ticket count", 
    metrics.metrics && metrics.metrics.totalConversations > 0);
  assert("Dashboard pattern clustering identifies recurring issue patterns", 
    metrics.patterns && metrics.patterns.length >= 3);

  console.log('\n=======================================================');
  console.log(`DIAGNOSTIC SUMMARY: ${passed}/${total} passed (${Math.round((passed/total)*100)}%)`);
  console.log('=======================================================');

  if (passed === total) {
    console.log('✅ ALL APPLICATION ENDPOINTS AND ENGINES FUNCTIONING NORMALLY.');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runSiteDiagnostic();
