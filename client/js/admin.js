// /client/js/admin.js
// Admin panel for managing products

const adminProductList = document.getElementById('adminProductList');

const ADMIN_CATEGORIES = ['Tops', 'T-Shirts', 'Shorts', 'Pants', 'Sports Bra', 'Socks', 'Leggings', 'Sets', 'Accessories'];

const escapeHtml = (value) => {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const createProductCard = (product) => {
  const title = product.title || 'Untitled Product';
  const escapedTitle = escapeHtml(title);
  const price = product.price != null ? `₹${Number(product.price).toLocaleString('en-IN')}` : 'Price unset';
  const stock = product.stock != null ? product.stock : '—';
  const featured = product.featured ? 'Yes' : 'No';
  const gender = product.gender || 'Unspecified';
  const category = escapeHtml(product.category || 'Uncategorized');
  const safeGender = escapeHtml(gender);

  return `
    <div class="admin-product-card">
      <div>
        <h3>${escapedTitle}</h3>
        <p class="product-category">${category} • ${safeGender}</p>
      </div>
      <div class="admin-product-meta">
        <span>${price}</span>
        <span>Stock: ${stock}</span>
        <span>Featured: ${featured}</span>
      </div>
      <div class="admin-product-actions">
        <button type="button" class="btn btn-secondary edit-product-btn" data-product-id="${product._id}">Edit</button>
        <button type="button" class="btn btn-danger delete-product-btn" data-product-id="${product._id}" data-product-title="${escapedTitle}">Delete</button>
      </div>
    </div>
  `;
};

const attachAdminCardListeners = () => {
  const editButtons = adminProductList.querySelectorAll('.edit-product-btn');
  editButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const productId = button.dataset.productId;
      editProduct(productId);
    });
  });

  const deleteButtons = adminProductList.querySelectorAll('.delete-product-btn');
  deleteButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const productId = button.dataset.productId;
      const title = button.dataset.productTitle;
      deleteProduct(productId, title);
    });
  });
};

const loadAdminProducts = async () => {
  if (!adminProductList) return;

  adminProductList.innerHTML = '<div class="loading">Loading products...</div>';

  try {
    const response = await productsAPI.getAll('All', '', 1, 100);

    if (response.success && Array.isArray(response.products)) {
      if (response.products.length === 0) {
        adminProductList.innerHTML = '<p>No products found. Add a new product to populate the catalog.</p>';
        return;
      }

      adminProductList.innerHTML = response.products
        .map(product => createProductCard(product))
        .join('');

      attachAdminCardListeners();
    } else {
      adminProductList.innerHTML = '<p>Unable to load products. Please refresh the page.</p>';
    }
  } catch (error) {
    console.error('Admin product list error:', error);
    adminProductList.innerHTML = '<p>Error loading products. Please try again later.</p>';
  }
};

async function handleProductSubmit(event) {
  if (event && typeof event.preventDefault === 'function') {
    event.preventDefault();
  }
  console.debug('Admin product submit triggered');

  const productId = document.getElementById('productId').value;
  const title = document.getElementById('productTitle').value.trim();
  const description = document.getElementById('productDescription').value.trim();
  const price = Number(document.getElementById('productPrice').value);
  const category = document.getElementById('productCategory').value;
  const gender = document.getElementById('productGender').value;
  const imagesText = document.getElementById('productImages').value.trim();
  const stock = Number(document.getElementById('productStock').value);
  const featured = document.getElementById('productFeatured').checked;

  if (!title || !description || !category || !gender || Number.isNaN(price) || Number.isNaN(stock)) {
    showToast('Please fill in all required fields with valid values.', 'error');
    return;
  }

  const images = imagesText
    .split('\n')
    .map(url => url.trim())
    .filter(Boolean);

  try {
    const productData = {
      title,
      description,
      price,
      category,
      gender,
      images,
      stock,
      featured
    };

    let response;
    if (productId) {
      response = await productsAPI.update(productId, productData);
    } else {
      response = await productsAPI.add(productData);
    }

    if (response.success) {
      showToast(productId ? 'Product updated successfully!' : 'Product added successfully!', 'success');
      clearEditMode();
      loadAdminProducts();
    }
  } catch (error) {
    console.error('Add/update product error:', error);
    showToast(error.message || 'Failed to save product.', 'error');
  }
};

const editProduct = async (productId) => {
  try {
    const response = await productsAPI.getById(productId);
    if (!response.success || !response.product) {
      showToast('Unable to load product for editing.', 'error');
      return;
    }

    const product = response.product;
    document.getElementById('productId').value = product._id;
    document.getElementById('productTitle').value = product.title;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productGender').value = product.gender;
    document.getElementById('productImages').value = (Array.isArray(product.images) && product.images.length > 0)
      ? product.images.join('\n')
      : product.image || '';
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productFeatured').checked = !!product.featured;

    document.getElementById('submitProductButton').textContent = 'Save Changes';
    document.getElementById('cancelEditButton').classList.remove('hidden');
    showToast('Edit mode enabled. Update the product and save.', 'info');
  } catch (error) {
    console.error('Edit product error:', error);
    showToast('Failed to enter edit mode.', 'error');
  }
};

const deleteProduct = async (productId, title) => {
  if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
    return;
  }

  try {
    const response = await productsAPI.delete(productId);
    if (response.success) {
      showToast('Product deleted successfully!', 'success');
      if (document.getElementById('productId').value === productId) {
        clearEditMode();
      }
      loadAdminProducts();
    }
  } catch (error) {
    console.error('Delete product error:', error);
    showToast(error.message || 'Failed to delete product.', 'error');
  }
};

const clearEditMode = () => {
  const productForm = document.getElementById('productForm');
  if (productForm) {
    productForm.reset();
  }
  document.getElementById('productId').value = '';
  document.getElementById('submitProductButton').textContent = 'Add Product';
  document.getElementById('cancelEditButton').classList.add('hidden');
};

const setupAdminPage = async () => {
  requireAuth();

  if (!isAdmin()) {
    showToast('Admin access only. Redirecting...', 'warning');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1200);
    return;
  }

  const productForm = document.getElementById('productForm');
  const submitProductButton = document.getElementById('submitProductButton');
  const cancelEditButton = document.getElementById('cancelEditButton');

  if (productForm) {
    productForm.addEventListener('submit', handleProductSubmit);
    productForm.onsubmit = handleProductSubmit;
  } else {
    console.warn('Admin product form not found in DOM');
  }

  if (submitProductButton) {
    submitProductButton.addEventListener('click', (event) => {
      event.preventDefault();
      if (!productForm) {
        console.warn('Submit button clicked but product form is missing');
        return;
      }
      if (typeof productForm.requestSubmit === 'function') {
        productForm.requestSubmit();
      } else {
        handleProductSubmit(event);
      }
    });
  } else {
    console.warn('Submit product button not found in DOM');
  }

  if (cancelEditButton) {
    cancelEditButton.addEventListener('click', clearEditMode);
  }
  if (cancelEditButton) {
    cancelEditButton.addEventListener('click', clearEditMode);
  }

  await loadAdminProducts();
};

window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.handleProductSubmit = handleProductSubmit;

// Initialize admin page when loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupAdminPage);
} else {
  setupAdminPage();
}
