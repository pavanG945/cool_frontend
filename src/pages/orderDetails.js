import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './orders.css';

function OrderDetails() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchOrder() {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`/api/orders/${orderId}`);
        setOrder(res.data);
      } catch (err) {
        setError('Failed to fetch order details.');
      } finally {
        setLoading(false);
      }
    }
    if (orderId) fetchOrder();
  }, [orderId]);

  return (
    <div className="container">
      <Link to="/orders" style={{ color: '#ff7043', textDecoration: 'underline', marginBottom: '1rem', display: 'inline-block' }}>&larr; Back to Orders</Link>
      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div>Loading...</div>
      ) : error ? (
        <div className="error-banner">{error}</div>
      ) : !order ? (
        <div className="no-orders">Order not found.</div>
      ) : (
        <div className="order-card" style={{ maxWidth: 700, margin: '0 auto' }}>
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
      )}
    </div>
  );
}

export default OrderDetails; 