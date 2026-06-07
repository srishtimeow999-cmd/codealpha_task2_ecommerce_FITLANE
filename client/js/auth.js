// /client/js/auth.js
// Handles authentication UI and state management
// Updates navbar based on login status

/**
 * Check if user is logged in
 * @returns {boolean} true if token exists
 */
const isLoggedIn = () => {
  return !!localStorage.getItem('token');
};

/**
 * Get current user from localStorage
 * @returns {object} user object or null
 */
const getCurrentUser = () => {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
};

/**
 * Set user data in localStorage
 * Called after successful login/register
 */
const setUser = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('currentUser', JSON.stringify(user));
};

/**
 * Clear user data from localStorage
 * Called on logout
 */
const clearUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('currentUser');
  localStorage.removeItem('cart');
};

/**
 * Update authentication menu in navbar
 * Shows login/register if not logged in
 * Shows user name and logout if logged in
 */
const updateAuthMenu = () => {
  const authMenu = document.getElementById('authMenu');
  
  if (!authMenu) return;

  if (isLoggedIn()) {
    const user = getCurrentUser();
    authMenu.innerHTML = `
      <span class="user-name">${user?.name || 'User'}</span>
      <button class="btn btn-secondary" id="logoutBtn">Logout</button>
    `;

    // Add logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
    }
  } else {
    authMenu.innerHTML = `
      <a href="login.html" class="btn btn-secondary">Login</a>
      <a href="register.html" class="btn btn-primary">Register</a>
    `;
  }

  updateAdminLink();
}

const updateAdminLink = () => {
  const adminLink = document.getElementById('adminLink');
  if (!adminLink) return;

  if (isAdmin()) {
    adminLink.style.display = 'inline-flex';
  } else {
    adminLink.style.display = 'none';
  }
};

/**
 * Handle user logout
 */
const handleLogout = async () => {
  try {
    await authAPI.logout();
    clearUser();
    showToast('Logged out successfully!', 'success');
    
    // Redirect to home after 1 second
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  } catch (error) {
    console.error('Logout error:', error);
    clearUser(); // Clear local data even if API call fails
    window.location.href = 'index.html';
  }
};

/**
 * Update cart badge with total items
 * Shows number of items in cart
 */
const updateCartBadge = async () => {
  try {
    if (!isLoggedIn()) {
      const badge = document.getElementById('cartBadge') || document.getElementById('cart-badge');
      if (badge) badge.textContent = '0';
      return;
    }

    const response = await cartAPI.getCart();
    const badge = document.getElementById('cartBadge') || document.getElementById('cart-badge');
    
    if (badge) {
      badge.textContent = response.cart?.totalItems || 0;
    }
  } catch (error) {
    console.error('Error updating cart badge:', error);
    const badge = document.getElementById('cartBadge') || document.getElementById('cart-badge');
    if (badge) badge.textContent = '0';
  }
};

/**
 * Show toast notification
 * Displays temporary notifications (success, error, info, warning)
 */
const showToast = (message, type = 'success') => {
  const toast = document.getElementById('toast');
  
  if (!toast) return;

  // Set toast class and message
  toast.textContent = message;
  toast.className = `toast show ${type}`;

  // Remove 'show' class after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
};

/**
 * Hamburger menu toggle for mobile
 */
const setupMobileMenu = () => {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('show');
  });

  // Close menu when a link is clicked
  const links = navLinks.querySelectorAll('a');
  links.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('show');
    });
  });
};

/**
 * Check if user is on a protected page and redirect if not logged in
 * Call this on pages that require authentication
 */
const requireAuth = () => {
  if (!isLoggedIn()) {
    showToast('Please login to access this page', 'warning');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
  }
};

/**
 * Check if user is admin
 * @returns {boolean} true if user is admin
 */
const isAdmin = () => {
  const user = getCurrentUser();
  return user?.role === 'admin';
};

// Initialize auth UI when page loads
document.addEventListener('DOMContentLoaded', () => {
  updateAuthMenu();
  updateCartBadge();
  setupMobileMenu();

  // Refresh cart badge every 5 seconds if logged in
  if (isLoggedIn()) {
    setInterval(updateCartBadge, 5000);
  }
});

// Update cart badge whenever user interacts with cart
window.addEventListener('storage', (e) => {
  if (e.key === 'token' || e.key === 'currentUser') {
    updateAuthMenu();
    updateCartBadge();
  }
});
