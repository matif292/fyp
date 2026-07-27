import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { registerTraveler } from '../api/auth';
import { apiErrorMessage } from '../api/client';
import { Alert } from '../components/Feedback';
import AuthVisual from '../components/AuthVisual';

export default function Register() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    date_of_birth: '',
    preferred_language: 'en',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await registerTraveler(form);
      navigate('/verify-otp', { state: { email: form.email } });
    } catch (err) {
      setError(apiErrorMessage(err, 'Registration failed. Please check your details.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <AuthVisual
        title="Every trip starts with one stop."
        subtitle="Create your traveler account to save trips, chat with owners and unlock member offers."
      />

      <div className="auth-form-side">
        <div className="auth-card">
          <div className="auth-brand">
            <span className="brand-mark" />
            Tripzo
          </div>
          <h2 style={{ marginBottom: 4 }}>Create your account</h2>
          <p className="muted" style={{ marginBottom: 22 }}>Start planning your next route.</p>

          <Alert>{error}</Alert>

          <form onSubmit={submit}>
            <div className="field">
              <label>Full name</label>
              <input name="full_name" required value={form.full_name} onChange={change} placeholder="Jane Doe" />
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" name="email" required value={form.email} onChange={change} placeholder="you@example.com" />
            </div>
            <div className="field">
              <label>Phone</label>
              <input name="phone" required value={form.phone} onChange={change} placeholder="+923001234567" />
            </div>
            <div className="field field-password">
              <label>Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={form.password}
                onChange={change}
                placeholder="At least 8 characters"
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
            <div className="field">
              <label>Date of birth</label>
              <input type="date" name="date_of_birth" required value={form.date_of_birth} onChange={change} />
            </div>
            <button className="btn btn-primary btn-block" disabled={loading} type="submit">
              {loading && <span className="btn-spinner" />}
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="auth-foot">
            Already have an account? <Link to="/login">Log in</Link>
            <br />
            Have a property? <Link to="/register-owner">List it on Tripzo</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
