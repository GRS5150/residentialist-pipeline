/**
 * Residentialist Dashboard — Product Detail Page
 */

(function() {
  let productData = null;
  let expandedNodes = {};
  let expandedSubScores = {};

  // ── Initialize ──────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', async () => {
    initHeader();
    const id = getProductIdFromURL();
    if (!id) {
      document.getElementById('product-detail-root').innerHTML =
        '<div class="empty-state">No product ID specified.</div>';
      return;
    }
    await loadProduct(id);
    
    // Re-render on admin mode change
    document.addEventListener('admin-mode-changed', () => {
      if (productData) renderAll();
    });
  });

  // ── Load Product ────────────────────────────────────────────────────────
  async function loadProduct(id) {
    try {
      productData = await fetchAPI(`product/${id}`);
      renderAll();
    } catch (err) {
      document.getElementById('product-detail-root').innerHTML =
        `<div class="empty-state">Failed to load product. ${err.message}</div>`;
    }
  }

  // ── Render All ──────────────────────────────────────────────────────────
  function renderAll() {
    const root = document.getElementById('product-detail-root');
    const { product, deterministic_scores: ds, bot2_findings, bot3_material_safety, score_history, pipeline_status } = productData;
    const scores = ds.scores || {};
    
    // Update page title
    document.title = `${product.product_name} — Residentialist`;

    root.innerHTML = `
      ${renderBreadcrumb(product)}
      ${renderProductHeader(product, ds)}
      <div class="detail-layout">
        <div class="detail-main">
          ${renderScoreTree(ds, scores)}
          ${renderSourceExplorerContainer()}
        </div>
        <div class="detail-sidebar">
          ${renderMaterialSafety(bot3_material_safety, ds)}
          ${renderFindings(bot2_findings)}
          ${renderLifespan(bot2_findings)}
          ${renderDataConfidence(score_history)}
          ${renderScoreHistory(score_history, product)}
        </div>
      </div>
      ${renderQuarantineReviewSection()}
      ${renderReportPreviewSection()}`;

    // Bind interactions
    bindTreeInteractions();
    bindSubScoreInteractions();

    // Load async sections
    loadQuarantineReviewSection(product.id);
    loadReportPreviewSection(product.id);
  }

  // ── Breadcrumb ──────────────────────────────────────────────────────────
  function renderBreadcrumb(product) {
    return `<nav class="breadcrumb">
      <a href="${getBasePath()}">Dashboard</a>
      <span class="sep">›</span>
      <span>${esc(product.product_name)}</span>
    </nav>`;
  }

  // ── Product Header ──────────────────────────────────────────────────────
  function renderProductHeader(product, ds) {
    const score = ds.overall || product.overall_score;
    const grade = ds.grade || getGrade(score);
    const outlook = ds.outlook || getOutlook(score);
    const outlookDetail = ds.outlook_detail || '';

    return `
      <div class="product-header">
        <div>
          <h1 class="product-title">${esc(product.product_name)}</h1>
          <div class="product-subtitle">
            <span class="material-badge">${esc(ds.material_class || product.material_class || '—')}</span>
            <span class="material-badge">${esc(product.config || product.category || '—')}</span>
            ${createOutlookBadge(outlook)}
            ${createGradeBadge(score, 'header-grade')}
          </div>
          ${outlookDetail ? `<p class="outlook-text">${esc(outlookDetail)}</p>` : ''}
        </div>
        <div class="header-score">
          ${createScoreCircleSVG(score, 'lg')}
          <span class="text-muted" style="font-size:0.7rem;font-family:var(--font-mono)">OVERALL</span>
        </div>
      </div>`;
  }

  // ── Score Tree ──────────────────────────────────────────────────────────
  function renderScoreTree(ds, scores) {
    const overall = ds.overall;

    return `
      <div class="section">
        <div class="section-header">
          <span class="section-title">Score Breakdown</span>
          <div class="tree-weight-labels">
            <span class="weight-label">Q 35%</span>
            <span class="weight-label">D 35%</span>
            <span class="weight-label">P 30%</span>
          </div>
        </div>
        <div class="section-body">
          <div class="score-tree">
            <div class="tree-overall">
              <span class="tree-overall-label">Overall</span>
              <span class="tree-overall-score" style="color:${scoreCSSColor(overall)}">${formatScore(overall)}</span>
              ${createGradeBadge(overall)}
            </div>
            <div class="tree-branches">
              ${renderBranch('quality', 'Quality', '35%', scores.quality, ds)}
              ${renderBranch('durability', 'Durability', '35%', scores.durability, ds)}
              ${renderBranch('performance', 'Performance', '30%', scores.performance, ds)}
            </div>
          </div>
        </div>
      </div>`;
  }

  function renderBranch(key, label, weight, axisData, ds) {
    if (!axisData) return '';
    const axisScore = axisData.axis_score;
    const expanded = expandedNodes[key];
    let subScoresHTML = '';

    if (key === 'quality') {
      subScoresHTML = renderQualitySubScores(axisData, ds);
    } else if (key === 'durability') {
      subScoresHTML = renderDurabilitySubScores(axisData);
    } else if (key === 'performance') {
      subScoresHTML = renderPerformanceSubScores(axisData);
    }

    // Show Sonnet reasoning and key sources when available
    const reasoning = axisData.reasoning || '';
    const keySources = axisData.key_sources || '';
    const reasoningHTML = reasoning ? `
      <div class="sonnet-reasoning" style="margin-top:8px;padding:8px 10px;background:var(--bg-elevated,#1a1a2e);border-radius:6px;border-left:3px solid var(--accent-blue,#4a9eff);">
        <div style="font-size:0.7rem;color:var(--text-muted);margin-bottom:4px;font-weight:600;">Sonnet Analysis</div>
        <div style="font-size:0.75rem;color:var(--text-secondary);line-height:1.5;white-space:pre-line;">${esc(reasoning)}</div>
        ${keySources ? `<div style="margin-top:6px;font-size:0.68rem;color:var(--text-muted);">Key sources: ${esc(keySources)}</div>` : ''}
      </div>` : '';

    return `
      <div class="tree-branch">
        <div class="tree-node ${expanded ? 'expanded' : ''}" data-branch="${key}">
          <div class="node-header">
            <span class="node-label">${label}</span>
            <span class="node-weight">${weight}</span>
          </div>
          <div class="node-score" style="color:${scoreCSSColor(axisScore)}">${formatScore(axisScore)}</div>
          <span class="node-expand-icon">${ICONS.chevronDown}</span>
          <div class="sub-scores">
            <div class="sub-score-list">
              ${subScoresHTML}
              ${reasoningHTML}
            </div>
          </div>
        </div>
      </div>`;
  }

  // ── Quality Sub-Scores ──────────────────────────────────────────────────
  function renderQualitySubScores(qData, ds) {
    const cq = qData.component_quality || {};
    const mq = qData.manufacturing_quality || {};
    const pc = qData.professional_consensus || {};
    const cqScore = cq.score || (ds.component_quality && ds.component_quality.score) || 0;
    const mqScore = mq.score || (ds.manufacturing_quality && ds.manufacturing_quality.score) || 0;
    const pcScore = pc.score || (ds.professional_consensus && ds.professional_consensus.score) || 0;

    // Component quality detail
    const components = (ds.component_quality && ds.component_quality.components) || {};
    const compTable = Object.entries(components).map(([name, data]) => `
      <tr>
        <td>${esc(name.replace(/_/g, ' '))}</td>
        <td>${esc(String(data.value || '—').replace(/_/g, ' '))}</td>
        <td><span class="disclosed-badge ${data.source === 'disclosed' ? 'yes' : 'no'}">${data.source === 'disclosed' ? 'Disclosed' : 'Class Prior'}</span></td>
        <td style="color:${scoreCSSColor(data.score)}">${formatScore(data.score)}</td>
      </tr>`).join('');

    // Manufacturing detail
    const mfg = ds.manufacturing_quality || {};
    const mfgDetail = `
      <div class="reasoning-text">
        <strong>Model:</strong> ${esc(String(mfg.business_model || '—').replace(/_/g, ' '))}<br>
        <strong>Certifications:</strong> ${(mfg.certifications || []).join(', ') || '—'}<br>
        <strong>Complaints:</strong> ${mfg.complaint_pattern ? mfg.complaint_pattern.tier_label : '—'}
        ${mfg.complaint_pattern && mfg.complaint_pattern.deduction ? ` (${mfg.complaint_pattern.deduction > 0 ? '+' : ''}${mfg.complaint_pattern.deduction})` : ''}
      </div>`;

    // Professional consensus detail
    const poolCounts = (ds.professional_consensus && ds.professional_consensus.pool_counts) || {};
    const poolHTML = Object.entries(poolCounts).map(([pool, count]) => 
      `<span class="pool-chip"><span class="pool-letter">${pool}</span>${count}</span>`
    ).join('');

    return `
      ${renderSubScoreItem('cq', 'Component Quality', cqScore, ds.component_quality && ds.component_quality.quality_tier ? `Tier: ${ds.component_quality.quality_tier}` : '', `
        <table class="classification-table">
          <thead><tr><th>Component</th><th>Value</th><th>Source</th><th>Score</th></tr></thead>
          <tbody>${compTable}</tbody>
        </table>
      `)}
      ${renderSubScoreItem('mq', 'Manufacturing Quality', mqScore, '', mfgDetail)}
      ${renderSubScoreItem('pc', 'Professional Consensus', pcScore, '', `
        <div class="pool-summary">${poolHTML}</div>
        ${renderQuarantinePanel(ds)}
        <button class="sort-btn mt-sm" onclick="toggleSourceExplorer()" style="width:100%;text-align:center;margin-top:8px">
          View All Sources →
        </button>
      `)}`;
  }

  // ── Durability Sub-Scores ───────────────────────────────────────────────
  function renderDurabilitySubScores(dData) {
    const fl = dData.frame_longevity || {};
    const md = dData.materials_durability || {};
    const rp = dData.repairability || {};

    const rpClassData = rp.classification_data || {};
    const rpDetail = Object.entries(rpClassData).map(([k, v]) =>
      `<tr><td>${esc(k.replace(/_/g, ' '))}</td><td style="color:${v === true || v === 'good' ? 'var(--score-green)' : v === false || v === 'none' ? 'var(--score-red)' : 'var(--text-secondary)'}">${String(v)}</td></tr>`
    ).join('');

    return `
      ${renderSubScoreItem('fl', 'Frame Longevity', fl.score || 0, '', `<div class="reasoning-text">${esc(fl.reasoning || '')}</div>`)}
      ${renderSubScoreItem('md', 'Materials Durability', md.score || 0, md.adjustments ? `Base: ${md.base}, ${md.adjustments}` : '', `<div class="reasoning-text">${esc(md.reasoning || '')}</div>`)}
      ${renderSubScoreItem('rp', 'Repairability', rp.score || 0, '', `
        <div class="reasoning-text">${esc(rp.reasoning || '')}</div>
        ${rpDetail ? `<table class="classification-table"><thead><tr><th>Factor</th><th>Value</th></tr></thead><tbody>${rpDetail}</tbody></table>` : ''}
      `)}`;
  }

  // ── Performance Sub-Scores ──────────────────────────────────────────────
  function renderPerformanceSubScores(pData) {
    const th = pData.thermal || {};
    const st = pData.structural || {};
    const aw = pData.air_water || {};

    return `
      ${renderSubScoreItem('th', 'Thermal', th.score || 0, '', `<div class="reasoning-text">${esc(th.reasoning || '')}</div>`)}
      ${renderSubScoreItem('st', 'Structural', st.score || 0, '', `<div class="reasoning-text">${esc(st.reasoning || '')}</div>`)}
      ${renderSubScoreItem('aw', 'Air & Water', aw.score || 0, '', `<div class="reasoning-text">${esc(aw.reasoning || '')}</div>`)}`;
  }

  // ── Generic Sub-Score Item ──────────────────────────────────────────────
  function renderSubScoreItem(id, label, score, hint, detailHTML) {
    const isExpanded = expandedSubScores[id];
    return `
      <div>
        <div class="sub-score-item ${isExpanded ? 'expanded' : ''}" data-sub="${id}">
          <div>
            <div class="sub-score-name">${label}</div>
            ${hint ? `<div class="reasoning-text" style="margin:0;font-size:0.7rem">${esc(hint)}</div>` : ''}
          </div>
          <span class="sub-score-value" style="color:${scoreCSSColor(score)}">${formatScore(score)}</span>
        </div>
        <div class="sub-score-detail ${isExpanded ? 'visible' : ''}" data-sub-detail="${id}">
          <div class="sub-score-detail-inner">
            ${detailHTML}
          </div>
        </div>
      </div>`;
  }

  // ── Source Explorer Container ───────────────────────────────────────────
  function renderSourceExplorerContainer() {
    return `<div id="source-explorer-container" class="source-explorer"></div>`;
  }

  // ── Material Safety ─────────────────────────────────────────────────────
  function renderMaterialSafety(bot3, ds) {
    if (!bot3) return '';
    const score = bot3.material_safety_score || ds.material_safety || 0;
    const grade = bot3.grade || getGrade(score);
    const tier = bot3.tier || '—';
    const certs = bot3.certifications_found || [];
    const flags = bot3.flags || [];
    const buyerNote = bot3.buyer_note || '';

    return `
      <div class="sidebar-panel">
        <div class="section-header">
          <span class="section-title">${ICONS.shield} Material Safety</span>
        </div>
        <div class="section-body">
          <div class="safety-header">
            <span class="safety-score" style="color:${scoreCSSColor(score)}">${formatScore(score)}</span>
            <div class="safety-meta">
              ${createGradeBadge(score)}
              <span class="tier-badge">${esc(tier)}</span>
            </div>
          </div>
          ${flags.length > 0 ? `<div class="mb-sm">${flags.map(f => {
              const text = typeof f === 'string' ? f : (f.flag || f.text || JSON.stringify(f));
              const sev = typeof f === 'object' && f.severity ? f.severity : '';
              return `<div class="flag-item ${sev.toLowerCase()}"><span>${ICONS.alertTriangle}</span> <span>${esc(text)}</span>${sev ? `<span class="flag-severity ${sev.toLowerCase()}">${sev}</span>` : ''}</div>`;
            }).join('')}</div>` : ''}
          ${certs.length > 0 ? `<div class="cert-list">${certs.map(c => `<span class="cert-tag">${esc(c)}</span>`).join('')}</div>` : ''}
          ${buyerNote ? `<div class="buyer-note">${esc(buyerNote)}</div>` : ''}
        </div>
      </div>`;
  }

  // ── Findings ────────────────────────────────────────────────────────────
  function renderFindings(bot2) {
    if (!bot2 || !bot2.findings) return '';
    const { red = [], yellow = [] } = bot2.findings;
    const hasFindings = red.length > 0 || yellow.length > 0;

    return `
      <div class="sidebar-panel">
        <div class="section-header">
          <span class="section-title">${ICONS.flag} Findings</span>
          ${hasFindings ? `<span style="font-size:0.7rem;color:var(--text-muted)">${red.length}R / ${yellow.length}Y</span>` : ''}
        </div>
        <div class="section-body">
          ${!hasFindings ? '<div class="no-findings">No findings flagged</div>' : ''}
          ${red.map(f => renderFinding(f, 'red')).join('')}
          ${yellow.map(f => renderFinding(f, 'yellow')).join('')}
        </div>
      </div>`;
  }

  function renderFinding(finding, type) {
    const icon = type === 'red' ? ICONS.alertCircle : ICONS.alertTriangle;
    return `
      <div class="finding-item ${type}-flag">
        <span class="finding-icon">${icon}</span>
        <div>
          <div class="finding-text">${esc(finding.finding)}</div>
          <div class="finding-source">
            ${esc(finding.source)}
            <span class="finding-category ${(finding.category || '').toLowerCase()}">${esc(finding.category || '')}</span>
          </div>
        </div>
      </div>`;
  }

  // ── Expected Lifespan ───────────────────────────────────────────────────
  function renderLifespan(bot2) {
    if (!bot2 || !bot2.expected_lifespan) return '';
    const ls = bot2.expected_lifespan;
    return `
      <div class="sidebar-panel">
        <div class="section-header">
          <span class="section-title">Expected Lifespan</span>
        </div>
        <div class="section-body">
          <div class="lifespan-row">
            <div class="lifespan-item">
              <div class="lifespan-label">Adverse</div>
              <div class="lifespan-value">${esc(ls.adverse || '—')}</div>
            </div>
            <div class="lifespan-item">
              <div class="lifespan-label">Median</div>
              <div class="lifespan-value">${esc(ls.median || '—')}</div>
            </div>
            <div class="lifespan-item">
              <div class="lifespan-label">Best</div>
              <div class="lifespan-value">${esc(ls.best || '—')}</div>
            </div>
          </div>
        </div>
      </div>`;
  }

  // ── Data Confidence ─────────────────────────────────────────────────────
  function renderDataConfidence(history) {
    if (!history || history.length === 0) return '';
    const latest = history[0];
    const conf = latest.confidence || 'UNKNOWN';
    const undisclosed = latest.undisclosed_count || 0;
    const confClass = conf === 'HIGH' ? 'high' : conf === 'MEDIUM' ? 'medium' : 'low';

    return `
      <div class="sidebar-panel">
        <div class="section-header">
          <span class="section-title">Data Confidence</span>
        </div>
        <div class="section-body">
          <div class="confidence-row">
            <span class="confidence-label">Confidence Level</span>
            <span class="confidence-value ${confClass}">${conf}</span>
          </div>
          <div class="confidence-row">
            <span class="confidence-label">Undisclosed Components</span>
            <span class="confidence-value ${undisclosed > 3 ? 'low' : undisclosed > 1 ? 'medium' : 'high'}">${undisclosed}</span>
          </div>
          <div class="confidence-row">
            <span class="confidence-label">Score Runs</span>
            <span class="confidence-value">${history.length}</span>
          </div>
        </div>
      </div>`;
  }

  // ── Score History ───────────────────────────────────────────────────────
  function renderScoreHistory(history, product) {
    if (!history || history.length === 0) return '';

    // Build SVG chart
    const w = 280, h = 100;
    const pad = { top: 10, right: 10, bottom: 25, left: 35 };
    const chartW = w - pad.left - pad.right;
    const chartH = h - pad.top - pad.bottom;
    
    const reversed = [...history].reverse();
    const minScore = Math.min(...reversed.map(s => s.overall_score)) - 0.5;
    const maxScore = Math.max(...reversed.map(s => s.overall_score)) + 0.5;
    const range = maxScore - minScore || 1;

    const points = reversed.map((s, i) => {
      const x = pad.left + (reversed.length > 1 ? (i / (reversed.length - 1)) * chartW : chartW / 2);
      const y = pad.top + chartH - ((s.overall_score - minScore) / range) * chartH;
      return { x, y, score: s.overall_score, date: s.scored_at };
    });

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    
    const gridLines = [minScore, (minScore + maxScore) / 2, maxScore].map(v => {
      const y = pad.top + chartH - ((v - minScore) / range) * chartH;
      return `<line class="grid-line" x1="${pad.left}" y1="${y}" x2="${w - pad.right}" y2="${y}"/>
              <text x="${pad.left - 4}" y="${y + 3}" text-anchor="end">${v.toFixed(1)}</text>`;
    }).join('');

    const dots = points.map(p => 
      `<circle class="data-dot" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4"/>`
    ).join('');

    const dateLabels = points.filter((_, i) => i === 0 || i === points.length - 1).map(p =>
      `<text x="${p.x}" y="${h - 4}" text-anchor="middle">${formatDate(p.date).replace(/, \d{4}/, '')}</text>`
    ).join('');

    // Table
    const tableRows = history.map(s => `
      <tr>
        <td style="color:var(--text-secondary)">${formatDate(s.scored_at)}</td>
        <td style="color:${scoreCSSColor(s.overall_score)}">${formatScore(s.overall_score)}</td>
        <td>${formatScore(s.quality_score)}</td>
        <td>${formatScore(s.durability_score)}</td>
        <td>${formatScore(s.performance_score)}</td>
      </tr>`).join('');

    return `
      <div class="sidebar-panel">
        <div class="section-header">
          <span class="section-title">Score History</span>
        </div>
        <div class="section-body">
          <svg class="history-svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet">
            ${gridLines}
            <path class="data-line" d="${linePath}"/>
            ${dots}
            ${dateLabels}
          </svg>
          <table class="history-mini-table">
            <thead><tr><th>Date</th><th>Overall</th><th>Q</th><th>D</th><th>P</th></tr></thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>
      </div>`;
  }

  // ── Tree Interactions ───────────────────────────────────────────────────
  function bindTreeInteractions() {
    document.querySelectorAll('.tree-node[data-branch]').forEach(node => {
      node.addEventListener('click', (e) => {
        // Don't toggle if clicking a button inside
        if (e.target.closest('button')) return;
        if (e.target.closest('.sub-score-item')) return;
        const key = node.dataset.branch;
        expandedNodes[key] = !expandedNodes[key];
        node.classList.toggle('expanded');
      });
    });
  }

  function bindSubScoreInteractions() {
    document.querySelectorAll('.sub-score-item[data-sub]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = item.dataset.sub;
        expandedSubScores[id] = !expandedSubScores[id];
        item.classList.toggle('expanded');
        const detail = document.querySelector(`[data-sub-detail="${id}"]`);
        if (detail) detail.classList.toggle('visible');
      });
    });
  }

  // ── Quarantine Panel ───────────────────────────────────────────────────
  function renderQuarantinePanel(ds) {
    const pc = ds.professional_consensus || {};
    const qCount = pc.quarantined_count || 0;
    if (qCount === 0 || !AdminMode.isAdmin()) return '';

    const reasons = pc.quarantine_reasons || {};
    const reasonChips = Object.entries(reasons).map(([r, c]) => 
      `<span class="quarantine-reason-chip">${esc(r.replace(/_/g, ' '))} (${c})</span>`
    ).join('');

    return `
      <div class="quarantine-panel" data-quarantine-panel>
        <button class="quarantine-toggle" onclick="event.stopPropagation(); toggleQuarantinePanel()">
          <span class="quarantine-icon">&#x1f512;</span>
          <span class="quarantine-count">${qCount} source${qCount !== 1 ? 's' : ''} quarantined</span>
          <span class="quarantine-reasons">${reasonChips}</span>
          <span class="quarantine-chevron">${ICONS.chevronDown}</span>
        </button>
        <div class="quarantine-list" id="quarantine-list" style="display:none">
          <div class="quarantine-loading">Loading quarantined sources...</div>
        </div>
      </div>`;
  }

  window.toggleQuarantinePanel = async function() {
    const list = document.getElementById('quarantine-list');
    if (!list) return;
    const isVisible = list.style.display !== 'none';
    list.style.display = isVisible ? 'none' : 'block';
    const chevron = list.parentElement.querySelector('.quarantine-chevron');
    if (chevron) chevron.style.transform = isVisible ? '' : 'rotate(180deg)';

    if (!isVisible && !list.dataset.loaded && productData) {
      list.dataset.loaded = 'true';
      try {
        const data = await fetchAPI(`product/${productData.product.id}/quarantine`);
        if (data.quarantined.length === 0) {
          list.innerHTML = '<div class="quarantine-empty">No quarantined sources</div>';
          return;
        }
        // Group by reason
        const grouped = {};
        for (const s of data.quarantined) {
          const r = s.quarantine_reason || 'unknown';
          if (!grouped[r]) grouped[r] = [];
          grouped[r].push(s);
        }
        let html = '';
        for (const [reason, sources] of Object.entries(grouped)) {
          const label = reason.replace(/_/g, ' ');
          html += `<div class="quarantine-group">
            <div class="quarantine-group-header">${esc(label)} <span class="quarantine-group-count">(${sources.length})</span></div>`;
          for (const s of sources) {
            const name = (s.name || '').substring(0, 50);
            const summary = (s.summary || '').substring(0, 120);
            const pool = (s.pool || 'C').toUpperCase();
            html += `<div class="quarantine-item" data-source-id="${esc(s.id)}">
              <div class="quarantine-item-info">
                <div class="quarantine-item-name"><span class="pool-chip-mini">${pool}</span> ${esc(name)}</div>
                <div class="quarantine-item-summary">${esc(summary)}</div>
              </div>
              <button class="quarantine-restore-btn" onclick="event.stopPropagation(); restoreQuarantinedSource('${esc(s.id)}', this)">Restore</button>
            </div>`;
          }
          html += '</div>';
        }
        if (data.restored.length > 0) {
          html += `<div class="quarantine-group">
            <div class="quarantine-group-header restored-header">Restored <span class="quarantine-group-count">(${data.restored.length})</span></div>`;
          for (const s of data.restored) {
            html += `<div class="quarantine-item restored">
              <div class="quarantine-item-info">
                <div class="quarantine-item-name"><span class="pool-chip-mini">${(s.pool || 'C').toUpperCase()}</span> ${esc(s.name || '')} <span class="quarantine-was">was: ${esc((s.quarantine_reason || '').replace(/_/g, ' '))}</span></div>
              </div>
            </div>`;
          }
          html += '</div>';
        }
        list.innerHTML = html;
      } catch (e) {
        list.innerHTML = '<div class="quarantine-empty">Failed to load quarantined sources</div>';
      }
    }
  };

  window.restoreQuarantinedSource = async function(sourceId, btn) {
    if (!productData) return;
    btn.disabled = true;
    btn.textContent = '...';
    try {
      const resp = await fetch(`${getBasePath()}api/product/${productData.product.id}/quarantine/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_id: sourceId })
      });
      const result = await resp.json();
      if (result.success) {
        const item = btn.closest('.quarantine-item');
        if (item) {
          item.style.opacity = '0.4';
          item.querySelector('.quarantine-restore-btn').textContent = 'Restored';
        }
      }
    } catch (e) {
      btn.textContent = 'Error';
    }
  };

  // ── Escape HTML ─────────────────────────────────────────────────────────
  function esc(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ── Expose for source explorer button ───────────────────────────────────
  window.toggleSourceExplorer = function() {
    const container = document.getElementById('source-explorer-container');
    if (container.classList.contains('visible')) {
      container.classList.remove('visible');
    } else {
      container.classList.add('visible');
      if (!container.dataset.loaded && productData) {
        container.dataset.loaded = 'true';
        loadSourceExplorer(productData.product.id, container);
      }
    }
  };

  window.getProductData = function() { return productData; };
  // ── Quarantine Review Section ─────────────────────────────────────────────

  function renderQuarantineReviewSection() {
    if (!AdminMode.isAdmin()) return '';
    return `
      <div class="section" id="quarantine-review-section" style="margin-top:var(--space-xl)">
        <div class="section-header" style="cursor:pointer" onclick="toggleQuarantineReviewSection()">
          <span class="section-title">&#x1F512; Source Quarantine Review</span>
          <span id="quarantine-review-chevron" style="color:var(--text-muted);transition:transform 0.2s">${ICONS.chevronDown}</span>
        </div>
        <div id="quarantine-review-body" class="section-body">
          <div style="display:flex;align-items:center;gap:8px;color:var(--text-muted);font-size:0.85rem">
            <div class="spinner" style="width:16px;height:16px;border-width:2px"></div>
            Loading quarantine data&hellip;
          </div>
        </div>
      </div>`;
  }

  async function loadQuarantineReviewSection(id) {
    if (!AdminMode.isAdmin()) return;
    const body = document.getElementById('quarantine-review-body');
    if (!body) return;
    try {
      const data = await fetchAPI(`product/${id}/quarantine`);
      const active = (data.active || []);
      const quarantined = (data.quarantined || []);
      const restored = (data.restored || []);

      if (quarantined.length === 0 && restored.length === 0) {
        body.innerHTML = `<div class="empty-state" style="padding:var(--space-md)">No quarantined sources for this product.</div>`;
        return;
      }

      const statsHtml = `
        <div style="display:flex;gap:var(--space-lg);margin-bottom:var(--space-lg);flex-wrap:wrap">
          <div style="display:flex;flex-direction:column;gap:2px">
            <span style="font-family:var(--font-mono);font-weight:700;font-size:1.2rem;color:var(--score-green)">${active.length}</span>
            <span style="font-size:0.75rem;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.05em">Active Sources</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:2px">
            <span style="font-family:var(--font-mono);font-weight:700;font-size:1.2rem;color:var(--score-amber)">${quarantined.length}</span>
            <span style="font-size:0.75rem;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.05em">Quarantined</span>
          </div>
          ${restored.length > 0 ? `<div style="display:flex;flex-direction:column;gap:2px">
            <span style="font-family:var(--font-mono);font-weight:700;font-size:1.2rem;color:var(--accent-blue)">${restored.length}</span>
            <span style="font-size:0.75rem;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.05em">Restored</span>
          </div>` : ''}
        </div>`;

      const tableRows = quarantined.map((s, idx) => `
        <tr style="opacity:0.75">
          <td style="padding:8px 10px">
            <input type="checkbox" class="quarantine-restore-check" value="${esc(s.id || String(idx))}" style="accent-color:var(--accent-blue)">
          </td>
          <td style="padding:8px 10px;color:var(--text-primary);text-decoration:line-through;text-decoration-color:var(--text-muted)">${s.url ? `<a href="${esc(s.url)}" target="_blank" rel="noopener" class="source-link">${esc((s.name || '').substring(0, 60))}</a>` : esc((s.name || '').substring(0, 60))}</td>
          <td style="padding:8px 10px">
            <span class="pool-chip-mini" style="width:auto;padding:2px 6px">${esc((s.pool || 'C').toUpperCase())}</span>
          </td>
          <td style="padding:8px 10px">
            <span class="sentiment-badge ${(s.sentiment || 'mixed').toLowerCase()}">${esc(s.sentiment || '&mdash;')}</span>
          </td>
          <td style="padding:8px 10px;color:var(--score-amber);font-size:0.8rem">${esc((s.quarantine_reason || '&mdash;').replace(/_/g, ' '))}</td>
        </tr>`).join('');

      const restoredRows = restored.map(s => `
        <tr style="opacity:0.5">
          <td style="padding:8px 10px"><input type="checkbox" disabled></td>
          <td style="padding:8px 10px;color:var(--score-green)">${s.url ? `<a href="${esc(s.url)}" target="_blank" rel="noopener" class="source-link">${esc((s.name || '').substring(0, 60))}</a>` : esc((s.name || '').substring(0, 60))} <span style="font-size:0.7rem;color:var(--text-muted)">(restored)</span></td>
          <td style="padding:8px 10px"><span class="pool-chip-mini" style="width:auto;padding:2px 6px">${esc((s.pool || 'C').toUpperCase())}</span></td>
          <td style="padding:8px 10px">&mdash;</td>
          <td style="padding:8px 10px;color:var(--text-muted);font-size:0.8rem">${esc((s.quarantine_reason || '&mdash;').replace(/_/g, ' '))}</td>
        </tr>`).join('');

      body.innerHTML = `
        ${statsHtml}
        <div style="overflow-x:auto">
          <table style="width:100%;border-collapse:collapse;font-size:0.85rem">
            <thead>
              <tr style="border-bottom:1px solid var(--border-default)">
                <th style="padding:6px 10px;width:36px"></th>
                <th style="padding:6px 10px;text-align:left;color:var(--text-tertiary);font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Source Name</th>
                <th style="padding:6px 10px;text-align:left;color:var(--text-tertiary);font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Pool</th>
                <th style="padding:6px 10px;text-align:left;color:var(--text-tertiary);font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Sentiment</th>
                <th style="padding:6px 10px;text-align:left;color:var(--text-tertiary);font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Reason Quarantined</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
              ${restoredRows}
            </tbody>
          </table>
        </div>
        <div id="quarantine-restore-bar" style="display:none;margin-top:var(--space-md);padding-top:var(--space-md);border-top:1px solid var(--border-default);align-items:center;gap:var(--space-md)">
          <button class="sort-btn" id="quarantine-restore-btn" onclick="restoreSelectedSources('${id}')" style="background:var(--accent-blue-dim);border-color:var(--accent-blue);color:var(--accent-blue)">
            Restore Selected Sources
          </button>
          <span id="quarantine-restore-count" style="font-size:0.8rem;color:var(--text-secondary)">0 selected</span>
        </div>`;

      bindQuarantineCheckboxes();
    } catch(e) {
      if (body) body.innerHTML = `<div class="empty-state">Failed to load quarantine data.</div>`;
    }
  }

  function bindQuarantineCheckboxes() {
    const body = document.getElementById('quarantine-review-body');
    if (!body) return;
    body.addEventListener('change', (e) => {
      if (!e.target.classList.contains('quarantine-restore-check')) return;
      const checked = body.querySelectorAll('.quarantine-restore-check:checked');
      const bar = document.getElementById('quarantine-restore-bar');
      const count = document.getElementById('quarantine-restore-count');
      if (bar) bar.style.display = checked.length > 0 ? 'flex' : 'none';
      if (count) count.textContent = `${checked.length} selected`;
    });
  }

  window.toggleQuarantineReviewSection = function() {
    const body = document.getElementById('quarantine-review-body');
    const chevron = document.getElementById('quarantine-review-chevron');
    if (!body) return;
    const hidden = body.style.display === 'none';
    body.style.display = hidden ? '' : 'none';
    if (chevron) chevron.style.transform = hidden ? '' : 'rotate(-90deg)';
  };

  window.restoreSelectedSources = async function(id) {
    const body = document.getElementById('quarantine-review-body');
    if (!body) return;
    const checked = body.querySelectorAll('.quarantine-restore-check:checked');
    const sourceIds = Array.from(checked).map(cb => cb.value);
    if (sourceIds.length === 0) return;

    const btn = document.getElementById('quarantine-restore-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Restoring...'; }

    try {
      const resp = await fetch(`${getBasePath()}api/product/${id}/quarantine/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_ids: sourceIds })
      });
      if (resp.ok) {
        await loadQuarantineReviewSection(id);
      } else {
        if (btn) { btn.disabled = false; btn.textContent = 'Restore Selected Sources'; }
      }
    } catch(e) {
      if (btn) { btn.disabled = false; btn.textContent = 'Restore Selected Sources'; }
    }
  };

  // ── Report Preview Section ────────────────────────────────────────────────

  function renderReportPreviewSection() {
    return `
      <div class="section" id="report-preview-section" style="margin-top:var(--space-md);margin-bottom:var(--space-xl)">
        <div class="section-header" style="cursor:pointer" onclick="toggleReportPreviewSection()">
          <span class="section-title">&#x1F4CB; Report Preview</span>
          <span id="report-preview-chevron" style="color:var(--text-muted);transition:transform 0.2s">${ICONS.chevronDown}</span>
        </div>
        <div id="report-preview-body" class="section-body">
          <div style="display:flex;align-items:center;gap:8px;color:var(--text-muted);font-size:0.85rem">
            <div class="spinner" style="width:16px;height:16px;border-width:2px"></div>
            Loading report preview&hellip;
          </div>
        </div>
      </div>`;
  }

  async function loadReportPreviewSection(id) {
    const body = document.getElementById('report-preview-body');
    if (!body) return;
    try {
      const data = await fetchAPI(`product/${id}/report-preview`);
      body.innerHTML = renderReportPreviewBody(data);
    } catch(e) {
      if (body) body.innerHTML = `<div class="empty-state" style="padding:var(--space-md)">Report preview not available for this product.</div>`;
    }
  }

  function renderReportPreviewBody(data) {
    const whatWeLove = data.what_we_love || [];
    const watchOutFor = data.watch_out_for || [];
    const knownIssues = data.known_issues || [];

    const loveItems = whatWeLove.map(item => `
      <div style="margin-bottom:var(--space-md)">
        <div style="font-weight:700;color:var(--text-primary);margin-bottom:4px;font-size:0.9rem">${esc(item.title || '')}</div>
        <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.6;margin:0">${esc(item.body || item.text || '')}</p>
      </div>`).join('');

    const watchItems = watchOutFor.map(item => `
      <div style="margin-bottom:var(--space-md)">
        <div style="font-weight:700;color:var(--text-primary);margin-bottom:4px;font-size:0.9rem">${esc(item.title || '')}</div>
        <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.6;margin:0">${esc(item.body || item.text || '')}</p>
      </div>`).join('');

    const hasBoth = whatWeLove.length > 0;
    const gridStyle = hasBoth
      ? 'display:grid;grid-template-columns:1fr 1fr;gap:var(--space-xl);margin-bottom:var(--space-xl)'
      : 'margin-bottom:var(--space-xl)';

    const loveCol = hasBoth ? `
      <div style="background:var(--bg-tertiary);border:1px solid rgba(232,185,60,0.2);border-radius:var(--radius-lg);padding:var(--space-lg)">
        <div style="font-size:0.78rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--score-amber);margin-bottom:var(--space-md);display:flex;align-items:center;gap:6px">
          &#x2728; What We Love About This Product
        </div>
        ${loveItems || '<p style="font-size:0.85rem;color:var(--text-muted)">No highlights available.</p>'}
      </div>` : '';

    const watchCol = `
      <div style="background:var(--bg-tertiary);border:1px solid rgba(255,138,128,0.2);border-radius:var(--radius-lg);padding:var(--space-lg)">
        <div style="font-size:0.78rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--score-red);margin-bottom:var(--space-md);display:flex;align-items:center;gap:6px">
          &#x26A0;&#xFE0F; Things to Watch Out For
        </div>
        ${watchItems || '<p style="font-size:0.85rem;color:var(--text-muted)">No concerns flagged.</p>'}
      </div>`;

    const narrativeHtml = `<div style="${gridStyle}">${loveCol}${watchCol}</div>`;

    let issuesHtml = '';
    if (knownIssues.length > 0) {
      const issueItems = knownIssues.map(issue => {
        const sev = (issue.severity || 'caution').toLowerCase();
        const isCritical = sev === 'critical' || sev === 'red';
        const color = isCritical ? 'var(--score-red)' : 'var(--score-amber)';
        const bg = isCritical ? 'var(--score-red-bg)' : 'var(--score-amber-bg)';
        const label = isCritical ? 'Critical' : 'Caution';
        return `
          <div style="display:flex;align-items:flex-start;gap:var(--space-sm);padding:var(--space-sm) 0;border-bottom:1px solid var(--border-subtle)">
            <span style="display:inline-flex;padding:2px 8px;border-radius:var(--radius-sm);font-size:0.72rem;font-weight:700;text-transform:uppercase;background:${bg};color:${color};flex-shrink:0;margin-top:2px">${label}</span>
            <div>
              <div style="font-size:0.88rem;font-weight:600;color:var(--text-primary)">${esc(issue.title || issue.finding || '')}</div>
              ${issue.description ? `<p style="font-size:0.82rem;color:var(--text-secondary);margin:2px 0 0">${esc(issue.description)}</p>` : ''}
            </div>
          </div>`;
      }).join('');

      issuesHtml = `
        <div style="margin-top:var(--space-md);padding-top:var(--space-md);border-top:1px solid var(--border-default)">
          <div style="font-size:0.78rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-secondary);margin-bottom:var(--space-md)">Known Issues</div>
          ${issueItems}
        </div>`;
    }

    return narrativeHtml + issuesHtml;
  }

  window.toggleReportPreviewSection = function() {
    const body = document.getElementById('report-preview-body');
    const chevron = document.getElementById('report-preview-chevron');
    if (!body) return;
    const hidden = body.style.display === 'none';
    body.style.display = hidden ? '' : 'none';
    if (chevron) chevron.style.transform = hidden ? '' : 'rotate(-90deg)';
  };

})();


// ═══ Price Integrity & Score Tier Display ═══
function renderPriceIntegrity(container, data) {
  if (!data) return;
  
  // Score Tier Label
  if (data.score_tier) {
    const tierClass = 'score-tier-' + data.score_tier.toLowerCase().replace(/\s+/g, '-');
    const tierEl = document.querySelector('.overall-score-value, .score-value, [class*="overall"]');
    if (tierEl) {
      const badge = document.createElement('span');
      badge.className = 'score-tier-label ' + tierClass;
      badge.textContent = data.score_tier;
      tierEl.parentNode.insertBefore(badge, tierEl.nextSibling);
    }
  }
  
  // Price Integrity Section
  if (data.price_amount || data.price_integrity_label) {
    const section = document.createElement('div');
    section.className = 'price-integrity-section';
    
    let html = '<h3>Price Integrity</h3>';
    
    if (data.price_amount) {
      html += '<div class="price-display">';
      html += '<span class="price-amount">$' + data.price_amount.toLocaleString() + '</span>';
      if (data.price_reference_spec) {
        html += '<span class="price-spec">' + escHtml(data.price_reference_spec) + '</span>';
      }
      if (data.price_unit) {
        html += '<span class="price-spec">' + escHtml(data.price_unit) + '</span>';
      }
      html += '</div>';
      if (data.price_note) {
        html += '<div class="price-note">' + escHtml(data.price_note) + '</div>';
      }
    }
    
    if (data.price_integrity_label) {
      const pi = data.price_integrity_label;
      html += '<div style="margin-top:12px">';
      html += '<span class="price-integrity-badge ' + pi.css + '">';
      html += pi.label;
      html += ' <span class="price-integrity-detail">— ' + pi.detail + '</span>';
      html += '</span>';
      html += '</div>';
    }
    
    section.innerHTML = html;
    
    // Insert after the score section
    const scoreSection = container.querySelector('.score-section, .product-scores, .scores-container');
    if (scoreSection) {
      scoreSection.parentNode.insertBefore(section, scoreSection.nextSibling);
    } else {
      // Fallback: insert at top of container
      container.insertBefore(section, container.firstChild);
    }
  }
}
