import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './login.css'; // Reuse your login styles

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
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
      const res = await axios.post('/api/users/register', {
        name, email, phone, password
      });
      if (res.data?.user?.name) {
        alert(`Welcome, ${res.data.user.name}!`);
      } else {
        alert('Welcome to Cool Couture!');
      }
      login(res.data.token, res.data.user); // Log in user after registration
      
      if (res.data.user && res.data.user.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/'); // Redirect to home
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container animated-in">
        <h2>Register for Cool Couture</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <label>Name</label>
          <input
            type="text"
            value={name}
            autoFocus
            onChange={e => setName(e.target.value)}
            required
            placeholder="Your Name"
          />
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
          <label>Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="Your phone number"
            required
          />
          <label>Password</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Create a password"
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
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;