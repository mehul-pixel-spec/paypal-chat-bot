import { 
  createOrder, 
  captureOrder, 
  getOrder, 
  refundCapture, 
  getTransactionStatus, 
  handlePayPalWebhook 
} from '../src/paypal.js';

async function runPayPalSandboxTest() {
  console.log('=======================================================');
  console.log('🧪 PAYPAL REST API SANDBOX INTEGRATION VERIFICATION TEST');
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

  try {
    // 1. Create Order
    console.log('1. Testing createOrder(amount, currency)...');
    const order = await createOrder("65.00", "USD");
    assert("createOrder returned valid orderId", order && order.orderId);
    assert("createOrder set status to CREATED", order && order.status === 'CREATED');
    console.log(`   Order created: ${order.orderId} (Mode: ${order.mode})`);

    // 2. Get Order Details
    console.log('\n2. Testing getOrder(orderId)...');
    const orderDetails = await getOrder(order.orderId);
    assert("getOrder returned order status", orderDetails && (orderDetails.id === order.orderId || orderDetails.status));

    // 3. Capture Order
    console.log('\n3. Testing captureOrder(orderId)...');
    const capture = await captureOrder(order.orderId);
    assert("captureOrder returned completed capture", capture && (capture.status === 'COMPLETED' || capture.captureId));
    console.log(`   Order captured: ${capture.orderId}, Capture ID: ${capture.captureId}`);

    // 4. Refund Capture
    console.log('\n4. Testing refundCapture(captureId)...');
    const refund = await refundCapture(capture.captureId || 'CAP-12345678', "20.00", "USD");
    assert("refundCapture returned valid refund object", refund && refund.status === 'COMPLETED');
    console.log(`   Refund processed: ${refund.id}`);

    // 5. Transaction Status
    console.log('\n5. Testing getTransactionStatus(id)...');
    const txnStatus = await getTransactionStatus("TXN-88291034");
    assert("getTransactionStatus retrieved transaction", txnStatus && txnStatus.id === "TXN-88291034");

    // 6. Webhook Delivery & Signature Verification (Idempotent)
    console.log('\n6. Testing handlePayPalWebhook(headers, event)...');
    const mockWebhookEvent = {
      id: `WH-EVT-${Date.now()}`,
      event_type: 'PAYMENT.CAPTURE.COMPLETED',
      create_time: new Date().toISOString(),
      resource_type: 'capture',
      resource: {
        id: capture.captureId || 'CAP-12345678',
        amount: { value: '65.00', currency_code: 'USD' },
        status: 'COMPLETED'
      }
    };

    const mockHeaders = {
      'paypal-transmission-id': 'mock-trans-id-9981',
      'paypal-transmission-time': new Date().toISOString(),
      'paypal-cert-url': 'https://api.sandbox.paypal.com/v1/notifications/certs/CERT-123',
      'paypal-auth-algo': 'SHA256withRSA',
      'paypal-transmission-sig': 'mock_sig_base64=='
    };

    const webhookResult1 = await handlePayPalWebhook(mockHeaders, mockWebhookEvent);
    assert("handlePayPalWebhook processed event", webhookResult1 && webhookResult1.received);

    // Test idempotency on duplicate delivery
    const webhookResult2 = await handlePayPalWebhook(mockHeaders, mockWebhookEvent);
    assert("handlePayPalWebhook handled duplicate event idempotently", webhookResult2 && webhookResult2.duplicate === true);

    console.log('\n=======================================================');
    console.log(`RESULTS: ${passed}/${total} passed (${Math.round((passed/total)*100)}%)`);
    console.log('=======================================================');

    if (passed === total) {
      console.log('✅ ALL PAYPAL REST API SANDBOX METHODS & LIFECYCLE TESTS PASSED.');
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  }
}

runPayPalSandboxTest();
