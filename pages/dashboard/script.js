let chartProfitInstance = null;
let chartCustomerInstance = null;

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

  // 2. Donut Chart (Metode Pembayaran)
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

// Inisialisasi chart saat script termuat
initDashboardCharts();
