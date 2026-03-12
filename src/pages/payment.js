import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './payment.css';

const paymentModes = [
  { value: 'card', label: 'Card' },
  { value: 'upi', label: 'UPI' },
  { value: 'netbanking', label: 'Net Banking' },
  { value: 'cod', label: 'Cash on Delivery' }
];

function Payment() {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('card');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Delivery details state
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');

  // Payment specific details
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [upi, setUpi] = useState('');
  const [bank, setBank] = useState('');

  const getUserIdFromToken = (token) => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || payload.id || payload._id;
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const userId = getUserIdFromToken(token);
    if (!userId) {
      setError("You must be logged in to place an order.");
      setLoading(false);
      return;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      setLoading(false);
      return;
    }

    // Format the cart items for the order schema (product schema ref + quantity + price)
    const formattedItems = cartItems.map(item => ({
      product: item._id,
      quantity: item.quantity,
      price: item.price
    }));

    const orderPayload = {
      user: userId,
      items: formattedItems,
      address: {
        name: 'backend_override_placeholder',
        phone: 'backend_override_placeholder',
        addressLine,
        city,
        pincode
      },
      paymentType: mode.toUpperCase() === 'COD' ? 'COD' : 'ONLINE',
      status: 'Confirmed'
    };

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      await axios.post('/api/orders', orderPayload, config);
      
      setSuccess(true);
      await clearCart();
      setTimeout(() => navigate('/orders'), 3000);
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err.response?.data?.message || "Failed to place order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-container">
      <div className="payment-card">
        <h2>Payment</h2>
        <div className="payment-summary">
          <span>Total Amount:</span>
          <span className="payment-total">₹{getCartTotal().toFixed(2)}</span>
        </div>
        <div className="payment-modes">
          {paymentModes.map(pm => (
            <button
              key={pm.value}
              className={`mode-btn${mode === pm.value ? ' active' : ''}`}
              onClick={() => setMode(pm.value)}
              type="button"
            >
              {pm.label}
            </button>
          ))}
        </div>
        {success ? (
          <div className="payment-success">
            <h3>Order Placed Successfully!</h3>
            <p>Thank you for shopping with Cool Couture.</p>
            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>Redirecting to your orders...</p>
          </div>
        ) : (
          <form className="payment-form" onSubmit={handleSubmit}>
            {error && <div className="error-banner" style={{ background: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>{error}</div>}
            
            <div className="delivery-details-section" style={{ marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
              <h3 style={{ marginBottom: '15px', color: '#333' }}>Delivery Details</h3>
              
              <label>Address Line</label>
              <input type="text" value={addressLine} onChange={e => setAddressLine(e.target.value)} required placeholder="123 Example Street, Apt 4B" />
              
              <div className="payment-row">
                <div>
                  <label>City</label>
                  <input type="text" value={city} onChange={e => setCity(e.target.value)} required placeholder="Mumbai" />
                </div>
                <div>
                  <label>Pincode</label>
                  <input type="text" value={pincode} onChange={e => setPincode(e.target.value)} required placeholder="400001" maxLength={6} />
                </div>
              </div>
            </div>

            <h3 style={{ marginBottom: '15px', color: '#333' }}>Payment details</h3>
            {mode === 'card' && (
              <>
                <label>Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value)}
                  required
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
                <div className="payment-row">
                  <div>
                    <label>Expiry</label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={e => setExpiry(e.target.value)}
                      required
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                  </div>
                  <div className="cvv-col">
                    <label>CVV</label>
                    <input
                      type="password"
                      value={cvv}
                      onChange={e => setCvv(e.target.value)}
                      required
                      placeholder="123"
                      maxLength={4}
                      className="cvv-input"
                    />
                  </div>
                </div>
              </>
            )}
            {mode === 'upi' && (
              <>
                <label>UPI ID</label>
                <input
                  type="text"
                  value={upi}
                  onChange={e => setUpi(e.target.value)}
                  required
                  placeholder="yourname@upi"
                />
              </>
            )}
            {mode === 'netbanking' && (
              <>
                <label>Select Bank</label>
                <select value={bank} onChange={e => setBank(e.target.value)} required>
                  <option value="">Choose Bank</option>
                  <option value="sbi">SBI</option>
                  <option value="hdfc">HDFC</option>
                  <option value="icici">ICICI</option>
                  <option value="axis">Axis</option>
                  <option value="kotak">Kotak</option>
                </select>
              </>
            )}
            {mode === 'cod' && (
              <div className="cod-info">
                <p>Pay with cash when your order is delivered.</p>
              </div>
            )}
            <button type="submit" className="pay-btn" disabled={loading}>
              {loading ? 'Processing...' : (mode === 'cod' ? 'Place Order' : 'Pay Now')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Payment;
