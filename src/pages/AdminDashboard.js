import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

function AdminDashboard() {
  const { token, isAdmin, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAdmin || !token) return;

    const fetchUsers = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        const res = await axios.get('/api/users', config);
        setUsers(res.data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load user list.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isAdmin, token]);

  const toggleAdmin = async (userId) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const res = await axios.put(`/api/users/${userId}/admin`, {}, config);
      
      // Update local state with the returned user
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId ? { ...user, isAdmin: res.data.isAdmin } : user
        )
      );
    } catch (err) {
      console.error('Error toggling admin status:', err);
      alert(err.response?.data?.message || 'Failed to change admin status.');
    }
  };

  
  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: 'var(--primary-color)' }}>Admin Dashboard</h1>
        <button onClick={logout} style={{
          background: 'linear-gradient(90deg, #ff7043 60%, #ffa07a 100%)',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '20px',
          cursor: 'pointer'
        }}>
          Logout Admin
        </button>
      </div>

      <div style={{ marginTop: '2rem', padding: '2rem', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <h2>User Management</h2>
        <p style={{ color: '#666', marginBottom: '1rem' }}>Manage system administrators and review registered users.</p>
        
        {error && <div style={{ padding: '10px', background: '#ffebee', color: '#c62828', borderRadius: '5px', marginBottom: '1rem' }}>{error}</div>}
        
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '12px' }}>Name</th>
                  <th style={{ padding: '12px' }}>Contact</th>
                  <th style={{ padding: '12px' }}>Role</th>
                  <th style={{ padding: '12px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>{user.name}</td>
                    <td style={{ padding: '12px' }}>{user.email || user.phone}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '12px', 
                        fontSize: '0.85rem',
                        background: user.isAdmin ? '#e8f5e9' : '#f5f5f5',
                        color: user.isAdmin ? '#2e7d32' : '#666'
                      }}>
                        {user.isAdmin ? 'Administrator' : 'User'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button 
                        onClick={() => toggleAdmin(user._id)}
                        style={{
                          background: user.isAdmin ? '#f44336' : '#4caf50',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.85rem'
                        }}
                      >
                        {user.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ padding: '12px', textAlign: 'center' }}>No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
