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
