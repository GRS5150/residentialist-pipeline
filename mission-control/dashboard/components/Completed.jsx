import { useState, useEffect } from 'react';
import axios from 'axios';

const CALIBRATION = [
  { product: 'Alpen Zenith ZR-7',  config: 'DH',  overall: 8.70, grade: 'A-', Q: null, D: null, P: null },
  { product: 'Marvin Integrity',    config: 'DH',  overall: 7.65, grade: 'B+', Q: 8.075, D: 8.0625, P: 6.80 },
  { product: 'Andersen 400 Series', config: 'DH',  overall: 7.07, grade: 'B',  Q: 6.73,  D: 7.39,  P: 7.10 },
  { product: 'Milgard Tuscany',     config: 'DH',  overall: 6.92, grade: 'B-', Q: 6.05,  D: 7.90,  P: 6.80 },
  { product: 'Pella 250 Series',    config: 'DH',  overall: 6.78, grade: 'B-', Q: 6.43,  D: 7.13,  P: 6.77 },
  { product: 'Pella 350 Series',    config: 'DH',  overall: 4.91, grade: 'D+', Q: 4.50,  D: 4.94,  P: 5.29 },
  { product: 'Jeld-Wen V-2500',     config: 'DH',  overall: 5.76, grade: 'C+', Q: 5.00,  D: 6.19,  P: 6.10 },
  { product: 'Reliabilt 3500',      config: 'DH',  overall: 4.90, grade: 'D+', Q: null,  D: null,  P: null },
  { product: 'Window World 4000',   config: 'DH',  overall: 4.63, grade: 'D',  Q: 5.20,  D: 4.50,  P: 4.20 },
];

export default function Completed({ refreshTrigger }) {
  const [items, setItems]             = useState([]);
  const [loading, setLoading]         = useState(false);
  const [expanded, setExpanded]       = useState(null); // eval_id or cal_idx
  const [expandedCal, setExpandedCal] = useState(null); // calibration row index

  useEffect(() => { fetchCompleted(); }, [refreshTrigger]);

  const fetchCompleted = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/evaluations?status=completed');
      setItems(res.data);
    } catch (err) { console.error('Failed to fetch completed:', err); }
    setLoading(false);
  };

  const getGrade = (score) => {
    if (!score) return '—';
    if (score >= 9.0) return 'A+'; if (score >= 8.5) return 'A';
    if (score >= 8.0) return 'A-'; if (score >= 7.5) return 'B+';
    if (score >= 7.0) return 'B';  if (score >= 6.5) return 'B-';
    if (score >= 6.0) return 'C+'; if (score >= 5.5) return 'C';
    if (score >= 5.0) return 'C-'; if (score >= 4.5) return 'D+';
    if (score >= 4.0) return 'D';  return 'F';
  };

  const getScoreColor = (score) => {
    if (!score) return '#9ca3af';
    if (score >= 8.0) return '#10b981';
    if (score >= 7.0) return '#3b82f6';
    if (score >= 6.0) return '#f59e0b';
    if (score >= 5.0) return '#ef8c34';
    return '#ef4444';
  };

  const getBarColor = (score) => {
    if (!score) return '#e5e7eb';
    if (score >= 8.0) return '#10b981';
    if (score >= 7.0) return '#3b82f6';
    if (score >= 6.0) return '#f59e0b';
    return '#ef4444';
  };

  const toggleExpand = (id) => setExpanded(prev => prev === id ? null : id);
  const toggleCalExpand = (idx) => setExpandedCal(prev => prev === idx ? null : idx);

  // Axis bar component
  const AxisBar = ({ label, score, weight }) => (
    <div className="axis-bar-row">
      <div className="axis-bar-header">
        <span className="axis-bar-label">{label}</span>
        <span className="axis-bar-score" style={{ color: getScoreColor(score) }}>
          {score ? score.toFixed(2) : '—'} <span className="axis-bar-grade">{getGrade(score)}</span>
        </span>
      </div>
      <div className="axis-bar-track">
        <div
          className="axis-bar-fill"
          style={{ width: score ? `${(score / 10) * 100}%` : '0%', background: getBarColor(score) }}
        />
      </div>
      <div className="axis-bar-weight">{weight} of overall score</div>
    </div>
  );

  // Mini score pill
  const ScorePill = ({ label, value }) => (
    <div className="mini-pill">
      <span className="mini-pill-label">{label}</span>
      <span className="mini-pill-value" style={{ color: getScoreColor(value) }}>
        {value ? value.toFixed(1) : '—'}
      </span>
    </div>
  );

  return (
    <div className="panel">
      <h2>Completed</h2>
      <p className="panel-subtitle">Finished evaluations ({items.length})</p>

      {/* ── CALIBRATION TABLE ── */}
      <div className="calibration-table">
        <h3>Calibration Benchmarks</h3>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Config</th>
              <th>Overall</th>
              <th>Grade</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {CALIBRATION.map((cal, idx) => (
              <>
                <tr
                  key={idx}
                  className={`benchmark-row ${expandedCal === idx ? 'expanded' : ''}`}
                  onClick={() => toggleCalExpand(idx)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>{cal.product}</td>
                  <td>{cal.config}</td>
                  <td style={{ color: getScoreColor(cal.overall) }}>
                    <strong>{cal.overall.toFixed(2)}</strong>
                  </td>
                  <td>{cal.grade}</td>
                  <td className="expand-chevron">{expandedCal === idx ? '▲' : '▼'}</td>
                </tr>
                {expandedCal === idx && (
                  <tr key={`${idx}-detail`} className="detail-row">
                    <td colSpan={5}>
                      <div className="drill-down">
                        <div className="drill-header">
                          <span className="drill-title">{cal.product} — Score Detail</span>
                          <span className="drill-config">{cal.config}</span>
                        </div>
                        {cal.Q !== null ? (
                          <div className="axis-bars">
                            <AxisBar label="Quality"     score={cal.Q} weight="35%" />
                            <AxisBar label="Durability"  score={cal.D} weight="35%" />
                            <AxisBar label="Performance" score={cal.P} weight="30%" />
                          </div>
                        ) : (
                          <div className="drill-note">Axis scores not available for this calibration entry.</div>
                        )}
                        <div className="drill-overall">
                          <span>Overall</span>
                          <span style={{ color: getScoreColor(cal.overall), fontWeight: 700 }}>
                            {cal.overall.toFixed(2)} / 10 — {cal.grade}
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── COMPLETED EVALUATIONS ── */}
      <div className="completed-list">
        <h3>Completed Evaluations</h3>
        {loading ? (
          <p>Loading...</p>
        ) : items.length === 0 ? (
          <p className="empty-state">No completed evaluations yet</p>
        ) : (
          items.map((item) => (
            <div key={item.eval_id} className="completed-item">
              {/* Header row — always visible */}
              <div
                className="item-header"
                onClick={() => toggleExpand(item.eval_id)}
                style={{ cursor: 'pointer' }}
              >
                <span className="item-title">
                  {item.product_name} {item.product_line}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    className="score-badge"
                    style={{ backgroundColor: getScoreColor(item.overall_score) }}
                  >
                    {item.overall_score ? item.overall_score.toFixed(2) : 'N/A'}
                  </span>
                  <span className="expand-chevron-inline">
                    {expanded === item.eval_id ? '▲' : '▼'}
                  </span>
                </div>
              </div>

              {/* Meta row */}
              <div className="item-meta">
                <span>{item.configuration}</span>
                <span className="dot">•</span>
                <span className="grade">{getGrade(item.overall_score || 0)}</span>
                <span className="dot">•</span>
                <span className="rubric">v{item.rubric_version || '?'}</span>
                <span className="dot">•</span>
                <span className={`status-text status-${item.status}`}>
                  {item.status === 'Ready_To_Generate' && '📋 Ready to Generate'}
                  {item.status === 'Report_Generated'  && '✅ Report Generated'}
                  {item.status === 'Pending_Sync'      && '⏳ Pending Sync'}
                  {item.status === 'Synced'            && '☑️ Synced'}
                </span>
              </div>

              {/* Mini score pills — always visible */}
              {item.overall_score && (
                <div className="mini-pills-row">
                  <ScorePill label="Quality"     value={item.quality_score} />
                  <ScorePill label="Durability"  value={item.durability_score} />
                  <ScorePill label="Performance" value={item.performance_score} />
                  {item.material_safety_score && (
                    <ScorePill label="Mat. Safety" value={item.material_safety_score} />
                  )}
                </div>
              )}

              {/* ── DRILL-DOWN PANEL ── */}
              {expanded === item.eval_id && (
                <div className="drill-down">
                  <div className="drill-header">
                    <span className="drill-title">Score Detail</span>
                    {item.data_confidence && (
                      <span className={`confidence-badge conf-${item.data_confidence.toLowerCase()}`}>
                        {item.data_confidence} confidence
                      </span>
                    )}
                  </div>

                  <div className="axis-bars">
                    <AxisBar label="Quality"     score={item.quality_score}     weight="35%" />
                    <AxisBar label="Durability"  score={item.durability_score}   weight="35%" />
                    <AxisBar label="Performance" score={item.performance_score}  weight="30%" />
                  </div>

                  {item.material_safety_score && (
                    <div className="safety-row">
                      <span className="safety-label">Material Safety</span>
                      <span className="safety-note">Scored independently — not included in overall</span>
                      <span className="safety-score" style={{ color: getScoreColor(item.material_safety_score) }}>
                        {item.material_safety_score.toFixed(1)}
                      </span>
                    </div>
                  )}

                  <div className="drill-overall">
                    <span>Weighted Overall (35 / 35 / 30)</span>
                    <span style={{ color: getScoreColor(item.overall_score), fontWeight: 700 }}>
                      {item.overall_score ? item.overall_score.toFixed(2) : '—'} / 10 — {getGrade(item.overall_score)}
                    </span>
                  </div>

                  <div className="drill-actions">
                    <button
                      className="drill-btn primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`Generate report for ${item.product_name} ${item.product_line} — Bot 6 trigger coming soon`);
                      }}
                    >
                      Generate Report
                    </button>
                    <button
                      className="drill-btn secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpanded(null);
                      }}
                    >
                      Collapse
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        /* ── CALIBRATION TABLE ── */
        .calibration-table {
          margin-bottom: 40px;
          padding: 20px;
          background-color: #f9fafb;
          border-radius: 8px;
        }
        .calibration-table h3 { margin-top: 0; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; font-size: 14px; }
        thead { background-color: #f3f4f6; }
        th { padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #d1d5db; }
        td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; }
        .benchmark-row:hover { background-color: #f0f9ff; }
        .benchmark-row.expanded { background-color: #eff6ff; }
        .expand-chevron { font-size: 10px; color: #9ca3af; text-align: right; }

        /* ── DETAIL DRILL-DOWN ── */
        .detail-row td { padding: 0; background-color: #f8faff; border-bottom: 2px solid #e5e7eb; }

        .drill-down {
          padding: 16px 20px;
          border-top: 1px solid #e5e7eb;
          margin-top: 12px;
          background: #f8faff;
          border-radius: 6px;
        }

        .drill-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .drill-title { font-weight: 600; font-size: 13px; color: #1f2937; }
        .drill-config { font-size: 12px; color: #6b7280; background: #f3f4f6; padding: 2px 8px; border-radius: 4px; }
        .drill-note { font-size: 13px; color: #6b7280; font-style: italic; padding: 8px 0; }

        /* ── AXIS BARS ── */
        .axis-bars { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }

        .axis-bar-row {}
        .axis-bar-header {
          display: flex; justify-content: space-between; align-items: baseline;
          margin-bottom: 5px;
        }
        .axis-bar-label { font-size: 12px; font-weight: 600; color: #374151; }
        .axis-bar-score { font-size: 14px; font-weight: 700; }
        .axis-bar-grade { font-size: 11px; font-weight: 600; color: #9ca3af; margin-left: 4px; }
        .axis-bar-track {
          height: 6px; background: #e5e7eb; border-radius: 3px;
          overflow: hidden; margin-bottom: 3px;
        }
        .axis-bar-fill { height: 100%; border-radius: 3px; transition: width 0.4s ease; }
        .axis-bar-weight { font-size: 10px; color: #9ca3af; }

        /* ── SAFETY ROW ── */
        .safety-row {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px;
          background: #fefce8; border: 1px solid #fde68a;
          border-radius: 6px; margin-bottom: 14px;
          font-size: 13px;
        }
        .safety-label { font-weight: 600; color: #374151; flex-shrink: 0; }
        .safety-note { font-size: 11px; color: #6b7280; flex: 1; }
        .safety-score { font-weight: 700; font-size: 16px; }

        /* ── OVERALL ROW ── */
        .drill-overall {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 14px;
          background: white; border: 1px solid #e5e7eb; border-radius: 6px;
          font-size: 13px; color: #6b7280; margin-bottom: 14px;
        }

        /* ── ACTIONS ── */
        .drill-actions { display: flex; gap: 8px; }
        .drill-btn {
          padding: 7px 16px; border-radius: 6px; font-size: 13px;
          font-weight: 500; cursor: pointer; border: none;
        }
        .drill-btn.primary { background: #1f2937; color: white; }
        .drill-btn.primary:hover { background: #374151; }
        .drill-btn.secondary { background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; }
        .drill-btn.secondary:hover { background: #e5e7eb; }

        /* ── CONFIDENCE BADGE ── */
        .confidence-badge { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 4px; }
        .conf-high     { background: #d1fae5; color: #065f46; }
        .conf-moderate { background: #fef3c7; color: #92400e; }
        .conf-low      { background: #fee2e2; color: #991b1b; }

        /* ── COMPLETED LIST ── */
        .completed-list h3 { margin-top: 0; margin-bottom: 16px; }
        .completed-item {
          padding: 16px; border: 1px solid #e5e7eb;
          border-radius: 8px; margin-bottom: 12px; background-color: white;
        }
        .completed-item:hover { border-color: #d1d5db; box-shadow: 0 1px 3px rgba(0,0,0,.05); }

        .item-header {
          display: flex; justify-content: space-between;
          align-items: center; margin-bottom: 8px;
        }
        .item-title { font-weight: 600; font-size: 15px; }
        .expand-chevron-inline { font-size: 10px; color: #9ca3af; }
        .score-badge { color: white; font-weight: 700; padding: 6px 12px; border-radius: 6px; font-size: 14px; }

        .item-meta { font-size: 13px; color: #6b7280; margin-bottom: 10px; }
        .dot { color: #d1d5db; margin: 0 6px; }
        .grade { font-weight: 600; color: #1f2937; }
        .rubric { font-size: 12px; background: #f0f9ff; padding: 2px 6px; border-radius: 3px; color: #0369a1; }

        .status-text { font-size: 12px; font-weight: 500; }
        .status-Ready_To_Generate { color: #92400e; }
        .status-Report_Generated  { color: #065f46; }
        .status-Pending_Sync      { color: #831843; }
        .status-Synced            { color: #166534; }

        /* ── MINI PILLS ── */
        .mini-pills-row {
          display: flex; gap: 8px; flex-wrap: wrap;
          padding-top: 10px; border-top: 1px solid #f3f4f6;
          margin-bottom: 0;
        }
        .mini-pill {
          display: flex; align-items: center; gap: 5px;
          background: #f9fafb; padding: 5px 10px;
          border-radius: 5px; border: 1px solid #e5e7eb;
        }
        .mini-pill-label { font-size: 11px; color: #6b7280; font-weight: 500; }
        .mini-pill-value { font-size: 14px; font-weight: 700; }
      `}</style>
    </div>
  );
}
