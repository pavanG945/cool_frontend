import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Checkout() {
  const { cartItems, getCartTotal, getTotalItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();

  // Address state
  const [address, setAddress] = useState({
    name: '',
    phone: '',
    addressLine: '',
    city: '',
    pincode: ''
  });
  const [paymentType, setPaymentType] = useState('COD');
  const [mobile, setMobile] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [loading, setLoading] = useState(false);

  // Get userId from token
  function getUserIdFromToken(token) {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || payload.id || payload._id;
    } catch {
      return null;
    }
  }
  const userId = getUserIdFromToken(token);

  // Handle address change
  const handleAddressChange = e => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  // Handle OTP send (simulate)
  const handleSendOtp = e => {
    e.preventDefault();
    if (!mobile || mobile.length < 10) {
      setOtpError('Enter a valid mobile number');
      return;
    }
    setOtpSent(true);
    setOtpError('');
  };

  // Handle order placement
  const handlePlaceOrder = async e => {
    e.preventDefault();
    setOtpError('');
    setOrderStatus('');
    if (paymentType === 'COD') {
      if (!otpSent) {
        setOtpError('Please send OTP to your mobile number');
        return;
      }
      if (otp !== '123456') {
        setOtpError('Invalid OTP. Please enter 123456 for demo.');
        return;
      }
    }
    // Validate address
    if (!address.name || !address.phone || !address.addressLine || !address.city || !address.pincode) {
      setOtpError('Please fill all address fields.');
      return;
    }
    setLoading(true);
    try {
      const orderData = {
        user: userId,
        items: cartItems.map(item => ({
          product: item._id,
          quantity: item.quantity,
          price: item.price
        })),
        address,
        paymentType,
        status: 'Confirmed'
      };
      await axios.post('/api/orders', orderData);
      setOrderStatus('Order placed successfully!');
      clearCart();
      setTimeout(() => navigate('/orders'), 1200);
    } catch (err) {
      setOtpError('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Debug: log paymentType and OTP state
  React.useEffect(() => {
    console.log('Payment type:', paymentType, 'OTP sent:', otpSent, 'OTP:', otp);
  }, [paymentType, otpSent, otp]);

  return (
    <div className="container">
      <h2>Checkout</h2>
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty.</p>
          <Link to="/" className="continue-shopping">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <form className="cart-content" onSubmit={handlePlaceOrder}>
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item._id} className="cart-item">
                <img 
                  src={item.images[0]} 
                  alt={item.name}
                  className="item-image"
                />
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p className="item-price">₹{item.price}</p>
                  <div className="quantity-controls">
                    <label>Quantity:</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={e => updateQuantity(item._id, parseInt(e.target.value))}
                      className="quantity-input"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={() => removeFromCart(item._id)}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                </div>
                <div className="item-total">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Items ({getTotalItems()}):</span>
              <span>₹{getCartTotal().toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <strong>
                <span>Total: ₹{getCartTotal().toFixed(2)}</span>
              </strong>
            </div>
            <div className="address-section">
              <h4>Shipping Address</h4>
              <input type="text" name="name" placeholder="Full Name" value={address.name} onChange={handleAddressChange} required />
              <input type="text" name="phone" placeholder="Mobile Number" value={address.phone} onChange={handleAddressChange} required />
              <input type="text" name="addressLine" placeholder="Address" value={address.addressLine} onChange={handleAddressChange} required />
              <input type="text" name="city" placeholder="City" value={address.city} onChange={handleAddressChange} required />
              <input type="text" name="pincode" placeholder="Pincode" value={address.pincode} onChange={handleAddressChange} required />
            </div>
            <div className="payment-section">
              <h4>Payment Method</h4>
              <label>
                <input type="radio" name="paymentType" value="COD" checked={paymentType === 'COD'} onChange={() => setPaymentType('COD')} />
                Cash on Delivery (COD)
              </label>
              {/* You can add more payment options here */}
            </div>
            {paymentType === 'COD' && (
              <div className="otp-section">
                <h4>Mobile Verification (COD)</h4>
                <ol style={{marginBottom: '0.5rem', color: '#444', fontSize: '0.98rem'}}>
                  <li>Enter your mobile number and click <b>Send OTP</b>.</li>
                  <li>Enter the OTP you receive (demo: <b>123456</b>).</li>
                  <li>Click <b>Place Order</b> to confirm.</li>
                </ol>
                <input
                  type="text"
                  placeholder="Enter Mobile Number"
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  maxLength={10}
                  required
                />
                <button type="button" className="send-otp-btn" onClick={handleSendOtp} disabled={otpSent}>
                  {otpSent ? 'OTP Sent' : 'Send OTP'}
                </button>
                {otpSent && (
                  <>
                    <input
                      type="text"
                      placeholder="Enter OTP (123456)"
                      value={otp}
                      onChange={e => setOtp(e.target.value)}
                      maxLength={6}
                      required
                    />
                  </>
                )}
                <div className="otp-hint">Demo OTP: <b>123456</b></div>
              </div>
            )}
            {otpError && <div className="error-banner">{otpError}</div>}
            {orderStatus && <div className="success-banner">{orderStatus}</div>}
            <div className="cart-actions">
              <button type="submit" className="checkout-btn" disabled={loading}>
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default Checkout;