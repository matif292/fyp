import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { login as loginApi } from '../api/auth';
import { apiErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../components/Feedback';
import AuthVisual from '../components/AuthVisual';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await loginApi(form);
      login(data.token, data.user);
      const redirect =
        data.user.role === 'admin' ? '/admin' : data.user.role === 'owner' ? '/owner' : '/account/bookings';
      navigate(location.state?.from || redirect, { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not log in. Check your credentials.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <AuthVisual
        title="Plan the trail. Book the stay."
        subtitle="Log back in to pick up your route — saved trips, offers and bookings, all where you left them."
      />

      <div className="auth-form-side">
        <div className="auth-card">
          <div className="auth-brand">
            <span className="brand-mark" />
            Tripzo
          </div>
          <h2 style={{ marginBottom: 4 }}>Welcome back</h2>
          <p className="muted" style={{ marginBottom: 22 }}>Log in to continue your trail.</p>

          <Alert>{error}</Alert>

          <form onSubmit={submit}>
            <div className="field">
              <label>Email</label>
              <input type="email" name="email" required value={form.email} onChange={change} placeholder="you@example.com" />
            </div>
            <div className="field field-password">
              <label>Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={form.password}
                onChange={change}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="field-password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            <button className="btn btn-primary btn-block" disabled={loading} type="submit">
              {loading && <span className="btn-spinner" />}
              {loading ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <p className="auth-foot">
            New to Tripzo? <Link to="/register">Create an account</Link>
            <br />
            Have a property? <Link to="/register-owner">List it on Tripzo</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
