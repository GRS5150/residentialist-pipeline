/**
 * Residentialist Dashboard — Source Explorer
 */

let sourceSortField = "pool";
let sourceSortDir = "asc";
let _sourceExplorerProductId = null;
let _selectedEvidenceIndices = new Set();

async function loadSourceExplorer(productId, container) {
  container.innerHTML = "<div class=\"loading-state\"><div class=\"spinner\"></div><span>Loading sources...</span></div>";
  _sourceExplorerProductId = productId;
  _selectedEvidenceIndices = new Set();
  _updateQuarantineFab();

  try {
    const isAdmin = AdminMode.isAdmin();
    const [data, quarantineData] = await Promise.all([
      fetchAPI(`product/${productId}/sources`),
      isAdmin ? fetchAPI(`products/${productId}/quarantine`).catch(() => null) : Promise.resolve(null)
    ]);
    renderSourceExplorer(data, container, productId, quarantineData);
  } catch (err) {
    container.innerHTML = `<div class="empty-state">Failed to load sources: ${err.message}</div>`;
  }
}

function buildEvidenceMap(quarantineData) {
  if (!quarantineData || !quarantineData.sources) return {};
  const map = {};
  quarantineData.sources.forEach((s, idx) => {
    const isActive = !s.quarantined || s.restored;
    map[s.name] = { evidenceIdx: idx, isActive };
  });
  return map;
}

function renderSourceExplorer(data, container, productId, quarantineData) {
  const poolDetails = data.pool_details || {};
  const isAdmin = AdminMode.isAdmin();
  const evidenceMap = isAdmin ? buildEvidenceMap(quarantineData) : {};

  // Flatten all sources, filtering out zero-weight placeholders
  let allSources = [];
  for (const [pool, poolData] of Object.entries(poolDetails)) {
    if (pool === "excluded") {
      for (const src of (poolData.sources || [])) {
        // Skip zero-weight excluded sources with no real data
        if ((src.final_weight || 0) === 0 && (src.contribution || 0) === 0) continue;
        allSources.push({ ...src, pool: "X" });
      }
    } else {
      for (const src of (poolData.sources || [])) {
        allSources.push(src);
      }
    }
  }

  // Summary stats
  const totalSources = allSources.length;
  const excluded = allSources.filter(s => s.pool === "X" || s.pool === "excluded").length;
  const poolBreakdown = {};
  allSources.forEach(s => {
    const p = s.pool === "X" ? "Excluded" : s.pool;
    poolBreakdown[p] = (poolBreakdown[p] || 0) + 1;
  });

  // Sort
  allSources = sortSources(allSources);

  // Reset anon counters for consistent numbering
  resetAnonCounters();

  const summaryHTML = `
    <div class="source-summary">
      <div class="source-stat">
        <div class="source-stat-value">${totalSources}</div>
        <div class="source-stat-label">Total Sources</div>
      </div>
      <div class="source-stat">
        <div class="source-stat-value" style="color:var(--score-red)">${excluded}</div>
        <div class="source-stat-label">Excluded</div>
      </div>
      ${Object.entries(poolBreakdown).filter(([k]) => k !== "Excluded").map(([pool, count]) => `
        <div class="source-stat">
          <div class="source-stat-value">${count}</div>
          <div class="source-stat-label">Pool ${pool}</div>
        </div>
      `).join("")}
    </div>`;

  const tableHTML = `
    <div class="source-table-wrap">
      <table class="source-table" id="source-table">
        <thead>
          <tr>
            ${isAdmin ? "<th class=\"source-select-col\">Select</th>" : ""}
            <th data-sort="pool" class="${sourceSortField === "pool" ? "sorted" : ""}">Pool</th>
            <th data-sort="name">Source</th>
            <th data-sort="sentiment" class="${sourceSortField === "sentiment" ? "sorted" : ""}">Sentiment</th>
            <th data-sort="weight" class="${sourceSortField === "weight" ? "sorted" : ""}">Weight</th>
            <th data-sort="contribution" class="${sourceSortField === "contribution" ? "sorted" : ""}">Contribution</th>
            ${isAdmin ? "<th>Bias</th>" : ""}
          </tr>
        </thead>
        <tbody>
          ${allSources.map(src => renderSourceRow(src, isAdmin, evidenceMap)).join("")}
        </tbody>
      </table>
    </div>`;

  container.innerHTML = `
    <div class="section" style="margin-top:var(--space-md)">
      <div class="section-header">
        <span class="section-title">Source Explorer</span>
        <span style="font-size:0.7rem;color:var(--text-muted)">${isAdmin ? "ADMIN VIEW" : "PUBLIC VIEW"}</span>
      </div>
      <div class="section-body">
        ${summaryHTML}
        ${tableHTML}
      </div>
    </div>`;

  // Bind sort headers
  container.querySelectorAll(".source-table th[data-sort]").forEach(th => {
    th.addEventListener("click", () => {
      const field = th.dataset.sort;
      if (sourceSortField === field) {
        sourceSortDir = sourceSortDir === "asc" ? "desc" : "asc";
      } else {
        sourceSortField = field;
        sourceSortDir = "asc";
      }
      renderSourceExplorer(data, container, productId, quarantineData);
    });
  });

  // Bind checkboxes in admin mode
  if (isAdmin) {
    container.querySelectorAll(".source-select-cb").forEach(cb => {
      cb.addEventListener("change", () => {
        const srcName = cb.dataset.sourceName;
        const srcUrl = cb.dataset.sourceUrl || '';
        if (cb.checked) {
          _selectedEvidenceIndices.add(JSON.stringify({name: srcName, url: srcUrl}));
        } else {
          _selectedEvidenceIndices.delete(JSON.stringify({name: srcName, url: srcUrl}));
        }
        _updateQuarantineFab();
      });
    });
  }

  // Re-render on admin mode change
  const handler = () => loadSourceExplorer(productId, container);
  document.removeEventListener("admin-mode-changed", handler);
  document.addEventListener("admin-mode-changed", handler);
}

function renderSourceRow(src, isAdmin, evidenceMap) {
  const pool = src.pool === "X" || src.pool === "excluded" ? "X" : src.pool;
  const poolClass = pool === "X" ? "pool-excluded" : `pool-${pool.toLowerCase()}`;

  const rawName = src.name || "—";
  const displayName = isAdmin ? rawName : anonymizeSource(rawName, pool);
  const sourceUrl = src.url || null;

  const sentiment = src.sentiment || "mixed";
  const weight = src.final_weight != null ? src.final_weight.toFixed(2) : "—";
  const contribution = src.contribution != null ? src.contribution.toFixed(3) : "—";
  const contColor = (src.contribution || 0) > 0 ? "var(--score-green)" : (src.contribution || 0) < 0 ? "var(--score-red)" : "var(--text-muted)";
  const contWidth = Math.min(60, Math.abs((src.contribution || 0)) * 120);

  // In admin mode, make source name a clickable link if URL is available
  const nameHTML = (isAdmin && sourceUrl)
    ? `<a href="${escHtml(sourceUrl)}" target="_blank" rel="noopener" class="source-link" title="${escHtml(rawName)}">${escHtml(displayName)}</a>`
    : `<span title="${escHtml(rawName)}">${escHtml(displayName)}</span>`;

  // Checkbox for admin: only on active (non-quarantined) sources that exist in evidence
  let checkboxCell = "";
  if (isAdmin) {
    const safeName = rawName.replace(/"/g, '&quot;');
    const safeUrl = sourceUrl ? sourceUrl.replace(/"/g, '&quot;') : '';
    checkboxCell = `<td class="source-select-col"><input type="checkbox" class="source-select-cb" data-source-name="${safeName}" data-source-url="${safeUrl}"></td>`;
  }

  return `
    <tr>
      ${checkboxCell}
      <td><span class="pool-badge ${poolClass}">${pool === "X" ? "✕" : pool}</span></td>
      <td class="source-name-cell">${nameHTML}</td>
      <td><span class="sentiment-badge ${sentiment}">${sentiment}</span></td>
      <td><span class="text-mono" style="font-size:0.75rem">${weight}</span></td>
      <td>
        <div class="contribution-bar">
          <div class="contribution-bar-fill" style="width:${contWidth}px;background:${contColor}"></div>
          <span class="contribution-bar-value" style="color:${contColor}">${contribution}</span>
        </div>
      </td>
      ${isAdmin ? `<td>${src.price_bias ? "<span class=\"price-bias-flag\">$ BIAS</span>" : ""}</td>` : ""}
    </tr>`;
}

function sortSources(sources) {
  const dir = sourceSortDir === "asc" ? 1 : -1;
  return [...sources].sort((a, b) => {
    switch (sourceSortField) {
      case "pool": {
        const order = { S: 0, A: 1, B: 2, C: 3, X: 4, excluded: 4 };
        return ((order[a.pool] || 5) - (order[b.pool] || 5)) * dir;
      }
      case "name":
        return (a.name || "").localeCompare(b.name || "") * dir;
      case "sentiment": {
        const order = { positive: 0, mixed: 1, negative: 2 };
        return ((order[a.sentiment] || 1) - (order[b.sentiment] || 1)) * dir;
      }
      case "weight":
        return ((a.final_weight || 0) - (b.final_weight || 0)) * dir;
      case "contribution":
        return ((a.contribution || 0) - (b.contribution || 0)) * dir;
      default:
        return 0;
    }
  });
}

function escHtml(str) {
  if (!str) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ── Quarantine FAB ───────────────────────────────────────────────────────

function _ensureQuarantineFab() {
  let fab = document.getElementById("source-quarantine-fab");
  if (!fab) {
    fab = document.createElement("div");
    fab.id = "source-quarantine-fab";
    fab.innerHTML = `<button id="source-quarantine-fab-btn"><span id="source-quarantine-fab-label">Quarantine 0 Selected Sources</span></button>`;
    fab.style.cssText = [
      "position:fixed",
      "bottom:32px",
      "left:50%",
      "transform:translateX(-50%) translateY(80px)",
      "z-index:9999",
      "transition:transform 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s",
      "opacity:0",
      "pointer-events:none"
    ].join(";");
    const btn = fab.querySelector("button");
    btn.style.cssText = [
      "background:var(--accent-blue, #B8722A)",
      "color:#fff",
      "border:none",
      "padding:12px 24px",
      "border-radius:12px",
      "box-shadow:0 4px 20px rgba(0,0,0,0.35)",
      "font-family:var(--font-label, Syne, sans-serif)",
      "font-size:0.875rem",
      "font-weight:600",
      "letter-spacing:0.02em",
      "cursor:pointer",
      "white-space:nowrap"
    ].join(";");
    btn.addEventListener("click", _handleManualQuarantine);
    document.body.appendChild(fab);
  }
  return fab;
}

function _updateQuarantineFab() {
  const count = _selectedEvidenceIndices.size;
  const fab = _ensureQuarantineFab();
  const label = document.getElementById("source-quarantine-fab-label");
  if (label) label.textContent = `Quarantine ${count} Selected Source${count !== 1 ? "s" : ""}`;
  if (count > 0) {
    fab.style.transform = "translateX(-50%) translateY(0)";
    fab.style.opacity = "1";
    fab.style.pointerEvents = "auto";
  } else {
    fab.style.transform = "translateX(-50%) translateY(80px)";
    fab.style.opacity = "0";
    fab.style.pointerEvents = "none";
  }
}

async function _handleManualQuarantine() {
  if (!_sourceExplorerProductId || _selectedEvidenceIndices.size === 0) return;
  const btn = document.getElementById("source-quarantine-fab-btn");
  if (btn) { btn.disabled = true; btn.style.opacity = "0.6"; btn.textContent = "Quarantining..."; }

  try {
    const resp = await fetch(`${getBasePath()}api/products/${_sourceExplorerProductId}/quarantine/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source_entries: Array.from(_selectedEvidenceIndices).map(s => { try { return JSON.parse(s); } catch(e) { return {name: s, url: ''}; } }) })
    });
    const result = await resp.json();
    if (result.success && result.quarantined_count > 0) {
      // Clear selection and reload
      _selectedEvidenceIndices = new Set();
      _updateQuarantineFab();
      const container = document.getElementById("source-explorer-container");
      if (container) {
        await loadSourceExplorer(_sourceExplorerProductId, container);
      }
    } else if (result.success && result.quarantined_count === 0) {
      alert("Those sources were already quarantined or could not be matched. Try refreshing the page.");
      _selectedEvidenceIndices = new Set();
      _updateQuarantineFab();
    } else {
      alert("Quarantine failed: " + (result.error || "Unknown error"));
    }
  } catch (e) {
    console.error("[QUARANTINE] Error:", e);
    alert("Network error — could not quarantine sources.");
  } finally {
    // ALWAYS re-enable button
    if (btn) { btn.disabled = false; btn.style.opacity = "1"; }
  }
}
