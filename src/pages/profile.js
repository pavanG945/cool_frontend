import React from 'react';
import './profile.css';
import { useAuth } from '../context/AuthContext';

// Default profile image
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

function Profile() {
  const { token } = useAuth();
  const user = getUserFromToken(token);

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-image-wrap">
          <img
            src={user && user.image ? user.image : DEFAULT_IMAGE}
            alt="Profile"
            className="profile-image"
          />
        </div>
        <h2 className="profile-name">{user?.name || 'User'}</h2>
        <p className="profile-email">{user?.email || 'user@email.com'}</p>
        {/* Add more details here if available */}
        {/* <p className="profile-phone">{user?.phone}</p> */}
        {/* <p className="profile-address">{user?.address}</p> */}
        <button className="edit-profile-btn" disabled>Edit Profile</button>
      </div>
    </div>
  );
}

export default Profile; 