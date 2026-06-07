// /client/js/checkout.js
// Handles checkout page functionality

const checkoutForm = document.getElementById('checkoutForm');
const placeOrderBtn = document.getElementById('placeOrderBtn');
const orderItemsList = document.getElementById('orderItemsList');

/**
 * Load cart items and display them on checkout page
 */
const loadCheckoutItems = async () => {
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
        showToast('Your cart is empty. Please add items before checkout.', 'warning');
        setTimeout(() => {
          window.location.href = 'cart.html';
        }, 2000);
        return;
      }

      // Display order items
      displayOrderItems(cart.items);
      updateOrderSummary(cart);
    }
  } catch (error) {
    console.error('Error loading checkout items:', error);
    showToast('Error loading checkout. Please try again.', 'error');
  }
};

/**
 * Display order items
 */
const displayOrderItems = (items) => {
  if (!orderItemsList) return;

  orderItemsList.innerHTML = items
      .map(item => {
        const productId = item.product?._id || item.product || '';
        const itemId = item._id || productId;
      return `
        <div class="order-item">
          <div>
            <strong>${item.productName}</strong><br>
            Quantity: ${item.quantity} × ₹${item.price.toLocaleString('en-IN')}
          </div>
          <div style="text-align: right;">
              ₹${item.total.toLocaleString('en-IN')}<br>
              <button type="button" class="btn btn-link" style="margin-top: 10px; color: #e53e3e;" onclick="removeCheckoutItem('${itemId}')">Remove</button>
          </div>
        </div>
      `;
    })
    .join('');
};


/**
 * Remove an item from the cart while on checkout page
 */
async function removeCheckoutItem(productId) {
  try {
    if (!productId) {
      showToast('Unable to remove this item.', 'error');
      return;
    }

    await cartAPI.removeFromCart(productId);
    showToast('Item removed from your cart', 'success');
    loadCheckoutItems();
    updateCartBadge();
  } catch (error) {
    console.error('Error removing checkout item:', error);
    showToast(error.message || 'Failed to remove item', 'error');
  }
}

/**
 * Update order summary
 */
const updateOrderSummary = (cart) => {
  const subtotal = cart.totalPrice;
  const tax = Math.round(subtotal * 0.1 * 100) / 100;
  const shipping = subtotal > 5000 ? 0 : 100;
  const total = subtotal + tax + shipping;

  document.getElementById('summarySubtotal').textContent = `₹${subtotal.toLocaleString('en-IN')}`;
  document.getElementById('summaryTax').textContent = `₹${tax.toLocaleString('en-IN')}`;
  document.getElementById('summaryShipping').textContent = `₹${shipping.toLocaleString('en-IN')}`;
  document.getElementById('summaryTotal').textContent = `₹${total.toLocaleString('en-IN')}`;
};

/**
 * Handle checkout form submission
 */
const handleCheckoutSubmit = async (e) => {
  e.preventDefault();

  try {
    placeOrderBtn.disabled = true;
    placeOrderBtn.textContent = 'Processing Order...';

    // Get form data
    const street = document.getElementById('street').value.trim();
    const city = document.getElementById('city').value.trim();
    const state = document.getElementById('state').value.trim();
    const zipCode = document.getElementById('zipCode').value.trim();
    const country = document.getElementById('country').value.trim();

    // Validation
    if (!street || !city || !state || !zipCode || !country) {
      showToast('Please fill in all address fields', 'error');
      placeOrderBtn.disabled = false;
      placeOrderBtn.textContent = 'Place Order';
      return;
    }

    // Create order
    const shippingAddress = { street, city, state, zipCode, country };
    const response = await ordersAPI.create(shippingAddress);

    if (response.success) {
      showToast('Order placed successfully!', 'success');

      const orderId = response.order?._id || response.orderDetails?.orderId;
      const orderNumber = response.order?.orderNumber || response.orderDetails?.orderNumber;
      if (orderId) {
        if (orderNumber) {
          localStorage.setItem('lastOrderNumber', orderNumber);
        }
        localStorage.setItem('lastOrderId', orderId);
        setTimeout(() => {
          window.location.href = `order-confirmation.html?orderId=${orderId}`;
        }, 2000);
      } else {
        showToast('Order placed, but unable to confirm order details.', 'info');
      }
    }
  } catch (error) {
    console.error('Checkout error:', error);
    showToast(error.message || 'Failed to place order. Please try again.', 'error');
    
    placeOrderBtn.disabled = false;
    placeOrderBtn.textContent = 'Place Order';
  }
};

// Add event listener to form
if (checkoutForm) {
  checkoutForm.addEventListener('submit', handleCheckoutSubmit);
}

// Load checkout items when page loads
document.addEventListener('DOMContentLoaded', loadCheckoutItems);
