const cartContent = document.getElementById('cart-content');

async function loadCart() {
  if (!auth.isAuthenticated()) {
    cartContent.innerHTML = `
      <div style="text-align: center; padding: 3rem;">
        <p style="font-size: 1.2rem; margin-bottom: 1rem;">Please log in to view your cart.</p>
        <a href="login.html" class="btn">Log In</a>
      </div>
    `;
    return;
  }

  try {
    const response = await api.get('/cart');
    const { items, subtotal, totalItemsCount } = response.data;

    renderCart(items, subtotal, totalItemsCount);
    updateCartBadge();
  } catch (error) {
    cartContent.innerHTML = `<p style="color: var(--danger); text-align: center;">Failed to load cart: ${error.message}</p>`;
  }
}

function renderCart(items, subtotal, totalItemsCount) {
  if (!items || items.length === 0) {
    cartContent.innerHTML = `
      <div style="text-align: center; padding: 3rem;">
        <p style="font-size: 1.2rem; color: var(--text-muted); margin-bottom: 1.5rem;">Your cart is currently empty.</p>
        <a href="index.html" class="btn">Start Shopping</a>
      </div>
    `;
    return;
  }

  cartContent.innerHTML = `
    <div class="cart-layout">
      <!-- Item List -->
      <div class="cart-items-card">
        ${items.map((item) => `
          <div class="cart-item-row" id="row-${item.id}">
            <img 
              src="${item.product.imageUrl || 'https://via.placeholder.com/80'}" 
              alt="${item.product.name}" 
              class="cart-item-img"
            />
            <div class="cart-item-details">
              <h3 style="font-size: 1.1rem; margin-bottom: 0.3rem;">
                <a href="product.html?id=${item.product.id}" style="text-decoration: none; color: var(--text-main);">
                  ${item.product.name}
                </a>
              </h3>
              <p style="color: var(--text-muted); font-size: 0.9rem;">Unit Price: $${item.product.price.toFixed(2)}</p>
              <button class="remove-btn" onclick="removeItem('${item.id}')">Remove</button>
            </div>
            
            <div class="qty-controls">
              <button class="qty-btn" onclick="updateQty('${item.id}', ${item.quantity - 1})">-</button>
              <span style="font-weight: 600; min-width: 20px; text-align: center;">${item.quantity}</span>
              <button class="qty-btn" onclick="updateQty('${item.id}', ${item.quantity + 1})">+</button>
            </div>

            <div style="font-weight: 700; font-size: 1.1rem; min-width: 80px; text-align: right;">
              $${item.itemTotal.toFixed(2)}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Order Summary Card -->
      <div class="cart-summary-card">
        <h2 style="font-size: 1.3rem; margin-bottom: 1.5rem;">Order Summary</h2>
        <div class="summary-row">
          <span>Items (${totalItemsCount}):</span>
          <span>$${subtotal.toFixed(2)}</span>
        </div>
        <div class="summary-row">
          <span>Shipping:</span>
          <span style="color: var(--success); font-weight: 600;">FREE</span>
        </div>
        <div class="summary-row summary-total">
          <span>Total:</span>
          <span>$${subtotal.toFixed(2)}</span>
        </div>
        <a href="checkout.html" class="btn" style="width: 100%; text-align: center; margin-top: 1.5rem; padding: 0.85rem;">
          Proceed to Checkout
        </a>
      </div>
    </div>
  `;
}

async function updateQty(cartItemId, newQty) {
  try {
    await api.request(`/cart/items/${cartItemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity: newQty }),
    });
    loadCart();
  } catch (error) {
    alert(error.message);
  }
}

async function removeItem(cartItemId) {
  if (!confirm('Are you sure you want to remove this item?')) return;
  try {
    await api.delete(`/cart/items/${cartItemId}`);
    loadCart();
  } catch (error) {
    alert(error.message);
  }
}

document.addEventListener('DOMContentLoaded', loadCart);
