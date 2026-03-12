import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './login.css';

function ForgotPassword() {
  const [step, setStep] = useState(1); // 1 = enter email, 2 = enter code + new password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await axios.post('/api/users/forgot-password', { email });
      setMessage(res.data.message || 'If an account exists, a reset code has been sent.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await axios.post('/api/users/reset-password', {
        email,
        code,
        newPassword
      });
      setMessage(res.data.message || 'Password updated successfully. You can now login.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Reset your password</h2>

        {step === 1 && (
          <form onSubmit={handleRequestCode} className="login-form">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your account email"
              required
            />
            {error && <p className="error">{error}</p>}
            {message && <p className="success-message">{message}</p>}
            <button type="submit" disabled={loading}>
              {loading ? 'Sending code...' : 'Send reset code'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword} className="login-form">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter the 6-digit code from your email"
              required
            />
            <div className="password-input-wrapper">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                required
                minLength={6}
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowNewPassword(prev => !prev)}
              >
                {showNewPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {error && <p className="error">{error}</p>}
            {message && <p className="success-message">{message}</p>}
            <button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update password'}
            </button>
          </form>
        )}

        <p>
          Remembered your password? <Link to="/login">Back to login</Link>
        </p>
        <p>
          <Link to="/">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;

