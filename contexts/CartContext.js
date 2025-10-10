import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const CartContext = createContext({
  cart: [],
  favorites: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  addToFavorites: () => {},
  removeFromFavorites: () => {},
});

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const c = await AsyncStorage.getItem("cart");
        const f = await AsyncStorage.getItem("favorites");
        if (c) setCart(JSON.parse(c));
        if (f) setFavorites(JSON.parse(f));
      } catch (err) {
        console.warn("Failed to load cart/favorites:", err.message);
      }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    AsyncStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) return prev.map((p) => (p.id === product.id ? { ...p, quantity: (p.quantity || 1) + 1 } : p));
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((p) => p.id !== id));
  const clearCart = () => setCart([]);

  const addToFavorites = (product) => {
    setFavorites((prev) => {
      if (prev.find((p) => p.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const removeFromFavorites = (id) => setFavorites((prev) => prev.filter((p) => p.id !== id));

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
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
