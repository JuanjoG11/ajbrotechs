/* ============================================================
   AJ BROTECH'S — checkout.js  |  Supabase integration
   ============================================================ */
'use strict';

const SUPABASE_URL = 'https://bwpvrgiejjatzjmmjrew.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3cHZyZ2llamphdHpqbW1qcmV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2MTgxMjMsImV4cCI6MjA5OTE5NDEyM30.AA0OhHa9bgs1sDdZxiJpHGeM6jUcQV4w91EHYzNPXFQ';

/* ---- Supabase helper ---- */
async function sbInsert(table, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function sbUpsert(table, data, onConflict) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?on_conflict=${onConflict}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': 'return=representation,resolution=merge-duplicates'
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/* ---- Format COP ---- */
function formatCOP(amount) {
  return '$' + Math.round(amount).toLocaleString('es-CO');
}

/* ---- Generate order number ---- */
function generateOrderNum() {
  return 'AJB-' + Math.floor(100000 + Math.random() * 900000);
}

/* ---- Render Order Summary ---- */
function renderSummary() {
  const cart     = JSON.parse(localStorage.getItem('ajbrotech_cart') || '[]');
  const discount = parseInt(localStorage.getItem('ajbrotech_discount') || '0');
  const elItems    = document.getElementById('summaryItems');
  const elSubtotal = document.getElementById('summarySubtotal');
  const elShipping = document.getElementById('summaryShipping');
  const elTotal    = document.getElementById('summaryTotal');
  const codRow     = document.getElementById('summaryCodRow');

  if (!elItems) return;

  if (cart.length === 0) {
    elItems.innerHTML = `<div class="summary-empty">Tu carrito está vacío. <a href="index.html">Volver →</a></div>`;
    return;
  }

  const subtotal  = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const freeShip  = subtotal >= 200000;
  const shipping  = freeShip ? 0 : 16900;
  const isCod     = document.querySelector('.payment-tab.active')?.dataset.tab === 'cod';
  const codFee    = isCod ? 12000 : 0;
  const beforeDisc = subtotal + shipping + codFee;
  const discAmt   = discount > 0 ? Math.round(beforeDisc * discount / 100) : 0;
  const total     = beforeDisc - discAmt;

  elItems.innerHTML = cart.map(item => `
    <div class="summary-item">
      <div class="summary-item-info">
        <div class="summary-item-name">${item.name}</div>
        <div class="summary-item-qty">Cant: ${item.qty}</div>
      </div>
      <div class="summary-item-price">${formatCOP(item.price * item.qty)}</div>
    </div>`).join('');

  if (elSubtotal) elSubtotal.textContent = formatCOP(subtotal);
  if (elShipping) elShipping.textContent = freeShip ? '¡Gratis! 🎉' : formatCOP(16900);
  if (codRow) codRow.style.display = isCod ? 'flex' : 'none';

  /* descuento row */
  let discRow = document.getElementById('summaryDiscRow');
  if (discAmt > 0) {
    if (!discRow) {
      discRow = document.createElement('div');
      discRow.id = 'summaryDiscRow';
      discRow.className = 'summary-row';
      discRow.style.color = '#00cc66';
      discRow.innerHTML = `<span>🎁 Descuento ${discount}%</span><strong id="summaryDiscAmt" style="color:#00cc66"></strong>`;
      elTotal?.parentElement?.insertBefore(discRow, elTotal.parentElement.querySelector('.summary-total-row'));
    }
    const el = document.getElementById('summaryDiscAmt');
    if (el) el.textContent = '−' + formatCOP(discAmt);
  }

  if (elTotal) elTotal.textContent = formatCOP(total);
}

/* ---- Payment Tabs ---- */
function initPaymentTabs() {
  document.querySelectorAll('.payment-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.payment-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.payment-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const panel = document.getElementById(`panel-${tab.dataset.tab}`);
      if (panel) panel.classList.add('active');
      renderSummary();
    });
  });
}

/* ---- Form Validation ---- */
function validateField(id, condition, msg) {
  const el  = document.getElementById(id);
  const err = document.getElementById(`err-${id}`);
  if (!el) return true;
  const ok = condition(el.value.trim());
  el.classList.toggle('invalid', !ok);
  el.classList.toggle('valid', ok);
  if (err) err.textContent = ok ? '' : msg;
  return ok;
}

function validateForm() {
  const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isPhone = v => v.replace(/\D/g, '').length >= 7;
  return [
    validateField('firstName', v => v.length >= 2, 'Ingresa tu nombre'),
    validateField('lastName',  v => v.length >= 2, 'Ingresa tu apellido'),
    validateField('email',     isEmail,             'Correo inválido'),
    validateField('phone',     isPhone,             'Teléfono inválido'),
    validateField('address',   v => v.length >= 5,  'Ingresa tu dirección'),
    validateField('city',      v => v.length >= 2,  'Ingresa tu ciudad'),
    validateField('state',     v => v.length > 0,   'Selecciona departamento'),
  ].every(Boolean);
}

/* ---- Submit → Supabase ---- */
function initFormSubmit() {
  const form      = document.getElementById('checkoutForm');
  const submitBtn = document.getElementById('submitBtn');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      form.querySelector('.invalid')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    submitBtn.disabled  = true;
    submitBtn.innerHTML = '⏳ Procesando...';

    try {
      const cart     = JSON.parse(localStorage.getItem('ajbrotech_cart') || '[]');
      const discount = parseInt(localStorage.getItem('ajbrotech_discount') || '0');
      const subtotal  = cart.reduce((s, i) => s + i.price * i.qty, 0);
      const freeShip  = subtotal >= 200000;
      const shipping  = freeShip ? 0 : 16900;
      const isCod     = document.querySelector('.payment-tab.active')?.dataset.tab === 'cod';
      const codFee    = isCod ? 12000 : 0;
      const beforeDisc = subtotal + shipping + codFee;
      const discAmt   = discount > 0 ? Math.round(beforeDisc * discount / 100) : 0;
      const total     = beforeDisc - discAmt;
      const numero    = generateOrderNum();
      const metodo    = document.querySelector('.payment-tab.active')?.dataset.tab || 'mp';

      /* 1. Insertar pedido */
      const [pedido] = await sbInsert('pedidos', {
        numero,
        nombre:       document.getElementById('firstName').value.trim(),
        apellido:     document.getElementById('lastName').value.trim(),
        email:        document.getElementById('email').value.trim(),
        telefono:     document.getElementById('phone').value.trim(),
        direccion:    document.getElementById('address').value.trim(),
        ciudad:       document.getElementById('city').value.trim(),
        departamento: document.getElementById('state').value.trim(),
        codigo_postal:document.getElementById('zip')?.value.trim() || '',
        metodo_pago:  metodo,
        subtotal,
        envio:        shipping + codFee,
        descuento:    discAmt,
        total
      });

      /* 2. Insertar items */
      const items = cart.map(item => ({
        pedido_id:   pedido.id,
        producto_id: item.id,
        nombre:      item.name,
        precio:      item.price,
        cantidad:    item.qty
      }));
      await sbInsert('pedido_items', items);

      /* 3. Crear preferencia Mercado Pago si el método es MP */
      let mpUrl = null;
      if (metodo === 'mp') {
        try {
          const mpRes = await fetch(
            'https://bwpvrgiejjatzjmmjrew.supabase.co/functions/v1/crear-preferencia',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_KEY}`
              },
              body: JSON.stringify({
                items: cart,
                shipping: shipping + codFee,
                discount: discAmt,
                payer: {
                  nombre:   document.getElementById('firstName').value.trim(),
                  apellido: document.getElementById('lastName').value.trim(),
                  email:    document.getElementById('email').value.trim(),
                  telefono: document.getElementById('phone').value.trim(),
                  direccion:document.getElementById('address').value.trim(),
                  ciudad:   document.getElementById('city').value.trim(),
                },
                external_reference: pedido.id,
              })
            }
          );
          const mpData = await mpRes.json();
          if (mpData.init_point) mpUrl = mpData.init_point;
        } catch(e) { console.warn('MP error:', e); }
      }

      /* 4. Upsert cliente */
      await sbUpsert('clientes', {
        email:          document.getElementById('email').value.trim(),
        nombre:         document.getElementById('firstName').value.trim(),
        apellido:       document.getElementById('lastName').value.trim(),
        telefono:       document.getElementById('phone').value.trim(),
        total_pedidos:  1,
        total_gastado:  total
      }, 'email');

      /* 5. Limpiar carrito */
      localStorage.removeItem('ajbrotech_cart');
      localStorage.removeItem('ajbrotech_discount');

      /* 6. Redirigir a MP o mostrar modal */
      if (mpUrl) {
        window.location.href = mpUrl;
      } else {
        if (typeof trackAdEvent === 'function') {
          trackAdEvent('Purchase', {
            value: total,
            currency: 'COP',
            content_type: 'product',
            content_ids: cart.map(i => i.id)
          });
        }
        const orderNumEl = document.getElementById('orderNum');
        if (orderNumEl) orderNumEl.textContent = numero;
        document.getElementById('successModal')?.classList.add('show');
      }

    } catch (err) {
      console.error(err);
      submitBtn.disabled  = false;
      submitBtn.innerHTML = '🔒 Completar Pedido';
      alert('Hubo un error al procesar tu pedido. Intenta de nuevo o contáctanos por WhatsApp.');
    }
  });
}

/* ---- Real-time validation ---- */
function initRealtimeValidation() {
  ['firstName','lastName','email','phone','address','city','state'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('blur', () => el.classList.toggle('valid', el.value.trim().length > 0));
  });
}

/* ---- Boot ---- */
document.addEventListener('DOMContentLoaded', () => {
  renderSummary();
  initPaymentTabs();
  initRealtimeValidation();
  initFormSubmit();

  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  // Track InitiateCheckout event
  try {
    const cart = JSON.parse(localStorage.getItem('ajbrotech_cart') || '[]');
    const totalVal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    if (typeof trackAdEvent === 'function' && cart.length > 0) {
      trackAdEvent('InitiateCheckout', {
        content_ids: cart.map(i => i.id),
        num_items: cart.reduce((s, i) => s + i.qty, 0),
        value: totalVal,
        currency: 'COP'
      });
    }
  } catch(e) {
    console.warn('Error tracking InitiateCheckout:', e);
  }
});
