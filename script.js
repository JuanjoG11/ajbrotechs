'use strict';

function formatCOP(n) {
  return '$' + Math.round(n).toLocaleString('es-CO');
}

var PRODUCTS = [
  { id:1,  nameEs:'Vidrio Blindado',         price:15000,  before:22000,  badge:'OFERTA', stars:'4.8', reviews:20, desc:'Proteccion maxima para la pantalla de tu iPhone, anti-impacto y anti-rayones', folder:'images/vidrio-blindado',      bg:'#0d1140' },
  { id:2,  nameEs:'Vidrio Antiespía',        price:20000,  before:30000,  badge:null,     stars:'4.7', reviews:15, desc:'Privacidad total, solo tu puedes ver tu pantalla. Compatible con iPhone',       folder:'images/vidrio-antiespía',     bg:'#0d1140' },
  { id:3,  nameEs:'Cargador Lightning',      price:40000,  before:58000,  badge:'OFERTA', stars:'4.8', reviews:12, desc:'Carga rapida compatible con iPhone y iPad',                                      folder:'images/cargador-lightning',   bg:'#0d1140' },
  { id:4,  nameEs:'Cargador Tipo C',         price:70000,  before:99000,  badge:null,     stars:'4.9', reviews:8,  desc:'Carga rapida 60W, compatible con MacBook, iPad Pro y iPhone 15+',               folder:'images/cargador-tipo-c',      bg:'#0d1140' },
  { id:5,  nameEs:'AirPods 1ra Gen Pequeño', price:65000,  before:95000,  badge:'OFERTA', stars:'4.8', reviews:18, desc:'Cancelacion activa de ruido, audio de alta calidad, talla pequeña',              folder:'images/airpods-1gen-pequeño', bg:'#0a1040' },
  { id:6,  nameEs:'AirPods 1ra Gen Grande',  price:65000,  before:95000,  badge:null,     stars:'4.9', reviews:14, desc:'Version talla grande, mayor duracion de bateria y mejor ajuste',                folder:'images/airpods-1gen-grande',  bg:'#0a1040' },
  { id:7,  nameEs:'AirPods Pro',             price:85000,  before:120000, badge:null,     stars:'4.9', reviews:22, desc:'Sonido premium, cancelacion de ruido activa, diseno compacto y comodo',         folder:'images/airpods-pro',          bg:'#080830' },
  { id:8,  nameEs:'AirPods Pro 2',           price:100000, before:145000, badge:'OFERTA', stars:'5.0', reviews:21, desc:'Audio espacial, ANC mejorada, estuche MagSafe',                                  folder:'images/airpods-pro-2',        bg:'#060630' },
  { id:9,  nameEs:'AirPods Pro 3',           price:150000, before:210000, badge:'NUEVO',  stars:'5.0', reviews:9,  desc:'Lo ultimo en tecnologia de audio inalambrico de Apple',                         folder:'images/airpods-pro-3',        bg:'#05052a' },
  { id:10, nameEs:'AirPods 4ta Generacion',  price:130000, before:185000, badge:'NUEVO',  stars:'4.9', reviews:7,  desc:'Diseno renovado, sonido inmersivo, conector USB-C',                             folder:'images/airpods-4ta-gen',      bg:'#04041f' }
];

var cart = [];
var cartDiscount = 0; /* 0 = sin descuento, 5 = 5% */
try { cart = JSON.parse(localStorage.getItem('ajbrotech_cart') || '[]'); } catch(e) { cart = []; }
try { cartDiscount = parseInt(localStorage.getItem('ajbrotech_discount') || '0'); } catch(e) { cartDiscount = 0; }

function saveCart() {
  try { localStorage.setItem('ajbrotech_cart', JSON.stringify(cart)); } catch(e) {}
}

/* ---- Load images from folder index.json then render ---- */
function loadAllImages(callback) {
  var pending = PRODUCTS.length;
  for (var i = 0; i < PRODUCTS.length; i++) {
    (function(p) {
      fetch(p.folder + '/index.json')
        .then(function(r) { return r.json(); })
        .then(function(files) {
          p.images = files.map(function(f) { return p.folder + '/' + f; });
        })
        .catch(function() {
          p.images = []; // carpeta sin fotos todavia
        })
        .finally(function() {
          pending--;
          if (pending === 0) callback();
        });
    })(PRODUCTS[i]);
  }
}

/* ---- Render Products ---- */
function renderProducts() {
  var grid = document.getElementById('productGrid');
  if (!grid) return;
  var html = '';
  for (var i = 0; i < PRODUCTS.length; i++) {
    var p = PRODUCTS[i];
    var imgs = p.images || [];
    html += '<div class="product-card reveal">';
    if (p.badge) html += '<div class="product-badge">' + p.badge + '</div>';

    /* --- Image Carousel --- */
    html += '<div class="product-carousel" data-id="' + p.id + '">';
    html += '<div class="carousel-track" style="background:' + p.bg + '">';
    if (imgs.length > 0) {
      for (var k = 0; k < imgs.length; k++) {
        html += '<div class="carousel-slide' + (k === 0 ? ' active' : '') + '" data-src="' + imgs[k] + '">';
        html += '<img src="' + imgs[k] + '" alt="' + p.nameEs + ' foto ' + (k+1) + '" loading="lazy">';
        /* icono lupa para abrir lightbox */
        html += '<button class="zoom-btn" data-src="' + imgs[k] + '" data-name="' + p.nameEs + '" aria-label="Ver imagen grande">&#128269;</button>';
        html += '</div>';
      }
    } else {
      html += '<div class="carousel-slide active carousel-placeholder">';
      html += '<span>📷</span><small>Fotos proximamente</small>';
      html += '</div>';
    }
    html += '</div>';
    if (imgs.length > 1) {
      html += '<button class="carousel-btn carousel-prev" aria-label="Anterior">&#8249;</button>';
      html += '<button class="carousel-btn carousel-next" aria-label="Siguiente">&#8250;</button>';
      html += '<div class="carousel-dots">';
      for (var d = 0; d < imgs.length; d++) {
        html += '<span class="carousel-dot' + (d === 0 ? ' active' : '') + '" data-dot="' + d + '"></span>';
      }
      html += '</div>';
    }
    html += '</div>';
    /* --- End Carousel --- */

    html += '<div class="product-info">';
    html += '<div class="product-name">' + p.nameEs + '</div>';
    html += '<div class="product-stars">';
    html += '<span style="color:#ffd700">&#9733;&#9733;&#9733;&#9733;&#9733;</span> ';
    html += '<span>' + p.stars + ' (' + p.reviews + ' reseñas)</span>';
    html += '</div>';
    html += '<div class="product-price-wrap">';
    html += '<span class="product-price">' + formatCOP(p.price) + '</span>';
    html += '<span class="product-price-before">ANTES: ' + formatCOP(p.before) + '</span>';
    html += '<span class="product-discount">-30%</span>';
    html += '</div>';
    html += '<button class="add-to-cart" data-id="' + p.id + '">Agregar al Carrito</button>';
    html += '</div></div>';
  }
  grid.innerHTML = html;

  /* Add-to-cart */
  grid.querySelectorAll('.add-to-cart').forEach(function(btn) {
    btn.addEventListener('click', function() { addToCart(parseInt(this.dataset.id)); });
  });

  /* Zoom / lightbox */
  grid.querySelectorAll('.zoom-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      openLightbox(this.dataset.src, this.dataset.name);
    });
  });

  /* Carousel */
  grid.querySelectorAll('.product-carousel').forEach(function(c) { initCarousel(c); });
}

function initCarousel(carousel) {
  var slides = carousel.querySelectorAll('.carousel-slide');
  var dots   = carousel.querySelectorAll('.carousel-dot');
  var prev   = carousel.querySelector('.carousel-prev');
  var next   = carousel.querySelector('.carousel-next');
  var current = 0;

  function goTo(idx) {
    slides[current].classList.remove('active');
    if (dots[current]) dots[current].classList.remove('active');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    if (dots[current]) dots[current].classList.add('active');
  }

  if (prev) prev.addEventListener('click', function(e) { e.stopPropagation(); goTo(current - 1); });
  if (next) next.addEventListener('click', function(e) { e.stopPropagation(); goTo(current + 1); });

  for (var i = 0; i < dots.length; i++) {
    (function(idx) {
      dots[idx].addEventListener('click', function(e) { e.stopPropagation(); goTo(idx); });
    })(i);
  }

  /* Swipe */
  var startX = 0;
  var track = carousel.querySelector('.carousel-track');
  if (track) {
    track.addEventListener('touchstart', function(e) { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', function(e) {
      var diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
    }, { passive: true });
  }
}

/* ---- Lightbox ---- */
function buildLightbox() {
  if (document.getElementById('lightbox')) return;
  var lb = document.createElement('div');
  lb.id = 'lightbox';
  lb.innerHTML =
    '<div class="lb-overlay"></div>' +
    '<div class="lb-content">' +
    '  <button class="lb-close" aria-label="Cerrar">&#10005;</button>' +
    '  <img class="lb-img" src="" alt="" />' +
    '  <div class="lb-caption"></div>' +
    '</div>';
  document.body.appendChild(lb);
  lb.querySelector('.lb-overlay').addEventListener('click', closeLightbox);
  lb.querySelector('.lb-close').addEventListener('click', closeLightbox);
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeLightbox(); });
}

function openLightbox(src, name) {
  buildLightbox();
  var lb = document.getElementById('lightbox');
  lb.querySelector('.lb-img').src = src;
  lb.querySelector('.lb-img').alt = name;
  lb.querySelector('.lb-caption').textContent = name;
  lb.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  var lb = document.getElementById('lightbox');
  if (lb) lb.classList.remove('active');
  document.body.style.overflow = '';
}

/* ---- Cart ---- */
function addToCart(id) {
  var p = null;
  for (var i = 0; i < PRODUCTS.length; i++) { if (PRODUCTS[i].id === id) { p = PRODUCTS[i]; break; } }
  if (!p) return;
  var found = false;
  for (var i = 0; i < cart.length; i++) { if (cart[i].id === id) { cart[i].qty++; found = true; break; } }
  if (!found) cart.push({ id: p.id, name: p.nameEs, price: p.price, qty: 1 });
  saveCart();
  updateCartUI();
  showToast(p.nameEs + ' agregado!');
  openCart();
}

function removeFromCart(id) {
  cart = cart.filter(function(i) { return i.id !== id; });
  saveCart(); updateCartUI();
}

function changeQty(id, delta) {
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].id === id) {
      cart[i].qty += delta;
      if (cart[i].qty <= 0) { cart.splice(i, 1); }
      break;
    }
  }
  saveCart(); updateCartUI();
}

function clearCart() {
  cart = [];
  cartDiscount = 0;
  try { localStorage.removeItem('ajbrotech_discount'); } catch(e) {}
  saveCart();
  updateCartUI();
}

function updateCartUI() {
  var count = 0, subtotal = 0;
  for (var i = 0; i < cart.length; i++) { count += cart[i].qty; subtotal += cart[i].price * cart[i].qty; }

  var badge = document.getElementById('cartBadge');
  if (badge) badge.textContent = count;

  var cartItems  = document.getElementById('cartItems');
  var cartFooter = document.getElementById('cartFooter');
  if (!cartItems) return;

  if (cart.length === 0) {
    cartItems.innerHTML = '<div class="cart-empty"><div class="cart-empty-icon"><svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg></div><p>Tu carrito esta vacio</p><button class="btn btn-primary" id="cartShopBtn">Ver Productos</button></div>';
    var sb = document.getElementById('cartShopBtn');
    if (sb) sb.onclick = function() { closeCart(); var s = document.getElementById('productos'); if(s) s.scrollIntoView({behavior:'smooth'}); };
    if (cartFooter) cartFooter.style.display = 'none';
  } else {
    var html = '';
    for (var i = 0; i < cart.length; i++) {
      var item = cart[i];
      html += '<div class="cart-item">';
      html += '<div class="cart-item-info"><div class="cart-item-name">' + item.name + '</div>';
      html += '<div class="cart-item-price">' + formatCOP(item.price * item.qty) + '</div></div>';
      html += '<div class="cart-item-controls">';
      html += '<button class="qty-btn" data-id="' + item.id + '" data-d="-1">&minus;</button>';
      html += '<span class="qty-display">' + item.qty + '</span>';
      html += '<button class="qty-btn" data-id="' + item.id + '" data-d="1">+</button>';
      html += '<button class="cart-item-remove" data-id="' + item.id + '">&#x2715;</button>';
      html += '</div></div>';
    }
    cartItems.innerHTML = html;

    cartItems.querySelectorAll('.qty-btn').forEach(function(b) {
      b.onclick = function() { changeQty(parseInt(this.dataset.id), parseInt(this.dataset.d)); };
    });
    cartItems.querySelectorAll('.cart-item-remove').forEach(function(b) {
      b.onclick = function() { removeFromCart(parseInt(this.dataset.id)); };
    });

    if (cartFooter) {
      cartFooter.style.display = 'block';
      var free = subtotal >= 200000;
      var shipping = free ? 0 : 16900;
      var totalBeforeDiscount = subtotal + shipping;
      var discountAmt = cartDiscount > 0 ? Math.round(totalBeforeDiscount * cartDiscount / 100) : 0;
      var total = totalBeforeDiscount - discountAmt;

      document.getElementById('cartSubtotal').textContent = formatCOP(subtotal);
      document.getElementById('cartShipping').textContent = free ? '¡Gratis!' : formatCOP(shipping);
      document.getElementById('cartTotal').textContent = formatCOP(total);

      /* fila descuento */
      var discRow = document.getElementById('cartDiscountRow');
      if (discountAmt > 0) {
        if (!discRow) {
          discRow = document.createElement('div');
          discRow.id = 'cartDiscountRow';
          discRow.className = 'cart-total-row cart-discount-row';
          discRow.innerHTML = '<span>🎁 Descuento ' + cartDiscount + '%:</span><strong id="cartDiscountAmt"></strong>';
          var shippingRow = document.getElementById('cartShipping').closest('.cart-total-row');
          shippingRow.insertAdjacentElement('afterend', discRow);
        }
        document.getElementById('cartDiscountAmt').textContent = '−' + formatCOP(discountAmt);
      } else if (discRow) {
        discRow.remove();
      }

      /* mensaje contraentrega */
      var codMsg = document.getElementById('cartCodMsg');
      if (!codMsg) {
        codMsg = document.createElement('div');
        codMsg.id = 'cartCodMsg';
        codMsg.className = 'cart-cod-msg';
        codMsg.innerHTML = '🏠 Pago contra entrega disponible<br><small>Se cobra un recargo de <strong>$12.000</strong> adicionales</small>';
        document.getElementById('cartFooter').insertBefore(codMsg, document.getElementById('cartFooter').firstChild);
      }
    }
  }

  /* ---- update shipping banner ---- */
  updateShippingBanner(subtotal);
}

function openCart()  { document.getElementById('cartSidebar').classList.add('open');    document.getElementById('cartOverlay').classList.add('active');    document.body.style.overflow='hidden'; }
function closeCart() {
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('active');
  document.body.style.overflow='';

  /* Si hay productos y aún no tiene descuento aplicado, mostrar popup */
  if (cart.length > 0 && cartDiscount === 0) {
    setTimeout(function() { showExitPopup(true); }, 400);
  }
}

/* ---- Toast ---- */
var toastTimer;
function showToast(msg) {
  var t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function() { t.classList.remove('show'); }, 2500);
}

/* ---- Countdown ---- */
function initCountdown() {
  var KEY = 'ajb_dl';
  var dl = parseInt(localStorage.getItem(KEY) || '0', 10);
  if (!dl || dl <= Date.now()) { dl = Date.now() + 86400000; localStorage.setItem(KEY, dl); }
  setInterval(function() {
    var r = Math.max(0, dl - Date.now());
    var h = Math.floor(r / 3600000);
    var m = Math.floor((r % 3600000) / 60000);
    var s = Math.floor((r % 60000) / 1000);
    var el = document.getElementById('hours');   if (el) el.textContent = ('0'+h).slice(-2);
    var el = document.getElementById('minutes'); if (el) el.textContent = ('0'+m).slice(-2);
    var el = document.getElementById('seconds'); if (el) el.textContent = ('0'+s).slice(-2);
  }, 1000);
}

/* ---- Scroll Reveal ---- */
function initReveal() {
  if (!window.IntersectionObserver) {
    document.querySelectorAll('.reveal').forEach(function(el) { el.classList.add('visible'); });
    return;
  }
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(function(el) { obs.observe(el); });
}

/* ---- Navbar scroll ---- */
function initNavbar() {
  var nav = document.getElementById('navbar');
  if (!nav) return;
  window.addEventListener('scroll', function() {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

/* ---- Hamburger ---- */
function initHamburger() {
  var btn = document.getElementById('hamburger');
  var links = document.getElementById('navLinks');
  if (!btn || !links) return;
  btn.addEventListener('click', function() { links.classList.toggle('open'); });
  links.querySelectorAll('a').forEach(function(a) {
    a.addEventListener('click', function() { links.classList.remove('open'); });
  });
}

/* ---- Shipping banner ---- */
function updateShippingBanner(subtotal) {
  var banner  = document.getElementById('cartShippingBanner');
  var bar     = document.getElementById('csbBar');
  var text    = document.getElementById('csbText');
  var amount  = document.getElementById('csbAmount');
  if (!banner) return;

  var FREE_THRESHOLD = 200000;
  var pct = Math.min(subtotal / FREE_THRESHOLD * 100, 100);
  if (bar) bar.style.width = pct + '%';

  if (subtotal === 0) {
    if (text) text.innerHTML = '🚚 Compra más de <strong>$200.000</strong> y el envío es <strong style="color:#00cc66">GRATIS</strong>';
  } else if (subtotal >= FREE_THRESHOLD) {
    if (text) text.innerHTML = '🎉 <strong style="color:#00cc66">¡Tienes envío GRATIS!</strong> Tu pedido califica ✅';
    if (bar) bar.style.background = '#00cc66';
  } else {
    var left = FREE_THRESHOLD - subtotal;
    if (text) {
      text.innerHTML = '🚚 Solo te faltan <strong>' + formatCOP(left) + '</strong> para envío <strong style="color:#00cc66">GRATIS</strong>';
    }
  }
}

/* ---- Exit Intent ---- */
function showExitPopup(fromCart) {
  /* desde carrito: mostrar siempre que no tenga descuento
     desde mouseleave/timer: solo una vez por sesión */
  if (!fromCart && sessionStorage.getItem('exitShown')) return;
  if (!fromCart) sessionStorage.setItem('exitShown', '1');

  var overlay = document.getElementById('exitOverlay');
  if (overlay) {
    overlay.classList.add('show');
    startExitTimer();
  }
}

function initExitIntent() {
  var overlay = document.getElementById('exitOverlay');
  var closeBtn = document.getElementById('exitClose');
  var skipBtn  = document.getElementById('exitSkip');
  var exitBtn  = document.getElementById('exitBtn');
  if (!overlay) return;

  function hidePopup() { overlay.classList.remove('show'); }

  /* Desktop: mouse sale por arriba */
  document.addEventListener('mouseleave', function(e) {
    if (e.clientY < 10) showExitPopup(false);
  });

  /* Móvil: si lleva 45s sin comprar */
  setTimeout(function() { showExitPopup(false); }, 45000);

  if (closeBtn) closeBtn.addEventListener('click', hidePopup);
  if (skipBtn)  skipBtn.addEventListener('click', hidePopup);
  if (exitBtn)  exitBtn.addEventListener('click', function() {
    cartDiscount = 5;
    try { localStorage.setItem('ajbrotech_discount', '5'); } catch(e) {}
    updateCartUI();
    hidePopup();
    openCart();
    showToast('🎁 ¡5% de descuento aplicado!');
  });
}

function startExitTimer() {
  var secs = 600; /* 10 minutos */
  var el = document.getElementById('exitCountdown');
  var iv = setInterval(function() {
    secs--;
    if (secs <= 0) { clearInterval(iv); return; }
    var m = Math.floor(secs / 60);
    var s = secs % 60;
    if (el) el.textContent = ('0'+m).slice(-2) + ':' + ('0'+s).slice(-2);
  }, 1000);
}

/* ---- Boot ---- */
document.addEventListener('DOMContentLoaded', function() {
  loadAllImages(function() {
    renderProducts();
    initReveal();
  });
  updateCartUI();
  initCountdown();
  initNavbar();
  initHamburger();
  initExitIntent();

  var cartBtn    = document.getElementById('cartBtn');
  var cartClose  = document.getElementById('cartClose');
  var cartOverlay= document.getElementById('cartOverlay');
  var clearBtn   = document.getElementById('clearCartBtn');

  if (cartBtn)     cartBtn.addEventListener('click', openCart);
  if (cartClose)   cartClose.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
  if (clearBtn)    clearBtn.addEventListener('click', clearCart);

  document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      var t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
    });
  });
});
