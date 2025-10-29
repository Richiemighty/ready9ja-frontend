import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useEffect, useState } from 'react';
import { Platform } from "react-native";
import { useAuth } from '../hooks/useAuth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const auth = useAuth();
  const [user, setUser] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = await getItem("access_token");
      const userData = await auth.getUser();
      
      setUserToken(token);
      setUser(userData);
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const result = await auth.login(username, password);
      const token = await getItem("access_token");
      const userData = await auth.getUser();
      
      setUserToken(token);
      setUser(userData);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await auth.logout();
    setUserToken(null);
    setUser(null);
  };

  const value = {
    user,
    userToken,
    isLoading,
    login,
    logout,
    register: auth.register,
    getActiveRole: auth.getActiveRole,
    switchRole: auth.switchRole,
    isAuthenticated: !!userToken,
    updateProfile: auth.updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Cross-platform storage functions (same as in your useAuth hook)
// --- Helpers for cross-platform storage ---
async function setItem(key, value) {
  if (Platform.OS === "web") {
    return AsyncStorage.setItem(key, value);
  } else {
    const SecureStore = require('expo-secure-store');
    return SecureStore.setItemAsync(key, value);
  }
}

async function getItem(key) {
  if (Platform.OS === "web") {
    return AsyncStorage.getItem(key);
  } else {
    const SecureStore = require('expo-secure-store');
    return SecureStore.getItemAsync(key);
  }
}

async function deleteItem(key) {
  if (Platform.OS === "web") {
    return AsyncStorage.removeItem(key);
  } else {
    const SecureStore = require('expo-secure-store');
    return SecureStore.deleteItemAsync(key);
  }
}