import { Compass, MapPin } from 'lucide-react';

/**
 * Branded left-hand panel shown on auth screens (login / register / register-owner).
 * Pure decoration — safe to omit on narrow viewports via CSS.
 */
export default function AuthVisual({ eyebrow = 'Tripzo', title, subtitle }) {
  return (
    <div className="auth-visual">
      <div className="auth-visual-compass" aria-hidden="true">
        <Compass size={340} strokeWidth={0.9} />
      </div>

      <div className="auth-visual-top">
        <span className="brand-mark" />
        {eyebrow}
      </div>

      <svg className="auth-visual-trail" viewBox="0 0 360 260" fill="none" aria-hidden="true">
        <path
          d="M20 230 C 90 230, 70 150, 140 140 S 210 60, 280 70 S 330 40, 340 20"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="6 10"
        />
        <circle cx="20" cy="230" r="5" fill="white" />
        <circle cx="140" cy="140" r="5" fill="white" fillOpacity="0.8" />
        <circle cx="280" cy="70" r="5" fill="white" fillOpacity="0.8" />
        <circle cx="340" cy="20" r="6" fill="white" />
      </svg>

      <div className="auth-visual-bottom">
        <MapPin size={20} style={{ opacity: 0.85, marginBottom: 10 }} />
        <h3 className="auth-visual-title">{title}</h3>
        {subtitle && <p className="auth-visual-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
}
