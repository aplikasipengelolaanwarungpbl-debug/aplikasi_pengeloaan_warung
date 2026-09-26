---
name: warungku-conventions
description: Architecture conventions and checklist for adding pages, components, styles, and modals to the WarungKu SPA. Read this before writing any code.
---

# WarungKu — Project Conventions

Reference for any agent or developer working on this codebase.
Read this **before** creating files. Every pattern already exists — reuse it.

---

## Architecture Overview

Static SPA. No build step, no bundler. Pages load via `fetch()` into `#main-content`.

```
index.html                  ← shell: sidebar, topbar, main, modal containers
assets/
  app.js                    ← router, component loader, RBAC, chart init
  style.css                 ← shared design tokens, layout, reusable components
  css/
    dashboard.css           ← dashboard-only styles
    riwayat-transaksi.css   ← transaction history styles + print
components/
  sidebar.html              ← navigation sidebar (loaded once at init)
  topbar.html               ← top header bar (loaded once at init)
  modal-detail-transaksi.html ← receipt modal (loaded once at init)
pages/
  dashboard.html            ← page content (no <html>, no <head>, just content)
  riwayat-transaksi.html    ← page content
```

---

## How to Add a New Page

### 1. Create the page HTML

File: `pages/<page-name>.html`

- Content fragment only — no `<!DOCTYPE>`, no `<html>`, no `<head>`, no `<body>`.
- No inline modals — extract them to `components/` (see below).
- Starts rendering inside `<main id="main-content">`.

### 2. Create page-specific CSS (if needed)

File: `assets/css/<page-name>.css`

The router auto-loads this. Naming convention is enforced:

```
pages/kasir.html  →  assets/css/kasir.css
pages/produk.html →  assets/css/produk.css
```

- `loadPage()` injects a `<link id="page-css">` and removes the previous one on navigation.
- If the CSS file doesn't exist, it 404s silently — no error.
- Only put page-specific styles here. Shared styles go in `assets/style.css`.

### 3. Add the sidebar link

File: `components/sidebar.html`

```html
<li class="nav-item">
  <a href="#" class="nav-link-custom" onclick="loadPage('pages/<page-name>.html', this)">
    <i data-lucide="<icon-name>"></i>
    <span>Menu Label</span>
  </a>
</li>
```

For submenu items, place inside an existing or new `.collapse` block. See existing `#collapse-transaksi` or `#collapse-produk` for the pattern.

Owner-only items: add `data-role="owner"` to the `<li>`.

### 4. That's it

No router config, no import map, no registration. The `loadPage()` function handles everything:
- Fetches HTML into `#main-content`
- Injects per-page CSS
- Updates active sidebar state
- Opens parent collapse if submenu
- Calls `refreshIcons()` for Lucide

---

## How to Add a Modal / Shared Component

### 1. Create the component file

File: `components/<component-name>.html`

Content fragment only, same as pages.

### 2. Add a container in `index.html`

```html
<div id="<component-name>-container"></div>
```

Place inside `#wrapper`, after `#main-content` (for modals) or in the appropriate position.

### 3. Load it at init in `app.js`

Add one line to the `Promise.all` in `DOMContentLoaded`:

```js
loadComponent('<component-name>-container', 'components/<component-name>.html')
```

### 4. Trigger it

Use Bootstrap's `data-bs-toggle="modal"` and `data-bs-target="#modalId"` on buttons.

---

## Shared Utilities (app.js)

| Function | Purpose |
|---|---|
| `loadComponent(elementId, filePath)` | Fetch HTML fragment into a container, then refresh Lucide icons |
| `loadPage(pagePath, triggerEl?)` | Load a page + its CSS, update sidebar active state |
| `refreshIcons()` | Re-run `lucide.createIcons()` after DOM changes |
| `applyRBAC()` | Show/hide elements based on `data-role` attribute vs `userRole` |
| `setRole(role)` | Switch role ('owner' / 'kasir'), re-apply RBAC |
| `toggleSidebar()` | Toggle responsive sidebar |
| `initDashboardCharts()` | Init ApexCharts on dashboard (called automatically by `loadPage`) |

**Do NOT duplicate these.** Call them.

---

## CSS Rules

### Shared styles (`assets/style.css`)
Design tokens (CSS variables), layout, sidebar, topbar, cards, buttons, badges, tables, form controls, icons, responsive breakpoints.

### Page styles (`assets/css/<page-name>.css`)
Styles that only apply to one page. Use CSS variables from `:root` — don't redefine them.

### Naming
- Use existing CSS class patterns: `.card-modern`, `.table-modern`, `.btn-standard`, `.badge-status`, `.metric-icon-*`.
- Don't invent new naming conventions. Check `style.css` first.

---

## External Dependencies (CDN)

Already loaded in `index.html`. Do NOT add duplicates or alternatives.

| Library | Version | Purpose |
|---|---|---|
| Bootstrap 5 | 5.3.3 | Grid, components, modals, collapse |
| Lucide Icons | latest | SVG icon set via `data-lucide` attributes |
| ApexCharts | latest | Dashboard charts |
| Google Fonts: Inter | 400–700 | Typography |

---

## RBAC Pattern

```html
<!-- This element only shows for owner role -->
<li data-role="owner">...</li>
```

`applyRBAC()` runs on init and on role change. It checks `data-role` against the global `userRole` variable.

---

## Checklist: Before You Code

- [ ] Does the page/component already exist? Check `pages/` and `components/`.
- [ ] Does a CSS class for this already exist? Check `assets/style.css`.
- [ ] Is the utility function already in `app.js`? Don't rewrite `loadComponent`, `refreshIcons`, etc.
- [ ] Page HTML is a content fragment (no `<html>`, `<head>`, `<body>`).
- [ ] Modal/shared component goes in `components/`, NOT inline in the page.
- [ ] Page CSS goes in `assets/css/<page-name>.css`, NOT in `style.css`.
- [ ] Sidebar link uses `onclick="loadPage('pages/X.html', this)"`.
- [ ] Lucide icons use `data-lucide="icon-name"` (auto-initialized on load).
- [ ] No new CDN dependencies without explicit request.
