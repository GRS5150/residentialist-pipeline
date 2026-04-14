import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ReviewQueue({ refreshTrigger }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSpec, setSelectedSpec] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviewQueue();
  }, [refreshTrigger]);

  const fetchReviewQueue = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/spec-sheets');
      setItems(res.data);
    } catch (err) {
      console.error('Failed to fetch review queue:', err);
    }
    setLoading(false);
  };

  const handleSelect = async (spec) => {
    setSelectedSpec(spec);
    setReviewNotes('');
    // Fetch full spec details
    try {
      const res = await axios.get(`/api/spec-sheets?id=${spec.spec_id}`);
      setSelectedSpec(res.data);
    } catch (err) {
      console.error('Failed to fetch spec details:', err);
    }
  };

  const handleApprove = async () => {
    if (!selectedSpec) return;
    setSubmitting(true);
    try {
      await axios.post('/api/spec-sheets', {
        action: 'approve',
        spec_id: selectedSpec.spec_id,
        notes: reviewNotes
      });
      alert('Spec sheet approved');
      setSelectedSpec(null);
      setReviewNotes('');
      await fetchReviewQueue();
    } catch (err) {
      alert('Failed to approve: ' + err.message);
    }
    setSubmitting(false);
  };

  const handleDiscard = async () => {
    if (!selectedSpec) return;
    if (!confirm('Are you sure you want to discard this spec sheet?')) return;

    setSubmitting(true);
    try {
      await axios.post('/api/spec-sheets', {
        action: 'discard',
        spec_id: selectedSpec.spec_id,
        notes: reviewNotes
      });
      alert('Spec sheet discarded');
      setSelectedSpec(null);
      setReviewNotes('');
      await fetchReviewQueue();
    } catch (err) {
      alert('Failed to discard: ' + err.message);
    }
    setSubmitting(false);
  };

  return (
    <div className="panel">
      <h2>Review Queue</h2>
      <p className="panel-subtitle">Spec sheets pending approval ({items.length})</p>

      <div className="review-container">
        <div className="spec-list">
          {loading ? (
            <p>Loading...</p>
          ) : items.length === 0 ? (
            <p className="empty-state">No spec sheets to review</p>
          ) : (
            items.map((item) => (
              <div
                key={item.spec_id}
                className={`spec-item ${selectedSpec?.spec_id === item.spec_id ? 'selected' : ''}`}
                onClick={() => handleSelect(item)}
              >
                <div className="spec-header">
                  <span className="address">{item.property_address}</span>
                </div>
                <div className="spec-meta">
                  <span>{item.property_city}</span>
                  <span className="dot">•</span>
                  <span className="gray">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="spec-summary">
                  Extracted: {item.categories_found} of 16 categories
                </div>
              </div>
            ))
          )}
        </div>

        <div className="spec-detail">
          {selectedSpec ? (
            <>
              <h3>{selectedSpec.property_address}</h3>
              <div className="detail-info">
                <div className="info-row">
                  <span className="label">City:</span>
                  <span>{selectedSpec.property_city}</span>
                </div>
                <div className="info-row">
                  <span className="label">Builder:</span>
                  <span>{selectedSpec.builder_name}</span>
                </div>
                <div className="info-row">
                  <span className="label">Categories Found:</span>
                  <span>{selectedSpec.categories_found} of 16</span>
                </div>
                <div className="info-row">
                  <span className="label">Items Needing Review:</span>
                  <span>{selectedSpec.items_needing_review}</span>
                </div>
                <div className="info-row">
                  <span className="label">Received:</span>
                  <span>
                    {new Date(selectedSpec.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {selectedSpec.extraction_summary && (
                <div className="extraction-summary">
                  <h4>Extracted Products by Category</h4>
                  <div className="category-grid">
                    {Object.entries(selectedSpec.extraction_summary).map(([cat, count]) => (
                      count > 0 && (
                        <div key={cat} className="category-item">
                          <span className="cat-name">{cat}</span>
                          <span className="cat-count">{count}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              <div className="review-form">
                <label>Review Notes (optional)</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add any notes or corrections..."
                  disabled={submitting}
                />

                <div className="button-group">
                  <button
                    onClick={handleApprove}
                    disabled={submitting}
                    className="btn-success"
                  >
                    {submitting ? 'Processing...' : '✅ Approve'}
                  </button>
                  <button
                    onClick={handleDiscard}
                    disabled={submitting}
                    className="btn-danger"
                  >
                    {submitting ? 'Processing...' : '❌ Discard'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p className="empty-state">Select a spec sheet to review</p>
          )}
        </div>
      </div>

      <style jsx>{`
        .review-container {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 20px;
          margin-top: 20px;
        }

        .spec-list {
          border-right: 1px solid #e5e7eb;
          max-height: 600px;
          overflow-y: auto;
        }

        .spec-item {
          padding: 12px;
          border: 1px solid #e5e7eb;
          margin-bottom: 8px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .spec-item:hover {
          background-color: #f9fafb;
          border-color: #d1d5db;
        }

        .spec-item.selected {
          background-color: #dbeafe;
          border-color: #3b82f6;
        }

        .spec-header {
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 6px;
        }

        .address {
          color: #1f2937;
        }

        .spec-meta {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 6px;
        }

        .spec-summary {
          font-size: 12px;
          color: #3b82f6;
          background-color: #f0f9ff;
          padding: 4px 6px;
          border-radius: 3px;
        }

        .spec-detail {
          padding: 20px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background-color: white;
          max-height: 600px;
          overflow-y: auto;
        }

        .spec-detail h3 {
          margin-top: 0;
          margin-bottom: 20px;
        }

        .detail-info {
          margin-bottom: 24px;
          padding-bottom: 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
        }

        .info-row .label {
          font-weight: 600;
          color: #6b7280;
          min-width: 120px;
        }

        .extraction-summary {
          margin-bottom: 24px;
        }

        .extraction-summary h4 {
          margin-top: 0;
          margin-bottom: 12px;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 8px;
        }

        .category-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px;
          background-color: #f0f9ff;
          border-radius: 4px;
          border: 1px solid #bfdbfe;
          font-size: 13px;
        }

        .cat-name {
          font-weight: 500;
          color: #0369a1;
        }

        .cat-count {
          background-color: #0369a1;
          color: white;
          padding: 2px 6px;
          border-radius: 3px;
          font-weight: 600;
          font-size: 12px;
        }

        .review-form {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #e5e7eb;
        }

        .review-form label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .review-form textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-family: inherit;
          font-size: 14px;
          resize: vertical;
          min-height: 80px;
          margin-bottom: 16px;
        }

        .button-group {
          display: flex;
          gap: 10px;
        }

        .btn-success,
        .btn-danger {
          flex: 1;
          padding: 10px 16px;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .btn-success {
          background-color: #10b981;
          color: white;
        }

        .btn-success:hover:not(:disabled) {
          background-color: #059669;
        }

        .btn-danger {
          background-color: #ef4444;
          color: white;
        }

        .btn-danger:hover:not(:disabled) {
          background-color: #dc2626;
        }

        .btn-success:disabled,
        .btn-danger:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 900px) {
          .review-container {
            grid-template-columns: 1fr;
          }

          .spec-list {
            border-right: none;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 20px;
            max-height: 300px;
          }
        }
      `}</style>
    </div>
  );
}
