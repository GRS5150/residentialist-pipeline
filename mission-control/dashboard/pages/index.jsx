import { useState, useEffect } from 'react';
import Queue from '../components/Queue';
import Pipeline from '../components/Pipeline';
import Completed from '../components/Completed';
import ReviewQueue from '../components/ReviewQueue';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('queue');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="dashboard">
      <header className="header">
        <div className="header-content">
          <h1>The Residentialist</h1>
          <p className="subtitle">Mission Control</p>
        </div>
        <div className="header-actions">
          <button onClick={handleRefresh} className="btn-refresh">
            🔄 Refresh
          </button>
        </div>
      </header>

      <nav className="tabs">
        <button
          className={`tab ${activeTab === 'queue' ? 'active' : ''}`}
          onClick={() => setActiveTab('queue')}
        >
          📋 Queue
        </button>
        <button
          className={`tab ${activeTab === 'pipeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('pipeline')}
        >
          🔄 Pipeline
        </button>
        <button
          className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          ✅ Completed
        </button>
        <button
          className={`tab ${activeTab === 'review' ? 'active' : ''}`}
          onClick={() => setActiveTab('review')}
        >
          📂 Review Queue
        </button>
      </nav>

      <main className="main">
        {activeTab === 'queue' && <Queue refreshTrigger={refreshTrigger} />}
        {activeTab === 'pipeline' && <Pipeline refreshTrigger={refreshTrigger} />}
        {activeTab === 'completed' && <Completed refreshTrigger={refreshTrigger} />}
        {activeTab === 'review' && <ReviewQueue refreshTrigger={refreshTrigger} />}
      </main>

      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
            sans-serif;
          background-color: #f9fafb;
          color: #1f2937;
        }

        .dashboard {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 32px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .header-content h1 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .subtitle {
          font-size: 14px;
          opacity: 0.9;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .btn-refresh {
          background-color: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .btn-refresh:hover {
          background-color: rgba(255, 255, 255, 0.3);
        }

        .tabs {
          display: flex;
          background-color: white;
          border-bottom: 1px solid #e5e7eb;
          overflow-x: auto;
        }

        .tab {
          flex: 1;
          padding: 16px 20px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #6b7280;
          border-bottom: 3px solid transparent;
          transition: all 0.2s;
          white-space: nowrap;
          min-width: max-content;
        }

        .tab:hover {
          color: #1f2937;
        }

        .tab.active {
          color: #667eea;
          border-bottom-color: #667eea;
        }

        .main {
          flex: 1;
          padding: 32px 24px;
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
        }

        .panel {
          background-color: white;
          border-radius: 8px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .panel h2 {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .panel-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 24px;
        }

        .form {
          margin-bottom: 32px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
          margin-bottom: 12px;
        }

        input,
        select,
        textarea {
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
          transition: all 0.2s;
        }

        input:focus,
        select:focus,
        textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        input:disabled,
        select:disabled,
        textarea:disabled {
          background-color: #f3f4f6;
          color: #9ca3af;
          cursor: not-allowed;
        }

        .btn-primary {
          background-color: #667eea;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #5568d3;
          box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .items-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .item {
          padding: 12px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .item:hover {
          border-color: #d1d5db;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .item-title {
          font-weight: 600;
          font-size: 14px;
        }

        .badge {
          display: inline-block;
          padding: 4px 10px;
          background-color: #fef3c7;
          color: #92400e;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .item-meta {
          font-size: 13px;
          color: #6b7280;
        }

        .gray {
          color: #9ca3af;
        }

        .empty-state {
          padding: 40px 20px;
          text-align: center;
          color: #9ca3af;
        }

        @media (max-width: 768px) {
          .header {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }

          .header-content h1 {
            font-size: 24px;
          }

          .main {
            padding: 20px 16px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .tabs {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
        }
      `}</style>
    </div>
  );
}
