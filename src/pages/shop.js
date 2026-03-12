import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './shop.css';

function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const { isLoggedIn, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('/api/products');
        setProducts(res.data);
      } catch (err) {
        setError('Failed to load products.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = async (product) => {
    if (!isLoggedIn) {
      alert('Please login to add items to your cart.');
      navigate('/login');
      return;
    }
    
    if (product.stock <= 0) {
      alert('This product is out of stock.');
      return;
    }

    try {
      await addToCart(product);
      
      // Optimitically update the local state to decrease the stock shown on the UI
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p._id === product._id ? { ...p, stock: p.stock - 1 } : p
        )
      );
    } catch (err) {
      console.error("Failed to add to cart:", err);
    }
  };

  // Group products by category
  const clothes = products.filter(p => (p.category || '').toLowerCase().includes('clothes'));
  const accessories = products.filter(p => (p.category || '').toLowerCase().includes('accessories'));
  const others = products.filter(p => !clothes.includes(p) && !accessories.includes(p));

  const renderProductCard = (product) => {
    const isOutOfStock = product.stock <= 0;
    
    return (
      <div className={`product-card ${isOutOfStock ? 'out-of-stock-card' : ''}`} key={product._id}>
        <div className="product-image-container">
          <img src={product.images[0]} alt={product.name} />
          {isOutOfStock && <div className="out-of-stock-badge">Out of Stock</div>}
        </div>
        <h3>{product.name}</h3>
        <p className="price">₹{product.price}</p>
        <p className="stock-info">{product.stock} items left</p>
        {!isAdmin && (
          <button 
            className="add-cart-btn" 
            onClick={() => handleAddToCart(product)}
            disabled={isOutOfStock}
            style={isOutOfStock ? { backgroundColor: '#ccc', cursor: 'not-allowed', color: '#666' } : {}}
          >
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="container shop-container">
      <h1 className="shop-title">Shop All Products</h1>
      {error && <div className="error-banner">{error}</div>}
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      ) : (
        <>
          <section className="shop-section">
            <h2 className="section-title">Clothes</h2>
            <div className="product-grid">
              {clothes.length === 0 ? <p>No clothes found.</p> : clothes.map(renderProductCard)}
            </div>
          </section>
          <section className="shop-section">
            <h2 className="section-title">Accessories</h2>
            <div className="product-grid">
              {accessories.length === 0 ? <p>No accessories found.</p> : accessories.map(renderProductCard)}
            </div>
          </section>
          {others.length > 0 && (
            <section className="shop-section">
              <h2 className="section-title">Other Products</h2>
              <div className="product-grid">
                {others.map(renderProductCard)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default Shop;