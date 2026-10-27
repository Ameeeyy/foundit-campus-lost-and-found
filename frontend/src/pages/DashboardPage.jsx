import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export default function DashboardPage() {
  const [stats, setStats] = useState({ myListings: 0, myClaims: 0, activeLost: 0, activeFound: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.getDashboard();
        setStats(response.stats || {});
      } catch (err) {
        setError(err.message || 'Unable to load your dashboard.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="page-block">
      <div className="page-header">
        <div>
          <span className="eyebrow">Overview</span>
          <h1>Dashboard</h1>
        </div>
        <Link className="button button-primary" to="/report">Report an item</Link>
      </div>

      {error && <div className="error-banner" role="alert">{error}</div>}
      {loading ? (
        <div className="loading-state">Loading dashboard…</div>
      ) : !error ? (
        <div className="stats-grid large">
          <div className="stat-card">
            <strong>{stats.myListings}</strong>
            <span>My listings</span>
          </div>
          <div className="stat-card">
            <strong>{stats.myClaims}</strong>
            <span>My claims</span>
          </div>
          <div className="stat-card">
            <strong>{stats.activeLost}</strong>
            <span>Open lost reports</span>
          </div>
          <div className="stat-card">
            <strong>{stats.activeFound}</strong>
            <span>Open found reports</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
