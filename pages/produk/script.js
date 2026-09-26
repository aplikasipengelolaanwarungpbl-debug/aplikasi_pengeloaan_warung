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
