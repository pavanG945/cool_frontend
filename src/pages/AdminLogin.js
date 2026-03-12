import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './login.css';

function AdminLogin() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/users/admin-login', { identifier, password });
      login(res.data.token);
      navigate('/admin'); // Success! Go to dashboard automatically.
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Admin Portal Login</h2>
        <p style={{ textAlign: 'center', marginBottom: '1rem', color: '#666' }}>Secure area restricted to Cool Couture Administrators.</p>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            placeholder="Admin Email"
            required
          />
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Admin Password"
              required
            />
            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => setShowPassword(prev => !prev)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading} style={{ background: 'linear-gradient(90deg, #111 0%, #333 100%)' }}>
            {loading ? 'Authenticating...' : 'Admin Login'}
          </button>
        </form>
        <p>
          Not an administrator? <Link to="/login">Go to standard login</Link>
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;
