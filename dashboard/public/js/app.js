/**
 * Residentialist Dashboard — Landing Page (Category Grid)
 */

(function() {
  let allProducts = [];
  let currentSort = 'score';
  let searchQuery = '';

  // ── Initialize ──────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', async () => {
    initHeader();
    updateTimestamp();
    bindControls();
    await loadProducts();
  });

  function updateTimestamp() {
    const el = document.getElementById('header-timestamp');
    if (el) {
      const now = new Date();
      el.textContent = now.toLocaleDateString('en-US', { 
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    }
  }

  // ── Load Products ───────────────────────────────────────────────────────
  async function loadProducts() {
    try {
      allProducts = await fetchAPI('products');
      render();
    } catch (err) {
      document.getElementById('product-container').innerHTML =
        `<div class="empty-state">Failed to load products. Is the server running?</div>`;
      console.error(err);
    }
  }

  // ── Controls ────────────────────────────────────────────────────────────
  function bindControls() {
    // Sort buttons
    document.querySelectorAll('.sort-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentSort = btn.dataset.sort;
        render();
      });
    });

    // Search
    const searchEl = document.getElementById('search-input');
    searchEl.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase();
      render();
    });
  }

  // ── Sort & Filter ──────────────────────────────────────────────────────
  function getFilteredProducts() {
    let filtered = allProducts;
    
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.product_name.toLowerCase().includes(searchQuery) ||
        (p.material_class || '').toLowerCase().includes(searchQuery) ||
        (p.category || '').toLowerCase().includes(searchQuery)
      );
    }

    switch (currentSort) {
      case 'score':
        filtered = [...filtered].sort((a, b) => b.overall_score - a.overall_score);
        break;
      case 'name':
        filtered = [...filtered].sort((a, b) => a.product_name.localeCompare(b.product_name));
        break;
      case 'material':
        filtered = [...filtered].sort((a, b) => (a.material_class || '').localeCompare(b.material_class || ''));
        break;
    }

    return filtered;
  }

  // ── Render ─────────────────────────────────────────────────────────────
  function render() {
    const container = document.getElementById('product-container');
    const filtered = getFilteredProducts();
    
    // Update count
    document.getElementById('product-count').textContent = `${filtered.length} products`;

    if (filtered.length === 0) {
      container.innerHTML = `<div class="empty-state">No products match your search.</div>`;
      return;
    }

    // Group by category (or show flat if sorted by something other than default)
    if (currentSort === 'material') {
      const groups = groupBy(filtered, 'material_class');
      container.innerHTML = Object.entries(groups).map(([cat, products]) =>
        renderCategoryGroup(cat || 'Unknown', products)
      ).join('');
    } else if (currentSort === 'name') {
      container.innerHTML = `<div class="product-grid">${filtered.map(renderProductCard).join('')}</div>`;
    } else {
      // Default: group by category
      const groups = groupBy(filtered, 'category');
      container.innerHTML = Object.entries(groups).map(([cat, products]) =>
        renderCategoryGroup(cat || 'Uncategorized', products)
      ).join('');
    }
  }

  function groupBy(arr, key) {
    return arr.reduce((groups, item) => {
      const val = item[key] || 'Other';
      (groups[val] = groups[val] || []).push(item);
      return groups;
    }, {});
  }

  function renderCategoryGroup(label, products) {
    return `
      <div class="category-group">
        <div class="category-label">${escapeHtml(label)} <span class="text-muted">(${products.length})</span></div>
        <div class="product-grid">
          ${products.map(renderProductCard).join('')}
        </div>
      </div>`;
  }

  function renderProductCard(product) {
    const score = product.overall_score;
    const color = scoreColor(score);
    const grade = product.grade || getGrade(score);
    const outlook = product.outlook || getOutlook(score);

    return `
      <a href="${getBasePath()}product/${product.id}" class="product-card">
        <div class="card-info">
          <div class="card-name">${escapeHtml(product.product_name)}</div>
          <div class="card-meta">
            <span class="material-badge">${escapeHtml(product.material_class || '—')}</span>
            ${createOutlookBadge(outlook)}
          </div>
          ${createSparkBars(product.quality_score, product.durability_score, product.performance_score)}
        </div>
        <div class="card-score-area">
          ${createScoreCircleSVG(score, 'sm')}
          ${createGradeBadge(score)}
        </div>
      </a>`;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
})();
