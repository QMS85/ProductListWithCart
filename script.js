
// Global state
let cart = [];
let products = [];

// DOM elements
const productsGrid = document.getElementById('products-grid');
const cartCount = document.getElementById('cart-count');
const cartContent = document.getElementById('cart-content');
const emptyCart = document.getElementById('empty-cart');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const confirmOrderBtn = document.getElementById('confirm-order-btn');
const modalOverlay = document.getElementById('modal-overlay');
const modalOrderItems = document.getElementById('modal-order-items');
const startNewOrderBtn = document.getElementById('start-new-order-btn');

// Load products data and initialize the application
async function init() {
  try {
    const response = await fetch('data.json');
    products = await response.json();
    renderProducts();
    updateCartDisplay();
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

// Render products grid
function renderProducts() {
  productsGrid.innerHTML = products.map((product, index) => `
    <article class="product-card" data-product-id="${index}">
      <picture>
        <source media="(min-width: 768px)" srcset="${product.image.desktop}">
        <source media="(min-width: 375px)" srcset="${product.image.tablet}">
        <img src="${product.image.mobile}" alt="${product.name}" class="product-image">
      </picture>
      
      <button class="add-to-cart-btn" aria-label="Add ${product.name} to cart">
        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" fill="none" viewBox="0 0 21 20" aria-hidden="true">
          <g fill="#C73B0F" clip-path="url(#a)">
            <path d="M6.583 18.75a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5ZM15.334 18.75a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5ZM3.446 1.752a.625.625 0 0 0-.613-.502h-2.5V2.5h1.988l2.4 11.998a.625.625 0 0 0 .612.502h11.25v-1.25H5.847l-.5-2.5h11.238a.625.625 0 0 0 .61-.49l1.417-6.385h-1.28L16.083 10H5.096l-1.65-8.248Z"/>
            <path d="M11.584 3.75v-2.5h-1.25v2.5h-2.5V5h2.5v2.5h1.25V5h2.5V3.75h-2.5Z"/>
          </g>
          <defs>
            <clipPath id="a"><path fill="#fff" d="M.333 0h20v20h-20z"/></clipPath>
          </defs>
        </svg>
        Add to Cart
      </button>
      
      <div class="quantity-controls">
        <button class="quantity-btn decrement-btn" aria-label="Decrease quantity of ${product.name}">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="2" fill="none" viewBox="0 0 10 2" aria-hidden="true">
            <path fill="#fff" d="M0 .375h10v1.25H0V.375Z"/>
          </svg>
        </button>
        <span class="quantity-display" aria-live="polite">1</span>
        <button class="quantity-btn increment-btn" aria-label="Increase quantity of ${product.name}">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10" aria-hidden="true">
            <path fill="#fff" d="M4.375 0v4.375H0v1.25h4.375V10h1.25V5.625H10v-1.25H5.625V0h-1.25Z"/>
          </svg>
        </button>
      </div>
      
      <div class="product-info">
        <p class="product-category">${product.category}</p>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price" aria-label="Price: $${product.price.toFixed(2)}">$${product.price.toFixed(2)}</p>
      </div>
    </article>
  `).join('');

  // Add event listeners to product cards
  addProductEventListeners();
}

// Add event listeners to all product cards
function addProductEventListeners() {
  document.querySelectorAll('.product-card').forEach(card => {
    const productId = parseInt(card.dataset.productId);
    const addBtn = card.querySelector('.add-to-cart-btn');
    const decrementBtn = card.querySelector('.decrement-btn');
    const incrementBtn = card.querySelector('.increment-btn');
    const quantityDisplay = card.querySelector('.quantity-display');

    addBtn.addEventListener('click', () => addToCart(productId));
    decrementBtn.addEventListener('click', () => updateQuantity(productId, -1));
    incrementBtn.addEventListener('click', () => updateQuantity(productId, 1));
  });
}

// Add product to cart
function addToCart(productId) {
  const product = products[productId];
  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: productId,
      name: product.name,
      category: product.category,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  }

  updateProductCard(productId);
  updateCartDisplay();
}

// Update product quantity
function updateQuantity(productId, change) {
  const cartItem = cart.find(item => item.id === productId);
  
  if (cartItem) {
    cartItem.quantity += change;
    
    if (cartItem.quantity <= 0) {
      removeFromCart(productId);
    } else {
      updateProductCard(productId);
      updateCartDisplay();
    }
  }
}

// Remove product from cart
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  updateProductCard(productId);
  updateCartDisplay();
}

// Update product card visual state
function updateProductCard(productId) {
  const card = document.querySelector(`[data-product-id="${productId}"]`);
  const cartItem = cart.find(item => item.id === productId);
  const quantityDisplay = card.querySelector('.quantity-display');

  if (cartItem) {
    card.classList.add('selected');
    quantityDisplay.textContent = cartItem.quantity;
  } else {
    card.classList.remove('selected');
  }
}

// Update cart display
function updateCartDisplay() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  cartCount.textContent = totalItems;

  if (cart.length === 0) {
    emptyCart.style.display = 'block';
    cartItems.style.display = 'none';
    cartTotal.style.display = 'none';
  } else {
    emptyCart.style.display = 'none';
    cartItems.style.display = 'block';
    cartTotal.style.display = 'block';

    renderCartItems();
    updateCartTotal(totalPrice);
  }
}

// Render cart items
function renderCartItems() {
  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-info">
        <h3>${item.name}</h3>
        <div class="cart-item-details">
          <span class="cart-item-quantity">${item.quantity}x</span>
          <span class="cart-item-price">@ $${item.price.toFixed(2)}</span>
          <span class="cart-item-total">$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
      </div>
      <button class="remove-item-btn" aria-label="Remove ${item.name} from cart" onclick="removeFromCart(${item.id})">
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10" aria-hidden="true">
          <path fill="#CAAFA7" d="m8.375 0 1.25 1.25L6.25 5l3.375 3.75-1.25 1.25L5 6.25 1.25 10 0 8.75 3.75 5 0 1.25 1.25 0 5 3.75 8.375 0Z"/>
        </svg>
      </button>
    </div>
  `).join('');
}

// Update cart total
function updateCartTotal(totalPrice) {
  cartTotal.innerHTML = `
    <div class="order-total">
      <span class="order-total-label">Order Total</span>
      <span class="order-total-amount" id="cart-total-amount">$${totalPrice.toFixed(2)}</span>
    </div>
    <div class="carbon-neutral">
      <img src="icon-carbon-neutral.svg" alt="Carbon neutral delivery" aria-hidden="true">
      <span>This is a <strong>carbon-neutral</strong> delivery</span>
    </div>
    <button class="confirm-order-btn" id="confirm-order-btn" aria-describedby="cart-total-amount">
      Confirm Order
    </button>
  `;

  // Re-attach event listener for confirm order button
  document.getElementById('confirm-order-btn').addEventListener('click', showOrderConfirmation);
}

// Show order confirmation modal
function showOrderConfirmation() {
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  modalOrderItems.innerHTML = `
    <div>
      ${cart.map(item => `
        <div class="modal-order-item">
          <img src="${item.image.thumbnail}" alt="${item.name}" class="modal-item-image">
          <div class="modal-item-info">
            <h3 class="modal-item-name">${item.name}</h3>
            <div class="modal-item-details">
              <span class="modal-item-quantity">${item.quantity}x</span>
              <span class="modal-item-price">@ $${item.price.toFixed(2)}</span>
            </div>
          </div>
          <span class="modal-item-total">$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
      `).join('')}
    </div>
    <div class="modal-order-total">
      <span class="modal-total-label">Order Total</span>
      <span class="modal-total-amount">$${totalPrice.toFixed(2)}</span>
    </div>
  `;

  modalOverlay.style.display = 'flex';
  modalOverlay.setAttribute('aria-hidden', 'false');
  
  // Focus management
  const firstFocusableElement = modalOverlay.querySelector('button');
  if (firstFocusableElement) {
    firstFocusableElement.focus();
  }

  // Prevent body scroll
  document.body.style.overflow = 'hidden';
}

// Hide order confirmation modal and reset cart
function hideOrderConfirmation() {
  modalOverlay.style.display = 'none';
  modalOverlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  
  // Reset cart
  cart = [];
  
  // Reset all product cards
  document.querySelectorAll('.product-card').forEach(card => {
    card.classList.remove('selected');
  });
  
  updateCartDisplay();
}

// Event listeners
confirmOrderBtn?.addEventListener('click', showOrderConfirmation);
startNewOrderBtn.addEventListener('click', hideOrderConfirmation);

// Close modal when clicking outside
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) {
    hideOrderConfirmation();
  }
});

// Keyboard navigation for modal
document.addEventListener('keydown', (e) => {
  if (modalOverlay.style.display === 'flex' && e.key === 'Escape') {
    hideOrderConfirmation();
  }
});

// Initialize the application
init();
