'use strict';

function formatCOP(n) {
  return '$' + Math.round(n).toLocaleString('es-CO');
}

var PRODUCTS = [
  { id:1,  nameEs:'Vidrio Blindado',         price:15000,  before:22000,  badge:'OFERTA', stars:'4.8', reviews:20, desc:'Proteccion maxima para la pantalla de tu iPhone, anti-impacto y anti-rayones', folder:'images/vidrio-blindado',      bg:'#0d1140',
    descBullets: ['Protección máxima anti-impacto para tu pantalla de iPhone','Dureza 9H — el máximo en vidrios protectores','Anti-rayones y anti-huellas dactilares','Instalación fácil en menos de 2 minutos','Compatible con todas las fundas'] },
  { id:2,  nameEs:'Vidrio Antiespía',        price:20000,  before:30000,  badge:null,     stars:'4.7', reviews:15, desc:'Privacidad total, solo tu puedes ver tu pantalla. Compatible con iPhone',       folder:'images/vidrio-antiespía',     bg:'#0d1140',
    descBullets: ['Privacidad total — solo tú puedes ver tu pantalla','Ángulo de visión de 60° protege tu información','Anti-rayones y anti-huellas','Ideal para bancos, WhatsApp y contraseñas','Compatible con Face ID'] },
  { id:3,  nameEs:'Cargador Lightning',      price:40000,  before:58000,  badge:'OFERTA', stars:'4.8', reviews:12, desc:'Carga rapida compatible con iPhone y iPad',                                      folder:'images/cargador-lightning',   bg:'#0d1140',
    descBullets: ['Carga rápida compatible con iPhone y iPad','Cable de alta resistencia — no se parte ni se dobla','Certificado MFi compatible','Longitud 1 metro — ideal para cargar en la cama','Garantía 6 meses incluida'] },
  { id:4,  nameEs:'Cargador Tipo C',         price:70000,  before:99000,  badge:null,     stars:'4.9', reviews:8,  desc:'Carga rapida 60W, compatible con MacBook, iPad Pro y iPhone 15+',               folder:'images/cargador-tipo-c',      bg:'#0d1140',
    descBullets: ['Carga rápida 60W — carga tu MacBook o iPhone 15 en minutos','Compatible con MacBook Air/Pro, iPad Pro e iPhone 15+','Cable USB-C a USB-C de alta resistencia','Detecta automáticamente la potencia óptima','Garantía 6 meses incluida'] },
  { id:5,  nameEs:'AirPods 1ra Gen Pequeño', price:65000,  before:95000,  badge:'OFERTA', stars:'4.8', reviews:18, desc:'Cancelacion activa de ruido, audio de alta calidad, talla pequeña',              folder:'images/airpods-1gen-pequeño', bg:'#0a1040',
    descBullets: ['Cancelación activa de ruido para escuchar solo lo que quieres','Audio de alta calidad — sonido inmersivo','Talla pequeña — perfecto para orejas más chicas','Hasta 6 horas de batería + 24h con el estuche','Control táctil en el AirPod'] },
  { id:6,  nameEs:'AirPods 1ra Gen Grande',  price:65000,  before:95000,  badge:null,     stars:'4.9', reviews:14, desc:'Version talla grande, mayor duracion de bateria y mejor ajuste',                folder:'images/airpods-1gen-grande',  bg:'#0a1040',
    descBullets: ['Mayor durabilidad y mejor ajuste para orejas más grandes','Cancelación activa de ruido premium','Audio espacial 3D envolvente','Batería extendida — hasta 7h continuas','Estuche de carga compacto incluido'] },
  { id:7,  nameEs:'AirPods Pro',             price:85000,  before:120000, badge:null,     stars:'4.9', reviews:22, desc:'Sonido premium, cancelacion de ruido activa, diseno compacto y comodo',         folder:'images/airpods-pro',          bg:'#080830',
    descBullets: ['Sonido premium con graves profundos y agudos nítidos','Cancelación de ruido activa de alto rendimiento','Diseño compacto y cómodo — no se caen','Modo transparencia para escuchar el entorno','Compatible con iPhone y Android'] },
  { id:8,  nameEs:'AirPods Pro 2',           price:100000, before:145000, badge:'OFERTA', stars:'5.0', reviews:21, desc:'Audio espacial, ANC mejorada, estuche MagSafe',                                  folder:'images/airpods-pro-2',        bg:'#060630',
    descBullets: ['Audio espacial personalizado — sonido 360° envolvente','ANC mejorada — bloquea hasta el 98% del ruido externo','Estuche con carga MagSafe y USB-C','Control de volumen táctil en el cable','La mejor relación calidad-precio del mercado'] },
  { id:9,  nameEs:'AirPods Pro 3',           price:150000, before:210000, badge:'NUEVO',  stars:'5.0', reviews:9,  desc:'Lo ultimo en tecnologia de audio inalambrico de Apple',                         folder:'images/airpods-pro-3',        bg:'#05052a',
    descBullets: ['Lo último en tecnología de audio inalámbrico','ANC de tercera generación — la más avanzada disponible','Audio espacial adaptativo en tiempo real','Chip H2 de última generación','Batería mejorada — hasta 8h continuas'] },
  { id:10, nameEs:'AirPods 4ta Generacion',  price:130000, before:185000, badge:'NUEVO',  stars:'4.9', reviews:7,  desc:'Diseno renovado, sonido inmersivo, conector USB-C',                             folder:'images/airpods-4ta-gen',      bg:'#04041f',
    descBullets: ['Diseño renovado y más ergonómico — el más cómodo de todos','Sonido inmersivo con audio espacial','Conector USB-C para cargar el estuche','Cancelación de ruido activa incluida','Chip H2 con eficiencia mejorada'] }
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
    html += '<div class="product-card reveal" id="product-' + p.id + '" data-product-id="' + p.id + '">';
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
    html += '<a href="#" class="product-name open-detail" data-id="' + p.id + '" style="text-decoration:none;color:inherit;cursor:pointer">' + p.nameEs + '</a>';
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
    html += '<a href="#" class="product-detail-link open-detail" data-id="' + p.id + '">Ver detalle &rarr;</a>';
    html += '</div></div>';
  }
  grid.innerHTML = html;

  /* Open Detail Modal */
  grid.querySelectorAll('.open-detail').forEach(function(el) {
    el.addEventListener('click', function(e) {
      e.preventDefault();
      openProductModal(parseInt(this.dataset.id));
    });
  });

  /* Add-to-cart */
  grid.querySelectorAll('.add-to-cart').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      addToCart(parseInt(this.dataset.id));
    });
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
function addToCart(id, qty) {
  qty = qty || 1;
  var p = null;
  for (var i = 0; i < PRODUCTS.length; i++) { if (PRODUCTS[i].id === id) { p = PRODUCTS[i]; break; } }
  if (!p) return;
  var found = false;
  for (var i = 0; i < cart.length; i++) { if (cart[i].id === id) { cart[i].qty += qty; found = true; break; } }
  if (!found) cart.push({ id: p.id, name: p.nameEs, price: p.price, qty: qty });
  saveCart();
  updateCartUI();
  showToast(p.nameEs + ' agregado!');
  openCart();
  trackAdEvent('AddToCart', {
    content_ids: [p.id],
    content_name: p.nameEs,
    content_type: 'product',
    value: p.price,
    currency: 'COP'
  });
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
    scrollToProductFromUrl();
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

  var prodModalClose = document.getElementById('productModalClose');
  var prodModal = document.getElementById('productDetailModal');
  if (prodModalClose) {
    prodModalClose.addEventListener('click', closeProductModal);
  }
  if (prodModal) {
    prodModal.addEventListener('click', function(e) {
      if (e.target === prodModal) closeProductModal();
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      var t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
    });
  });

  checkPaymentStatus();
});

/* ===== Mercado Pago Redirect Handler ===== */
function checkPaymentStatus() {
  var params = new URLSearchParams(window.location.search);
  var status = params.get('status');
  var extRef = params.get('external_reference');
  
  if (status === 'success' && extRef) {
    // 1. Mostrar modal de éxito
    var modal = document.getElementById('mpSuccessModal');
    if (modal) {
      modal.classList.add('show');
      
      var closeBtn = document.getElementById('mpSuccessClose');
      if (closeBtn) {
        closeBtn.onclick = function() {
          modal.classList.remove('show');
        };
      }
      modal.onclick = function(e) {
        if (e.target === modal) modal.classList.remove('show');
      };
    }
    
    // 2. Registrar evento de compra (Purchase) para anuncios
    try {
      var cartData = JSON.parse(localStorage.getItem('ajbrotech_cart') || '[]');
      var discountVal = parseInt(localStorage.getItem('ajbrotech_discount') || '0');
      var sub = cartData.reduce(function(s, item) { return s + item.price * item.qty; }, 0);
      var ship = sub >= 200000 ? 0 : 16900;
      var tot = sub + ship;
      if (discountVal > 0) {
        tot = tot - Math.round(tot * discountVal / 100);
      }
      trackAdEvent('Purchase', {
        value: tot,
        currency: 'COP',
        content_type: 'product',
        content_ids: cartData.map(function(item) { return item.id; })
      });
    } catch(e) {
      console.warn('Error tracking purchase:', e);
    }

    // 3. Limpiar carrito localmente
    clearCart();
    
    // 3. Confirmar pedido en la base de datos (Supabase)
    var SUPABASE_URL = 'https://bwpvrgiejjatzjmmjrew.supabase.co';
    var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3cHZyZ2llamphdHpqbW1qcmV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2MTgxMjMsImV4cCI6MjA5OTE5NDEyM30.AA0OhHa9bgs1sDdZxiJpHGeM6jUcQV4w91EHYzNPXFQ';
    
    fetch(SUPABASE_URL + '/rest/v1/pedidos?id=eq.' + extRef, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ estado: 'confirmado' })
    }).catch(function(err) {
      console.warn('Error confirmando pago:', err);
    });
    
    // 4. Limpiar parámetros de URL para no re-activar la modal
    var cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
    
  } else if (status === 'failure') {
    showToast('❌ El pago fue rechazado o cancelado. Intenta de nuevo.');
    var cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
    
  } else if (status === 'pending') {
    showToast('⏳ Tu pago está en proceso de verificación.');
    var cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  }
}

/* ===== Slugify Helper for Ad Redirection ===== */
function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

/* ===== Ad Scroll to Product redirection ===== */
function scrollToProductFromUrl() {
  var params = new URLSearchParams(window.location.search);
  var pVal = params.get('p');
  if (!pVal) return;
  
  pVal = pVal.toLowerCase().trim();
  
  var targetProduct = null;
  for (var i = 0; i < PRODUCTS.length; i++) {
    var prod = PRODUCTS[i];
    if (String(prod.id) === pVal || slugify(prod.nameEs) === pVal) {
      targetProduct = prod;
      break;
    }
  }
  
  if (targetProduct) {
    setTimeout(function() {
      openProductModal(targetProduct.id);
    }, 800);
  }
}

/* ===== Product Detail Modal Functions ===== */
function openProductModal(id) {
  var p = PRODUCTS.find(function(x) { return x.id === id; });
  if (!p) return;

  var modal = document.getElementById('productDetailModal');
  var content = document.getElementById('productModalContent');
  if (!modal || !content) return;

  // Track ViewContent event
  trackAdEvent('ViewContent', {
    content_ids: [p.id],
    content_name: p.nameEs,
    content_type: 'product',
    value: p.price,
    currency: 'COP'
  });

  // Render modal loader first
  content.innerHTML = '<div style="display:flex;justify-content:center;padding:50px;"><div class="loader-spinner" style="width:30px;height:30px;border:3px solid rgba(255,255,255,0.1);border-top-color:#0066FF;border-radius:50%;animation:spin 0.8s linear infinite;"></div></div>';
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';

  // Load images
  fetch(p.folder + '/index.json')
    .then(function(r) { return r.json(); })
    .then(function(files) {
      p.images = files.map(function(f) { return p.folder + '/' + f; });
    })
    .catch(function() {
      p.images = [];
    })
    .finally(function() {
      renderModalContent(p);
    });
}

function closeProductModal() {
  var modal = document.getElementById('productDetailModal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
}

function renderModalContent(p) {
  var content = document.getElementById('productModalContent');
  if (!content) return;

  var imgs = p.images || [];
  var mainImgSrc = imgs.length > 0 ? imgs[0] : '';
  
  // Gallery HTML
  var galleryHtml = '<div class="modal-gallery">';
  if (mainImgSrc) {
    galleryHtml += '<div class="modal-gallery-main">' +
      '<img src="' + mainImgSrc + '" alt="' + p.nameEs + '" id="modalMainImg" />' +
      '</div>';
  } else {
    galleryHtml += '<div class="modal-gallery-main" style="display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px">' +
      '<span style="font-size:40px">📷</span><p style="color:var(--muted)">Sin fotos</p></div>';
  }
  
  if (imgs.length > 1) {
    galleryHtml += '<div class="modal-gallery-thumbs">';
    imgs.forEach(function(src, i) {
      galleryHtml += '<div class="modal-gallery-thumb' + (i===0?' active':'') + '" data-src="' + src + '">' +
        '<img src="' + src + '" alt="' + p.nameEs + ' ' + (i+1) + '" />' +
        '</div>';
    });
    galleryHtml += '</div>';
  }
  galleryHtml += '</div>';

  // Description bullets
  var descHtml = '<ul class="modal-desc-list">';
  var bullets = p.descBullets || [p.desc];
  bullets.forEach(function(b) {
    descHtml += '<li>' + b + '</li>';
  });
  descHtml += '</ul>';

  var savings = p.before - p.price;
  var discPct = Math.round((savings / p.before) * 100);

  // Modal Layout
  var layoutHtml = 
    '<div class="product-modal-layout">' +
      galleryHtml +
      '<div class="modal-info-wrap">' +
        '<span class="modal-tag">Accesorios Apple Premium</span>' +
        '<h2 class="modal-title">' + p.nameEs + '</h2>' +
        '<div class="modal-stars">★★★★★ <span>' + p.stars + ' (' + p.reviews + ' reseñas)</span></div>' +
        
        '<div class="modal-price-box">' +
          '<span class="modal-price">' + formatCOP(p.price) + 
            '<span class="modal-price-before">' + formatCOP(p.before) + '</span>' +
            '<span class="modal-badge">-' + discPct + '% OFF</span>' +
          '</span>' +
        '</div>' +

        descHtml +

        '<div class="modal-qty-row">' +
          '<span class="modal-qty-label">Cantidad:</span>' +
          '<div class="modal-qty-selector">' +
            '<button class="modal-qty-btn" id="modalQtyMinus">−</button>' +
            '<div class="modal-qty-num" id="modalQtyNum">1</div>' +
            '<button class="modal-qty-btn" id="modalQtyPlus">+</button>' +
          '</div>' +
        '</div>' +

        '<div class="modal-cta-section">' +
          '<button class="btn-modal-cart" id="modalAddCart">🛒 Agregar al Carrito</button>' +
          '<a href="https://wa.me/573207507468?text=Hola! Me interesa el ' + encodeURIComponent(p.nameEs) + ', precio ' + formatCOP(p.price) + '" target="_blank" class="btn-modal-whatsapp">' +
            '<svg viewBox="0 0 32 32" width="20" height="20" fill="white"><path d="M16 0C7.163 0 0 7.163 0 16c0 2.832.742 5.49 2.04 7.797L0 32l8.418-2.01A15.94 15.94 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm7.27 22.06c-.397-.199-2.35-1.16-2.715-1.291-.365-.132-.63-.199-.896.2-.265.397-1.028 1.29-1.261 1.556-.232.265-.464.298-.861.1-.397-.2-1.676-.618-3.192-1.97-1.18-1.052-1.976-2.35-2.208-2.748-.232-.397-.025-.611.175-.808.18-.178.397-.464.596-.696.199-.232.265-.397.397-.662.132-.265.066-.497-.033-.696-.1-.199-.896-2.16-1.228-2.957-.323-.776-.65-.671-.896-.683l-.762-.013c-.265 0-.696.1-1.061.497-.365.397-1.393 1.36-1.393 3.318 0 1.957 1.426 3.848 1.624 4.113.2.265 2.806 4.282 6.8 5.999.95.41 1.692.655 2.27.839.953.303 1.82.26 2.506.158.765-.114 2.35-.96 2.682-1.888.33-.928.33-1.723.232-1.888-.099-.166-.365-.265-.762-.464z"/></svg>' +
            'Preguntar por WhatsApp' +
          '</a>' +
        '</div>' +

        '<div class="modal-trust">' +
          '<div class="modal-trust-item">🛡️ <strong>Garantía:</strong> 6 meses</div>' +
          '<div class="modal-trust-item">🚚 <strong>Envío gratis:</strong> +$200.000</div>' +
        '</div>' +

      '</div>' +
    '</div>';

  content.innerHTML = layoutHtml;

  // Hook elements
  var qty = 1;
  var qtyNum = document.getElementById('modalQtyNum');
  document.getElementById('modalQtyMinus').onclick = function() {
    if (qty > 1) { qty--; qtyNum.textContent = qty; }
  };
  document.getElementById('modalQtyPlus').onclick = function() {
    if (qty < 10) { qty++; qtyNum.textContent = qty; }
  };

  document.getElementById('modalAddCart').onclick = function() {
    addToCart(p.id, qty);
    closeProductModal();
  };

  // Thumbnail click
  var thumbs = content.querySelectorAll('.modal-gallery-thumb');
  thumbs.forEach(function(th) {
    th.onclick = function() {
      thumbs.forEach(function(t) { t.classList.remove('active'); });
      this.classList.add('active');
      var main = document.getElementById('modalMainImg');
      if (main) main.src = this.dataset.src;
    };
  });
}

/* ===== Event Tracker Helper for Meta Pixel & Google Tags ===== */
function trackAdEvent(eventName, eventData) {
  if (typeof fbq === 'function') {
    fbq('track', eventName, eventData);
  }
  if (typeof gtag === 'function') {
    gtag('event', eventName, eventData);
  }
}


