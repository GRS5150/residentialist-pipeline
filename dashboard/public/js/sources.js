/**
 * Residentialist Dashboard — Source Explorer
 */

let sourceSortField = 'pool';
let sourceSortDir = 'asc';

async function loadSourceExplorer(productId, container) {
  container.innerHTML = '<div class="loading-state"><div class="spinner"></div><span>Loading sources...</span></div>';
  
  try {
    const data = await fetchAPI(`product/${productId}/sources`);
    renderSourceExplorer(data, container);
  } catch (err) {
    container.innerHTML = `<div class="empty-state">Failed to load sources: ${err.message}</div>`;
  }
}

function renderSourceExplorer(data, container) {
  const poolDetails = data.pool_details || {};
  const isAdmin = AdminMode.isAdmin();
  
  // Flatten all sources
  let allSources = [];
  for (const [pool, poolData] of Object.entries(poolDetails)) {
    if (pool === 'excluded') {
      for (const src of (poolData.sources || [])) {
        allSources.push({ ...src, pool: 'X' });
      }
    } else {
      for (const src of (poolData.sources || [])) {
        allSources.push(src);
      }
    }
  }

  // Summary stats
  const totalSources = allSources.length;
  const excluded = allSources.filter(s => s.pool === 'X' || s.pool === 'excluded').length;
  const poolBreakdown = {};
  allSources.forEach(s => {
    const p = s.pool === 'X' ? 'Excluded' : s.pool;
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
      ${Object.entries(poolBreakdown).filter(([k]) => k !== 'Excluded').map(([pool, count]) => `
        <div class="source-stat">
          <div class="source-stat-value">${count}</div>
          <div class="source-stat-label">Pool ${pool}</div>
        </div>
      `).join('')}
    </div>`;

  const tableHTML = `
    <div class="source-table-wrap">
      <table class="source-table" id="source-table">
        <thead>
          <tr>
            <th data-sort="pool" class="${sourceSortField === 'pool' ? 'sorted' : ''}">Pool</th>
            <th data-sort="name">Source</th>
            <th data-sort="sentiment" class="${sourceSortField === 'sentiment' ? 'sorted' : ''}">Sentiment</th>
            <th data-sort="weight" class="${sourceSortField === 'weight' ? 'sorted' : ''}">Weight</th>
            <th data-sort="contribution" class="${sourceSortField === 'contribution' ? 'sorted' : ''}">Contribution</th>
            ${isAdmin ? '<th>Bias</th>' : ''}
          </tr>
        </thead>
        <tbody>
          ${allSources.map(src => renderSourceRow(src, isAdmin)).join('')}
        </tbody>
      </table>
    </div>`;

  container.innerHTML = `
    <div class="section" style="margin-top:var(--space-md)">
      <div class="section-header">
        <span class="section-title">Source Explorer</span>
        <span style="font-size:0.7rem;color:var(--text-muted)">${isAdmin ? 'ADMIN VIEW' : 'PUBLIC VIEW'}</span>
      </div>
      <div class="section-body">
        ${summaryHTML}
        ${tableHTML}
      </div>
    </div>`;

  // Bind sort headers
  container.querySelectorAll('.source-table th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const field = th.dataset.sort;
      if (sourceSortField === field) {
        sourceSortDir = sourceSortDir === 'asc' ? 'desc' : 'asc';
      } else {
        sourceSortField = field;
        sourceSortDir = 'asc';
      }
      renderSourceExplorer(data, container);
    });
  });

  // Re-render on admin mode change
  const handler = () => renderSourceExplorer(data, container);
  document.removeEventListener('admin-mode-changed', handler);
  document.addEventListener('admin-mode-changed', handler);
}

function renderSourceRow(src, isAdmin) {
  const pool = src.pool === 'X' || src.pool === 'excluded' ? 'X' : src.pool;
  const poolClass = pool === 'X' ? 'pool-excluded' : `pool-${pool.toLowerCase()}`;
  
  const name = isAdmin
    ? src.name || '—'
    : anonymizeSource(src.name || 'Unknown Source', pool);

  const sentiment = src.sentiment || 'mixed';
  const weight = src.final_weight != null ? src.final_weight.toFixed(2) : '—';
  const contribution = src.contribution != null ? src.contribution.toFixed(3) : '—';
  const contColor = (src.contribution || 0) > 0 ? 'var(--score-green)' : (src.contribution || 0) < 0 ? 'var(--score-red)' : 'var(--text-muted)';
  const contWidth = Math.min(60, Math.abs((src.contribution || 0)) * 120);

  return `
    <tr>
      <td><span class="pool-badge ${poolClass}">${pool === 'X' ? '✕' : pool}</span></td>
      <td class="source-name-cell" title="${escHtml(src.name || '')}">${escHtml(name)}</td>
      <td><span class="sentiment-badge ${sentiment}">${sentiment}</span></td>
      <td><span class="text-mono" style="font-size:0.75rem">${weight}</span></td>
      <td>
        <div class="contribution-bar">
          <div class="contribution-bar-fill" style="width:${contWidth}px;background:${contColor}"></div>
          <span class="contribution-bar-value" style="color:${contColor}">${contribution}</span>
        </div>
      </td>
      ${isAdmin ? `<td>${src.price_bias ? '<span class="price-bias-flag">$ BIAS</span>' : ''}</td>` : ''}
    </tr>`;
}

function sortSources(sources) {
  const dir = sourceSortDir === 'asc' ? 1 : -1;
  return [...sources].sort((a, b) => {
    switch (sourceSortField) {
      case 'pool': {
        const order = { S: 0, A: 1, B: 2, C: 3, X: 4, excluded: 4 };
        return ((order[a.pool] || 5) - (order[b.pool] || 5)) * dir;
      }
      case 'name':
        return (a.name || '').localeCompare(b.name || '') * dir;
      case 'sentiment': {
        const order = { positive: 0, mixed: 1, negative: 2 };
        return ((order[a.sentiment] || 1) - (order[b.sentiment] || 1)) * dir;
      }
      case 'weight':
        return ((a.final_weight || 0) - (b.final_weight || 0)) * dir;
      case 'contribution':
        return ((a.contribution || 0) - (b.contribution || 0)) * dir;
      default:
        return 0;
    }
  });
}

function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
