import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Globe, LogOut } from 'lucide-react';

/**
 * Shared shell for the admin, owner and traveler areas.
 * Same props as before ({ stops, roleLabel, children }) — all pages work unchanged.
 * Desktop: fixed navy sidebar. Mobile: top bar + slide-in drawer.
 */
export default function DashboardLayout({ stops, roleLabel, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initial = (user?.full_name || user?.email || 'U').charAt(0).toUpperCase();

  const nav = (
    <>
      <nav className="tz-dash-nav">
        {stops.map((stop) => (
          <NavLink
            key={stop.to}
            to={stop.to}
            end={stop.end}
            className={({ isActive }) => `tz-dash-link${isActive ? ' active' : ''}`}
            onClick={() => setOpen(false)}
          >
            {stop.icon}
            <span>{stop.label}</span>
          </NavLink>
        ))}
        <Link to="/hostels" className="tz-dash-link tz-dash-link--muted" onClick={() => setOpen(false)}>
          <Globe size={15} />
          <span>View public site</span>
        </Link>
      </nav>

      <div className="tz-dash-foot">
        <div className="tz-dash-user">
          <span className="tz-dash-avatar">{initial}</span>
          <div className="tz-dash-user-meta">
            <strong>{user?.full_name || 'Account'}</strong>
            <span>{user?.email}</span>
          </div>
        </div>
        <button className="tz-dash-logout" onClick={handleLogout}>
          <LogOut size={15} /> Log out
        </button>
      </div>
    </>
  );

  return (
    <div className="tz-dash">
      {/* Mobile top bar */}
      <header className="tz-dash-topbar">
        <button className="tz-dash-burger" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu size={20} />
        </button>
        <Link to="/" className="brand">
          <span className="brand-mark" /> Tripzo
        </Link>
        <span className="tz-dash-role">{roleLabel}</span>
      </header>

      {/* Sidebar (desktop) / drawer (mobile) */}
      <aside className={`tz-dash-side ${open ? 'tz-dash-side--open' : ''}`}>
        <div className="tz-dash-side-head">
          <Link to="/" className="brand" onClick={() => setOpen(false)}>
            <span className="brand-mark" /> Tripzo
          </Link>
          <button className="tz-dash-close" onClick={() => setOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>
        <span className="tz-dash-role">{roleLabel}</span>
        {nav}
      </aside>
      {open && <div className="tz-dash-overlay" onClick={() => setOpen(false)} />}

      <main className="tz-dash-main">{children}</main>
    </div>
  );
}
