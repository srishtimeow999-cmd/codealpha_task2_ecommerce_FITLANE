// /client/js/cart.js
// Handles shopping cart page functionality

const cartItemsContainer = document.getElementById('cartItemsContainer');
const emptyCartDiv = document.getElementById('emptyCart');
const checkoutBtn = document.getElementById('checkoutBtn');

/**
 * Load and display cart items
 */
const loadCart = async () => {
  try {
    // Check if user is logged in
    if (!isLoggedIn()) {
      requireAuth();
      return;
    }

    const response = await cartAPI.getCart();
    
    if (response.success) {
      const cart = response.cart;

      if (!cart.items || cart.items.length === 0) {
        displayEmptyCart();
      } else {
        displayCartItems(cart.items);
        updateCartSummary(cart);
      }
    }
  } catch (error) {
    console.error('Error loading cart:', error);
    showToast('Error loading cart. Please try again.', 'error');
    displayEmptyCart();
  }
};

/**
 * Display empty cart message
 */
const displayEmptyCart = () => {
  if (emptyCartDiv) emptyCartDiv.style.display = 'block';
  if (cartItemsContainer) cartItemsContainer.innerHTML = '';
  
  // Reset summary
  document.getElementById('subtotal').textContent = '₹0';
  document.getElementById('tax').textContent = '₹0';
  document.getElementById('shipping').textContent = '₹0';
  document.getElementById('total').textContent = '₹0';
  
  if (checkoutBtn) checkoutBtn.disabled = true;
};

/**
 * Display cart items
 */
const displayCartItems = (items) => {
  if (emptyCartDiv) emptyCartDiv.style.display = 'none';
  if (checkoutBtn) checkoutBtn.disabled = false;

  if (!cartItemsContainer) return;

  cartItemsContainer.innerHTML = items
    .map(item => createCartItemHTML(item))
    .join('');

  // Add event listeners
  addCartItemListeners();
};

/**
 * Create cart item HTML
 */
const createCartItemHTML = (item) => {
  const productId = item.product?._id || item.product || '';
  const itemId = item._id || productId; // cart item id fallback to product id
  const productTitle = item.productName || item.product?.title || 'Product';
  const productImage = item.product?.image || 'https://via.placeholder.com/100';

  return `
    <div class="cart-item">
      <img src="${productImage}" alt="${productTitle}" class="cart-item-image">
      <div class="cart-item-details">
        <h3 class="cart-item-name">${productTitle}</h3>
        <p class="cart-item-price">₹${item.price.toLocaleString('en-IN')} each</p>
        <div class="cart-item-quantity">
          <button class="qty-btn" onclick="updateQuantity('${productId}', ${item.quantity - 1})">−</button>
          <input type="number" value="${item.quantity}" readonly class="qty-input" style="width: 50px; text-align: center; border: 1px solid #ccc; border-radius: 4px;">
          <button class="qty-btn" onclick="updateQuantity('${productId}', ${item.quantity + 1})">+</button>
        </div>
        <p style="margin-top: 10px; font-weight: bold;">Subtotal: ₹${item.total.toLocaleString('en-IN')}</p>
      </div>
      <button class="remove-btn" onclick="removeFromCart('${itemId}')">Remove</button>
    </div>
  `;
};

/**
 * Update cart item quantity
 */
async function updateQuantity(productId, newQuantity) {
  try {
    if (newQuantity < 1) {
      showToast('Quantity must be at least 1', 'warning');
      return;
    }

    if (newQuantity > 10) {
      showToast('Maximum quantity is 10 items', 'warning');
      return;
    }

    await cartAPI.updateQuantity(productId, newQuantity);
    loadCart();
    updateCartBadge();
  } catch (error) {
    console.error('Error updating quantity:', error);
    showToast(error.message || 'Failed to update quantity', 'error');
  }
}

/**
 * Remove item from cart
 */
async function removeFromCart(productId) {
  try {
    if (confirm('Are you sure you want to remove this item?')) {
      await cartAPI.removeFromCart(productId);
      showToast('Item removed from cart', 'success');
      loadCart();
      updateCartBadge();
    }
  } catch (error) {
    console.error('Error removing from cart:', error);
    showToast(error.message || 'Failed to remove item', 'error');
  }
}

/**
 * Update cart summary (totals)
 */
const updateCartSummary = (cart) => {
  const subtotal = cart.totalPrice;
  const tax = Math.round(subtotal * 0.1 * 100) / 100;
  const shipping = subtotal > 5000 ? 0 : 100;
  const total = subtotal + tax + shipping;

  document.getElementById('subtotal').textContent = `₹${subtotal.toLocaleString('en-IN')}`;
  document.getElementById('tax').textContent = `₹${tax.toLocaleString('en-IN')}`;
  document.getElementById('shipping').textContent = `₹${shipping.toLocaleString('en-IN')}`;
  document.getElementById('total').textContent = `₹${total.toLocaleString('en-IN')}`;
};

/**
 * Add event listeners to cart items
 */
const addCartItemListeners = () => {
  // Event listeners are added inline in createCartItemHTML
};

/**
 * Handle checkout button click
 */
const handleCheckout = () => {
  if (!isLoggedIn()) {
    showToast('Please login to checkout', 'warning');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1000);
    return;
  }

  // Redirect to checkout page
  window.location.href = 'checkout.html';
};

// Add event listener to checkout button
if (checkoutBtn) {
  checkoutBtn.addEventListener('click', handleCheckout);
}

// Load cart when page loads
document.addEventListener('DOMContentLoaded', loadCart);
