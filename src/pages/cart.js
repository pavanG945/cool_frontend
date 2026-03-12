import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import './cart.css';

function Cart() {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getCartTotal, 
    getTotalItems 
  } = useCart();

  return (
    <div className="container">
      <h2>Your Shopping Cart</h2>
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty.</p>
          <Link to="/" className="continue-shopping">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="cart-content">
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
            <div className="cart-actions">
              <button onClick={clearCart} className="clear-cart">
                Clear Cart
              </button>
              <Link to="/payment" className="checkout-btn">
                Proceed to Payment
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;