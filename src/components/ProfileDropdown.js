import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiPackage } from 'react-icons/fi';
import './ProfileDropdown.css';

const DEFAULT_IMAGE = 'https://ui-avatars.com/api/?name=User&background=ff7043&color=fff&size=128&rounded=true';

function getUserFromToken(token) {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
}

function ProfileDropdown() {
  const { token, logout } = useAuth();
  const user = getUserFromToken(token);
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/login');
  };

  return (
    <div className="profile-dropdown-wrap" ref={ref}>
      <button className="profile-dropdown-trigger" onClick={() => setOpen((v) => !v)}>
        <img
          src={user && user.image ? user.image : DEFAULT_IMAGE}
          alt="Profile"
          className="profile-dropdown-avatar"
        />
      </button>
      {open && (
        <div className="profile-dropdown-menu">
          <div className="profile-dropdown-header">
            <img
              src={user && user.image ? user.image : DEFAULT_IMAGE}
              alt="Profile"
              className="profile-dropdown-avatar-lg"
            />
            <div className="profile-dropdown-userinfo">
              <div className="profile-dropdown-name" style={{ fontWeight: 'bold' }}>{user?.name || 'User'}</div>
              <div className="profile-dropdown-email">{user?.phone || user?.email || ''}</div>
            </div>
          </div>
          <hr className="profile-dropdown-divider" />
          {(!user || !user.isAdmin) && (
            <Link to="/orders" className="profile-dropdown-item orders" onClick={() => setOpen(false)}>
              <FiPackage size={20} style={{ color: '#ff7043' }} /> My Orders
            </Link>
          )}
          <button className="profile-dropdown-item logout" onClick={handleLogout}>
            <FiLogOut size={20} style={{ color: '#ff7043' }} /> Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileDropdown; 