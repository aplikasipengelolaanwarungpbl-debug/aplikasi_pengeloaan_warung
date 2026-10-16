function hitungModalRestockTotal() {
  const qtyInput = document.getElementById('modal-restock-qty');
  const modalInput = document.getElementById('modal-restock-modal');
  const previewEl = document.getElementById('modal-restock-total-preview');

  const qty = parseInt(qtyInput?.value || '0', 10);
  const modal = parseInt(modalInput?.value || '0', 10);
  const total = qty * modal;

  if (previewEl) {
    previewEl.textContent = 'Rp ' + total.toLocaleString('id-ID');
  }
}

function handleModalPilihProduk(sku) {
  const select = document.getElementById('modal-restock-produk');
  const selectedOption = select?.selectedOptions[0];
  if (!selectedOption) return;

  const modal = selectedOption.getAttribute('data-modal');
  const modalInput = document.getElementById('modal-restock-modal');
  if (modalInput && modal) {
    modalInput.value = modal;
  }
  hitungModalRestockTotal();
}

function saveRestockFromModal() {
  const select = document.getElementById('modal-restock-produk');
  const selectedOption = select?.selectedOptions[0];
  const qty = parseInt(document.getElementById('modal-restock-qty')?.value || '0', 10);
  const modal = parseInt(document.getElementById('modal-restock-modal')?.value || '0', 10);

  if (!selectedOption || !select.value) {
    alert('Pilih barang yang ingin direstock!');
    return;
  }

  if (qty <= 0) {
    alert('Jumlah restock minimal 1!');
    return;
  }

  const namaProduk = selectedOption.getAttribute('data-nama') || select.value;
  const satuan = selectedOption.getAttribute('data-satuan') || 'Unit';
  const sku = select.value;
  const totalBiaya = qty * modal;

  const now = new Date();
  const jam = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0') + ' WIB';
  const noFaktur = '#RCK-' + now.toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(100 + Math.random() * 900);

  const tbody = document.getElementById('tabel-riwayat-restock');
  if (tbody) {
    const tr = document.createElement('tr');
    tr.className = 'restock-row';
    tr.setAttribute('data-faktur', noFaktur);
    tr.setAttribute('data-produk', namaProduk);
    tr.innerHTML = `
      <td class="ps-4">
        <span class="trx-faktur">${noFaktur}</span>
      </td>
      <td>
        <div class="trx-waktu">
          <span class="trx-tanggal">Hari Ini</span>
          <span class="trx-jam text-muted small">${jam}</span>
        </div>
      </td>
      <td>
        <span class="fw-semibold text-dark d-block">${namaProduk}</span>
        <small class="text-muted">Kode: #${sku}</small>
      </td>
      <td>
        <span class="badge bg-success-subtle text-success border border-success-subtle">+${qty} ${satuan}</span>
      </td>
      <td class="fw-bold text-dark">Rp ${totalBiaya.toLocaleString('id-ID')}</td>
      <td>
        <span class="badge-status success"><i data-lucide="check-circle" class="icon-xs"></i> Masuk</span>
      </td>
      <td class="text-center pe-4">
        <button class="btn btn-sm btn-outline-primary px-2" onclick="alert('Restock ${noFaktur} telah dicatat.')">
          Detail
        </button>
      </td>
    `;
    tbody.prepend(tr);
    if (window.lucide) window.lucide.createIcons();
  }

  // Tutup Modal
  const modalEl = document.getElementById('modalFormRestock');
  if (modalEl && window.bootstrap) {
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    modalInstance?.hide();
  }

  alert(`Berhasil restock ${namaProduk} sebanyak +${qty} ${satuan}!`);
}

function filterRestockTable() {
  const search = document.getElementById('restock-table-search')?.value.toLowerCase() || '';
  const rows = document.querySelectorAll('.restock-row');
  
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    const matchSearch = !search || text.includes(search);
    row.style.display = matchSearch ? '' : 'none';
  });
}

function resetRestockFilter() {
  const searchInput = document.getElementById('restock-table-search');
  const periodeSelect = document.getElementById('restock-filter-periode');

  if (searchInput) searchInput.value = '';
  if (periodeSelect) periodeSelect.value = 'today';

  filterRestockTable();
}

function exportDataRestock() {
  alert('Mengunduh Laporan Riwayat Restock (.xlsx)...');
}

// Inisialisasi awal
hitungModalRestockTotal();
if (window.lucide) window.lucide.createIcons();
