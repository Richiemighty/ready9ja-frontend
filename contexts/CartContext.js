import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);

  // --- Load cart & favorites from AsyncStorage on mount ---
  useEffect(() => {
    (async () => {
      try {
        const savedCart = await AsyncStorage.getItem("cart_items");
        const savedFavs = await AsyncStorage.getItem("favorite_items");

        if (savedCart) setCart(JSON.parse(savedCart));
        if (savedFavs) setFavorites(JSON.parse(savedFavs));
      } catch (err) {
        console.warn("Failed to load persisted data:", err);
      }
    })();
  }, []);

  // --- Persist changes automatically ---
  useEffect(() => {
    AsyncStorage.setItem("cart_items", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    AsyncStorage.setItem("favorite_items", JSON.stringify(favorites));
  }, [favorites]);

  // --- CART FUNCTIONS ---
  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // --- FAVORITES FUNCTIONS ---
  const addToFavorites = (product) => {
    setFavorites((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) return prev;
      return [...prev, product];
    });
  };

  const removeFromFavorites = (productId) => {
    setFavorites((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        favorites,
        addToCart,
        removeFromCart,
        clearCart,
        addToFavorites,
        removeFromFavorites,
        clearFavorites,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
