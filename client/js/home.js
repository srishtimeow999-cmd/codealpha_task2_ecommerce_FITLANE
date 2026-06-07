// /client/js/home.js
// Handles homepage functionality
// Displays featured products and categories

/**
 * Load and display featured products
 */
const loadFeaturedProducts = async () => {
  try {
    const featuredContainer = document.getElementById('featuredProducts');
    
    if (!featuredContainer) return;

    // Fetch featured products (first 6)
    const response = await productsAPI.getAll('All', '', 1, 6);

    if (response.success && response.products.length > 0) {
      featuredContainer.innerHTML = response.products
        .map(product => createProductCard(product))
        .join('');

      // Add event listeners to action buttons
      addProductCardListeners();
    } else {
      featuredContainer.innerHTML = '<p>No products available</p>';
    }
  } catch (error) {
    console.error('Error loading featured products:', error);
    const featuredContainer = document.getElementById('featuredProducts');
    if (featuredContainer) {
      featuredContainer.innerHTML = '<p>Error loading products. Please try again later.</p>';
    }
  }
};

/**
 * Load and display categories
 */
const loadCategories = async () => {
  try {
    const categoriesGrid = document.getElementById('categoriesGrid');
    
    if (!categoriesGrid) return;

    const categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports'];
    const categoryEmojis = {
      'Electronics': '📱',
      'Clothing': '👕',
      'Books': '📚',
      'Home': '🏠',
      'Sports': '⚽'
    };

    categoriesGrid.innerHTML = categories
      .map(category => `
        <a href="products.html?category=${category}" class="category-card">
          <div style="font-size: 40px; margin-bottom: 10px;">
            ${categoryEmojis[category] || '📦'}
          </div>
          <h3>${category}</h3>
        </a>
      `)
      .join('');
  } catch (error) {
    console.error('Error loading categories:', error);
  }
};

/**
 * Create product card HTML
 */
const createProductCard = (product) => {
  const inStock = product.stock > 0;
  const imageUrl = (Array.isArray(product.images) && product.images[0]) || product.image || 'https://via.placeholder.com/300x300?text=FITLANE+Product';
  
  return `
    <div class="product-card" onclick="openProductDetail('${product._id}')">
      <img src="${imageUrl}" alt="${product.name}" class="product-image">
      <div class="product-info">
        <p class="product-category">${product.category}</p>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">₹${product.price.toLocaleString('en-IN')}</p>
        <p class="product-stock ${inStock ? 'in-stock' : 'out-of-stock'}">
          ${inStock ? `In Stock (${product.stock})` : 'Out of Stock'}
        </p>
        <div class="product-actions">
          ${inStock ? `<button class="btn btn-secondary" onclick="event.stopPropagation(); quickAdd('${product._id}', '${product.name}')">Add Cart</button>` : ''}
        </div>
      </div>
    </div>
  `;
};

/**
 * View product details
 */
const viewProduct = (productId) => {
  window.location.href = `products.html?productId=${productId}`;
};

/**
 * Quick add to cart from home page
 */
const quickAdd = async (productId, productName) => {
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
 * Add event listeners to product cards
 */
const addProductCardListeners = () => {
  // Event listeners are added inline in the createProductCard function
};

// Load featured products and categories when page loads
document.addEventListener('DOMContentLoaded', () => {
  loadFeaturedProducts();
  loadCategories();
});
