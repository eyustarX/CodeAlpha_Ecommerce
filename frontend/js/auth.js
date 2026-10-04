/**
 * Shared authentication helpers for frontend
 */
const auth = {
  getToken() {
    return localStorage.getItem('token');
  },

  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAdmin() {
    const user = this.getUser();
    return user && user.role === 'ADMIN';
  },

  setAuth(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  // Update navbar across pages
  renderNav() {
    const authLink = document.getElementById('auth-link');
    const adminLinkContainer = document.getElementById('admin-link-container');
    const user = this.getUser();

    // Render Admin link if user has ADMIN role
    if (adminLinkContainer) {
      if (this.isAdmin()) {
        adminLinkContainer.innerHTML = `<a href="admin.html" style="color: #f59e0b; font-weight: 700;">Admin Panel</a>`;
      } else {
        adminLinkContainer.innerHTML = '';
      }
    }

    if (!authLink) return;

    if (user) {
      authLink.innerHTML = `
        <span style="font-weight: 600; color: var(--primary);">Hi, ${user.name}</span>
        <button id="logout-btn" style="background: none; border: none; color: var(--danger); font-weight: 600; cursor: pointer; margin-left: 0.8rem;">Logout</button>
      `;

      document.getElementById('logout-btn')?.addEventListener('click', () => {
        auth.logout();
      });
    } else {
      authLink.innerHTML = `<a href="login.html">Login</a>`;
    }
  },
};

/**
 * Update the cart badge count in the navigation bar
 */
async function updateCartBadge() {
  const badge = document.getElementById('cart-count');
  if (!badge) return;

  if (!auth.isAuthenticated()) {
    badge.textContent = '0';
    return;
  }

  try {
    const response = await api.get('/cart');
    badge.textContent = response.data.totalItemsCount || 0;
  } catch (err) {
    badge.textContent = '0';
  }
}

// Automatically run on page load
document.addEventListener('DOMContentLoaded', () => {
  auth.renderNav();
  updateCartBadge();
});
