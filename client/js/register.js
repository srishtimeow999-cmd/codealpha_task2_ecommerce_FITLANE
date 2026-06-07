// /client/js/register.js
// Handles registration page functionality

const registerForm = document.getElementById('registerForm');
const registerBtn = document.getElementById('registerBtn');

/**
 * Handle registration form submission
 */
const handleRegister = async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const confirmPassword = document.getElementById('confirmPassword').value.trim();

  // Validation
  if (!name || !email || !password || !confirmPassword) {
    showToast('Please fill in all fields', 'error');
    return;
  }

  if (password.length < 6) {
    showToast('Password must be at least 6 characters', 'error');
    return;
  }

  if (password !== confirmPassword) {
    showToast('Passwords do not match', 'error');
    return;
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showToast('Please enter a valid email address', 'error');
    return;
  }

  try {
    registerBtn.disabled = true;
    registerBtn.textContent = 'Creating account...';

    // Call register API
    const response = await authAPI.register(name, email, password, confirmPassword);

    if (response.success) {
      // Store token and user info
      setUser(response.token, response.user);

      showToast('Account created successfully!', 'success');

      // Redirect to home after 1 second
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    }
  } catch (error) {
    console.error('Register error:', error);
    showToast(error.message || 'Registration failed. Please try again.', 'error');
  } finally {
    registerBtn.disabled = false;
    registerBtn.textContent = 'Create Account';
  }
};

// Add event listener to form
if (registerForm) {
  registerForm.addEventListener('submit', handleRegister);
}
