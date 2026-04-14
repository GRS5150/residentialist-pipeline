import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Pipeline({ refreshTrigger }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEval, setSelectedEval] = useState(null);
  const [activityLog, setActivityLog] = useState([]);

  useEffect(() => {
    fetchPipeline();
  }, [refreshTrigger]);

  useEffect(() => {
    if (selectedEval) {
      fetchActivity(selectedEval.eval_id);
      const interval = setInterval(() => fetchActivity(selectedEval.eval_id), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedEval]);

  const fetchPipeline = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/evaluations?status=pipeline');
      setItems(res.data);
      if (res.data.length > 0 && !selectedEval) {
        setSelectedEval(res.data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch pipeline:', err);
    }
    setLoading(false);
  };

  const fetchActivity = async (eval_id) => {
    try {
      const res = await axios.get(`/api/activity?eval_id=${eval_id}&limit=20`);
      setActivityLog(res.data);
    } catch (err) {
      console.error('Failed to fetch activity:', err);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'Bot1_Running': '🔄 Bot 1: Research',
      'Bot1_Done': '✅ Bot 1 Done',
      'Bot2_Running': '🔄 Bot 2: Scoring',
      'Bot2_Done': '✅ Bot 2 Done',
      'Bot3_Running': '🔄 Bot 3: Material Safety',
      'Bot3_Done': '✅ Bot 3 Done'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    if (status.includes('Running')) return '#3b82f6';
    if (status.includes('Done')) return '#10b981';
    return '#6b7280';
  };

  return (
    <div className="panel">
      <h2>Pipeline</h2>
      <p className="panel-subtitle">Active evaluations ({items.length})</p>

      <div className="pipeline-container">
        <div className="pipeline-list">
          {loading ? (
            <p>Loading...</p>
          ) : items.length === 0 ? (
            <p className="empty-state">No active evaluations</p>
          ) : (
            items.map((item) => (
              <div
                key={item.eval_id}
                className={`pipeline-item ${selectedEval?.eval_id === item.eval_id ? 'selected' : ''}`}
                onClick={() => setSelectedEval(item)}
              >
                <div className="item-header">
                  <span className="item-title">
                    {item.product_name} {item.product_line}
                  </span>
                </div>
                <div className="item-meta">
                  <span style={{ color: getStatusColor(item.status) }}>
                    {getStatusLabel(item.status)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="activity-log">
          <h3>Activity Log</h3>
          {selectedEval ? (
            <div className="log-entries">
              {activityLog.length === 0 ? (
                <p className="empty-state">No activity yet</p>
              ) : (
                activityLog.map((entry, idx) => (
                  <div key={idx} className="log-entry">
                    <div className="log-time">
                      {new Date(entry.created_at).toLocaleTimeString()}
                    </div>
                    <div className="log-type">{entry.activity_type}</div>
                    <div className="log-message">{entry.message}</div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <p className="empty-state">Select an evaluation to see activity</p>
          )}
        </div>
      </div>

      <style jsx>{`
        .pipeline-container {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 20px;
          margin-top: 20px;
        }

        .pipeline-list {
          border-right: 1px solid #e5e7eb;
          max-height: 500px;
          overflow-y: auto;
        }

        .pipeline-item {
          padding: 12px;
          border: 1px solid #e5e7eb;
          margin-bottom: 8px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pipeline-item:hover {
          background-color: #f9fafb;
          border-color: #d1d5db;
        }

        .pipeline-item.selected {
          background-color: #dbeafe;
          border-color: #3b82f6;
        }

        .activity-log {
          max-height: 500px;
          overflow-y: auto;
        }

        .log-entries {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .log-entry {
          padding: 10px;
          border-left: 3px solid #3b82f6;
          background-color: #f0f9ff;
          border-radius: 4px;
          font-size: 13px;
        }

        .log-time {
          font-weight: 600;
          color: #1f2937;
          font-size: 12px;
        }

        .log-type {
          color: #3b82f6;
          font-weight: 500;
          margin-top: 2px;
        }

        .log-message {
          color: #6b7280;
          margin-top: 4px;
          line-height: 1.4;
        }

        @media (max-width: 900px) {
          .pipeline-container {
            grid-template-columns: 1fr;
          }

          .pipeline-list {
            border-right: none;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 20px;
          }
        }
      `}</style>
    </div>
  );
}
