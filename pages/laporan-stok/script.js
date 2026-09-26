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
