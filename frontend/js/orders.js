const ordersList = document.getElementById('orders-list');

async function loadOrders() {
  if (!auth.isAuthenticated()) {
    ordersList.innerHTML = `
      <div style="text-align: center; padding: 3rem;">
        <p style="font-size: 1.2rem; margin-bottom: 1rem;">Please log in to view your orders.</p>
        <a href="login.html" class="btn">Log In</a>
      </div>
    `;
    return;
  }

  try {
    const response = await api.get('/orders');
    const orders = response.data;

    renderOrders(orders);
  } catch (error) {
    ordersList.innerHTML = `<p style="color: var(--danger); text-align: center;">Failed to load orders: ${error.message}</p>`;
  }
}

function renderOrders(orders) {
  if (!orders || orders.length === 0) {
    ordersList.innerHTML = `
      <div style="text-align: center; padding: 3rem;">
        <p style="font-size: 1.2rem; color: var(--text-muted); margin-bottom: 1.5rem;">You haven't placed any orders yet.</p>
        <a href="index.html" class="btn">Start Shopping</a>
      </div>
    `;
    return;
  }

  ordersList.innerHTML = orders.map((order) => {
    const dateFormatted = new Date(order.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return `
      <div class="order-card">
        <div class="order-header">
          <div>
            <span style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase;">Order ID:</span>
            <div style="font-family: monospace; font-weight: 600;">${order.id}</div>
            <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.2rem;">Placed: ${dateFormatted}</div>
          </div>
          <div style="text-align: right;">
            <span class="order-status status-${order.status}">${order.status}</span>
            <div style="font-size: 1.3rem; font-weight: 700; color: var(--primary); margin-top: 0.3rem;">
              $${order.totalAmount.toFixed(2)}
            </div>
          </div>
        </div>

        <div style="margin-bottom: 1rem;">
          <strong style="font-size: 0.9rem;">Shipping Address:</strong>
          <p style="color: var(--text-muted); font-size: 0.9rem;">${order.shippingAddress}</p>
        </div>

        <div style="border-top: 1px dashed var(--border); padding-top: 0.75rem;">
          <strong style="font-size: 0.9rem; display: block; margin-bottom: 0.5rem;">Items:</strong>
          ${order.items.map((i) => `
            <div class="order-item-mini">
              <span>${i.product ? i.product.name : 'Product'} (x${i.quantity})</span>
              <span>$${(i.price * i.quantity).toFixed(2)} (at $${i.price.toFixed(2)}/ea)</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

document.addEventListener('DOMContentLoaded', loadOrders);
