// State management
let currentPage = 1;
const limit = 6;
let searchKeyword = "";
let selectedCategory = "";

// DOM Elements
const productGrid = document.getElementById("product-grid");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const pageIndicator = document.getElementById("page-indicator");

/**
 * Fetch and render products with active filters
 */
async function loadProducts() {
  productGrid.innerHTML =
    '<p style="grid-column: 1/-1; text-align: center;">Loading products...</p>';

  try {
    let endpoint = `/products?page=${currentPage}&limit=${limit}`;
    if (searchKeyword.trim()) {
      endpoint += `&search=${encodeURIComponent(searchKeyword.trim())}`;
    }
    if (selectedCategory) {
      endpoint += `&category=${encodeURIComponent(selectedCategory)}`;
    }

    const response = await api.get(endpoint);
    const { data: products, meta } = response;

    renderProducts(products);
    updatePagination(meta);
  } catch (error) {
    productGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--danger);">Failed to load products: ${error.message}</p>`;
  }
}

/**
 * Render product cards into grid
 */
function renderProducts(products) {
  if (!products || products.length === 0) {
    productGrid.innerHTML =
      '<p style="grid-column: 1/-1; text-align: center;">No products found matching your criteria.</p>';
    return;
  }

  productGrid.innerHTML = products
    .map(
      (product) => `
    <article class="product-card">
      <img 
        src="${product.imageUrl || "https://via.placeholder.com/300x200?text=No+Image"}" 
        alt="${product.name}" 
        class="product-image"
      />
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3 class="product-title">
          <a href="product.html?id=${product.id}">${product.name}</a>
        </h3>
        <p class="product-desc">${product.description.substring(0, 85)}...</p>
        <div class="product-footer">
          <span class="product-price">$${product.price.toFixed(2)}</span>
          <a href="product.html?id=${product.id}" class="btn">View Details</a>
        </div>
      </div>
    </article>
  `,
    )
    .join("");
}

/**
 * Update pagination buttons and text
 */
function updatePagination(meta) {
  currentPage = meta.page;
  pageIndicator.textContent = `Page ${meta.page} of ${meta.totalPages || 1}`;
  prevBtn.disabled = !meta.hasPrevPage;
  nextBtn.disabled = !meta.hasNextPage;
}

// Event Listeners
prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    loadProducts();
  }
});

nextBtn.addEventListener("click", () => {
  currentPage++;
  loadProducts();
});

// Debounced search input
let searchTimeout;
searchInput.addEventListener("input", (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchKeyword = e.target.value;
    currentPage = 1; // Reset to first page on new search
    loadProducts();
  }, 400);
});

// Category dropdown change
categoryFilter.addEventListener("change", (e) => {
  selectedCategory = e.target.value;
  currentPage = 1;
  loadProducts();
});

// Initial load
document.addEventListener("DOMContentLoaded", loadProducts);
