import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { verifyOtp, resendOtp } from '../api/auth';
import { apiErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../components/Feedback';
import { ShieldCheck, MailCheck } from 'lucide-react';

const OTP_LENGTH = 6;
const OTP_SECONDS = 180; // 3 minutes

/**
 * OTP verification — Figure 5.4 style.
 * 6 separate digit boxes with auto-advance, backspace navigation and paste
 * support, a live "OTP will expire in mm:ss" countdown, and a resend link.
 */
export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState(location.state?.email || '');
  const isOwner = location.state?.isOwner;
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [info, setInfo] = useState(
    isOwner ? 'Your account is pending admin approval after verification.' : ''
  );
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(OTP_SECONDS);
  const [editingEmail, setEditingEmail] = useState(!location.state?.email);
  const boxRefs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  const expired = secondsLeft <= 0;
  const otp = digits.join('');

  const setDigit = (i, val) => {
    const v = val.replace(/\D/g, '');
    setDigits((prev) => {
      const next = [...prev];
      next[i] = v.slice(-1);
      return next;
    });
    if (v && i < OTP_LENGTH - 1) boxRefs.current[i + 1]?.focus();
  };

  const onKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      boxRefs.current[i - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && i > 0) boxRefs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < OTP_LENGTH - 1) boxRefs.current[i + 1]?.focus();
  };

  const onPaste = (e) => {
    const text = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!text) return;
    e.preventDefault();
    const next = Array(OTP_LENGTH).fill('');
    text.split('').forEach((c, idx) => (next[idx] = c));
    setDigits(next);
    boxRefs.current[Math.min(text.length, OTP_LENGTH - 1)]?.focus();
  };

  const submit = async (e) => {
    e.preventDefault();
    if (otp.length < OTP_LENGTH) {
      setError('Please enter the full 6-digit code.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await verifyOtp({ email, otp });
      if (data.token) {
        login(data.token, data.user);
        const redirect =
          data.user.role === 'admin' ? '/admin' : data.user.role === 'owner' ? '/owner' : '/account/bookings';
        navigate(redirect, { replace: true });
      } else {
        setInfo('Email verified. You can log in once your account is approved.');
      }
    } catch (err) {
      setError(apiErrorMessage(err, 'Invalid or expired OTP.'));
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setError('');
    setResending(true);
    try {
      await resendOtp({ email });
      setInfo('A new OTP has been sent to your email.');
      setDigits(Array(OTP_LENGTH).fill(''));
      setSecondsLeft(OTP_SECONDS);
      boxRefs.current[0]?.focus();
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not resend OTP.'));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card tz-reveal">
        <div className="auth-brand" style={{ justifyContent: 'center' }}>
          <span className="brand-mark" />
          Tripzo
        </div>

        <div className="otp-hero">
          <MailCheck size={38} />
        </div>

        <h2 style={{ marginBottom: 4, textAlign: 'center' }}>Verify your email</h2>
        <p className="muted" style={{ marginBottom: 6, textAlign: 'center' }}>
          We have sent a 6-digit OTP to
        </p>
        <p style={{ textAlign: 'center', fontWeight: 700, marginBottom: 18, fontSize: 14 }}>
          {editingEmail ? (
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ maxWidth: 260, margin: '0 auto', display: 'block', textAlign: 'center' }}
            />
          ) : (
            <>
              {email}{' '}
              <button
                type="button"
                onClick={() => setEditingEmail(true)}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: 13.5 }}
              >
                Change
              </button>
            </>
          )}
        </p>

        <Alert>{error}</Alert>
        <Alert type="success">{info}</Alert>

        <form onSubmit={submit}>
          <p className="muted" style={{ textAlign: 'center', fontSize: 13, marginBottom: 8 }}>
            Enter the OTP code below
          </p>
          <div className="otp-boxes" onPaste={onPaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => (boxRefs.current[i] = el)}
                className={`otp-box${d ? ' filled' : ''}`}
                inputMode="numeric"
                autoComplete={i === 0 ? 'one-time-code' : 'off'}
                maxLength={2}
                value={d}
                onChange={(e) => setDigit(i, e.target.value)}
                onKeyDown={(e) => onKeyDown(i, e)}
                aria-label={`Digit ${i + 1}`}
              />
            ))}
          </div>

          <p className={`otp-timer${expired ? ' expired' : ''}`}>
            {expired ? (
              <>OTP expired — request a new one below</>
            ) : (
              <>OTP will expire in <strong>{mm}:{ss}</strong></>
            )}
          </p>

          <button
            className="btn btn-primary btn-block"
            disabled={loading || otp.length < OTP_LENGTH}
            type="submit"
          >
            {loading ? 'Verifying…' : 'Verify OTP'}
          </button>
        </form>

        <div className="otp-divider">or</div>

        <p className="otp-resend">
          Didn&rsquo;t receive the code?{' '}
          <button type="button" onClick={resend} disabled={resending || !email}>
            {resending ? 'Sending…' : 'Resend OTP'}
          </button>
        </p>

        <div className="otp-secure">
          <ShieldCheck size={20} />
          For your security, never share your OTP with anyone.
        </div>

        <p className="auth-foot">
          <Link to="/login">Back to log in</Link>
        </p>
      </div>
    </div>
  );
}
