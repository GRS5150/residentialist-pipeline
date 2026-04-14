import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Queue({ refreshTrigger }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newEval, setNewEval] = useState({
    productName: '',
    productLine: '',
    configuration: '',
    category: 'Windows',
    priority: 'Normal'
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchQueue();
  }, [refreshTrigger]);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/evaluations?status=queue');
      setItems(res.data);
    } catch (err) {
      console.error('Failed to fetch queue:', err);
    }
    setLoading(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newEval.productName || !newEval.productLine || !newEval.configuration) {
      alert('Please fill in all required fields');
      return;
    }

    setCreating(true);
    try {
      const res = await axios.post('/api/evaluations', newEval);
      alert(`Evaluation created: ${res.data.eval_id}`);
      setNewEval({
        productName: '',
        productLine: '',
        configuration: '',
        category: 'Windows',
        priority: 'Normal'
      });
      await fetchQueue();
    } catch (err) {
      alert('Failed to create evaluation: ' + err.message);
    }
    setCreating(false);
  };

  return (
    <div className="panel">
      <h2>Queue</h2>
      <p className="panel-subtitle">Products waiting for evaluation ({items.length})</p>

      <form onSubmit={handleCreate} className="form">
        <div className="form-grid">
          <input
            type="text"
            placeholder="Product name"
            value={newEval.productName}
            onChange={(e) => setNewEval({ ...newEval, productName: e.target.value })}
            disabled={creating}
          />
          <input
            type="text"
            placeholder="Product line"
            value={newEval.productLine}
            onChange={(e) => setNewEval({ ...newEval, productLine: e.target.value })}
            disabled={creating}
          />
          <input
            type="text"
            placeholder="Configuration (e.g., DH, CSM)"
            value={newEval.configuration}
            onChange={(e) => setNewEval({ ...newEval, configuration: e.target.value })}
            disabled={creating}
          />
          <select
            value={newEval.category}
            onChange={(e) => setNewEval({ ...newEval, category: e.target.value })}
            disabled={creating}
          >
            <option value="Windows">Windows</option>
            <option value="Cabinets">Cabinets</option>
            <option value="Countertops">Countertops</option>
            <option value="Flooring">Flooring</option>
            <option value="Faucets">Faucets</option>
            <option value="HVAC">HVAC</option>
          </select>
          <select
            value={newEval.priority}
            onChange={(e) => setNewEval({ ...newEval, priority: e.target.value })}
            disabled={creating}
          >
            <option value="Low">Low</option>
            <option value="Normal">Normal</option>
            <option value="High">High</option>
          </select>
          <button type="submit" disabled={creating} className="btn-primary">
            {creating ? 'Creating...' : 'Start Evaluation'}
          </button>
        </div>
      </form>

      <div className="items-list">
        {loading ? (
          <p>Loading...</p>
        ) : items.length === 0 ? (
          <p className="empty-state">No items in queue</p>
        ) : (
          items.map((item) => (
            <div key={item.eval_id} className="item">
              <div className="item-header">
                <span className="item-title">
                  {item.product_name} {item.product_line}
                </span>
                <span className="badge">{item.priority}</span>
              </div>
              <div className="item-meta">
                <span>{item.configuration}</span>
                <span className="dot">•</span>
                <span>{item.category}</span>
                <span className="dot">•</span>
                <span className="gray">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
