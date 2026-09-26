if (window.lucide) {
  window.lucide.createIcons();
}

function handleRegister(event) {
  event.preventDefault();
  const warungName = document.getElementById('reg-warung-name')?.value.trim() || '';
  const warungPhone = document.getElementById('reg-warung-phone')?.value.trim() || '';
  const address = document.getElementById('reg-warung-address')?.value.trim() || '';
  const ownerName = document.getElementById('reg-owner-name')?.value.trim() || '';
  const email = document.getElementById('reg-email')?.value.trim() || '';
  const phone = document.getElementById('reg-phone')?.value.trim() || '';
  const username = document.getElementById('reg-username')?.value.trim() || '';
  const password = document.getElementById('reg-password')?.value || '';
  const confirmPassword = document.getElementById('reg-confirm-password')?.value || '';

  if (!warungName || !ownerName || !email || !phone || !username || !password) {
    showAlert('Mohon lengkapi seluruh kolom wajib bertanda bintang (*)!');
    return;
  }

  if (password !== confirmPassword) {
    showAlert('Password dan konfirmasi password tidak cocok!');
    return;
  }

  if (password.length < 6) {
    showAlert('Password minimal 6 karakter!');
    return;
  }

  localStorage.setItem('warungku_role', 'owner');
  localStorage.setItem('warungku_user', username);
  localStorage.setItem('warungku_email', email);
  localStorage.setItem('warungku_phone', phone);
  localStorage.setItem('warungku_warung_name', warungName);
  localStorage.setItem('warungku_warung_phone', warungPhone);
  localStorage.setItem('warungku_warung_address', address);
  localStorage.setItem('warungku_owner_name', ownerName);

  alert(`Selamat! Akun Warung "${warungName}" berhasil didaftarkan.`);
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
