let userRole = 'owner';
let chartProfitInstance = null;
let chartCustomerInstance = null;

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

async function loadComponent(elementId, filePath) {
  try {
    const res = await fetch(filePath);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Gagal memuat ${filePath}`);
    const html = await res.text();
    const container = document.getElementById(elementId);
    if (container) {
      container.innerHTML = html;
      refreshIcons();
    }
  } catch (err) {
    console.error('Error loadComponent:', err);
  }
}

function applyRBAC() {
  const restrictedElements = document.querySelectorAll('[data-role]');
  restrictedElements.forEach(el => {
    const requiredRole = el.getAttribute('data-role');
    el.style.display = (userRole === requiredRole) ? '' : 'none';
  });

  const topbarBadge = document.getElementById('topbar-role-badge');
  if (topbarBadge) {
    topbarBadge.textContent = userRole.toUpperCase();
  }

  const sidebarStaffName = document.getElementById('sidebar-staff-name');
  const sidebarStaffRole = document.getElementById('sidebar-staff-role');
  if (sidebarStaffName && sidebarStaffRole) {
    if (userRole === 'owner') {
      sidebarStaffName.textContent = 'Budi Santoso';
      sidebarStaffRole.textContent = 'Owner (Kasir Aktif)';
    } else {
      sidebarStaffName.textContent = 'Siti Aminah';
      sidebarStaffRole.textContent = 'Staf Kasir (Shift 1)';
    }
  }

  const roleSelect = document.getElementById('role-select');
  if (roleSelect && roleSelect.value !== userRole) {
    roleSelect.value = userRole;
  }
}

function setRole(role) {
  userRole = role;
  applyRBAC();
}

function toggleSidebar() {
  const wrapper = document.getElementById('wrapper');
  if (wrapper) wrapper.classList.toggle('toggled');
}

function initDashboardCharts() {
  const profitEl = document.querySelector('#chart-total-profit');
  const customerEl = document.querySelector('#chart-customer-rate');

  if (chartProfitInstance) {
    chartProfitInstance.destroy();
    chartProfitInstance = null;
  }
  if (chartCustomerInstance) {
    chartCustomerInstance.destroy();
    chartCustomerInstance = null;
  }

  // 1. Smooth Area Chart (Tren Omzet Harian 7 Hari)
  if (profitEl) {
    const profitOptions = {
      series: [{
        name: 'Omzet Penjualan',
        data: [478500, 560000, 430000, 385000, 610000, 520000, 690000]
      }],
      chart: {
        type: 'area',
        height: 280,
        toolbar: { show: false },
        fontFamily: 'Inter, sans-serif'
      },
      colors: ['#2563eb'],
      stroke: {
        curve: 'smooth',
        width: 2
      },
      fill: {
        type: 'solid',
        opacity: 0.05
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: ['18 Sep', '19 Sep', '20 Sep', '21 Sep', '22 Sep', '23 Sep', '24 Sep (Hari Ini)'],
        labels: { style: { colors: '#64748b', fontSize: '11px' } },
        axisBorder: { show: true, color: '#e2e8f0' },
        axisTicks: { show: true, color: '#e2e8f0' }
      },
      yaxis: {
        labels: {
          formatter: (val) => 'Rp ' + Math.round(val / 1000) + 'k',
          style: { colors: '#64748b', fontSize: '12px' }
        }
      },
      grid: {
        borderColor: '#e2e8f0',
        strokeDashArray: 0
      },
      tooltip: {
        y: { formatter: (val) => 'Rp ' + val.toLocaleString('id-ID') }
      }
    };
    chartProfitInstance = new ApexCharts(profitEl, profitOptions);
    chartProfitInstance.render();
  }

  if (customerEl) {
    const customerOptions = {
      series: [369000, 109500],
      labels: ['Tunai (Laci)', 'QRIS / Digital'],
      chart: {
        type: 'donut',
        height: 230,
        fontFamily: 'Inter, sans-serif'
      },
      colors: ['#16a34a', '#2563eb'],
      legend: { show: false },
      dataLabels: { enabled: false },
      plotOptions: {
        pie: {
          donut: {
            size: '75%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Total Masuk',
                fontSize: '12px',
                color: '#64748b',
                formatter: () => 'Rp 478.5k'
              }
            }
          }
        }
      },
      stroke: { width: 0 },
      tooltip: {
        y: { formatter: (val) => 'Rp ' + val.toLocaleString('id-ID') }
      }
    };
    chartCustomerInstance = new ApexCharts(customerEl, customerOptions);
    chartCustomerInstance.render();
  }
}

async function loadPage(pagePath, triggerEl = null) {
  const oldLink = document.getElementById('page-css');
  if (oldLink) oldLink.remove();

  await loadComponent('main-content', pagePath);

  const pageName = pagePath.replace('pages/', '').replace('.html', '');
  const cssLink = document.createElement('link');
  cssLink.rel = 'stylesheet';
  cssLink.id = 'page-css';
  cssLink.href = `assets/css/${pageName}.css`;
  document.head.appendChild(cssLink);

  const targetLink = triggerEl || document.querySelector(`#sidebar-container a[onclick*="${pagePath}"]`);
  if (targetLink) {
    document.querySelectorAll('#sidebar-container .nav-link-custom').forEach(link => {
      link.classList.remove('active');
    });
    targetLink.classList.add('active');

    const parentCollapse = targetLink.closest('.collapse');
    if (parentCollapse && window.bootstrap) {
      const bsCollapse = bootstrap.Collapse.getOrCreateInstance(parentCollapse, { toggle: false });
      bsCollapse.show();
    }
  }

  if (pagePath.includes('dashboard')) {
    initDashboardCharts();
  } else if (pagePath.includes('laporan-laba-rugi')) {
    initLabaRugiChart();
  } else if (pagePath.includes('laporan-terlaris')) {
    initTerlarisCharts();
  }
}

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

function exportDataTrx() {
  alert('Mengunduh data riwayat transaksi (.xlsx)...');
}

function openAddProductModal() {
  const form = document.getElementById('form-produk');
  if (form) form.reset();
  const label = document.getElementById('modalFormProdukLabel');
  if (label) label.textContent = 'Tambah Produk Baru';

  const modalEl = document.getElementById('modalFormProduk');
  if (modalEl && window.bootstrap) {
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }
}

function saveProduct() {
  const name = document.getElementById('prod-name')?.value;
  const price = document.getElementById('prod-price')?.value;
  if (!name || !price) {
    alert('Mohon isi nama produk dan harga jual!');
    return;
  }

  const modalEl = document.getElementById('modalFormProduk');
  if (modalEl && window.bootstrap) {
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal?.hide();
  }
  alert(`Produk "${name}" berhasil disimpan!`);
}

function editProduct(id) {
  const label = document.getElementById('modalFormProdukLabel');
  if (label) label.textContent = 'Edit Data Produk';

  const modalEl = document.getElementById('modalFormProduk');
  if (modalEl && window.bootstrap) {
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }
}

function deleteProduct(id) {
  if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
    alert('Produk berhasil dihapus!');
  }
}

function filterProdukTable() {
  const query = (document.getElementById('produk-table-search')?.value || '').toLowerCase();
  const cat = document.getElementById('produk-filter-category')?.value || 'all';
  const stockFilter = document.getElementById('produk-filter-stock')?.value || 'all';

  const rows = document.querySelectorAll('.produk-row');
  rows.forEach(row => {
    const name = (row.getAttribute('data-name') || '').toLowerCase();
    const category = row.getAttribute('data-category') || '';
    const stock = parseInt(row.getAttribute('data-stock') || '0', 10);

    const matchQuery = name.includes(query);
    const matchCat = cat === 'all' || category === cat;
    let matchStock = true;
    if (stockFilter === 'in_stock') matchStock = stock > 10;
    if (stockFilter === 'low_stock') matchStock = stock <= 10;

    row.style.display = (matchQuery && matchCat && matchStock) ? '' : 'none';
  });
}

function resetProdukFilter() {
  const search = document.getElementById('produk-table-search');
  const cat = document.getElementById('produk-filter-category');
  const stock = document.getElementById('produk-filter-stock');
  if (search) search.value = '';
  if (cat) cat.value = 'all';
  if (stock) stock.value = 'all';
  filterProdukTable();
}

function exportDataProduk() {
  alert('Mengunduh data inventaris produk (.xlsx)...');
}

function openAddCategoryModal() {
  const form = document.getElementById('form-kategori');
  if (form) form.reset();
  const label = document.getElementById('modalFormKategoriLabel');
  if (label) label.textContent = 'Tambah Kategori Baru';

  const modalEl = document.getElementById('modalFormKategori');
  if (modalEl && window.bootstrap) {
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }
}

function saveCategory() {
  const name = document.getElementById('cat-name')?.value;
  if (!name) {
    alert('Mohon isi nama kategori!');
    return;
  }

  const modalEl = document.getElementById('modalFormKategori');
  if (modalEl && window.bootstrap) {
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal?.hide();
  }
  alert(`Kategori "${name}" berhasil disimpan!`);
}

function editCategory(id) {
  const label = document.getElementById('modalFormKategoriLabel');
  if (label) label.textContent = 'Edit Data Kategori';

  const modalEl = document.getElementById('modalFormKategori');
  if (modalEl && window.bootstrap) {
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }
}

function deleteCategory(id) {
  if (confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
    alert('Kategori berhasil dihapus!');
  }
}

function filterKategoriTable() {
  const query = (document.getElementById('kategori-table-search')?.value || '').toLowerCase();
  const rows = document.querySelectorAll('.kategori-row');
  rows.forEach(row => {
    const name = (row.getAttribute('data-name') || '').toLowerCase();
    row.style.display = name.includes(query) ? '' : 'none';
  });
}

function openAddAccountModal() {
  const form = document.getElementById('form-akun');
  if (form) form.reset();
  const label = document.getElementById('modalFormAkunLabel');
  if (label) label.textContent = 'Tambah Akun Kasir Baru';

  const modalEl = document.getElementById('modalFormAkun');
  if (modalEl && window.bootstrap) {
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }
}

function saveUserAccount() {
  const name = document.getElementById('acc-name')?.value;
  const username = document.getElementById('acc-username')?.value;
  const password = document.getElementById('acc-password')?.value;

  if (!name || !username || !password) {
    alert('Mohon lengkapi nama, username, dan password!');
    return;
  }

  const modalEl = document.getElementById('modalFormAkun');
  if (modalEl && window.bootstrap) {
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal?.hide();
  }
  alert(`Akun untuk "${name}" (@${username}) berhasil disimpan!`);
}

function editAccount(id) {
  const label = document.getElementById('modalFormAkunLabel');
  if (label) label.textContent = 'Edit Data Akun';

  const modalEl = document.getElementById('modalFormAkun');
  if (modalEl && window.bootstrap) {
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }
}

function deleteAccount(id) {
  if (confirm('Apakah Anda yakin ingin menonaktifkan / menghapus akun kasir ini?')) {
    alert('Akun berhasil dihapus!');
  }
}

function filterAkunTable() {
  const query = (document.getElementById('akun-table-search')?.value || '').toLowerCase();
  const roleFilter = document.getElementById('akun-filter-role')?.value || 'all';
  const statusFilter = document.getElementById('akun-filter-status')?.value || 'all';

  const rows = document.querySelectorAll('.akun-row');
  rows.forEach(row => {
    const name = (row.getAttribute('data-name') || '').toLowerCase();
    const role = row.getAttribute('data-role') || '';
    const status = row.getAttribute('data-status') || '';

    const matchQuery = name.includes(query);
    const matchRole = roleFilter === 'all' || role === roleFilter;
    const matchStatus = statusFilter === 'all' || status === statusFilter;

    row.style.display = (matchQuery && matchRole && matchStatus) ? '' : 'none';
  });
}

let chartLabaRugiInstance = null;
let chartTopSalesBarInstance = null;
let chartCategoryPieInstance = null;

function initLabaRugiChart() {
  const el = document.querySelector('#chart-laba-rugi-trend');
  if (chartLabaRugiInstance) {
    chartLabaRugiInstance.destroy();
    chartLabaRugiInstance = null;
  }
  if (el) {
    const options = {
      series: [
        { name: 'Omzet Penjualan', data: [478, 560, 430, 385, 610, 520, 690] },
        { name: 'Laba Bersih', data: [138, 150, 125, 113, 190, 160, 220] }
      ],
      chart: { type: 'area', height: 280, toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
      colors: ['#2563eb', '#16a34a'],
      stroke: { curve: 'smooth', width: 2 },
      fill: { type: 'solid', opacity: 0.05 },
      dataLabels: { enabled: false },
      xaxis: {
        categories: ['18 Sep', '19 Sep', '20 Sep', '21 Sep', '22 Sep', '23 Sep', '24 Sep'],
        labels: { style: { colors: '#64748b', fontSize: '12px' } }
      },
      yaxis: {
        labels: {
          formatter: (val) => 'Rp ' + val + 'k',
          style: { colors: '#64748b', fontSize: '12px' }
        }
      },
      tooltip: {
        y: { formatter: (val) => 'Rp ' + (val * 1000).toLocaleString('id-ID') }
      },
      grid: { borderColor: '#e2e8f0' }
    };
    chartLabaRugiInstance = new ApexCharts(el, options);
    chartLabaRugiInstance.render();
  }
}

function initTerlarisCharts() {
  const barEl = document.querySelector('#chart-top-selling-bar');
  const pieEl = document.querySelector('#chart-category-pie');

  if (chartTopSalesBarInstance) {
    chartTopSalesBarInstance.destroy();
    chartTopSalesBarInstance = null;
  }
  if (chartCategoryPieInstance) {
    chartCategoryPieInstance.destroy();
    chartCategoryPieInstance = null;
  }

  if (barEl) {
    const barOptions = {
      series: [{
        name: 'Jumlah Terjual',
        data: [120, 95, 84, 62, 45]
      }],
      chart: { type: 'bar', height: 240, toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
      plotOptions: {
        bar: { borderRadius: 4, horizontal: true, distributed: true, dataLabels: { position: 'top' } }
      },
      colors: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'],
      dataLabels: {
        enabled: true,
        formatter: (val) => val + ' pcs',
        style: { fontSize: '11px', colors: ['#0f172a'] },
        offsetX: 20
      },
      xaxis: {
        categories: ['Beras Ramos 5kg', 'Minyak Goreng 2L', 'Telur Ayam 1kg', 'Gula Pasir 1kg', 'Teh Celup 25s'],
        labels: { style: { colors: '#64748b', fontSize: '11px' } }
      },
      legend: { show: false },
      grid: { borderColor: '#e2e8f0' }
    };
    chartTopSalesBarInstance = new ApexCharts(barEl, barOptions);
    chartTopSalesBarInstance.render();
  }

  if (pieEl) {
    const pieOptions = {
      series: [62.6, 21.6, 15.8],
      labels: ['Sembako', 'Minyak', 'Fresh'],
      chart: { type: 'donut', height: 210, fontFamily: 'Inter, sans-serif' },
      colors: ['#2563eb', '#16a34a', '#d97706'],
      legend: { show: false },
      dataLabels: { enabled: false },
      plotOptions: {
        pie: {
          donut: {
            size: '72%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Kategori',
                fontSize: '12px',
                color: '#64748b',
                formatter: () => 'Top 3'
              }
            }
          }
        }
      },
      stroke: { width: 0 }
    };
    chartCategoryPieInstance = new ApexCharts(pieEl, pieOptions);
    chartCategoryPieInstance.render();
  }
}

function filterStokReport() {
  const query = (document.getElementById('stok-report-search')?.value || '').toLowerCase();
  const cat = document.getElementById('stok-report-cat')?.value || 'all';

  const rows = document.querySelectorAll('.stok-row');
  rows.forEach(row => {
    const name = (row.getAttribute('data-name') || '').toLowerCase();
    const category = row.getAttribute('data-category') || '';

    const matchQuery = name.includes(query);
    const matchCat = cat === 'all' || category === cat;

    row.style.display = (matchQuery && matchCat) ? '' : 'none';
  });
}

function exportDataLaporan(jenis) {
  alert(`Mengunduh dokumen Laporan ${jenis} (.xlsx / PDF)...`);
}

function markAllNotificationsRead() {
  const badge = document.querySelector('.notif-dropdown-menu .badge');
  const dot = document.querySelector('.topbar-header .bg-danger');
  const unreadItems = document.querySelectorAll('.notif-item.unread');

  if (badge) badge.style.display = 'none';
  if (dot) dot.style.display = 'none';
  unreadItems.forEach(item => item.classList.remove('unread'));
}

function handleLogout() {
  if (confirm('Apakah Anda yakin ingin keluar dari sesi aplikasi?')) {
    alert('Anda telah berhasil keluar dari akun.');
    location.reload();
  }
}

function openChangePasswordModal() {
  const form = document.getElementById('form-ganti-password');
  if (form) form.reset();
  const modalEl = document.getElementById('modalGantiPassword');
  if (modalEl && window.bootstrap) {
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }
}

function saveNewPassword() {
  const oldPass = document.getElementById('pass-old')?.value;
  const newPass = document.getElementById('pass-new')?.value;
  const confirmPass = document.getElementById('pass-confirm')?.value;

  if (!oldPass || !newPass || !confirmPass) {
    alert('Mohon lengkapi semua kolom password!');
    return;
  }

  if (newPass !== confirmPass) {
    alert('Password baru dan konfirmasi password tidak cocok!');
    return;
  }

  const modalEl = document.getElementById('modalGantiPassword');
  if (modalEl && window.bootstrap) {
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal?.hide();
  }
  alert('Password berhasil diperbarui!');
}

function openProfilWarungModal() {
  const modalEl = document.getElementById('modalProfilWarung');
  if (modalEl && window.bootstrap) {
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }
}

function saveProfilWarung() {
  const name = document.getElementById('warung-name')?.value;
  const phone = document.getElementById('warung-phone')?.value;

  if (!name || !phone) {
    alert('Mohon lengkapi nama warung dan nomor telepon!');
    return;
  }

  const modalEl = document.getElementById('modalProfilWarung');
  if (modalEl && window.bootstrap) {
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal?.hide();
  }
  alert('Profil warung berhasil disimpan!');
}

document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([
    loadComponent('sidebar-container', 'components/sidebar.html'),
    loadComponent('topbar-container', 'components/topbar.html'),
    loadComponent('modal-container', 'components/modal-detail-transaksi.html'),
    loadComponent('modal-pembayaran-container', 'components/modal-pembayaran-kasir.html'),
    loadComponent('modal-produk-container', 'components/modal-form-produk.html'),
    loadComponent('modal-kategori-container', 'components/modal-form-kategori.html'),
    loadComponent('modal-akun-container', 'components/modal-form-akun.html'),
    loadComponent('modal-password-container', 'components/modal-ganti-password.html'),
    loadComponent('modal-profil-warung-container', 'components/modal-profil-warung.html')
  ]);

  applyRBAC();
  await loadPage('pages/dashboard.html');
});
