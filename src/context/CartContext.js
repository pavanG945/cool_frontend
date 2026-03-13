import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const BACKEND_URL = process.env.REACT_APP_API_URL || 'https://cool-backend-3hgs.onrender.com';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const { isLoggedIn, setCartClearCallback, token } = useAuth();
  const [cartItems, setCartItems] = useState([]);

  // Get user ID from token (you'll need to decode JWT or get user info)
  const getUserId = () => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT
      return payload.userId;
    } catch {
      return null;
    }
  };

  const userId = getUserId();

  // Load cart from localStorage on mount/user change
  useEffect(() => {
    if (isLoggedIn && userId) {
      const userCartKey = `cartItems_${userId}`;
      const savedCart = localStorage.getItem(userCartKey);
      setCartItems(savedCart ? JSON.parse(savedCart) : []);
    } else {
      setCartItems([]); // Clear cart if not logged in
    }
  }, [isLoggedIn, userId]);

  // Save cart to localStorage with user-specific key
  useEffect(() => {
    if (isLoggedIn && userId) {
      const userCartKey = `cartItems_${userId}`;
      localStorage.setItem(userCartKey, JSON.stringify(cartItems));
    }
  }, [cartItems, isLoggedIn, userId]);

  const addToCart = async (product) => {
    if (!isLoggedIn) {
      alert('Please login to add items to cart');
      return;
    }
    
    // Check local stock first
    const currentCartItem = cartItems.find(item => item._id === product._id);
    const existingQuantity = currentCartItem ? currentCartItem.quantity : 0;
    
    if (product.stock <= existingQuantity) {
       alert('Not enough stock available');
       return;
    }

    try {
      // Create an axios instance inline, or import axios if necessary. Assuming fetch or you'll need to import axios.
      // Better yet, just use standard fetch since it's simple
      const response = await fetch(`${BACKEND_URL}/api/products/${product._id}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ change: -1 })
      });

      if (!response.ok) {
         const errorText = await response.text();
         console.error("API Error Response:", response.status, errorText);
         alert(`Error: API returned ${response.status}. Details: ${errorText.substring(0, 100)}`);
         return;
      }
      
      const updatedProduct = await response.json();

      setCartItems(prevCart => {
        const existingItemIndex = prevCart.findIndex(item => item._id === product._id);
        if (existingItemIndex !== -1) {
          const updated = prevCart.map((item, idx) =>
            idx === existingItemIndex
              ? { ...item, quantity: item.quantity + 1, stock: updatedProduct.stock }
              : item
          );
          alert(`${product.name} quantity updated in cart`);
          return updated;
        } else {
          // Add newly stock-updated product
          const updated = [...prevCart, { ...updatedProduct, quantity: 1 }];
          alert(`${product.name} added to cart`);
          return updated;
        }
      });
    } catch (error) {
       console.error("Failed to add to cart:", error);
       alert(`Failed to add item to cart. Error: ${error.message || JSON.stringify(error)}`);
    }
  };

  const removeFromCart = async (id) => {
    const itemToRemove = cartItems.find(item => item._id === id);
    if (!itemToRemove) return;

    try {
      // Restore stock
      await fetch(`${BACKEND_URL}/api/products/${id}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ change: itemToRemove.quantity })
      });

      setCartItems(prev => prev.filter(item => item._id !== id));
    } catch (error) {
      console.error("Failed to remove from cart:", error);
      alert("Failed to remove item. Please try again.");
    }
  };

  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;
    
    const itemToUpdate = cartItems.find(item => item._id === id);
    if (!itemToUpdate) return;

    const difference = newQuantity - itemToUpdate.quantity;
    
    if (difference === 0) return;
    
    if (difference > 0 && itemToUpdate.stock < difference) {
      alert("Not enough stock available");
      return;
    }

    try {
      // Invert difference because we are tracking change from the perspective of RESTOCKING vs DEPLETING
      // If newQuantity > oldQuantity, difference is positive, so we want to deplete stock (change = -difference)
      const change = -difference;
      
      const response = await fetch(`${BACKEND_URL}/api/products/${id}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ change })
      });

      if (!response.ok) {
         const errorText = await response.text();
         console.error("API Error Response:", response.status, errorText);
         alert(`Error: API returned ${response.status}. Details: ${errorText.substring(0, 100)}`);
         return;
      }

      const updatedProduct = await response.json();

      setCartItems(prev =>
        prev.map(item =>
          item._id === id ? { ...item, quantity: newQuantity, stock: updatedProduct.stock } : item
        )
      );
    } catch (error) {
      console.error("Failed to update quantity:", error);
      alert("Failed to update quantity. Please try again.");
    }
  };

  // Memoize clearCart to prevent infinite loop
  const clearCart = useCallback(async () => {
    // Attempt to restore inventory for all items in the cart
    try {
       await Promise.all(cartItems.map(item => 
         fetch(`${BACKEND_URL}/api/products/${item._id}/stock`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify({ change: item.quantity })
          })
       ));
    } catch (error) {
       console.error("Failed to clear cart stock back:", error);
    }
    setCartItems([]);
  }, [cartItems, token]);

  // Register clearCart with AuthContext
  useEffect(() => {
    setCartClearCallback(() => clearCart);
  }, [setCartClearCallback, clearCart]);

  const getCartTotal = () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const getTotalItems = () => cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getTotalItems
    }}>
      {children}
    </CartContext.Provider>
  );
}
