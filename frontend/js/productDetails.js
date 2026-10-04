const container = document.getElementById('product-detail-container');

// Extract product ID from URL (?id=...)
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

async function loadProductDetail() {
  if (!productId) {
    container.innerHTML = '<p style="color: var(--danger); text-align: center;">No product ID provided in the URL.</p>';
    return;
  }

  try {
    const response = await api.get(`/products/${productId}`);
    const product = response.data;
    renderDetail(product);
  } catch (error) {
    container.innerHTML = `<p style="color: var(--danger); text-align: center;">Failed to load product: ${error.message}</p>`;
  }
}

function renderDetail(product) {
  const isAvailable = product.stock > 0;
  const stockBadge = isAvailable
    ? `<span class="stock-tag in-stock">${product.stock} in stock</span>`
    : `<span class="stock-tag out-of-stock">Out of Stock</span>`;

  container.innerHTML = `
    <div class="product-detail-wrapper">
      <img 
        src="${product.imageUrl || 'https://via.placeholder.com/600x450?text=No+Image'}" 
        alt="${product.name}" 
        class="detail-img"
      />
      <div class="detail-info">
        <span class="product-category">${product.category}</span>
        <h1 style="font-size: 1.8rem; font-weight: 700;">${product.name}</h1>
        ${stockBadge}
        <p class="product-price" style="font-size: 2rem; margin: 0.5rem 0;">$${product.price.toFixed(2)}</p>
        <p class="product-desc" style="font-size: 1rem; line-height: 1.6;">${product.description}</p>

        <div style="display: flex; gap: 1rem; align-items: center; margin-top: 1.5rem;">
          <label for="quantity" style="font-weight: 600;">Qty:</label>
          <input 
            type="number" 
            id="quantity" 
            min="1" 
            max="${product.stock}" 
            value="1" 
            style="width: 70px; padding: 0.5rem; border: 1px solid var(--border); border-radius: var(--radius);" 
            ${!isAvailable ? 'disabled' : ''}
          />
          <button 
            id="add-to-cart-btn" 
            class="btn" 
            style="flex: 1;" 
            ${!isAvailable ? 'disabled' : ''}
          >
            ${isAvailable ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  `;

  if (isAvailable) {
    const addBtn = document.getElementById('add-to-cart-btn');
    addBtn.addEventListener('click', async () => {
      if (!auth.isAuthenticated()) {
        alert('Please log in to add items to your cart.');
        window.location.href = 'login.html';
        return;
      }

      const qty = parseInt(document.getElementById('quantity').value, 10) || 1;

      try {
        addBtn.disabled = true;
        addBtn.textContent = 'Adding...';

        await api.post('/cart/items', {
          productId: product.id,
          quantity: qty,
        });

        alert(`Added ${qty} item(s) to your cart!`);
        updateCartBadge();
      } catch (err) {
        alert(`Error: ${err.message}`);
      } finally {
        addBtn.disabled = false;
        addBtn.textContent = 'Add to Cart';
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', loadProductDetail);
