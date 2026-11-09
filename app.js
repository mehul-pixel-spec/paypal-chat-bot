// Client State
let currentView = 'chat';
let chatHistory = [];
let pendingCallbackCaseId = null;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  fetchDashboardMetrics();
});

function switchView(viewName) {
  currentView = viewName;

  document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

  if (viewName === 'chat') {
    document.getElementById('view-chat').classList.add('active');
    document.getElementById('nav-chat-btn').classList.add('active');
    document.getElementById('page-title-text').innerText = 'Payment Assistance Chat';
  } else {
    document.getElementById('view-dashboard').classList.add('active');
    document.getElementById('nav-dash-btn').classList.add('active');
    document.getElementById('page-title-text').innerText = 'Support Team Insights & Pattern Analysis';
    fetchDashboardMetrics();
  }
}

// Chat functions
function handleInputKey(event) {
  if (event.key === 'Enter') {
    sendMessage();
  }
}

function sendQuickPrompt(promptText) {
  const input = document.getElementById('chat-input-field');
  input.value = promptText;
  sendMessage();
}

async function sendMessage() {
  const input = document.getElementById('chat-input-field');
  const text = (input.value || '').trim();
  if (!text) return;

  // Append User Bubble
  appendMessage({ role: 'user', content: text });
  input.value = '';

  // Show loading indicator
  const loadingId = appendLoadingBubble();

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        history: chatHistory.slice(-6),
        context: { userId: 'usr_sarah_99' }
      })
    });

    const data = await res.json();
    removeLoadingBubble(loadingId);

    // Append AI Response
    appendMessage(data);

    // Save to local session memory
    chatHistory.push({ role: 'user', content: text });
    chatHistory.push({ role: 'assistant', content: data.content });

  } catch (err) {
    removeLoadingBubble(loadingId);
    appendMessage({
      role: 'assistant',
      content: 'I encountered a temporary connection issue reaching the PayPal backend. Please try again in a moment.'
    });
  }
}

function appendMessage(msg) {
  const container = document.getElementById('chat-messages-container');
  const row = document.createElement('div');
  row.className = `message-row ${msg.role === 'user' ? 'user' : 'ai'}`;

  const avatar = document.createElement('div');
  avatar.className = `avatar ${msg.role === 'user' ? 'user' : 'ai'}`;
  avatar.innerText = msg.role === 'user' ? 'SM' : 'AI';
  row.appendChild(avatar);

  const bubble = document.createElement('div');
  bubble.className = 'bubble';

  // Format markdown bold & lines
  let formatted = (msg.content || '')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');

  bubble.innerHTML = formatted;

  // If "Why I think this" explanation exists
  if (msg.whyIThinkThis) {
    const whyDiv = document.createElement('div');
    whyDiv.className = 'why-box';
    whyDiv.innerHTML = `
      <div class="why-header">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
        Why I think this
      </div>
      <div>${msg.whyIThinkThis}</div>
    `;
    bubble.appendChild(whyDiv);
  }

  // If Transaction Card returned
  if (msg.transactionCard) {
    const txn = msg.transactionCard;
    const cardDiv = document.createElement('div');
    cardDiv.className = 'inline-card';
    
    const badgeClass = txn.status === 'FAILED_DEDUCTED' ? 'status-failed-deducted' 
      : txn.status === 'HELD_RISK_REVIEW' ? 'status-held' : 'status-suspicious';

    cardDiv.innerHTML = `
      <div class="card-top">
        <span class="txn-id">${txn.id}</span>
        <span class="txn-status-badge ${badgeClass}">${txn.status.replace(/_/g, ' ')}</span>
      </div>
      <div class="card-details-grid">
        <div><span class="detail-label">Recipient:</span> <span class="detail-val">${txn.recipient}</span></div>
        <div><span class="detail-label">Amount:</span> <span class="detail-val">$${txn.amount.toFixed(2)} ${txn.currency}</span></div>
        <div><span class="detail-label">Method:</span> <span class="detail-val">${txn.paymentMethod}</span></div>
        <div><span class="detail-label">Date:</span> <span class="detail-val">${new Date(txn.date).toLocaleDateString()}</span></div>
      </div>
      <div style="font-size: 11px; font-weight: 600; color: #475569; text-transform: uppercase; margin-bottom: 4px;">Status Timeline</div>
      <div class="timeline-track">
        <div class="timeline-step">
          <div class="step-circle done">✓</div>
          <span>Pre-Auth</span>
        </div>
        <div class="timeline-step">
          <div class="step-circle ${txn.status === 'FAILED_DEDUCTED' ? 'failed' : 'done'}">${txn.status === 'FAILED_DEDUCTED' ? '✕' : '✓'}</div>
          <span>Merchant Callback</span>
        </div>
        <div class="timeline-step">
          <div class="step-circle ${txn.status === 'FAILED_DEDUCTED' ? 'current' : 'done'}">⏱</div>
          <span>Hold Auto-Release</span>
        </div>
      </div>
    `;
    bubble.appendChild(cardDiv);
  }

  // Citations Pills
  if (msg.citations && msg.citations.length > 0) {
    const citWrap = document.createElement('div');
    citWrap.className = 'citations-wrapper';
    msg.citations.forEach(cit => {
      const pill = document.createElement('span');
      pill.className = 'citation-pill';
      pill.innerHTML = `📖 ${cit.title}`;
      pill.title = cit.snippet;
      citWrap.appendChild(pill);
    });
    bubble.appendChild(citWrap);
  }

  // Escalation Handoff & Callback Picker
  if (msg.escalation) {
    const esc = msg.escalation;
    pendingCallbackCaseId = esc.caseId;

    const escDiv = document.createElement('div');
    escDiv.className = 'escalation-box';
    escDiv.innerHTML = `
      <div class="escalation-header">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
        Escalated to Human Support (Case ${esc.caseId})
      </div>
      <p style="font-size: 12px; color: #431407; margin-bottom: 8px;">
        <strong>Handoff summary generated:</strong> "${esc.summary}"
      </p>
      <p style="font-size: 11.5px; color: #78350f;">
        You don't need to repeat yourself. Select a callback window below:
      </p>
      <div class="slot-selection-grid">
        ${(esc.availableSlots || ["Today at 3:00 PM EST", "Tomorrow at 10:00 AM EST"]).map(slot => `
          <button class="slot-btn" onclick="openCallbackModal('${esc.caseId}', '${slot}')">📞 ${slot}</button>
        `).join('')}
      </div>
    `;
    bubble.appendChild(escDiv);
  }

  row.appendChild(bubble);
  container.appendChild(row);
  container.scrollTop = container.scrollHeight;
}

function appendLoadingBubble() {
  const container = document.getElementById('chat-messages-container');
  const id = 'loading-' + Date.now();
  const row = document.createElement('div');
  row.className = 'message-row ai';
  row.id = id;
  row.innerHTML = `
    <div class="avatar ai">AI</div>
    <div class="bubble" style="color: #64748b; font-style: italic; display: flex; align-items: center; gap: 8px;">
      Checking PayPal ledger & policies...
    </div>
  `;
  container.appendChild(row);
  container.scrollTop = container.scrollHeight;
  return id;
}

function removeLoadingBubble(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

// Demo buttons
async function triggerDemoPayment() {
  try {
    const res = await fetch('/api/demo/trigger-failed-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'usr_sarah_99' })
    });
    const data = await res.json();
    alert(`⚡ ${data.message}`);
    // Auto populate query
    const input = document.getElementById('chat-input-field');
    input.value = `Why did my transaction ${data.transaction.id} fail but my Visa card was debited $189.99?`;
    if (currentView !== 'chat') switchView('chat');
  } catch (err) {
    alert("Error triggering demo payment: " + err.message);
  }
}

async function createSandboxOrder() {
  try {
    const res = await fetch('/api/paypal/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: "45.00", currency: "USD" })
    });
    const data = await res.json();
    alert(`Order Created in PayPal Developer Sandbox:\nID: ${data.orderId}\nStatus: ${data.status}`);
  } catch (err) {
    alert("Error creating sandbox order: " + err.message);
  }
}

async function resetDatabase() {
  if (!confirm("Reset database to clean seed state?")) return;
  await fetch('/api/db/reset', { method: 'POST' });
  await fetch('/api/dashboard/metrics');
  location.reload();
}

// Callback Modal
function openCallbackModal(caseId, slot) {
  pendingCallbackCaseId = caseId;
  document.getElementById('modal-case-sub').innerText = `Case: ${caseId}`;
  document.getElementById('modal-slot-val').value = slot;
  document.getElementById('callback-modal').style.display = 'flex';
}

function closeCallbackModal() {
  document.getElementById('callback-modal').style.display = 'none';
}

async function confirmCallbackBooking() {
  const slot = document.getElementById('modal-slot-val').value;
  const phone = document.getElementById('modal-phone-val').value;

  try {
    const res = await fetch('/api/callback/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caseId: pendingCallbackCaseId,
        slot,
        phoneNumber: phone
      })
    });

    const data = await res.json();
    closeCallbackModal();
    appendMessage({
      role: 'assistant',
      content: `✅ **Callback Confirmed!**\n\nBooking ID: \`${data.bookingId}\`\nScheduled for: **${data.confirmedSlot}**\n\nA senior PayPal specialist will call **${phone}** with your full case summary loaded. No need to explain your issue again.`
    });
  } catch (e) {
    alert("Failed to confirm callback: " + e.message);
  }
}

// Dashboard Fetching
async function fetchDashboardMetrics() {
  try {
    const res = await fetch('/api/dashboard/metrics');
    const data = await res.json();

    document.getElementById('metric-total').innerText = data.metrics.totalConversations;
    document.getElementById('metric-resolution').innerText = data.metrics.resolutionRate;
    document.getElementById('metric-duration').innerText = data.metrics.avgDurationMinutes;

    // Render Pattern Cards
    const patternsList = document.getElementById('patterns-list');
    patternsList.innerHTML = '';

    (data.patterns || []).forEach(pat => {
      const card = document.createElement('div');
      card.className = 'pattern-card';
      card.innerHTML = `
        <div class="pattern-top">
          <strong style="font-size: 14.5px; color: var(--text-main);">${pat.title}</strong>
          <span class="pattern-percentage">${pat.percentage}% of weekly volume</span>
        </div>
        <p class="pattern-summary">${pat.summary}</p>
        <div style="font-size: 12px; color: #475569; margin-bottom: 10px;">
          <strong>Root Cause:</strong> ${pat.rootCause}
        </div>
        <div class="recommended-box">
          <div>
            <strong>Recommended Fix:</strong> ${pat.recommendedFix}
          </div>
          ${pat.proposedArticle && pat.status === 'PENDING_APPROVAL' ? `
            <button class="btn btn-primary" style="font-size: 11px; padding: 4px 10px; margin-left: 12px;" onclick="approveArticle('${pat.id}')">
              Approve Article to RAG
            </button>
          ` : pat.status === 'APPROVED' ? `
            <span style="font-size: 11px; font-weight: 700; color: #15803d; margin-left: 10px;">✓ Active in KB</span>
          ` : ''}
        </div>
      `;
      patternsList.appendChild(card);
    });

    // Render Recent Tickets
    const tbody = document.getElementById('recent-tickets-tbody');
    tbody.innerHTML = '';

    (data.recentConversations || []).forEach(ticket => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid var(--border-subtle)';
      tr.innerHTML = `
        <td style="padding: 8px 12px; font-family: monospace; font-weight: 600;">${ticket.id}</td>
        <td style="padding: 8px 12px; color: #475569;">${ticket.category.replace(/_/g, ' ')}</td>
        <td style="padding: 8px 12px;">
          <span style="padding: 2px 6px; border-radius: 4px; font-size: 10.5px; font-weight: 700; background: ${ticket.status === 'RESOLVED' ? '#ecfdf5; color: #059669;' : '#fff7ed; color: #c2410c;'}">${ticket.status}</span>
        </td>
        <td style="padding: 8px 12px; font-size: 11.5px; color: ${ticket.sentiment === 'positive' ? '#059669' : ticket.sentiment === 'negative' ? '#dc2626' : '#64748b'};">
          ${ticket.sentiment}
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error("Dashboard metrics error:", err);
  }
}

async function approveArticle(patternId) {
  try {
    const res = await fetch('/api/dashboard/approve-article', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patternId })
    });
    const data = await res.json();
    if (data.success) {
      alert("✅ " + data.message);
      fetchDashboardMetrics();
    }
  } catch (err) {
    alert("Approval error: " + err.message);
  }
}

// -------------------------------------------------------------
// PayPal JS SDK Integration (Create-Order & Capture-Order Flow)
// -------------------------------------------------------------
let paypalSdkLoaded = false;
let paypalConfig = null;

async function fetchPayPalPublicConfig() {
  if (paypalConfig) return paypalConfig;
  try {
    const res = await fetch('/api/config');
    const data = await res.json();
    paypalConfig = data.paypal;
    return paypalConfig;
  } catch (err) {
    console.error("Failed to load public config:", err);
    return null;
  }
}

async function openCheckoutModal() {
  document.getElementById('checkout-modal').style.display = 'flex';
  const alertEl = document.getElementById('paypal-status-alert');
  alertEl.style.display = 'none';

  const cfg = await fetchPayPalPublicConfig();
  const clientId = cfg?.clientId;

  const btnContainer = document.getElementById('paypal-button-container');

  // If client ID is configured and SDK not yet loaded
  if (clientId && !paypalSdkLoaded) {
    btnContainer.innerHTML = '<div style="text-align: center; color: #64748b; font-size: 13px;">Loading PayPal JS SDK...</div>';
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=USD&intent=capture`;
    script.async = true;
    script.onload = () => {
      paypalSdkLoaded = true;
      renderPayPalButtons();
    };
    script.onerror = () => {
      renderFallbackButton("Failed to load PayPal JS SDK. Check your Client ID.");
    };
    document.body.appendChild(script);
  } else if (paypalSdkLoaded && window.paypal) {
    renderPayPalButtons();
  } else {
    // Graceful fallback for sandbox / mock testing without live keys
    renderFallbackButton("Running in sandbox demonstration mode. Click below to test create-order & capture-order endpoints.");
  }
}

function closeCheckoutModal() {
  document.getElementById('checkout-modal').style.display = 'none';
}

function showCheckoutStatus(type, message) {
  const alertEl = document.getElementById('paypal-status-alert');
  alertEl.style.display = 'block';
  if (type === 'success') {
    alertEl.style.background = '#ecfdf5';
    alertEl.style.color = '#065f46';
    alertEl.style.border = '1px solid #a7f3d0';
    alertEl.innerHTML = `<strong>Success!</strong> ${message}`;
  } else if (type === 'error') {
    alertEl.style.background = '#fef2f2';
    alertEl.style.color = '#991b1b';
    alertEl.style.border = '1px solid #fecaca';
    alertEl.innerHTML = `<strong>Failed:</strong> ${message}`;
  } else if (type === 'cancel') {
    alertEl.style.background = '#fffbeb';
    alertEl.style.color = '#92400e';
    alertEl.style.border = '1px solid #fde68a';
    alertEl.innerHTML = `<strong>Cancelled:</strong> ${message}`;
  }
}

function renderPayPalButtons() {
  const container = document.getElementById('paypal-button-container');
  container.innerHTML = '';

  if (!window.paypal) return;

  window.paypal.Buttons({
    style: {
      layout: 'vertical',
      color: 'gold',
      shape: 'rect',
      label: 'paypal'
    },
    createOrder: async () => {
      try {
        const res = await fetch('/api/paypal/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: "45.00", currency: "USD" })
        });
        const data = await res.json();
        if (data.orderId) {
          return data.orderId;
        }
        throw new Error(data.message || data.error || 'Failed to create order');
      } catch (err) {
        showCheckoutStatus('error', err.message);
        throw err;
      }
    },
    onApprove: async (data) => {
      try {
        const res = await fetch('/api/paypal/capture-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: data.orderID })
        });
        const captureResult = await res.json();
        if (captureResult.status === 'COMPLETED' || captureResult.mode === 'mock_sandbox') {
          showCheckoutStatus('success', `Payment captured successfully! Order ID: ${captureResult.orderId}, Capture ID: ${captureResult.captureId || 'N/A'}`);
        } else {
          showCheckoutStatus('error', `Capture status: ${captureResult.status}`);
        }
      } catch (err) {
        showCheckoutStatus('error', `Capture error: ${err.message}`);
      }
    },
    onCancel: (data) => {
      showCheckoutStatus('cancel', 'Checkout was cancelled by user. No funds were debited.');
    },
    onError: (err) => {
      showCheckoutStatus('error', err.message || 'PayPal checkout error occurred.');
    }
  }).render('#paypal-button-container');
}

function renderFallbackButton(notice) {
  const container = document.getElementById('paypal-button-container');
  container.innerHTML = `
    <div style="font-size: 12px; color: #64748b; margin-bottom: 12px; line-height: 1.4;">${notice}</div>
    <button class="btn btn-primary" style="width: 100%; justify-content: center; padding: 10px;" onclick="testFullCheckoutFlow()">
      Simulate Complete Sandbox Order & Capture ($45.00)
    </button>
  `;
}

async function testFullCheckoutFlow() {
  try {
    showCheckoutStatus('cancel', 'Initiating /api/paypal/create-order...');
    const orderRes = await fetch('/api/paypal/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: "45.00", currency: "USD" })
    });
    const order = await orderRes.json();

    showCheckoutStatus('cancel', `Order created (${order.orderId}). Simulating approval & capture...`);
    const capRes = await fetch('/api/paypal/capture-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: order.orderId })
    });
    const capture = await capRes.json();

    showCheckoutStatus('success', `Order ${capture.orderId} captured successfully! Capture ID: ${capture.captureId}. Mode: ${capture.mode}`);
  } catch (err) {
    showCheckoutStatus('error', err.message);
  }
}
