// /client/js/login.js
// Handles login page functionality

const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');

/**
 * Handle login form submission
 */
const handleLogin = async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  // Validation
  if (!email || !password) {
    showToast('Please fill in all fields', 'error');
    return;
  }

  try {
    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in...';

    // Call login API
    const response = await authAPI.login(email, password);

    if (response.success) {
      // Store token and user info
      setUser(response.token, response.user);

      showToast('Login successful!', 'success');

      // Redirect to home after 1 second
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    }
  } catch (error) {
    console.error('Login error:', error);
    showToast(error.message || 'Login failed. Please try again.', 'error');
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Login';
  }
};

// Add event listener to form
if (loginForm) {
  loginForm.addEventListener('submit', handleLogin);
}
