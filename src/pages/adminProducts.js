import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './adminProducts.css';

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [editingId, setEditingId] = useState(null);

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

  const resetForm = () => {
    setName('');
    setPrice('');
    setImageUrl('');
    setDescription('');
    setCategory('');
    setStock('');
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !price || !imageUrl) {
      setError('Name, price and image URL are required.');
      return;
    }

    try {
      const payload = {
        name,
        price: Number(price),
        images: [imageUrl],
        description,
        category,
        stock: stock ? Number(stock) : 0,
      };

      if (editingId) {
        const res = await axios.put(`/api/products/${editingId}`, payload);
        setProducts(prev =>
          prev.map(p => (p._id === editingId ? res.data : p))
        );
      } else {
        const res = await axios.post('/api/products', payload);
        setProducts(prev => [...prev, res.data]);
      }

      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || (editingId ? 'Failed to update product.' : 'Failed to add product.'));
    }
  };

  const handleEditClick = (product) => {
    setEditingId(product._id);
    setName(product.name || '');
    setPrice(product.price != null ? String(product.price) : '');
    setImageUrl(product.images && product.images[0] ? product.images[0] : '');
    setDescription(product.description || '');
    setCategory(product.category || '');
    setStock(product.stock != null ? String(product.stock) : '');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`/api/products/${id}`);
      setProducts(prev => prev.filter(p => p._id !== id));
      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  return (
    <div className="admin-container">
      <h1 className="admin-title">Admin – Manage Products</h1>

      {error && <div className="admin-error">{error}</div>}

      <section className="admin-section">
        <h2>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
        <form className="admin-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Product name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Price (₹)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min="0"
          />
          <input
            type="text"
            placeholder="Image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Category (e.g. Clothes, Accessories)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <input
            type="number"
            placeholder="Stock"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            min="0"
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
          />
          <button type="submit">
            {editingId ? 'Save Changes' : 'Add Product'}
          </button>
          {editingId && (
            <button type="button" className="admin-secondary-btn" onClick={resetForm}>
              Cancel
            </button>
          )}
        </form>
      </section>

      <section className="admin-section">
        <h2>Existing Products</h2>
        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products yet.</p>
        ) : (
          <div className="admin-products-grid">
            {products.map((p) => (
              <div className="admin-product-card" key={p._id}>
                {p.images && p.images[0] && (
                  <img src={p.images[0]} alt={p.name} />
                )}
                <h3>{p.name}</h3>
                <p className="admin-price">₹{p.price}</p>
                <p className="admin-meta">
                  Category: {p.category || 'Uncategorized'} • Stock: {p.stock ?? 0}
                </p>
                {p.description && (
                  <p className="admin-description">{p.description}</p>
                )}
                <div className="admin-card-actions">
                  <button
                    type="button"
                    className="admin-edit-btn"
                    onClick={() => handleEditClick(p)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="admin-delete-btn"
                    onClick={() => handleDelete(p._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminProducts;

