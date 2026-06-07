// /client/js/products.js
// Handles products listing page with filtering and search

let currentPage = 1;
let currentCategory = 'All';
let currentGender = 'All';
let currentSearch = '';
let totalPages = 1;

const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const genderFilter = document.getElementById('genderFilter');
const sortSelect = document.getElementById('sortSelect');
const clearFiltersBtn = document.getElementById('clearFilters');
const productsGrid = document.getElementById('productsGrid');
const productCount = document.getElementById('productCount');
const paginationContainer = document.getElementById('paginationContainer');

/**
 * Load and display products
 */
async function loadProductsPrimary(page = 1) {
  try {
    currentPage = page;
    
    if (productsGrid) {
      productsGrid.innerHTML = '<div class="loading">Loading products...</div>';
    }

    const response = await productsAPI.getAll(
      currentCategory,
      currentSearch,
      page,
      10,
      currentGender
    );

    if (response.success) {
      let products = response.products;

      // Apply sorting
      const sortValue = sortSelect?.value || 'default';
      if (sortValue === 'price-low') {
        products.sort((a, b) => (a.price || 0) - (b.price || 0));
      } else if (sortValue === 'price-high') {
        products.sort((a, b) => (b.price || 0) - (a.price || 0));
      } else if (sortValue === 'rating') {
        products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }

      totalPages = response.pagination.totalPages;

      // Display products
      displayProducts(products);

      // Update product count
      if (productCount) {
        productCount.textContent = `Showing ${products.length} of ${response.pagination.totalProducts} products`;
      }

      // Display pagination
      displayPagination();
    } else {
      if (productsGrid) {
        productsGrid.innerHTML = '<p>No products found</p>';
      }
    }
  } catch (error) {
    console.error('Error loading products:', error);
    if (productsGrid) {
      productsGrid.innerHTML = '<p>Error loading products. Please try again.</p>';
    }
    showToast('Error loading products', 'error');
  }
};

async function loadProducts(page = 1) {
  return loadProductsWithFallback(page);
}

/**
 * Display products in grid
 */
const displayProducts = (products) => {
  if (!productsGrid) return;

  if (products.length === 0) {
    productsGrid.innerHTML = '<p>No products found. Try adjusting your filters.</p>';
    return;
  }

  productsGrid.innerHTML = products
    .map(product => createProductCard(product))
    .join('');

  // Add event listeners
  addProductCardListeners();
};

/**
 * Create product card HTML
 */
const createProductCard = (product) => {
  const title = product.title || product.name || 'Product';
  const inStock = product.stock > 0;
  const price = product.price != null ? `₹${Number(product.price).toLocaleString('en-IN')}` : 'Price unavailable';
  const productId = product._id || product.id;
  const imageUrl = (Array.isArray(product.images) && product.images[0]) || product.image || 'https://via.placeholder.com/300x300?text=FITLANE+Product';
  
  return `
    <div class="product-card" onclick="openProductDetail('${productId}')">
      <img src="${imageUrl}" alt="${title}" class="product-image">
      <div class="product-info">
        <p class="product-category">${product.category || 'Sportswear'}</p>
        <h3 class="product-name">${title}</h3>
        <p class="product-price">${price}</p>
        <p class="product-stock ${inStock ? 'in-stock' : 'out-of-stock'}">
          ${inStock ? `In Stock (${product.stock})` : 'Out of Stock'}
        </p>
        <div class="product-actions">
          ${inStock ? `<button class="btn btn-secondary" onclick="event.stopPropagation(); addToCartQuick('${productId}', '${title.replace(/'/g, "\\'")}')">Add</button>` : ''}
        </div>
      </div>
    </div>
  `;
};

/**
 * View product details
 */
const viewProductDetail = (productId) => {
  openProductDetail(productId);
};

/**
 * Quick add to cart
 */
const addToCartQuick = async (productId, productName) => {
  try {
    if (!isLoggedIn()) {
      showToast('Please login to add items to cart', 'warning');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1000);
      return;
    }

    const response = await cartAPI.addToCart(productId, 1);
    
    if (response.success) {
      showToast(`${productName} added to cart!`, 'success');
      updateCartBadge();
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    showToast(error.message || 'Failed to add item to cart', 'error');
  }
};

/**
 * Display pagination buttons
 */
const displayPagination = () => {
  if (!paginationContainer) return;

  if (totalPages <= 1) {
    paginationContainer.innerHTML = '';
    return;
  }

  let html = '';

  // Previous button
  if (currentPage > 1) {
    html += `<button onclick="loadProducts(${currentPage - 1})">← Previous</button>`;
  }

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === currentPage) {
      html += `<button class="active" disabled>${i}</button>`;
    } else {
      html += `<button onclick="loadProducts(${i})">${i}</button>`;
    }
  }

  // Next button
  if (currentPage < totalPages) {
    html += `<button onclick="loadProducts(${currentPage + 1})">Next →</button>`;
  }

  paginationContainer.innerHTML = html;
};

/**
 * Handle search input
 */
const handleSearch = (e) => {
  currentSearch = e.target.value.trim();
  currentPage = 1;
  loadProducts();
};

/**
 * Handle category filter change
 */
const handleCategoryFilter = (e) => {
  currentCategory = e.target.value;
  currentPage = 1;
  loadProducts();
};

const handleGenderFilter = (e) => {
  currentGender = e.target.value;
  currentPage = 1;
  loadProducts();
};

/**
 * Clear all filters
 */
const clearAllFilters = () => {
  currentCategory = 'All';
  currentGender = 'All';
  currentSearch = '';
  currentPage = 1;
  
  if (searchInput) searchInput.value = '';
  if (categoryFilter) categoryFilter.value = 'All';
  if (genderFilter) genderFilter.value = 'All';
  if (sortSelect) sortSelect.value = 'default';

  loadProducts();
};

/**
 * Add event listeners to product cards
 */
const addProductCardListeners = () => {
  // Event listeners are added inline in createProductCard function
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  // Get URL parameters for filtering
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');
  const genderParam = urlParams.get('gender');
  
  const isGenderParam = genderParam || ['Men', 'Women'].includes(categoryParam);

  if (categoryParam && !['Men', 'Women'].includes(categoryParam)) {
    currentCategory = categoryParam;
    if (categoryFilter) categoryFilter.value = categoryParam;
  }

  if (genderParam) {
    currentGender = genderParam.charAt(0).toUpperCase() + genderParam.slice(1).toLowerCase();
  } else if (['Men', 'Women'].includes(categoryParam)) {
    currentGender = categoryParam;
  }

  if (genderFilter) {
    genderFilter.value = currentGender;
  }

  // Add event listeners
  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
  }
  
  if (categoryFilter) {
    categoryFilter.addEventListener('change', handleCategoryFilter);
  }

  if (genderFilter) {
    genderFilter.addEventListener('change', handleGenderFilter);
  }
  
  if (sortSelect) {
    sortSelect.addEventListener('change', () => loadProducts());
  }
  
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', clearAllFilters);
  }

  // Load products
  loadProducts();
});

// Expose loadProducts globally for inline handlers
window.loadProducts = loadProducts;
window.addToCartQuick = addToCartQuick;
window.openProductDetail = openProductDetail;

// Fallback fetch attempt if productsAPI fails (tries relative /api/products)
const tryFetchProductsFallback = async (category, search, page, limit, gender) => {
  try {
    const params = new URLSearchParams({ category, search, page, limit });
    if (gender && gender !== 'All') params.append('gender', gender);
    const res = await fetch(`/api/products?${params.toString()}`);
    const text = await res.text();
    const json = text ? JSON.parse(text) : {};
    return json;
  } catch (e) {
    console.error('Fallback fetch products failed:', e);
    return null;
  }
};

// Handle product loading failure by trying a fallback request before showing error
async function loadProductsWithFallback(page = 1) {
  try {
    await loadProductsPrimary(page);
  } catch (error) {
    console.warn('Primary products load failed, trying fallback...', error);
    const fallback = await tryFetchProductsFallback(currentCategory, currentSearch, page, 10, currentGender);
    if (fallback && fallback.success) {
      totalPages = fallback.pagination.totalPages;
      displayProducts(fallback.products || []);
      if (productCount) {
        productCount.textContent = `Showing ${ (fallback.products || []).length } of ${fallback.pagination.totalProducts} products`;
      }
      displayPagination();
      return;
    }

    if (productsGrid) {
      productsGrid.innerHTML = '<p>Error loading products. Please try again.</p>';
    }
    showToast('Error loading products', 'error');
  }
}

// Keep window binding for the initializer and inline handlers
window.loadProducts = loadProducts;
window.addToCartQuick = addToCartQuick;
window.openProductDetail = openProductDetail;
