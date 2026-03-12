import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './orders.css';

function getUserIdFromToken(token) {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Debug: log payload
    console.log('Decoded JWT payload:', payload);
    return payload.userId || payload.id || payload._id;
  } catch (e) {
    console.error('Failed to decode JWT:', e);
    return null;
  }
}

function Orders() {
  const { token } = useAuth();
  const userId = getUserIdFromToken(token);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      setError('');
      try {
        if (!userId) {
          setError('User not logged in or invalid token.');
          setLoading(false);
          return;
        }
        const res = await axios.get(`/api/orders/user/${userId}`);
        setOrders(res.data);
      } catch (err) {
        let msg = 'Failed to fetch orders.';
        if (err.response && err.response.data && err.response.data.message) {
          msg += ' ' + err.response.data.message;
        }
        setError(msg);
        console.error('Order fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [userId]);

  const handleOrderClick = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  return (
    <div className="container">
      <h2>My Orders</h2>
      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div>Loading...</div>
      ) : error ? (
        <div className="error-banner">{error}</div>
      ) : orders.length === 0 ? (
        <div className="no-orders">No orders found.</div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div className="order-card" key={order._id} onClick={() => handleOrderClick(order._id)}>
              <div className="order-header">
                <span className={`order-status ${order.status.toLowerCase()}`}>{order.status}</span>
                <span className="order-date">{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <div className="order-items">
                {order.items.map(item => (
                  <div className="order-item" key={item.product?._id || item.product}>
                    <img src={item.product?.images?.[0]} alt={item.product?.name} className="order-item-img" />
                    <div className="order-item-info">
                      <div className="order-item-name">{item.product?.name}</div>
                      <div className="order-item-qty">Qty: {item.quantity}</div>
                      <div className="order-item-price">₹{item.price}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="order-address">
                <strong>Address:</strong> {order.address.name}, {order.address.phone}, {order.address.addressLine}, {order.address.city}, {order.address.pincode}
              </div>
              <div className="order-payment">
                <strong>Payment:</strong> {order.paymentType}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders; 