import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [clearCartCallback, setClearCartCallback] = useState(null);

  useEffect(() => {
    if (token && !user) {
      fetch('/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data && data.id) {
          setUser(data);
          localStorage.setItem('user', JSON.stringify(data));
        }
      })
      .catch(err => console.error("Failed to hydrate user context:", err));
    }
  }, [token, user]);

  const login = (newToken, userData) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    if (userData) {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    }
  };

  const logout = () => {
    // Clear all user-specific data
    const oldToken = token;
    if (oldToken) {
      try {
        const payload = JSON.parse(atob(oldToken.split('.')[1]));
        const userId = payload.userId;
        localStorage.removeItem(`cartItems_${userId}`); // Remove user's cart
      } catch (e) {
        // If token decode fails, clear generic cart
        localStorage.removeItem('cartItems');
      }
    }
    
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear cart state
    if (clearCartCallback) clearCartCallback();
  };

  const isLoggedIn = !!token;

  const isAdmin = React.useMemo(() => {
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return !!payload.isAdmin;
    } catch {
      return false;
    }
  }, [token]);

  const setCartClearCallback = (cb) => setClearCartCallback(() => cb);

  return (
    <AuthContext.Provider value={{ 
      token, 
      user,
      login, 
      logout, 
      isLoggedIn, 
      isAdmin,
      setCartClearCallback 
    }}>
      {children}
    </AuthContext.Provider>
  );
}
