import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { registerOwner } from '../api/auth';
import { apiErrorMessage } from '../api/client';
import { Alert } from '../components/Feedback';
import AuthVisual from '../components/AuthVisual';

const initialFields = {
  full_name: '',
  email: '',
  phone: '',
  password: '',
  date_of_birth: '',
  cnic_number: '',
  business_reg_number: '',
  bank_name: '',
  account_title: '',
  account_number: '',
  iban: '',
};

export default function RegisterOwner() {
  const [form, setForm] = useState(initialFields);
  const [files, setFiles] = useState({ cnic_front: null, cnic_back: null, business_license: null, bank_letter: null });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const changeFile = (e) => setFiles({ ...files, [e.target.name]: e.target.files[0] || null });

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!files.cnic_front || !files.cnic_back) {
      setError('CNIC front and back images are required.');
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, val]) => fd.append(key, val));
      Object.entries(files).forEach(([key, file]) => {
        if (file) fd.append(key, file);
      });

      await registerOwner(fd);
      navigate('/verify-otp', { state: { email: form.email, isOwner: true } });
    } catch (err) {
      setError(apiErrorMessage(err, 'Registration failed. Please check your details and documents.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <AuthVisual
        eyebrow="Tripzo for Owners"
        title="List your stay. Meet your guests."
        subtitle="Owner accounts are reviewed manually before you can publish listings — usually within 1–2 business days."
      />

      <div className="auth-form-side">
        <div className="auth-card wide">
          <div className="auth-brand">
            <span className="brand-mark" />
            Tripzo for Owners
          </div>
          <h2 style={{ marginBottom: 4 }}>List your property</h2>
          <p className="muted" style={{ marginBottom: 22 }}>
            Owner accounts are reviewed manually before you can publish listings.
          </p>

          <Alert>{error}</Alert>

          <form onSubmit={submit}>
            <h4 className="auth-section-title">
              <span className="auth-section-num">1</span> Personal details
            </h4>
            <div className="form-grid">
              <div className="field">
                <label>Full name</label>
                <input name="full_name" required value={form.full_name} onChange={change} />
              </div>
              <div className="field">
                <label>Email</label>
                <input type="email" name="email" required value={form.email} onChange={change} />
              </div>
              <div className="field">
                <label>Phone</label>
                <input name="phone" required value={form.phone} onChange={change} placeholder="+923001234568" />
              </div>
              <div className="field field-password">
                <label>Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={form.password}
                  onChange={change}
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
              <div className="field">
                <label>CNIC number</label>
                <input name="cnic_number" required value={form.cnic_number} onChange={change} placeholder="42201-1234567-8" />
              </div>
            </div>

            <h4 className="auth-section-title">
              <span className="auth-section-num">2</span> Business &amp; banking
            </h4>
            <div className="form-grid">
              <div className="field">
                <label>Business registration no.</label>
                <input name="business_reg_number" value={form.business_reg_number} onChange={change} placeholder="BR-2024-001" />
              </div>
              <div className="field">
                <label>Bank name</label>
                <input name="bank_name" required value={form.bank_name} onChange={change} />
              </div>
              <div className="field">
                <label>Account title</label>
                <input name="account_title" required value={form.account_title} onChange={change} />
              </div>
              <div className="field">
                <label>Account number</label>
                <input name="account_number" required value={form.account_number} onChange={change} />
              </div>
              <div className="field full">
                <label>IBAN</label>
                <input name="iban" required value={form.iban} onChange={change} placeholder="PK36MEZN1234567890" />
              </div>
            </div>

            <h4 className="auth-section-title">
              <span className="auth-section-num">3</span> Verification documents
            </h4>
            <div className="form-grid">
              <div className="field">
                <label>CNIC front</label>
                <input type="file" name="cnic_front" accept="image/*" required onChange={changeFile} />
              </div>
              <div className="field">
                <label>CNIC back</label>
                <input type="file" name="cnic_back" accept="image/*" required onChange={changeFile} />
              </div>
              <div className="field">
                <label>Business license (optional)</label>
                <input type="file" name="business_license" accept="image/*,.pdf" onChange={changeFile} />
              </div>
              <div className="field">
                <label>Bank letter (optional)</label>
                <input type="file" name="bank_letter" accept="image/*,.pdf" onChange={changeFile} />
              </div>
            </div>

            <button className="btn btn-primary btn-block" disabled={loading} type="submit">
              {loading && <span className="btn-spinner" />}
              {loading ? 'Submitting…' : 'Submit for review'}
            </button>
          </form>

          <p className="auth-foot">
            Just traveling? <Link to="/register">Create a traveler account instead</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
