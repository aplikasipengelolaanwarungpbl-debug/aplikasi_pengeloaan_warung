let userRole = localStorage.getItem("warungku_role") || "owner";

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

async function loadComponent(elementId, filePath) {
  try {
    const res = await fetch(filePath);
    if (!res.ok)
      throw new Error(`HTTP ${res.status}: Gagal memuat ${filePath}`);
    const html = await res.text();
    const container = document.getElementById(elementId);
    if (container) {
      container.innerHTML = html;
      refreshIcons();
    }
  } catch (err) {
    console.error("Error loadComponent:", err);
  }
}

function applyRBAC() {
  const restrictedElements = document.querySelectorAll("[data-role]");
  restrictedElements.forEach((el) => {
    const requiredRole = el.getAttribute("data-role");
    el.style.display = userRole === requiredRole ? "" : "none";
  });

  const topbarBadge = document.getElementById("topbar-role-badge");
  if (topbarBadge) {
    topbarBadge.textContent = userRole.toUpperCase();
  }

  const topbarUserName = document.getElementById("topbar-user-name");
  if (topbarUserName) {
    topbarUserName.textContent =
      userRole === "owner" ? "Budi Santoso" : "Siti Aminah";
  }

  const sidebarStaffName = document.getElementById("sidebar-staff-name");
  const sidebarStaffRole = document.getElementById("sidebar-staff-role");
  if (sidebarStaffName && sidebarStaffRole) {
    if (userRole === "owner") {
      sidebarStaffName.textContent = "Budi Santoso";
      sidebarStaffRole.textContent = "Owner";
    } else {
      sidebarStaffName.textContent = "Siti Aminah";
      sidebarStaffRole.textContent = "Staf Kasir (Shift 1)";
    }
  }

  const logoutUserName = document.getElementById("modal-logout-user-name");
  const logoutUserRole = document.getElementById("modal-logout-user-role");
  if (logoutUserName && logoutUserRole) {
    logoutUserName.textContent =
      userRole === "owner" ? "Budi Santoso" : "Siti Aminah";
    logoutUserRole.textContent = userRole === "owner" ? "Owner" : "Kasir";
  }

  const roleSelect = document.getElementById("role-select");
  if (roleSelect && roleSelect.value !== userRole) {
    roleSelect.value = userRole;
  }
}

function setRole(role) {
  userRole = role;
  applyRBAC();
}

function toggleSidebar() {
  const wrapper = document.getElementById("wrapper");
  if (wrapper) wrapper.classList.toggle("toggled");
}

/**
 * Dynamic Modular Router
 * Mendukung path modul langsung (misal: 'dashboard', 'kasir')
 * atau path berbasis role (misal: 'owner/dashboard', 'owner/laporan-laba-rugi', 'kasir/kasir')
 * @param {string} routePath - Path route yang diminta
 * @param {HTMLElement|null} triggerEl - Elemen link yang diklik
 */
async function loadPage(routePath, triggerEl = null) {
  let targetRole = null;
  let cleanName = routePath
    .replace(/^#\/?/, "")
    .replace("pages/", "")
    .replace("/index.html", "")
    .replace(".html", "");
  if (!cleanName) cleanName = "dashboard";

  // Deteksi role prefix dari route
  if (cleanName.startsWith("owner/")) {
    targetRole = "owner";
    cleanName = cleanName.replace("owner/", "");
  } else if (cleanName.startsWith("kasir/")) {
    targetRole = "kasir";
    cleanName = cleanName.replace("kasir/", "");
  }

  // Jika route spesifik ke role tertentu, sinkronkan role aplikasi
  if (targetRole && targetRole !== userRole) {
    setRole(targetRole);
  }

  // Update URL Hash agar memiliki link route di browser
  const targetHash = `#/${targetRole ? targetRole + "/" : ""}${cleanName}`;
  if (window.location.hash !== targetHash) {
    history.pushState(null, "", targetHash);
  }

  // 1. Hapus CSS dan JS halaman sebelumnya
  const oldCss = document.getElementById("page-css");
  if (oldCss) oldCss.remove();

  const oldJs = document.getElementById("page-js");
  if (oldJs) oldJs.remove();

  // 2. Load Fragment HTML halaman
  await loadComponent("main-content", `pages/${cleanName}/index.html`);

  // 3. Inject CSS halaman dinamis
  const cssLink = document.createElement("link");
  cssLink.rel = "stylesheet";
  cssLink.id = "page-css";
  cssLink.href = `pages/${cleanName}/style.css`;
  document.head.appendChild(cssLink);

  // 4. Inject JS halaman dinamis
  const scriptTag = document.createElement("script");
  scriptTag.id = "page-js";
  scriptTag.src = `pages/${cleanName}/script.js`;
  document.body.appendChild(scriptTag);

  // 5. Update status aktif sidebar
  const targetLink =
    triggerEl ||
    document.querySelector(`#sidebar-container a[href="#/${cleanName}"]`) ||
    document.querySelector(`#sidebar-container a[href="#/${routePath}"]`) ||
    document.querySelector(`#sidebar-container a[onclick*="'${cleanName}'"]`);
  if (targetLink) {
    document
      .querySelectorAll("#sidebar-container .nav-link-custom")
      .forEach((link) => {
        link.classList.remove("active");
      });
    targetLink.classList.add("active");

    const parentCollapse = targetLink.closest(".collapse");
    if (parentCollapse && window.bootstrap) {
      const bsCollapse = bootstrap.Collapse.getOrCreateInstance(
        parentCollapse,
        { toggle: false },
      );
      bsCollapse.show();
    }
  }

  // Terapkan RBAC untuk elemen baru di halaman
  applyRBAC();
}

function markAllNotificationsRead() {
  const badge = document.querySelector(".notif-dropdown-menu .badge");
  const dot = document.querySelector(".topbar-header .bg-danger");
  const unreadItems = document.querySelectorAll(".notif-item.unread");

  if (badge) badge.style.display = "none";
  if (dot) dot.style.display = "none";
  unreadItems.forEach((item) => item.classList.remove("unread"));
}

function handleLogout() {
  const modalEl = document.getElementById("modalLogout");
  if (modalEl && window.bootstrap) {
    applyRBAC();
    refreshIcons();
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  } else if (confirm("Apakah Anda yakin ingin keluar dari sesi aplikasi?")) {
    confirmLogout();
  }
}

function confirmLogout() {
  localStorage.removeItem("warungku_user");
  window.location.href = "pages/login/index.html";
}

function openChangePasswordModal() {
  const form = document.getElementById("form-ganti-password");
  if (form) form.reset();
  const modalEl = document.getElementById("modalGantiPassword");
  if (modalEl && window.bootstrap) {
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }
}

function saveNewPassword() {
  const oldPass = document.getElementById("pass-old")?.value;
  const newPass = document.getElementById("pass-new")?.value;
  const confirmPass = document.getElementById("pass-confirm")?.value;

  if (!oldPass || !newPass || !confirmPass) {
    alert("Mohon lengkapi semua kolom password!");
    return;
  }

  if (newPass !== confirmPass) {
    alert("Password baru dan konfirmasi password tidak cocok!");
    return;
  }

  const modalEl = document.getElementById("modalGantiPassword");
  if (modalEl && window.bootstrap) {
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal?.hide();
  }
  alert("Password berhasil diperbarui!");
}

function updateWarungProfileUI() {
  const warungName =
    localStorage.getItem("warungku_warung_name") || "Warung Suka Maju";
  const topbarWarungEl = document.getElementById("topbar-warung-name");
  if (topbarWarungEl) {
    topbarWarungEl.textContent = warungName;
  }
}

function openProfilWarungModal() {
  const savedName = localStorage.getItem("warungku_warung_name");
  if (savedName) {
    const inputName = document.getElementById("warung-name");
    if (inputName) inputName.value = savedName;
  }
  const savedPhone = localStorage.getItem("warungku_warung_phone");
  if (savedPhone) {
    const inputPhone = document.getElementById("warung-phone");
    if (inputPhone) inputPhone.value = savedPhone;
  }
  const savedAddress = localStorage.getItem("warungku_warung_address");
  if (savedAddress) {
    const inputAddress = document.getElementById("warung-address");
    if (inputAddress) inputAddress.value = savedAddress;
  }

  const modalEl = document.getElementById("modalProfilWarung");
  if (modalEl && window.bootstrap) {
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }
}

function saveProfilWarung() {
  const name = document.getElementById("warung-name")?.value;
  const phone = document.getElementById("warung-phone")?.value;

  if (!name || !phone) {
    alert("Mohon lengkapi Warung Suka Maju dan nomor telepon!");
    return;
  }

  localStorage.setItem("warungku_warung_name", name);
  localStorage.setItem("warungku_warung_phone", phone);
  const address = document.getElementById("warung-address")?.value;
  if (address) localStorage.setItem("warungku_warung_address", address);

  updateWarungProfileUI();

  const modalEl = document.getElementById("modalProfilWarung");
  if (modalEl && window.bootstrap) {
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal?.hide();
  }
  alert("Profil warung berhasil disimpan!");
}

function openModalRestock(sku = null) {
  const modalEl = document.getElementById("modalFormRestock");
  if (modalEl && window.bootstrap) {
    if (sku) {
      const select = document.getElementById("modal-restock-produk");
      if (select) {
        select.value = sku;
        if (typeof handleModalPilihProduk === "function")
          handleModalPilihProduk(sku);
      }
    }
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await Promise.all([
    loadComponent("sidebar-container", "components/sidebar.html"),
    loadComponent("topbar-container", "components/topbar.html"),
    loadComponent("modal-container", "components/modal-detail-transaksi.html"),
    loadComponent(
      "modal-pembayaran-container",
      "components/modal-pembayaran-kasir.html",
    ),
    loadComponent(
      "modal-produk-container",
      "components/modal-form-produk.html",
    ),
    loadComponent(
      "modal-kategori-container",
      "components/modal-form-kategori.html",
    ),
    loadComponent("modal-akun-container", "components/modal-form-akun.html"),
    loadComponent(
      "modal-password-container",
      "components/modal-ganti-password.html",
    ),
    loadComponent(
      "modal-profil-warung-container",
      "components/modal-profil-warung.html",
    ),
    loadComponent("modal-logout-container", "components/modal-logout.html"),
    loadComponent(
      "modal-restock-container",
      "components/modal-restock-barang.html",
    ),
  ]);

  updateWarungProfileUI();
  applyRBAC();
  const initialRoute = window.location.hash
    ? window.location.hash.replace(/^#\/?/, "")
    : "dashboard";
  await loadPage(initialRoute);
});

window.addEventListener("hashchange", () => {
  const currentRoute = window.location.hash.replace(/^#\/?/, "") || "dashboard";
  loadPage(currentRoute);
});
