// contexts/CartContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import api from '../constants/api';
import { useAuth } from '../hooks/useAuth';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const { getUser } = useAuth();

  // Fetch cart from API when component mounts
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      if (!token) {
        console.log('No token available for fetching cart');
        return;
      }

      const response = await api.get('/carts', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log('Cart API response:', response.data);
      
      if (response.data && response.data.success) {
        // Handle the nested product data properly
        const cartItems = response.data.data.map(item => ({
          ...item,
          // Ensure product data is properly extracted
          product: item.product || {}
        }));
        setCart(cartItems);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get auth token
  const getAuthToken = async () => {
    try {
      const userData = await getUser();
      return userData?.accessToken;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  const addToCart = async (product) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        Alert.alert('Authentication Required', 'Please log in to add items to cart.');
        return false;
      }

      const cartItem = {
        product_id: product.productId || product.id,
        quantity: product.quantity || 1
      };

      console.log('Adding to cart:', cartItem);

      const response = await api.post('/carts', cartItem, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log('Add to cart response:', response.data);
      
      if (response.data) {
        // Refresh cart from API after successful addition
        await fetchCart();
        Alert.alert('Success', 'Item added to cart!');
        return true;
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart. Please try again.');
      return false;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const token = await getAuthToken();
      const response = await api.delete(`/carts/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log('Remove from cart response:', response.status);
      
      if (response.status === 200 || response.status === 204) {
        // Refresh cart from API after successful removal
        await fetchCart();
        Alert.alert('Success', 'Item removed from cart!');
        return true;
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      Alert.alert('Error', 'Failed to remove item from cart. Please try again.');
      return false;
    }
  };

  const updateCartItemQuantity = async (productId, quantity) => {
    try {
      const token = await getAuthToken();
      const response = await api.put(`/carts/${productId}`, { 
        quantity 
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data) {
        await fetchCart();
        return true;
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
      Alert.alert('Error', 'Failed to update item quantity. Please try again.');
      return false;
    }
  };

  const clearCart = async () => {
    try {
      const token = await getAuthToken();
      // Since the API doesn't have a clear all endpoint, we'll remove each item individually
      for (const item of cart) {
        const productId = item.product_id || item.id;
        await api.delete(`/carts/${productId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      setCart([]);
      Alert.alert('Success', 'Cart cleared successfully!');
    } catch (error) {
      console.error('Error clearing cart:', error);
      Alert.alert('Error', 'Failed to clear cart. Please try again.');
    }
  };

  const addToFavorites = (product) => {
    Alert.alert('Added to Favorites', `${product.name} has been added to your favorites!`);
  };

  const value = {
    cart,
    loading,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    addToFavorites,
    clearCart,
    refreshCart: fetchCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};