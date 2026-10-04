const productRows = document.getElementById('admin-product-rows');
const orderRows = document.getElementById('admin-order-rows');
const modal = document.getElementById('product-modal');
const form = document.getElementById('product-form');

// Check Admin access
function checkAdminAccess() {
  if (!auth.isAuthenticated() || !auth.isAdmin()) {
    alert('Access Denied: You must be logged in as an ADMIN to view this page.');
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

function switchTab(tab) {
  const tabProd = document.getElementById('tab-products');
  const tabOrd = document.getElementById('tab-orders');
  const btns = document.querySelectorAll('.tab-btn');

  if (tab === 'products') {
    tabProd.style.display = 'block';
    tabOrd.style.display = 'none';
    btns[0].classList.add('active');
    btns[1].classList.remove('active');
    loadAdminProducts();
  } else {
    tabProd.style.display = 'none';
    tabOrd.style.display = 'block';
    btns[0].classList.remove('active');
    btns[1].classList.add('active');
    loadAdminOrders();
  }
}

// 1. Products Management
async function loadAdminProducts() {
  try {
    const res = await api.get('/products?limit=100');
    const products = res.data;

    productRows.innerHTML = products.map((p) => `
      <tr>
        <td>
          <img src="${p.imageUrl || 'https://via.placeholder.com/50'}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 4px;">
        </td>
        <td style="font-weight: 600;">${p.name}</td>
        <td>${p.category}</td>
        <td>$${p.price.toFixed(2)}</td>
        <td>
          <span style="font-weight: 700; color: ${p.stock < 5 ? 'var(--danger)' : 'var(--text-main)'};">
            ${p.stock}
          </span>
        </td>
        <td>
          <button class="btn" style="padding: 0.3rem 0.6rem; font-size: 0.8rem; margin-right: 0.4rem;" onclick='editProduct(${JSON.stringify(p)})'>Edit</button>
          <button class="btn" style="background: var(--danger); padding: 0.3rem 0.6rem; font-size: 0.8rem;" onclick="deleteProduct('${p.id}')">Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    productRows.innerHTML = `<tr><td colspan="6" style="color: var(--danger); text-align: center;">${err.message}</td></tr>`;
  }
}

function openProductModal() {
  document.getElementById('modal-title').textContent = 'Add New Product';
  document.getElementById('prod-id').value = '';
  form.reset();
  modal.style.display = 'flex';
}

function closeProductModal() {
  modal.style.display = 'none';
}

function editProduct(p) {
  document.getElementById('modal-title').textContent = 'Edit Product';
  document.getElementById('prod-id').value = p.id;
  document.getElementById('prod-name').value = p.name;
  document.getElementById('prod-desc').value = p.description;
  document.getElementById('prod-price').value = p.price;
  document.getElementById('prod-stock').value = p.stock;
  document.getElementById('prod-category').value = p.category;
  document.getElementById('prod-img').value = p.imageUrl || '';
  modal.style.display = 'flex';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('prod-id').value;
  const body = {
    name: document.getElementById('prod-name').value.trim(),
    description: document.getElementById('prod-desc').value.trim(),
    price: parseFloat(document.getElementById('prod-price').value),
    stock: parseInt(document.getElementById('prod-stock').value, 10),
    category: document.getElementById('prod-category').value.trim(),
    imageUrl: document.getElementById('prod-img').value.trim() || null,
  };

  try {
    if (id) {
      await api.put(`/products/${id}`, body);
    } else {
      await api.post('/products', body);
    }
    closeProductModal();
    loadAdminProducts();
  } catch (err) {
    alert(`Failed to save product: ${err.message}`);
  }
});

async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;
  try {
    await api.delete(`/products/${id}`);
    loadAdminProducts();
  } catch (err) {
    alert(`Delete failed: ${err.message}`);
  }
}

// 2. Orders Management
async function loadAdminOrders() {
  try {
    const res = await api.get('/orders');
    const orders = res.data;

    orderRows.innerHTML = orders.map((o) => `
      <tr>
        <td style="font-family: monospace; font-size: 0.85rem;">${o.id.substring(0, 8)}...</td>
        <td>
          <strong>${o.user ? o.user.name : 'Customer'}</strong><br>
          <small style="color: var(--text-muted);">${o.user ? o.user.email : ''}</small>
        </td>
        <td>${new Date(o.createdAt).toLocaleDateString()}</td>
        <td style="font-weight: 700;">$${o.totalAmount.toFixed(2)}</td>
        <td>
          <span class="order-status status-${o.status}">${o.status}</span>
        </td>
        <td>
          <select onchange="changeStatus('${o.id}', this.value)" style="padding: 0.3rem; border-radius: var(--radius); border: 1px solid var(--border);">
            <option value="">Update...</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    orderRows.innerHTML = `<tr><td colspan="6" style="color: var(--danger); text-align: center;">${err.message}</td></tr>`;
  }
}

async function changeStatus(orderId, status) {
  if (!status) return;
  try {
    await api.request(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    alert(`Order status updated to ${status}`);
    loadAdminOrders();
  } catch (err) {
    alert(`Failed to update status: ${err.message}`);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (checkAdminAccess()) {
    loadAdminProducts();
  }
});
