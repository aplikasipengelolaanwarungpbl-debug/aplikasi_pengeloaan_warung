let chartTopSalesBarInstance = null;
let chartCategoryPieInstance = null;

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

function exportDataLaporan(jenis) {
  alert(`Mengunduh dokumen Laporan ${jenis} (.xlsx / PDF)...`);
}

// Inisialisasi chart produk terlaris
initTerlarisCharts();
