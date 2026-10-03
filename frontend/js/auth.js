/**
 * Shared authentication helpers for frontend
 */
const auth = {
  getToken() {
    return localStorage.getItem("token");
  },

  getUser() {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  setAuth(token, user) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  // Update navbar across pages
  renderNav() {
    const authLink = document.getElementById("auth-link");
    if (!authLink) return;

    const user = this.getUser();

    if (user) {
      authLink.innerHTML = `
        <span style="font-weight: 600; color: var(--primary);">Hi, ${user.name}</span>
        <button id="logout-btn" style="background: none; border: none; color: var(--danger); font-weight: 600; cursor: pointer; margin-left: 0.8rem;">Logout</button>
      `;

      document.getElementById("logout-btn")?.addEventListener("click", () => {
        auth.logout();
      });
    } else {
      authLink.innerHTML = `<a href="login.html">Login</a>`;
    }
  },
};

// Automatically run on page load
document.addEventListener("DOMContentLoaded", () => {
  auth.renderNav();
});
