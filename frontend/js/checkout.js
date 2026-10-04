const previewContainer = document.getElementById('checkout-items-preview');
const checkoutForm = document.getElementById('checkout-form');
const submitBtn = document.getElementById('submit-order-btn');

async function loadCheckoutSummary() {
  if (!auth.isAuthenticated()) {
    alert('Please log in to proceed to checkout.');
    window.location.href = 'login.html';
    return;
  }

  try {
    const response = await api.get('/cart');
    const { items, subtotal } = response.data;

    if (!items || items.length === 0) {
      alert('Your cart is empty.');
      window.location.href = 'index.html';
      return;
    }

    previewContainer.innerHTML = `
      <div>
        ${items.map((i) => `
          <div class="review-item">
            <span>${i.product.name} (x${i.quantity})</span>
            <span style="font-weight: 600;">$${i.itemTotal.toFixed(2)}</span>
          </div>
        `).join('')}
        
        <div style="display: flex; justify-content: space-between; margin-top: 1.5rem; font-size: 1.25rem; font-weight: 700; border-top: 2px solid var(--border); padding-top: 1rem;">
          <span>Total:</span>
          <span style="color: var(--primary);">$${subtotal.toFixed(2)}</span>
        </div>
      </div>
    `;
  } catch (error) {
    previewContainer.innerHTML = `<p style="color: var(--danger);">Failed to load order preview: ${error.message}</p>`;
  }
}

checkoutForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const address = document.getElementById('shipping-address').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const fullShippingAddress = `${address} (Phone: ${phone})`;

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing Transaction...';

    const response = await api.post('/orders', {
      shippingAddress: fullShippingAddress,
    });

    alert('🎉 Order successfully placed! Your inventory has been updated.');
    updateCartBadge();
    window.location.href = `orders.html?id=${response.data.id}`;
  } catch (error) {
    alert(`Order failed: ${error.message}`);
    submitBtn.disabled = false;
    submitBtn.textContent = 'Place Order Now';
  }
});

document.addEventListener('DOMContentLoaded', loadCheckoutSummary);
