// Shared utilities

async function apiFetch(url, opts = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function toast(msg) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

async function loadNav() {
  const user = await apiFetch('/api/auth/me').catch(() => null);
  const navLinks = document.getElementById('nav-links');
  const page = window.location.pathname;

  let cartCount = 0;
  if (user) {
    const cart = await apiFetch('/api/cart').catch(() => []);
    cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  }

  navLinks.innerHTML = `
    <a href="/index.html" class="${page === '/' || page.includes('index') ? 'active' : ''}">Shop</a>
    ${user ? `
      <a href="/cart.html" class="cart-badge ${page.includes('cart') ? 'active' : ''}">
        Cart <span id="cart-count" class="${cartCount > 0 ? 'visible' : ''}">${cartCount}</span>
      </a>
      <a href="/orders.html" class="${page.includes('orders') ? 'active' : ''}">Orders</a>
      <div class="user-chip">
        <div class="avatar">${user.name[0].toUpperCase()}</div>
        ${user.name.split(' ')[0]}
      </div>
      <button class="btn btn-outline btn-sm" onclick="logout()">Sign out</button>
    ` : `
      <a href="/login.html" class="${page.includes('login') ? 'active' : ''}">Sign in</a>
    `}
  `;
}

async function logout() {
  await apiFetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/login.html';
}

async function updateCartCount() {
  const count = document.getElementById('cart-count');
  if (!count) return;
  const cart = await apiFetch('/api/cart').catch(() => []);
  const total = cart.reduce((s, i) => s + i.quantity, 0);
  count.textContent = total;
  count.classList.toggle('visible', total > 0);
}
