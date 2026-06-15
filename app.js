'use strict';

/* ═══════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════ */

const SIZE_LABELS  = { small:'Chica', medium:'Mediana', large:'Grande', xlarge:'Familiar', cuadrada:'Cuadrada', mega:'Mega' };
const SIZE_SLICES  = { small:'6 reb.', medium:'8 reb.', large:'10 reb.', xlarge:'12 reb.', cuadrada:'16 reb.', mega:'24 reb.' };
const CHEESE_EXTRA = { small:20, medium:30, large:40, xlarge:50 };
const HALF_EXTRA = {
  small: 15,
  medium: 20,
  large: 25,
  xlarge: 30,
  cuadrada: 20,
  mega: 25
};
const ESP = {
  small: 105,
  medium: 155,
  large: 195,
  xlarge: 240,
  cuadrada: 360,
  mega: 415
};

const PIZZAS = [
  { id:1,  name:'Especial', desc:'Pierna, chile poblano, pollo y chorizo',                         cat:'Especialidades', prices:ESP,  img:'images/pizza-mexicana.png' },
  { id:2,  name:'Hawaiana',      desc:'Jamón, piña y tocino',                                            cat:'Especialidades', prices:ESP,  img:'images/pizza-margherita.png' },
  { id:3,  name:'Combinada',     desc:'Champiñón, jamón, salami, pimiento verde, cebolla y chorizo',    cat:'Especialidades', prices:ESP, img: 'images/hero-pizza.png' },
  { id:4,  name:'Carnes Frías',  desc:'Jamón, salchicha, peperoni, salami y tocino',                    cat:'Especialidades', prices:ESP,  img:'images/pizza-pepperoni.png' },
  { id:5,  name:'Al Pastor',     desc:'Carne al pastor, cebolla, piña y chipotle',                      cat:'Especialidades', prices:ESP, img: 'images/hero-pizza.png' },
  { id:6,  name:'Mexicana',      desc:'Pierna, pollo, jalapeño y aguacate',                             cat:'Especialidades', prices:ESP,  img:'images/pizza-mexicana.png' },
  { id:7,  name:'Champeroni',    desc:'Champiñón y peperoni',                                           cat:'Especialidades', prices:ESP, img: 'images/hero-pizza.png' },
  { id:8,  name:'Choriqueso',    desc:'Chorizo y queso',                                                cat:'Especialidades', prices:ESP, img: 'images/hero-pizza.png' },
  { id:9,  name:'Azteca',        desc:'Frijol, jalapeño, cebolla y chorizo',                            cat:'Especialidades', prices:ESP, img: 'images/hero-pizza.png' },
  { id:10, name:'Clásica',       desc:'Champiñón, pimiento verde y peperoni',                           cat:'Especialidades', prices:ESP, img: 'images/hero-pizza.png' },
  { id:11, name:'Peperoni',      desc:'Peperoni y queso',                                               cat:'Especialidades', prices:ESP,  img:'images/pizza-pepperoni.png' },
  { id:12, name:'Vegetariana',   desc:'Champiñón, pimiento verde, cebolla, piña y elote',               cat:'Especialidades', prices:ESP,  img:'images/pizza-veggie.png' },
  { id:13, name:'Camarón',       desc:'Camarón y queso',                                                cat:'Mariscos',       prices:{ small:130, medium:180, large:250, xlarge:310, cuadrada:380, mega:465 } , img: 'images/hero-pizza.png' },
  { id:14, name:'Marinera',  desc:'Cebolla, aceituna, camarón y calamar',                           cat:'Mariscos',       prices:{ small:135, medium:190, large:260, xlarge:320, cuadrada:390, mega:475 } , img: 'images/hero-pizza.png' },
];

const COMBOS = [
  { id:1, name:'Paquete 1: Pizza Cuadrada', price:360, desc:'16 Rebanadas + Refresco 2L. Excepto mariscos.',   img:'images/combo-familiar.png',
    includes:['Hasta 2 Combinaciones de Especialidades','16 Rebanadas','1 Refresco de 2 lts','Orilla Rellena de Queso'],
    flavorCfg:{ maxChoices:2, label:'Elige Hasta 2 Sabores', excludeCat:'Mariscos' } },
  { id:2, name:'Paquete 2: Pizza Mega',     price:415, desc:'24 Rebanadas + Refresco 2L. Excepto Mariscos.',   img:'images/combo-familiar.png',
    includes:['Hasta 4 Combinaciones de Especialidades','24 Rebanadas','1 Refresco de 2 lts','Orilla Rellena de Queso'],
    flavorCfg:{ maxChoices:4, label:'Elige Hasta 4 Sabores', excludeCat:'Mariscos' } },
  { id:3, name:'Paquete 3: Pizza Grande',      price:260, desc:'1 Pizza Grande a Elegir + Refresco 2L.',          img:'images/combo-familiar.png',
    includes:['1 Pizza Grande (Hawaiana o Peperoni)','1 Refresco de 2 lts'],
    flavorCfg:{ maxChoices:1, label:'Elige tu Sabor', allowedNames:['Hawaiana','Peperoni'] } },
  { id:4, name:'Paquete 4: Pizza Familiar',      price:300, desc:'1 Pizza Familiar Cualquier Especialidad + Refresco 2L.', img:'images/combo-familiar.png',
    includes:['1 Pizza Familiar (Cualquier Especialidad)','1 Refresco de 2 lts'],
    flavorCfg:{ maxChoices:1, label:'Elige tu Especialidad', excludeCat:'Mariscos' } },
];

const CATEGORIES = [...new Set(PIZZAS.map(p => p.cat))];
const WA_PHONE = '529711872883';

/* ═══════════════════════════════════════════════════════
   CART STATE
═══════════════════════════════════════════════════════ */

let cart = [];
let selectedCardSizes = {};

function cartTotal()  { return cart.reduce((s, i) => s + i.total, 0); }
function cartCount()  { return cart.reduce((s, i) => s + i.qty,   0); }

function addCartItem(data) {
  const single = data.basePrice + (data.cheeseCrust ? (CHEESE_EXTRA[data.size] || 0) : 0)
               + (data.halfAndHalf && data.halfId ? (HALF_EXTRA[data.size] || 0) : 0);
  cart.push({ ...data, id: Date.now() + Math.random(), qty: 1, total: single });
  renderCart();
  openCart();
}

function removeCartItem(id) {
  cart = cart.filter(i => i.id !== id);
  renderCart();
}

function changeQty(id, delta) {
  cart = cart.map(i => {
    if (i.id !== id) return i;
    const qty = Math.max(1, i.qty + delta);
    const single = i.total / i.qty;
    return { ...i, qty, total: single * qty };
  });
  renderCart();
}

/* ═══════════════════════════════════════════════════════
   CART RENDER
═══════════════════════════════════════════════════════ */

function renderCart() {
  const itemsEl  = document.getElementById('cart-items');
  const footerEl = document.getElementById('cart-footer');
  const badge    = document.getElementById('cart-badge');
  const count    = cartCount();

  badge.textContent = count;
  badge.classList.toggle('hidden', count === 0);

  if (cart.length === 0) {
    itemsEl.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <p>Tu carrito está vacío</p>
        <span>Agrega algunas pizzas para comenzar.</span>
      </div>`;
    footerEl.innerHTML = '';
    return;
  }

  itemsEl.innerHTML = cart.map(item => {
    const nameHtml = item.halfAndHalf && item.halfName
      ? `Mitad ${item.name} / Mitad ${item.halfName}`
      : item.comboId ? item.name : item.name;
    const sizeHtml = item.comboId ? '' : `<div class="cart-item-sub">${SIZE_LABELS[item.size]}</div>`;
    const extrasHtml = buildCartExtras(item);
    const flavorsHtml = item.flavors && item.flavors.length
      ? `<div class="cart-item-extras"><div class="cart-item-extra">Sabores: ${item.flavors.join(', ')}</div></div>` : '';

    return `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-top">
          <div class="cart-item-name">${nameHtml}</div>
          <div class="cart-item-total">$${item.total}</div>
        </div>
        ${sizeHtml}
        ${extrasHtml}
        ${flavorsHtml}
        <div class="cart-item-controls">
          <div class="qty-ctrl">
            <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn" onclick="changeQty(${item.id}, +1)">+</button>
          </div>
          <button class="cart-remove" onclick="removeCartItem(${item.id})">🗑</button>
        </div>
      </div>`;
  }).join('');

  footerEl.innerHTML = `
    <div class="cart-total-row">
      <span>Total</span>
      <span class="cart-total-price">$${cartTotal()}</span>
    </div>
    <button class="btn btn-whatsapp btn-full" style="height:52px;font-size:1rem;border-radius:12px;"
      onclick="sendCartToWA()">
      Ordenar Ahora
    </button>`;
}

function buildCartExtras(item) {
  const parts = [];
  if (item.halfAndHalf && item.halfName) parts.push(`+ Mitad y mitad (+$${HALF_EXTRA[item.size] || 0})`);
  if (item.cheeseCrust) parts.push(`+ Orilla rellena de queso (+$${CHEESE_EXTRA[item.size] || 0})`);
  if (!parts.length) return '';
  return `<div class="cart-item-extras">${parts.map(p => `<div class="cart-item-extra">${p}</div>`).join('')}</div>`;
}

/* ═══════════════════════════════════════════════════════
   CART PANEL OPEN / CLOSE
═══════════════════════════════════════════════════════ */

let cartIsOpen = false;

function openCart()   { cartIsOpen = true;  document.getElementById('cart-panel').classList.add('open'); document.getElementById('cart-overlay').classList.add('open'); }
function closeCartPanel() { cartIsOpen = false; document.getElementById('cart-panel').classList.remove('open'); document.getElementById('cart-overlay').classList.remove('open'); }
function toggleCart() { cartIsOpen ? closeCartPanel() : openCart(); }

/* ═══════════════════════════════════════════════════════
   WHATSAPP
═══════════════════════════════════════════════════════ */

function buildWAMsg(lines) {
  return encodeURIComponent(lines.join('\n'));
}

function sendCartToWA() {
  if (!cart.length) return;
  const lines = ['Hola, me gustaría ordenar el siguiente pedido:', '', '*PIZZAAA - Tu Pedido*', '------------------------', ''];
  cart.forEach(item => {
    if (item.comboId) {
      lines.push(`▪ ${item.qty}x ${item.name}`);
      if (item.flavors && item.flavors.length) lines.push(`  Sabores: ${item.flavors.join(', ')}`);
    } else if (item.halfAndHalf && item.halfName) {
      lines.push(`▪ ${item.qty}x Pizza Mitad ${item.name} / Mitad ${item.halfName} (${SIZE_LABELS[item.size]})`);
      lines.push(`  + Mitad y mitad (+$${HALF_EXTRA[item.size] || 0})`);
    } else {
      lines.push(`▪ ${item.qty}x ${item.name} (${SIZE_LABELS[item.size]})`);
    }
    if (item.cheeseCrust) lines.push(`  + Orilla rellena de queso (+$${CHEESE_EXTRA[item.size] || 0})`);
    lines.push(`  Subtotal: $${item.total}`, '');
  });
  lines.push('------------------------', `*Total a pagar: $${cartTotal()}*`, '', '¿Me pueden confirmar el tiempo estimado y opciones de pago?');
  window.open(`https://wa.me/${WA_PHONE}?text=${buildWAMsg(lines)}`, '_blank');
}

function orderNowWA(item) {
  const single = item.basePrice + (item.cheeseCrust ? (CHEESE_EXTRA[item.size]||0) : 0)
               + (item.halfAndHalf && item.halfId ? (HALF_EXTRA[item.size]||0) : 0);
  const lines = ['Hola, me gustaría ordenar el siguiente pedido:', '', '*PIZZAAA - Tu Pedido*', '------------------------', ''];
  if (item.comboId) {
    lines.push(`▪ 1x ${item.name}`);
    if (item.flavors && item.flavors.length) lines.push(`  Sabores: ${item.flavors.join(', ')}`);
  } else if (item.halfAndHalf && item.halfName) {
    lines.push(`▪ 1x Pizza Mitad ${item.name} / Mitad ${item.halfName} (${SIZE_LABELS[item.size]})`);
    lines.push(`  + Mitad y mitad (+$${HALF_EXTRA[item.size]||0})`);
  } else {
    lines.push(`▪ 1x ${item.name} (${SIZE_LABELS[item.size]})`);
  }
  if (item.cheeseCrust) lines.push(`  + Orilla rellena de queso (+$${CHEESE_EXTRA[item.size]||0})`);
  lines.push('', '------------------------', `*Total a pagar: $${single}*`, '', '¿Me pueden confirmar el tiempo estimado y opciones de pago?');
  window.open(`https://wa.me/${WA_PHONE}?text=${buildWAMsg(lines)}`, '_blank');
}

/* ═══════════════════════════════════════════════════════
   MODAL STATE
═══════════════════════════════════════════════════════ */

let modal = {
  type: null,   // 'pizza' | 'combo'
  pizzaId: null,
  comboId: null,
  size: 'medium',
  cheeseCrust: false,
  halfAndHalf: false,
  halfId: null,
  flavors: [],
};

function getPizza(id) { return PIZZAS.find(p => p.id === id); }
function getCombo(id) { return COMBOS.find(c => c.id === id); }
function getAvailableSizes(pizza) {
  return ['small','medium','large','xlarge','cuadrada','mega'].filter(s => pizza.prices[s] !== undefined);
}

/* ── PIZZA MODAL ────────────────────────────────────── */

function openPizzaModal(pizzaId) {
  const p = getPizza(pizzaId);
  if (!p) return;

  const defaultSize = selectedCardSizes[pizzaId] || 
    (p.prices['medium'] !== undefined ? 'medium' : getAvailableSizes(p)[0]);

  modal = {
    type: 'pizza',
    pizzaId: pizzaId,
    comboId: null,
    size: defaultSize,
    cheeseCrust: false,
    halfAndHalf: false,
    halfId: null,
    flavors: []
  };

  renderModal();
  showModal();
}
/* ── COMBO MODAL ────────────────────────────────────── */

function openComboModal(comboId) {
  modal = { type:'combo', pizzaId:null, comboId, size:'xlarge', cheeseCrust:false, halfAndHalf:false, halfId:null, flavors:[] };
  renderModal();
  showModal();
}

function showModal() {
  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(e) {
  if (e && e.target !== document.getElementById('modal-overlay')) return;
  forceCloseModal();
}

function forceCloseModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

/* ═══════════════════════════════════════════════════════
   RENDER MODAL
═══════════════════════════════════════════════════════ */

function renderModal() {
  if (modal.type === 'pizza') renderPizzaModal();
  else if (modal.type === 'combo') renderComboModal();
}

function renderPizzaModal() {
  const p = getPizza(modal.pizzaId);
  const sizes = getAvailableSizes(p);
  const isMarisc = false;
  const showCheese = modal.size !== 'cuadrada' && modal.size !== 'mega';

  const basePrice   = p.prices[modal.size] || 0;
  const cheesePrice = (modal.cheeseCrust && showCheese) ? (CHEESE_EXTRA[modal.size]||0) : 0;
  const halfPrice   = (modal.halfAndHalf && modal.halfId) ? (HALF_EXTRA[modal.size]||0) : 0;
  const total       = basePrice + cheesePrice + halfPrice;

  const canAdd = !modal.halfAndHalf || modal.halfId;

  const colsClass = sizes.length <= 3 ? 'cols-'+sizes.length : sizes.length === 4 ? 'cols-4' : '';

  document.getElementById('modal-body').innerHTML = `
    <div class="modal-head">
      ${p.img ? `<img src="${p.img}" alt="${p.name}">` : `<div class="modal-head-placeholder">PIZZAAA</div>`}
      <div class="modal-head-overlay">
        <div class="modal-head-text">
          <div class="modal-pizza-name">${p.name}</div>
          <div class="modal-pizza-desc">${p.desc}</div>
        </div>
      </div>
      <button class="modal-back-btn" onclick="forceCloseModal()">←</button>
    </div>

    <div class="modal-body">
      <!-- Size -->
      <div>
        <div class="modal-section-title">
          <span class="modal-section-bar modal-section-bar--gold"></span>
          Tamaño
        </div>
        <div class="size-grid ${colsClass}">
          ${sizes.map(s => `
            <button class="size-opt ${modal.size===s?'active':''}" onclick="setModalSize('${s}')">
              <span class="size-opt-name">${SIZE_LABELS[s]}</span>
              ${SIZE_SLICES[s] ? `<span class="size-opt-slices">${SIZE_SLICES[s]}</span>` : ''}
              <span class="size-opt-price">$${p.prices[s]}</span>
            </button>`).join('')}
        </div>
      </div>

      <!-- Orilla rellena -->
      ${showCheese ? `
      <div>
        <div class="modal-section-title">
          <span class="modal-section-bar modal-section-bar--gold"></span>
          Orilla Rellena de Queso
        </div>
        <div class="toggle-row ${modal.cheeseCrust?'checked':''}" onclick="toggleCheese()">
          <div class="toggle-row-left">
            <div class="toggle-check">${modal.cheeseCrust?'✓':''}</div>
            <div>
              <div class="toggle-label">Orilla Rellena de Queso</div>
              <div class="toggle-sublabel">Mozzarella fundida en la orilla</div>
            </div>
          </div>
          <div class="toggle-price">+$${CHEESE_EXTRA[modal.size]||0}</div>
        </div>
      </div>` : ''}

      <!-- Mitad y mitad -->
      ${!isMarisc ? `
      <div>
        <div class="modal-section-title">
          <span class="modal-section-bar modal-section-bar--red"></span>
          Pizza Mitad y Mitad
          
        </div>
        <div class="toggle-row ${modal.halfAndHalf?'checked':''}" onclick="toggleHalf()">
          <div class="toggle-row-left">
            <div class="toggle-check">${modal.halfAndHalf?'✓':''}</div>
            <div>
              <div class="toggle-label">Dividir en dos sabores</div>
              <div class="toggle-sublabel">Una mitad <strong>${p.name}</strong>, la otra a elegir</div>
            </div>
          </div>
          <div class="toggle-price">+$${HALF_EXTRA[modal.size]||0}</div>
        </div>
        ${modal.halfAndHalf ? `
          <div style="margin-top:10px;">
            <p style="font-size:.8rem;font-weight:600;color:var(--text-muted);margin-bottom:8px;">Elige el sabor de la otra mitad:</p>
            <div class="half-pizza-grid">
              ${PIZZAS.filter(op => op.id !== p.id).map(op => `
                <button class="half-opt ${modal.halfId===op.id?'active':''}" onclick="selectHalf(${op.id})">
                  <span class="half-opt-name">${op.name}</span>
                  <span class="half-opt-desc">${op.desc}</span>
                </button>`).join('')}
            </div>
          </div>` : ''}
      </div>` : ''}
    </div>

    <div class="modal-footer">
      ${modal.halfAndHalf && !modal.halfId ? `<div class="modal-error">Selecciona el sabor de la otra mitad para continuar</div>` : ''}
      <div class="modal-footer-btns">
        <button class="btn btn-outline" ${!canAdd?'disabled':''} onclick="addPizzaToCart()">
          Agregar al carrito &bull; $${total}
        </button>
        <button class="btn btn-whatsapp" ${!canAdd?'disabled':''} onclick="pizzaOrderNow()">
          Ordenar Ahora
        </button>
      </div>
    </div>`;
}

function renderComboModal() {
  const c = getCombo(modal.comboId);
  const cfg = c.flavorCfg;
  const availPizzas = PIZZAS.filter(p => {
    if (cfg.excludeCat && p.cat === cfg.excludeCat) return false;
    if (cfg.allowedNames && !cfg.allowedNames.includes(p.name)) return false;
    return true;
  });
  const canAdd = modal.flavors.length >= 1;

  document.getElementById('modal-body').innerHTML = `
    <div class="modal-combo-head">
      <button class="modal-combo-back" onclick="forceCloseModal()">←</button>
      <div>
        <div class="modal-combo-name">${c.name}</div>
        <div class="modal-combo-info">$${c.price} &bull; ${c.desc}</div>
      </div>
    </div>

    <div class="modal-body">
      <!-- Flavor selection -->
      <div>
        <div class="flavor-header">
          <div class="modal-section-title" style="margin:0">
            <span class="modal-section-bar modal-section-bar--red"></span>
            ${cfg.label}
          </div>
          <span class="flavor-counter">${modal.flavors.length}/${cfg.maxChoices}</span>
        </div>
        <div class="flavor-grid" style="margin-top:10px">
          ${availPizzas.map(p => {
            const isSel = modal.flavors.includes(p.name);
            const isDisabled = !isSel && modal.flavors.length >= cfg.maxChoices;
            return `<button class="flavor-opt ${isSel?'active':''} ${isDisabled?'disabled':''}"
              onclick="toggleFlavor('${p.name}')" ${isDisabled?'disabled':''}>
              <span class="flavor-check">✓</span>
              <span class="flavor-opt-name">${p.name}</span>
              <span class="flavor-opt-desc">${p.desc}</span>
            </button>`;
          }).join('')}
        </div>
      </div>

      <!-- Includes -->
      <div class="modal-includes">
        <div class="modal-includes-title">Incluye:</div>
        <ul>
          ${c.includes.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    </div>

    <div class="modal-footer">
      ${!canAdd ? `<div class="modal-error">Selecciona al menos un sabor para continuar</div>` : ''}
      <div class="modal-footer-btns">
        <button class="btn btn-outline" ${!canAdd?'disabled':''} onclick="addComboToCart()">
          Agregar al carrito &bull; $${c.price}
        </button>
        <button class="btn btn-whatsapp" ${!canAdd?'disabled':''} onclick="comboOrderNow()">
          Ordenar Ahora
        </button>
      </div>
    </div>`;
}

/* ── MODAL ACTIONS ──────────────────────────────────── */

function setModalSize(size) {
  modal.size = size;
  modal.cheeseCrust = false; // reset cheese when size changes to/from special sizes
  renderModal();
  // restore scroll position in modal body
}

function toggleCheese() {
  modal.cheeseCrust = !modal.cheeseCrust;
  renderModal();
}

function toggleHalf() {
  modal.halfAndHalf = !modal.halfAndHalf;
  if (!modal.halfAndHalf) modal.halfId = null;
  renderModal();
}

function selectHalf(id) {
  modal.halfId = id;
  renderModal();
  // Scroll to bottom so user sees the buttons
  const body = document.querySelector('.modal-body');
  if (body) body.scrollTop = body.scrollHeight;
}

function toggleFlavor(name) {
  const c = getCombo(modal.comboId);
  if (modal.flavors.includes(name)) {
    modal.flavors = modal.flavors.filter(f => f !== name);
  } else if (modal.flavors.length < c.flavorCfg.maxChoices) {
    modal.flavors = [...modal.flavors, name];
  }
  renderModal();
}

function addPizzaToCart() {
  const p = getPizza(modal.pizzaId);
  if (!p) return;
  const halfPizza = modal.halfId ? getPizza(modal.halfId) : null;
  addCartItem({
    name: p.name, size: modal.size, basePrice: p.prices[modal.size],
    cheeseCrust: modal.cheeseCrust && modal.size !== 'cuadrada' && modal.size !== 'mega',
    halfAndHalf: modal.halfAndHalf && !!halfPizza,
    halfId: modal.halfId, halfName: halfPizza ? halfPizza.name : '',
    comboId: null, flavors: [],
  });
  forceCloseModal();
}

function pizzaOrderNow() {
  const p = getPizza(modal.pizzaId);
  if (!p) return;
  const halfPizza = modal.halfId ? getPizza(modal.halfId) : null;
  orderNowWA({
    name: p.name, size: modal.size, basePrice: p.prices[modal.size],
    cheeseCrust: modal.cheeseCrust && modal.size !== 'cuadrada' && modal.size !== 'mega',
    halfAndHalf: modal.halfAndHalf && !!halfPizza,
    halfId: modal.halfId, halfName: halfPizza ? halfPizza.name : '',
    comboId: null, flavors: [],
  });
  forceCloseModal();
}

function addComboToCart() {
  const c = getCombo(modal.comboId);
  if (!c || modal.flavors.length === 0) return;
  addCartItem({
    name: c.name, size: 'xlarge', basePrice: c.price,
    cheeseCrust: false, halfAndHalf: false, halfId: null, halfName: '',
    comboId: c.id, flavors: [...modal.flavors],
  });
  forceCloseModal();
}

function comboOrderNow() {
  const c = getCombo(modal.comboId);
  if (!c || modal.flavors.length === 0) return;
  orderNowWA({
    name: c.name, size: 'xlarge', basePrice: c.price,
    cheeseCrust: false, halfAndHalf: false, halfId: null, halfName: '',
    comboId: c.id, flavors: [...modal.flavors],
  });
  forceCloseModal();
}

/* ═══════════════════════════════════════════════════════
   RENDER PAGES
═══════════════════════════════════════════════════════ */

function renderCatNav() {
  const nav = document.getElementById('cat-nav');
  const buttons = [
    ...CATEGORIES.map(cat => ({ label: cat, id: `cat-${cat}` })),
    { label: 'Combos', id: 'combos' },
    { label: 'Ubicación', id: 'ubicacion' },
  ];
  nav.innerHTML = buttons.map(b =>
    `<button class="cat-btn" onclick="scrollToSection('${b.id}')">${b.label}</button>`
  ).join('');
}

function renderMenu() {
  const content = document.getElementById('menu-content');
  content.innerHTML = CATEGORIES.map(cat => {
    const pizzasInCat = PIZZAS.filter(p => p.cat === cat);
    return `
      <div class="pizza-category" id="cat-${cat}">
        <div class="cat-label">
          <span class="cat-label-bar"></span>
          ${cat}
        </div>
        <div class="pizza-grid">
          ${pizzasInCat.map(p => renderPizzaCard(p)).join('')}
        </div>
      </div>`;
  }).join('');
}

function renderPizzaCard(p) {
  const sizes  = getAvailableSizes(p);
  const defSz  = p.prices['medium'] !== undefined ? 'medium' : sizes[0];

  const sizePills = sizes.map(s => `
    <button class="size-pill ${s===defSz?'active':''}"
      onclick="cardSizeChange(${p.id}, '${s}', this)">
      ${SIZE_LABELS[s]}
      <span>$${p.prices[s]}</span>
    </button>`).join('');

  return `
    <div class="pizza-card">
      <div class="pizza-card-img-wrap">
        ${p.img
          ? `<img class="pizza-card-img" src="${p.img}" alt="${p.name}" loading="lazy">`
          : `<div class="pizza-card-placeholder">PIZZAAA</div>`}
        <span class="pizza-badge">Desde $${p.prices.small}</span>
      </div>
      <div class="pizza-card-body">
        <div class="pizza-card-name">${p.name}</div>
        <div class="pizza-card-desc">${p.desc}</div>
        <div class="size-pills" id="pills-${p.id}">${sizePills}</div>
        <div class="pizza-card-footer">
          <button class="btn btn-primary btn-full"
            id="card-btn-${p.id}"
            onclick="openPizzaModal(${p.id})">
            Añadir $${p.prices[defSz]}
          </button>
        </div>
      </div>
    </div>`;
}

function cardSizeChange(pizzaId, size, el) {
  document.querySelectorAll(`#pills-${pizzaId} .size-pill`).forEach(b => b.classList.remove('active'));
  el.classList.add('active');

  const p = getPizza(pizzaId);
  const btn = document.getElementById(`card-btn-${pizzaId}`);

  if (btn) {
    btn.textContent = `Agregar $${p.prices[size]}`;
  }

  selectedCardSizes[pizzaId] = size;
}

function renderCombos() {
  document.getElementById('combos-grid').innerHTML = COMBOS.map(c => `
    <div class="combo-card">
      <div class="combo-card-img-wrap">
        ${c.img
          ? `<img class="combo-card-img" src="${c.img}" alt="${c.name}" loading="lazy">`
          : `<div class="combo-card-placeholder">⭐</div>`}
      </div>
      <div class="combo-card-body">
        <div class="combo-card-name">${c.name}</div>
        <div class="combo-card-desc">${c.desc}</div>
        <ul class="combo-includes">
          ${c.includes.map(i => `<li>${i}</li>`).join('')}
        </ul>
        <div class="combo-card-footer">
          <span class="combo-price">$${c.price}</span>
          <button class="btn btn-primary btn-sm" onclick="openComboModal(${c.id})">Personalizar</button>
        </div>
      </div>
    </div>`).join('');
}

/* ═══════════════════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════════════════ */

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Keyboard: close modal on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') forceCloseModal();
});

// Also allow clicking modal overlay background
document.getElementById('modal-overlay').addEventListener('click', function(e) {
  if (e.target === this) forceCloseModal();
});

/* ═══════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════ */

document.getElementById('year').textContent = new Date().getFullYear();
renderCatNav();
renderMenu();
renderCombos();
renderCart();
