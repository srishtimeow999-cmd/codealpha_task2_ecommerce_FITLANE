// /client/js/api.js
// Centralized API communication helper
// Contains all functions to communicate with the backend

const BACKEND_ORIGIN = 'http://localhost:5000';
const originHost = window.location.host ? `${window.location.protocol}//${window.location.host}` : BACKEND_ORIGIN;
const API_BASE_URL = `${BACKEND_ORIGIN}/api`;

/**
 * Get stored JWT token from localStorage
 * JWT tokens are used to authenticate protected API requests
 */
const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Generic fetch function for API calls
 * @param {string} endpoint - API endpoint (e.g., '/products')
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {object} data - Request body data (for POST/PUT)
 * @returns {Promise} API response
 */
const apiCall = async (endpoint, method = 'GET', data = null) => {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // Add token to Authorization header if it exists
    const token = getToken();
    if (token) {
      options.headers.Authorization = `Bearer ${token}`;
    }

    // Add body for POST/PUT requests
    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const text = await response.text();

    let result;
    try {
      result = text ? JSON.parse(text) : {};
    } catch (parseError) {
      throw new Error(`Invalid JSON response from API: ${text || '[empty]'} (${parseError.message})`);
    }

    // If status is not ok (not 2xx), throw error
    if (!response.ok) {
      throw new Error(result.message || `${response.status} ${response.statusText}`);
    }

    return result;
  } catch (error) {
    console.error('API Error:', error);
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Unable to reach backend. Please make sure the server is running at http://localhost:5000 and refresh the page.');
    }
    throw error;
  }
};

// ============= AUTH API CALLS =============

const authAPI = {
  // Register a new user
  register: async (name, email, password, confirmPassword) => {
    return apiCall('/auth/register', 'POST', {
      name,
      email,
      password,
      confirmPassword
    });
  },

  // Login user
  login: async (email, password) => {
    return apiCall('/auth/login', 'POST', { email, password });
  },

  // Logout user
  logout: async () => {
    return apiCall('/auth/logout', 'POST');
  },

  // Get current user info
  getCurrentUser: async () => {
    return apiCall('/auth/me', 'GET');
  },

  // Update user profile
  updateProfile: async (name, phone, address) => {
    return apiCall('/auth/update', 'PUT', { name, phone, address });
  }
};

// ============= PRODUCTS API CALLS =============

const productsAPI = {
  // Get all products with filters
  getAll: async (category = 'All', search = '', page = 1, limit = 10, gender = 'All', featured = false) => {
    const params = new URLSearchParams({
      category,
      search,
      page,
      limit
    });
    if (gender && gender !== 'All') {
      params.append('gender', gender);
    }
    if (featured) {
      params.append('featured', 'true');
    }
    return apiCall(`/products?${params.toString()}`, 'GET');
  },

  // Get single product by ID
  getById: async (id) => {
    return apiCall(`/products/${id}`, 'GET');
  },

  // Get all categories
  getCategories: async () => {
    return apiCall('/products/categories', 'GET');
  },

  // Add new product (Admin only)
  add: async (productData) => {
    return apiCall('/products/admin/add', 'POST', productData);
  },

  // Update product (Admin only)
  update: async (id, productData) => {
    return apiCall(`/products/admin/${id}`, 'PUT', productData);
  },

  // Delete product (Admin only)
  delete: async (id) => {
    return apiCall(`/products/admin/${id}`, 'DELETE');
  }
};

// ============= CART API CALLS =============

const cartAPI = {
  // Get user's cart
  getCart: async () => {
    return apiCall('/cart', 'GET');
  },

  // Add product to cart
  addToCart: async (productId, quantity) => {
    return apiCall('/cart/add', 'POST', { productId, quantity });
  },

  // Remove product from cart
  removeFromCart: async (productId) => {
    return apiCall(`/cart/remove/${productId}`, 'DELETE');
  },

  // Update product quantity in cart
  updateQuantity: async (productId, quantity) => {
    return apiCall(`/cart/update/${productId}`, 'PUT', { quantity });
  },

  // Clear entire cart
  clearCart: async () => {
    return apiCall('/cart/clear', 'DELETE');
  }
};

// ============= ORDER API CALLS =============

const ordersAPI = {
  // Create new order from cart
  create: async (shippingAddress) => {
    return apiCall('/orders/create', 'POST', { shippingAddress });
  },

  // Get user's orders
  getMyOrders: async (page = 1, limit = 10) => {
    const params = new URLSearchParams({ page, limit });
    return apiCall(`/orders?${params.toString()}`, 'GET');
  },

  // Get single order by ID
  getById: async (id) => {
    return apiCall(`/orders/${id}`, 'GET');
  },

  // Update order status (Admin only)
  updateStatus: async (id, status, paymentStatus = null, trackingNumber = null) => {
    return apiCall(`/orders/admin/${id}/status`, 'PUT', {
      status,
      paymentStatus,
      trackingNumber
    });
  },

  // Get order statistics (Admin only)
  getStats: async () => {
    return apiCall('/orders/admin/stats', 'GET');
  }
};

// ============= SERVER HEALTH CHECK =============

const healthCheck = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('Server health check failed:', error);
    return false;
  }
};
