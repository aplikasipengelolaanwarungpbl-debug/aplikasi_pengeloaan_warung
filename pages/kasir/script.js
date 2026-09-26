// State Keranjang & Pembayaran Kasir
let cartItems = [];
let selectedPaymentMethod = 'cash';

function addToCart(id, name, price, stock) {
  const existing = cartItems.find(item => item.id === id);
  if (existing) {
    if (existing.qty < stock) {
      existing.qty += 1;
    }
  } else {
    cartItems.push({ id, name, price, stock, qty: 1 });
  }
  renderCart();
}

function updateCartQty(id, delta) {
  const item = cartItems.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cartItems = cartItems.filter(i => i.id !== id);
  }
  renderCart();
}

function clearCart() {
  cartItems = [];
  renderCart();
}

function renderCart() {
  const listEl = document.getElementById('cart-items-list');
  const subtotalEl = document.getElementById('cart-subtotal');
  const totalEl = document.getElementById('cart-total');
  const btnCheckout = document.getElementById('btn-checkout');

  if (!listEl) return;

  if (cartItems.length === 0) {
    listEl.innerHTML = `
      <div class="text-center py-5 text-muted" id="cart-empty-placeholder">
        <i data-lucide="shopping-cart" class="icon-lg text-subtle mb-2"></i>
        <p class="small mb-0">Keranjang masih kosong</p>
        <small class="text-muted">Klik produk di samping untuk menambahkan</small>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = 'Rp 0';
    if (totalEl) totalEl.textContent = 'Rp 0';
    if (btnCheckout) btnCheckout.disabled = true;
    refreshIcons();
    return;
  }

  let total = 0;
  let html = '';

  cartItems.forEach(item => {
    const itemTotal = item.price * item.qty;
    total += itemTotal;
    html += `
      <div class="cart-item-row d-flex justify-content-between align-items-center">
        <div class="pe-2">
          <h6 class="fw-semibold text-dark small mb-0">${item.name}</h6>
          <small class="text-muted">Rp ${item.price.toLocaleString('id-ID')}</small>
        </div>
        <div class="d-flex align-items-center gap-2">
          <div class="d-flex align-items-center border rounded bg-white">
            <button class="btn btn-sm btn-link text-dark p-0 qty-btn text-decoration-none" onclick="updateCartQty(${item.id}, -1)">-</button>
            <span class="px-2 small fw-bold">${item.qty}</span>
            <button class="btn btn-sm btn-link text-dark p-0 qty-btn text-decoration-none" onclick="updateCartQty(${item.id}, 1)">+</button>
          </div>
          <span class="fw-bold text-dark small text-nowrap ms-1">Rp ${itemTotal.toLocaleString('id-ID')}</span>
        </div>
      </div>
    `;
  });

  listEl.innerHTML = html;
  if (subtotalEl) subtotalEl.textContent = `Rp ${total.toLocaleString('id-ID')}`;
  if (totalEl) totalEl.textContent = `Rp ${total.toLocaleString('id-ID')}`;
  if (btnCheckout) btnCheckout.disabled = false;
  refreshIcons();
}

function filterKasirProducts() {
  const query = (document.getElementById('kasir-search-input')?.value || '').toLowerCase();
  const activeBtn = document.querySelector('.btn-category-pill.active');
  const activeCategory = activeBtn?.textContent.trim() || 'Semua';

  const cards = document.querySelectorAll('.product-card-wrapper');
  cards.forEach(card => {
    const name = (card.getAttribute('data-name') || '').toLowerCase();
    const category = card.getAttribute('data-category') || '';
    const matchQuery = name.includes(query);
    const matchCategory = activeCategory === 'Semua' || category === activeCategory;

    card.style.display = (matchQuery && matchCategory) ? '' : 'none';
  });
}

function filterKasirCategory(category, btn) {
  document.querySelectorAll('.btn-category-pill').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  filterKasirProducts();
}

function openPaymentModal() {
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const totalEl = document.getElementById('kasir-modal-total');
  if (totalEl) totalEl.textContent = `Rp ${total.toLocaleString('id-ID')}`;
  
  const inputUang = document.getElementById('kasir-input-uang');
  if (inputUang) inputUang.value = '';
  
  const kembalianEl = document.getElementById('kasir-kembalian');
  if (kembalianEl) kembalianEl.textContent = 'Rp 0';

  setPaymentMethod('cash');

  const modalEl = document.getElementById('modalPembayaranKasir');
  if (modalEl && window.bootstrap) {
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }
}

function setPaymentMethod(method) {
  selectedPaymentMethod = method;

  const optCash = document.getElementById('pay-opt-cash');
  const optQris = document.getElementById('pay-opt-qris');
  const secCash = document.getElementById('section-pay-cash');
  const secQris = document.getElementById('section-pay-qris');

  if (method === 'cash') {
    optCash?.classList.add('active');
    optQris?.classList.remove('active');
    secCash?.classList.remove('d-none');
    secQris?.classList.add('d-none');
  } else {
    optQris?.classList.add('active');
    optCash?.classList.remove('active');
    secQris?.classList.remove('d-none');
    secCash?.classList.add('d-none');
  }
}

function calculateChange() {
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const uang = parseFloat(document.getElementById('kasir-input-uang')?.value || 0);
  const kembalian = uang - total;
  const kembalianEl = document.getElementById('kasir-kembalian');
  if (kembalianEl) {
    kembalianEl.textContent = kembalian >= 0 ? `Rp ${kembalian.toLocaleString('id-ID')}` : 'Rp 0 (Kurang)';
    kembalianEl.className = kembalian >= 0 ? 'fw-bold fs-5 text-success' : 'fw-bold fs-5 text-danger';
  }
}

function setQuickCash(val) {
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const inputUang = document.getElementById('kasir-input-uang');
  if (!inputUang) return;
  inputUang.value = val === 'exact' ? total : val;
  calculateChange();
}

function completeTransaction() {
  const modalEl = document.getElementById('modalPembayaranKasir');
  if (modalEl && window.bootstrap) {
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal?.hide();
  }
  alert('Transaksi berhasil disimpan!');
  clearCart();
}

// Inisialisasi awal kasir
renderCart();
