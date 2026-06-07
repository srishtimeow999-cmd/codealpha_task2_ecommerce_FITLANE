// /client/js/productDetail.js
// Shared modal for product details, size selection, and reviews

const PRODUCT_DETAIL_MODAL_ID = 'productDetailModal';
const PRODUCT_DETAIL_CONTENT_ID = 'productDetailContent';
let selectedProductSize = 'M';
let currentProductId = null;

const getProductSizeStorageKey = (productId) => `product_size_${productId}`;
const loadStoredProductSize = (productId) => {
  try {
    const storedSize = localStorage.getItem(getProductSizeStorageKey(productId));
    return storedSize || 'M';
  } catch {
    return 'M';
  }
};
const saveSelectedProductSize = (productId, size) => {
  try {
    localStorage.setItem(getProductSizeStorageKey(productId), size);
  } catch {
    // ignore storage errors
  }
};

const createProductDetailModal = () => {
  if (document.getElementById(PRODUCT_DETAIL_MODAL_ID)) return;

  const modalHtml = `
    <div id="${PRODUCT_DETAIL_MODAL_ID}" class="product-detail-modal hidden">
      <div class="modal-backdrop" onclick="closeProductDetail()"></div>
      <div class="product-detail-dialog">
        <button class="modal-close" type="button" onclick="closeProductDetail()">×</button>
        <div id="${PRODUCT_DETAIL_CONTENT_ID}" class="product-detail-content"></div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
};

const openProductDetail = async (productId) => {
  try {
    createProductDetailModal();

    const modal = document.getElementById(PRODUCT_DETAIL_MODAL_ID);
    const detailContent = document.getElementById(PRODUCT_DETAIL_CONTENT_ID);

    if (!modal || !detailContent) return;

    detailContent.innerHTML = '<div class="loading">Loading product details...</div>';
    modal.classList.remove('hidden');

    const response = await productsAPI.getById(productId);

    if (!response.success) {
      detailContent.innerHTML = '<p>Unable to load product details.</p>';
      return;
    }

    const product = response.product;
    currentProductId = product._id;
    selectedProductSize = loadStoredProductSize(product._id);

    detailContent.innerHTML = renderProductDetail(product);
    selectProductSize(selectedProductSize);
  } catch (error) {
    console.error('Open product detail error:', error);
    const detailContent = document.getElementById(PRODUCT_DETAIL_CONTENT_ID);
    if (detailContent) {
      detailContent.innerHTML = '<p>Error loading product. Please try again.</p>';
    }
  }
};

const closeProductDetail = () => {
  const modal = document.getElementById(PRODUCT_DETAIL_MODAL_ID);
  if (modal) {
    modal.classList.add('hidden');
  }
};

const selectProductSize = (size) => {
  selectedProductSize = size;
  if (currentProductId) {
    saveSelectedProductSize(currentProductId, size);
  }

  document.querySelectorAll('.size-option').forEach(button => {
    const isSelected = button.dataset.size === size;
    button.classList.toggle('selected', isSelected);
    button.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
  });
};

const addProductToCartFromDetail = async (productId, productName) => {
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
      showToast(`${productName} added to cart! Size: ${selectedProductSize}`, 'success');
      updateCartBadge();
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    showToast(error.message || 'Failed to add item to cart', 'error');
  }
};

const renderProductDetail = (product) => {
  const title = product.title || product.name || 'Product';
  const price = product.price != null ? `₹${Number(product.price).toLocaleString('en-IN')}` : 'Price unavailable';
  const inStock = product.stock > 0;
  const reviews = loadProductReviews(product._id);
  const imageUrls = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : (product.image ? [product.image] : ['https://via.placeholder.com/300x300?text=FITLANE+Product']);

  const galleryHtml = imageUrls
    .map(url => `<img src="${url}" alt="${title}" class="product-detail-thumb">`)
    .join('');

  const sizeButtons = ['XS', 'S', 'M', 'L', 'XL']
    .map(size => `
      <button type="button" class="size-option${size === selectedProductSize ? ' selected' : ''}" data-size="${size}" onclick="selectProductSize('${size}')">${size}</button>
    `)
    .join('');

  return `
    <div class="product-detail-grid">
      <div class="product-detail-image">
        <img src="${imageUrls[0]}" alt="${title}">
        ${imageUrls.length > 1 ? `<div class="product-detail-gallery">${galleryHtml}</div>` : ''}
      </div>
      <div class="product-detail-copy">
        <p class="product-category">${product.category || 'Sportswear'}</p>
        <h2>${title}</h2>
        <p class="product-price-large">${price}</p>
        <p class="product-stock ${inStock ? 'in-stock' : 'out-of-stock'}">
          ${inStock ? `In Stock (${product.stock})` : 'Out of Stock'}
        </p>
        <p class="product-description">${product.description || 'No description available for this item.'}</p>

        <div class="detail-section">
          <h3>Select Size</h3>
          <div class="size-options">${sizeButtons}</div>
        </div>

        <div class="detail-actions">
          <button class="btn btn-primary btn-full" onclick="addProductToCartFromDetail('${product._id}', '${title.replace(/'/g, "\\'")}')" ${inStock ? '' : 'disabled'}>Add to Cart</button>
        </div>

        <div class="detail-section">
          <h3>Leave a Review</h3>
          <form onsubmit="submitProductReview(event, '${product._id}')" class="review-form">
            <label for="reviewRating">Rating</label>
            <select id="reviewRating" class="select-field" required>
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Very Good</option>
              <option value="3">3 - Good</option>
              <option value="2">2 - Fair</option>
              <option value="1">1 - Poor</option>
            </select>
            <label for="reviewComment">Review</label>
            <textarea id="reviewComment" class="input-field" rows="4" placeholder="Write your experience..." required></textarea>
            <button type="submit" class="btn btn-secondary btn-full">Submit Review</button>
          </form>
        </div>

        <div class="detail-section reviews-section">
          <h3>Reviews</h3>
          ${reviews.length > 0 ? renderReviewList(reviews) : '<p class="no-reviews">No reviews yet. Be the first to leave feedback.</p>'}
        </div>
      </div>
    </div>
  `;
};

const loadProductReviews = (productId) => {
  try {
    const stored = localStorage.getItem(`product_reviews_${productId}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveProductReview = (productId, review) => {
  const reviews = loadProductReviews(productId);
  reviews.unshift(review);
  localStorage.setItem(`product_reviews_${productId}`, JSON.stringify(reviews));
};

const renderReviewList = (reviews) => {
  return reviews
    .map(review => `
      <div class="review-card">
        <div class="review-meta">
          <span class="review-author">${review.name}</span>
          <span class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span>
        </div>
        <p>${review.comment}</p>
        <span class="review-date">${review.date}</span>
      </div>
    `)
    .join('');
};

const submitProductReview = (event, productId) => {
  event.preventDefault();

  const ratingSelect = document.getElementById('reviewRating');
  const reviewComment = document.getElementById('reviewComment');

  if (!ratingSelect || !reviewComment) return;

  const rating = Number(ratingSelect.value);
  const comment = reviewComment.value.trim();

  if (!comment) {
    showToast('Please write a review comment.', 'error');
    return;
  }

  saveProductReview(productId, {
    name: getCurrentUser()?.name || 'Guest',
    rating,
    comment,
    date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
  });

  showToast('Review submitted successfully!', 'success');
  openProductDetail(productId);
};

window.openProductDetail = openProductDetail;
window.closeProductDetail = closeProductDetail;
window.selectProductSize = selectProductSize;
window.submitProductReview = submitProductReview;
window.addProductToCartFromDetail = addProductToCartFromDetail;
