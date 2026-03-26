/**
 * THE RESIDENTIALIST — Manufacturer View JS
 */

const API_BASE = location.pathname.startsWith('/scores') ? '/scores' : '';

async function loadManufacturers() {
  try {
    // List manufacturer JSON files via curation API (get unique manufacturers)
    const res = await fetch(`${API_BASE}/api/curation`);
    const products = await res.json();
    const mfgs = [...new Set(products.map(p => p.manufacturer_slug).filter(Boolean))].sort();

    const container = document.getElementById('manufacturerList');
    if (!mfgs.length) return;

    container.innerHTML = mfgs.map(slug => `
      <div class="product-row" onclick="loadManufacturer('${slug}')">
        <span class="name">${slug.replace(/_/g, ' ').replace(/\\b\\w/g, c => c.toUpperCase())}</span>
        <span class="meta">${products.filter(p => p.manufacturer_slug === slug).length} products</span>
        <button class="btn btn-sm btn-ghost" onclick="event.stopPropagation(); loadManufacturer('${slug}')">View</button>
      </div>
    `).join('');
  } catch (err) {
    console.error('Failed to load manufacturers:', err);
  }
}

async function loadManufacturer(slug) {
  try {
    const res = await fetch(`${API_BASE}/api/manufacturer/${slug}`);
    if (!res.ok) {
      document.getElementById('detailSection').style.display = '';
      document.getElementById('mfgName').textContent = slug.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      document.getElementById('mfgMeta').textContent = 'No manufacturer file found';
      document.getElementById('mfgReport').textContent = 'Run a deep dive to generate manufacturer data.';
      return;
    }

    const data = await res.json();
    document.getElementById('detailSection').style.display = '';
    document.getElementById('mfgName').textContent = data.manufacturer_name || slug;
    document.getElementById('mfgMeta').textContent = `Last updated: ${data.last_updated || 'Unknown'} · Search type: ${data.search_type || 'N/A'}`;
    document.getElementById('mfgReport').textContent = data.raw_report || 'No report data available.';
  } catch (err) {
    console.error('Failed to load manufacturer:', err);
  }
}

loadManufacturers();
