let kasirModalAwal = 100000;
let kasirTunaiMasuk = 269000;
let kasirTotalKeluar = 0;

function formatKasirRupiah(num) {
  return 'Rp ' + num.toLocaleString('id-ID');
}

function updateKasirLaciUI() {
  const totalLaci = kasirModalAwal + kasirTunaiMasuk - kasirTotalKeluar;
  const laciEl = document.getElementById('kasir-total-laci');
  const statLaciEl = document.getElementById('stat-tunai-laci');
  const keluarEl = document.getElementById('kasir-kas-keluar');

  if (laciEl) laciEl.textContent = formatKasirRupiah(totalLaci);
  if (statLaciEl) statLaciEl.textContent = formatKasirRupiah(totalLaci);
  if (keluarEl) keluarEl.textContent = kasirTotalKeluar > 0 ? `- ${formatKasirRupiah(kasirTotalKeluar)}` : 'Rp 0';
}

function catatKasKeluar() {
  const nominalStr = prompt('Masukkan nominal kas keluar (contoh: 15000):', '15000');
  if (!nominalStr) return;

  const nominal = parseInt(nominalStr.replace(/[^0-9]/g, ''), 10);
  if (!nominal || nominal <= 0) {
    alert('Nominal kas keluar tidak valid.');
    return;
  }

  const ket = prompt('Keperluan kas keluar (misal: Beli Es / Kantong Plastik):', 'Keperluan Operasional') || 'Operasional';
  kasirTotalKeluar += nominal;
  updateKasirLaciUI();
  alert(`Kas keluar sebesar ${formatKasirRupiah(nominal)} untuk "${ket}" berhasil dicatat.`);
}

function tutupKasirShift() {
  const totalLaci = kasirModalAwal + kasirTunaiMasuk - kasirTotalKeluar;
  const konfirmasi = confirm(
    `Konfirmasi Tutup Shift Kasir:\n\n` +
    `• Modal Awal: ${formatKasirRupiah(kasirModalAwal)}\n` +
    `• Tunai Masuk: ${formatKasirRupiah(kasirTunaiMasuk)}\n` +
    `• Kas Keluar: ${formatKasirRupiah(kasirTotalKeluar)}\n` +
    `• Total Fisik di Laci: ${formatKasirRupiah(totalLaci)}\n` +
    `• QRIS / Digital: Rp 109.500\n\n` +
    `Lanjutkan penutupan shift dan cetak rekap?`
  );

  if (konfirmasi) {
    alert('Shift kasir berhasil ditutup. Rekapitulasi kas siap disetorkan.');
  }
}

if (window.lucide) {
  window.lucide.createIcons();
}
