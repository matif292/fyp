import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="auth-wrap">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <span className="mono" style={{ color: 'var(--moss)' }}>404</span>
        <h2>Trail not found</h2>
        <p className="muted">This path doesn't lead anywhere on Tripzo.</p>
        <Link to="/">
          <button className="btn btn-primary">Back to home</button>
        </Link>
      </div>
    </div>
  );
}
