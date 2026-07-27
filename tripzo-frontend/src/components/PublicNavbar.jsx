import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPublicSettings } from '../api/settings';
import { AlertTriangle, Megaphone } from 'lucide-react';

export default function PublicNavbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    getPublicSettings()
      .then(({ data }) => setBanner(data.data))
      .catch(() => setBanner(null));
  }, []);

  return (
    <>
      {banner?.maintenance_mode && (
        <div style={{ background: '#fdecea', color: '#a12a1e', padding: '8px 16px', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textAlign: 'center' }}>
          <AlertTriangle size={14} /> Tripzo is temporarily paused for maintenance — new bookings will resume shortly.
        </div>
      )}
      {banner?.announcement_banner && (
        <div style={{ background: 'var(--primary, #1d5fa8)', color: '#fff', padding: '8px 16px', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textAlign: 'center' }}>
          <Megaphone size={14} /> {banner.announcement_banner}
        </div>
      )}
    <nav className="public-nav tz-nav">
      <Link to="/" className="brand">
        <span className="brand-mark" />
        Tripzo
      </Link>
      <div className="public-nav-links tz-nav-links">
        <NavLink to="/hostels">Explore stays</NavLink>
        <NavLink to="/trips">Trip planner</NavLink>
        {isAuthenticated ? (
          <>
            {user?.role === 'traveler' && (
              <>
                <NavLink to="/account/bookings">My bookings</NavLink>
                <NavLink to="/account/profile">Profile</NavLink>
              </>
            )}
            {user?.role === 'owner' && <NavLink to="/owner">Dashboard</NavLink>}
            {user?.role === 'admin' && <NavLink to="/admin">Dashboard</NavLink>}
            <button
              className="tz-btn tz-btn--ghost tz-btn--sm"
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/register-owner" className="tz-nav-muted">
              List your property
            </NavLink>
            <NavLink to="/login">Log in</NavLink>
            <Link to="/register">
              <button className="tz-btn tz-btn--light tz-btn--sm">Sign up</button>
            </Link>
          </>
        )}
      </div>
    </nav>
    </>
  );
}
