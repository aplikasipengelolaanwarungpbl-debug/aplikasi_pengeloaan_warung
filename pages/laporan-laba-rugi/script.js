let chartLabaRugiInstance = null;

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

function exportDataLaporan(jenis) {
  alert(`Mengunduh dokumen Laporan ${jenis} (.xlsx / PDF)...`);
}

// Inisialisasi chart laba rugi
initLabaRugiChart();
