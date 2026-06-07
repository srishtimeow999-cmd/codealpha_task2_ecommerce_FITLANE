/* ============================================
   HOME PAGE - SPORTSWEAR HOMEPAGE SCRIPT
   ============================================ */

const DEMO_PRODUCTS = [];

const collectionsGrid = document.getElementById('collections-grid');
const hotPicksGrid = document.getElementById('hot-picks-grid');
const newsletterForm = document.getElementById('newsletter-form');
const mobileToggle = document.getElementById('mobile-toggle');
const navLinks = document.querySelector('.nav-links');
const cartBadge = document.getElementById('cart-badge');

const COLLECTION_CARDS = [
  { title: 'Performance Basics', subtitle: 'Men', link: 'products.html?gender=Men' },
  { title: 'Everyday Essentials', subtitle: 'Women', link: 'products.html?gender=Women' },
  { title: 'Sculpted fit', subtitle: 'Leggings', link: 'products.html?category=Leggings' },
  { title: 'Lightweight comfort', subtitle: 'Shorts', link: 'products.html?category=Shorts' },
  { title: 'Essential layers', subtitle: 'Tops', link: 'products.html?category=Tops' },
  { title: 'Matching must-haves', subtitle: 'Sets', link: 'products.html?category=Sets' }
];

function createHotPickCard(product) {
  const title = product.title || product.name || 'Featured Item';
  const price = product.price != null ? `₹${Number(product.price).toLocaleString('en-IN')}` : 'Price unavailable';
  const label = product.featured ? 'Featured' : 'Hot';

  return `
    <article class="hot-pick-card" onclick="openProductDetail('${product._id || product.id}')">
      <div class="hot-pick-media">${label}</div>
      <div class="hot-pick-content">
        <h3>${title}</h3>
        <p>${product.category || 'Sportswear'} collection</p>
        <div class="hot-pick-price">
          <span>${price}</span>
          <span>${product.featured ? '⭐ Top Pick' : ''}</span>
        </div>
        <div class="hot-pick-actions">
          <button class="btn btn-primary" onclick="event.stopPropagation(); addToCart('${product._id || product.id}')">Add</button>
        </div>
      </div>
    </article>
  `;
}

async function loadHotPicks() {
  if (!hotPicksGrid) return;

  hotPicksGrid.innerHTML = '<div class="loading">Loading featured products...</div>';

  try {
    let response = await productsAPI.getAll('All', '', 1, 6, 'All', true);

    // Fallback to general top products if no featured items exist.
    if (!response.success || !Array.isArray(response.products) || response.products.length === 0) {
      response = await productsAPI.getAll('All', '', 1, 6, 'All', false);
    }

    if (response.success && Array.isArray(response.products) && response.products.length > 0) {
      hotPicksGrid.innerHTML = response.products
        .map(product => createHotPickCard(product))
        .join('');
    } else {
      hotPicksGrid.innerHTML = '<p>No products are available right now. Please check back shortly.</p>';
    }
  } catch (error) {
    console.error('Error loading featured products:', error);
    hotPicksGrid.innerHTML = '<p>Unable to load products. Please refresh the page.</p>';
  }
}

function loadCollections() {
  if (!collectionsGrid) return;
  collectionsGrid.innerHTML = COLLECTION_CARDS.map((card, index) => {
    const sizeClass = index === 0 ? 'collection-card-large' : 'collection-card-small';
    return `
      <a href="${card.link}" class="collection-card ${sizeClass}">
        <div class="collection-card-overlay">
          <span>${card.subtitle}</span>
          <h3>${card.title}</h3>
          <span class="link-ghost">Shop now</span>
        </div>
      </a>
    `;
  }).join('');
}

function setupMobileMenu() {
  mobileToggle?.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

function setupNewsletter() {
  newsletterForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = newsletterForm.querySelector('.newsletter-input').value;
    showToast(`Subscribed successfully: ${email}`, 'success');
    newsletterForm.reset();
  });
}

function updateCartBadge() {
  const count = localStorage.getItem('cartCount') || 0;
  if (cartBadge) cartBadge.textContent = count;
}

function addToCart(productId) {
  const count = Number(localStorage.getItem('cartCount') || 0) + 1;
  localStorage.setItem('cartCount', count);
  updateCartBadge();
  showToast('Added to cart', 'success');
}

function init() {
  loadCollections();
  loadHotPicks();
  setupMobileMenu();
  setupNewsletter();
  updateCartBadge();
}

document.addEventListener('DOMContentLoaded', init);
