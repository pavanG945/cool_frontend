import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './login.css';

function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('user'); // 'user' or 'admin'
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (role === 'admin') {
        const res = await axios.post('/api/users/admin-login', { identifier, password });
        login(res.data.token, res.data.user);
        navigate('/admin');
      } else {
        const res = await axios.post('/api/users/login', { identifier, password });
        login(res.data.token, res.data.user);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Login to Cool Couture</h2>
        
        <div style={{ display: 'flex', marginBottom: '20px', borderBottom: '2px solid #eee' }}>
          <button 
            type="button" 
            onClick={() => { setRole('user'); setError(''); }}
            style={{ 
              flex: 1, padding: '10px', border: 'none', background: 'none', 
              borderBottom: role === 'user' ? '2px solid #ff7043' : 'none', 
              color: role === 'user' ? '#ff7043' : '#666', 
              fontWeight: role === 'user' ? 'bold' : 'normal', cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            User
          </button>
          <button 
            type="button" 
            onClick={() => { setRole('admin'); setError(''); }}
            style={{ 
              flex: 1, padding: '10px', border: 'none', background: 'none', 
              borderBottom: role === 'admin' ? '2px solid #ff7043' : 'none', 
              color: role === 'admin' ? '#ff7043' : '#666', 
              fontWeight: role === 'admin' ? 'bold' : 'normal', cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            placeholder="Email or phone number"
            required
          />
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
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
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p>
          <Link to="/forgot-password">Forgot password?</Link>
        </p>
        <p>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
        <p>
          <Link to="/">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
