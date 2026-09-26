async function loadComponent(elementId, filePath) {
  try {
    const res = await fetch(filePath);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Gagal memuat ${filePath}`);
    const html = await res.text();
    const container = document.getElementById(elementId);
    if (container) {
      container.innerHTML = html;
      if (window.lucide) window.lucide.createIcons();
    }
  } catch (err) {
    console.error('Error loadComponent:', err);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadComponent('modal-lupa-password-container', '../../components/modal-lupa-password.html');
  if (window.lucide) window.lucide.createIcons();
});

function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById('login-username')?.value.trim() || '';
  const password = document.getElementById('login-password')?.value || '';

  if (!username || !password) {
    showAlert('Mohon lengkapi username dan password!');
    return;
  }

  const role = username.toLowerCase().includes('kasir') || username.toLowerCase().includes('staff') ? 'kasir' : 'owner';

  localStorage.setItem('warungku_role', role);
  localStorage.setItem('warungku_user', username);
  window.location.href = '../../index.html';
}

function showAlert(msg) {
  const alertBox = document.getElementById('auth-alert');
  const alertText = document.getElementById('auth-alert-text');
  if (alertBox && alertText) {
    alertText.textContent = msg;
    alertBox.classList.remove('d-none');
  }
}

function handleLupaPassword(event) {
  event.preventDefault();
  const email = document.getElementById('reset-email')?.value.trim();
  const phone = document.getElementById('reset-phone')?.value.trim();
  if (!email || !phone) return;

  const resetAlert = document.getElementById('reset-alert');
  const resetAlertText = document.getElementById('reset-alert-text');
  if (resetAlert && resetAlertText) {
    resetAlertText.textContent = `Instruksi reset dikirim ke email ${email} dan WhatsApp ${phone}`;
    resetAlert.classList.remove('d-none');
    if (window.lucide) window.lucide.createIcons();
    setTimeout(() => {
      const modal = bootstrap.Modal.getInstance(document.getElementById('modalLupaPassword'));
      if (modal) modal.hide();
      resetAlert.classList.add('d-none');
      document.getElementById('form-lupa-password').reset();
    }, 2500);
  }
}
