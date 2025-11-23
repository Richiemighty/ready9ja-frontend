// contexts/CartContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import api from "../constants/api";
import { useAuth } from "../hooks/useAuth";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const { getUser } = useAuth();

  // Load cart on app start
  useEffect(() => {
    fetchCart();
  }, []);

  const getAuthToken = async () => {
    try {
      const userData = await getUser();
      return userData?.accessToken || null;
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      if (!token) return;

      const res = await api.get("/carts", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.success && Array.isArray(res.data.data)) {
        setCart(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        Alert.alert("Authentication Required", "Please log in to add items.");
        return false;
      }

      const payload = {
        product_id: product.productId, // backend uses UUID here
        quantity: product.quantity || 1,
      };

      const res = await api.post("/carts", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.success) {
        await fetchCart(); // instant UI update
        Alert.alert("Success", "Item added to cart!");
        return true;
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      Alert.alert("Error", "Failed to add item to cart. Please try again.");
    }
    return false;
  };

  const removeFromCart = async (uuid) => {
    try {
      const token = await getAuthToken();
      if (!token) return false;

      const res = await api.delete(`/carts/${uuid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.success) {
        await fetchCart();
        return true;
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      Alert.alert("Error", "Failed to remove item. Please try again.");
    }
    return false;
  };

  // quantity update uses product_id + POST /carts
  const updateCartItemQuantity = async (product_id, quantity) => {
    try {
      const token = await getAuthToken();
      if (!token) return false;

      const payload = { product_id, quantity };
      const res = await api.post("/carts", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.success) {
        await fetchCart();
        return true;
      }
    } catch (error) {
      console.error("Error updating cart item:", error);
      Alert.alert("Error", "Failed to update item. Please try again.");
    }
    return false;
  };

  const clearCart = async () => {
    try {
      const token = await getAuthToken();
      if (!token) return false;

      const res = await api.delete("/carts", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.success) {
        setCart([]); // optimistic
        await fetchCart(); // sync with server
        Alert.alert("Success", "Cart cleared successfully!");
        return true;
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      Alert.alert("Error", "Failed to clear cart. Please try again.");
    }
    return false;
  };

  const addToFavorites = (product) => {
    Alert.alert("Added to Favorites", `${product.name} saved!`);
  };

  // total count for badge
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const value = {
    cart,
    loading,
    cartCount,
    refreshCart: fetchCart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    addToFavorites,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
