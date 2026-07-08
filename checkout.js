/* ============================================================
   AJ BROTECH'S — checkout.js
   ============================================================ */

'use strict';

/* ---------- Format COP ---------- */
function formatCOP(amount) {
  return '$' + Math.round(amount).toLocaleString('es-CO') + ' COP';
}

/* ---------- Render Order Summary ---------- */
function renderSummary() {
  const cart = JSON.parse(localStorage.getItem('ajbrotech_cart') || '[]');
  const summaryItems = document.getElementById('summaryItems');
  const summarySubtotal = document.getElementById('summarySubtotal');
  const summaryShipping = document.getElementById('summaryShipping');
  const summaryTotal = document.getElementById('summaryTotal');

  if (!summaryItems) return;

  if (cart.length === 0) {
    summaryItems.innerHTML = `<div class="summary-empty">Tu carrito está vacío. <a href="index.html">Volver a la tienda →</a></div>`;
    if (summarySubtotal) summarySubtotal.textContent = '$0 COP';
    if (summaryShipping) summaryShipping.textContent = 'Gratis';
    if (summaryTotal) summaryTotal.textContent = '$0 COP';
    return;
  }

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const freeShip = subtotal >= 200000;
  const shipping = freeShip ? 0 : 16900;
  const isCod = document.querySelector('.payment-tab.active')?.dataset.tab === 'cod';
  const codFee = isCod ? 12000 : 0;
  const total = subtotal + shipping + codFee;

  summaryItems.innerHTML = cart.map(item => `
    <div class="summary-item">
      <div class="summary-item-info">
        <div class="summary-item-name">${item.name}</div>
        <div class="summary-item-qty">Cant: ${item.qty}</div>
      </div>
      <div class="summary-item-price">${formatCOP(item.price * item.qty)}</div>
    </div>
  `).join('');

  if (summarySubtotal) summarySubtotal.textContent = formatCOP(subtotal);
  if (summaryShipping) summaryShipping.textContent = freeShip ? '¡Gratis! 🎉' : formatCOP(16900);

  /* recargo contraentrega */
  const codRow = document.getElementById('summaryCodRow');
  if (codRow) codRow.style.display = isCod ? 'flex' : 'none';

  if (summaryTotal) summaryTotal.textContent = formatCOP(total);
}

/* ---------- Payment Tabs ---------- */
function initPaymentTabs() {
  const tabs = document.querySelectorAll('.payment-tab');
  const panels = document.querySelectorAll('.payment-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const panelId = `panel-${tab.dataset.tab}`;
      const panel = document.getElementById(panelId);
      if (panel) panel.classList.add('active');
      /* recalculate total when switching payment method */
      renderSummary();
    });
  });
}

/* ---------- Card Number Formatting & Type Detection ---------- */
const CARD_PATTERNS = {
  visa:       /^4/,
  mastercard: /^5[1-5]|^2[2-7]/,
  amex:       /^3[47]/,
  discover:   /^6(?:011|5)/,
};

const CARD_ICONS = {
  visa:       '💳 VISA',
  mastercard: '💳 MC',
  amex:       '💳 AMEX',
  discover:   '💳 DISC',
};

function detectCardType(number) {
  const cleaned = number.replace(/\s/g, '');
  for (const [type, pattern] of Object.entries(CARD_PATTERNS)) {
    if (pattern.test(cleaned)) return type;
  }
  return null;
}

function formatCardNumber(value) {
  const cleaned = value.replace(/\D/g, '').slice(0, 16);
  return cleaned.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value) {
  const cleaned = value.replace(/\D/g, '').slice(0, 4);
  if (cleaned.length >= 3) return cleaned.slice(0, 2) + '/' + cleaned.slice(2);
  return cleaned;
}

function initCardInputs() {
  const cardNumberInput = document.getElementById('cardNumber');
  const cardNameInput = document.getElementById('cardName');
  const cardExpiryInput = document.getElementById('cardExpiry');
  const cardNumDisplay = document.getElementById('cardNumDisplay');
  const cardHolderDisplay = document.getElementById('cardHolderDisplay');
  const cardExpiryDisplay = document.getElementById('cardExpiryDisplay');
  const cardTypeIcon = document.getElementById('cardTypeIcon');
  const cardBrandDisplay = document.getElementById('cardBrandDisplay');

  if (!cardNumberInput) return;

  cardNumberInput.addEventListener('input', () => {
    const formatted = formatCardNumber(cardNumberInput.value);
    cardNumberInput.value = formatted;
    const displayNum = formatted.padEnd(19, '•').replace(/[^•\d ]/g, '•');
    if (cardNumDisplay) {
      const parts = formatted.split(' ');
      while (parts.length < 4) parts.push('••••');
      cardNumDisplay.textContent = parts.join(' ');
    }
    const cardType = detectCardType(formatted);
    if (cardTypeIcon) cardTypeIcon.textContent = cardType ? CARD_ICONS[cardType] : '';
    if (cardBrandDisplay) {
      const icons = { visa: '🔵 VISA', mastercard: '🔴 MC', amex: '🟢 AMEX', discover: '🟠 DISC' };
      cardBrandDisplay.textContent = cardType ? icons[cardType] || '' : '';
    }
  });

  cardNameInput && cardNameInput.addEventListener('input', () => {
    if (cardHolderDisplay) {
      cardHolderDisplay.textContent = cardNameInput.value.toUpperCase() || 'NOMBRE APELLIDO';
    }
  });

  cardExpiryInput && cardExpiryInput.addEventListener('input', () => {
    const formatted = formatExpiry(cardExpiryInput.value);
    cardExpiryInput.value = formatted;
    if (cardExpiryDisplay) cardExpiryDisplay.textContent = formatted || 'MM/AA';
  });
}

/* ---------- Form Validation ---------- */
function validateField(id, condition, errorMsg) {
  const input = document.getElementById(id);
  const errEl = document.getElementById(`err-${id}`);
  if (!input) return true;
  if (!condition(input.value.trim())) {
    input.classList.add('invalid');
    input.classList.remove('valid');
    if (errEl) errEl.textContent = errorMsg;
    return false;
  } else {
    input.classList.remove('invalid');
    input.classList.add('valid');
    if (errEl) errEl.textContent = '';
    return true;
  }
}

function getActivePaymentTab() {
  const activeTab = document.querySelector('.payment-tab.active');
  return activeTab ? activeTab.dataset.tab : 'card';
}

function validateForm() {
  const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isPhone = v => v.replace(/\D/g, '').length >= 7;

  const checks = [
    validateField('firstName', v => v.length >= 2, 'Ingresa tu nombre'),
    validateField('lastName', v => v.length >= 2, 'Ingresa tu apellido'),
    validateField('email', isEmail, 'Correo inválido'),
    validateField('phone', isPhone, 'Teléfono inválido'),
    validateField('address', v => v.length >= 5, 'Ingresa tu dirección completa'),
    validateField('city', v => v.length >= 2, 'Ingresa tu ciudad'),
    validateField('state', v => v.length > 0, 'Selecciona un departamento'),
  ];

  const paymentMethod = getActivePaymentTab();
  if (paymentMethod === 'card') {
    const isExpiry = v => /^\d{2}\/\d{2}$/.test(v);
    const isCvv = v => /^\d{3,4}$/.test(v);
    checks.push(
      validateField('cardNumber', v => v.replace(/\s/g, '').length >= 15, 'Número de tarjeta inválido'),
      validateField('cardName', v => v.length >= 3, 'Ingresa el nombre del titular'),
      validateField('cardExpiry', isExpiry, 'Fecha inválida (MM/AA)'),
      validateField('cardCvv', isCvv, 'CVV inválido')
    );
  }

  return checks.every(Boolean);
}

/* ---------- Real-time Validation ---------- */
function initRealtimeValidation() {
  const fields = ['firstName','lastName','email','phone','address','city','state','zip'];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('blur', () => {
      // Re-run just this field validation silently
      el.classList.toggle('valid', el.value.trim().length > 0);
    });
  });
}

/* ---------- Generate Order Number ---------- */
function generateOrderNum() {
  return 'AJB-' + Math.floor(100000 + Math.random() * 900000);
}

/* ---------- Form Submit ---------- */
function initFormSubmit() {
  const form = document.getElementById('checkoutForm');
  const submitBtn = document.getElementById('submitBtn');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      // Scroll to first error
      const firstInvalid = form.querySelector('.invalid');
      if (firstInvalid) firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Loading state
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Procesando...';
    submitBtn.style.opacity = '0.8';

    // Simulate processing
    await new Promise(r => setTimeout(r, 1800));

    // Clear cart
    localStorage.removeItem('ajbrotech_cart');

    // Show success modal
    const modal = document.getElementById('successModal');
    const orderNumEl = document.getElementById('orderNum');
    if (orderNumEl) orderNumEl.textContent = generateOrderNum();
    if (modal) modal.classList.add('show');
  });
}

/* ---------- Boot ---------- */
document.addEventListener('DOMContentLoaded', () => {
  renderSummary();
  initPaymentTabs();
  initCardInputs();
  initRealtimeValidation();
  initFormSubmit();

  // Sticky navbar scroll
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }
});
