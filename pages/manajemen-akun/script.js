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
