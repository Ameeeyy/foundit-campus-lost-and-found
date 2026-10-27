import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="hero-section">
      <div className="hero-copy">
        <span className="eyebrow">Campus safety and community</span>
        <h1>Lost an item? Found something important?</h1>
        <p>
          FoundIt helps students, staff, and faculty report, search, and reunite items with their rightful owners using a trusted campus workflow.
        </p>
        <div className="cta-row">
          <Link className="button button-primary" to="/browse">Browse listings</Link>
          <Link className="button button-secondary" to="/report">Report an item</Link>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <strong>2x</strong>
            <span>Faster recovery</span>
          </div>
          <div className="stat-card">
            <strong>85%</strong>
            <span>Match confidence</span>
          </div>
          <div className="stat-card">
            <strong>24/7</strong>
            <span>Campus visibility</span>
          </div>
        </div>
      </div>
      <div className="hero-panel">
        <div className="mini-card primary-card">
          <span className="eyebrow muted">Today</span>
          <h3>Recent match activity</h3>
          <ul>
            <li>Lost student ID near Library Annex</li>
            <li>Found bicycle keychain at bus stop</li>
            <li>Water bottle claimed by owner</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
