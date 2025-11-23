import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import jwtDecode from "jwt-decode";
import { createContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import api from "../constants/api";
import { useAuth } from "../hooks/useAuth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const router = useRouter();
  const auth = useAuth();

  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [refreshIntervalId, setRefreshIntervalId] = useState(null);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      const hasOpened = await getItem("has_opened_before");
      const storedAccess = await getItem("access_token");
      const storedRefresh = await getItem("refresh_token");

      // ❗ FIRST TIME USER
      if (!hasOpened) {
        await setItem("has_opened_before", "true");
        console.log("🌟 First time user → show landing page");

        setIsLoading(false);
        return; // <-- allow landing page
      }

      // ❗ RETURNING USER BUT LOGGED OUT
      if (!storedAccess || !storedRefresh) {
        console.log("Returning user without token → go to login");
        router.replace("/login");
        setIsLoading(false);
        return;
      }

      // If a token exists → validate/refresh it
      const decoded = jwtDecode(storedAccess);
      const now = Date.now() / 1000;

      if (decoded.exp < now) {
        const refreshed = await refreshAccessToken(storedRefresh);
        if (!refreshed) {
          console.log("Expired token & refresh failed → go to login");
          router.replace("/login");
          setIsLoading(false);
          return;
        }
      } else {
        setSession(storedAccess, storedRefresh);
        const userData = await auth.getUser();
        setUser(userData);
      }

      startAutoRefresh(storedAccess, storedRefresh);

      // USER IS LOGGED IN → go straight to dashboard
      router.replace("/buyer/(tabs)/marketplace");

    } catch (error) {
      console.log("Auth init failed", error);
    } finally {
      setIsLoading(false);
    }
  };


  const clearSession = async () => {
    await deleteItem("access_token");
    await deleteItem("refresh_token");
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
  };

  const startAutoRefresh = (access, refresh) => {
    if (!access) return;

    const { exp } = jwtDecode(access);
    const now = Date.now() / 1000;
    const refreshInSeconds = exp - now - 120;
    const ms = Math.max(refreshInSeconds * 1000, 5000);

    if (refreshIntervalId) clearInterval(refreshIntervalId);

    const intervalId = setInterval(() => {
      refreshAccessToken(refresh);
    }, ms);

    setRefreshIntervalId(intervalId);
  };

  const refreshAccessToken = async (refreshTok) => {
    try {
      const res = await api.post("/auth/refresh", { refreshToken: refreshTok });

      const newAccess = res.data.accessToken;
      const newRefresh = res.data.refreshToken;

      await setItem("access_token", newAccess);
      await setItem("refresh_token", newRefresh);

      setSession(newAccess, newRefresh);
      startAutoRefresh(newAccess, newRefresh);

      return true;
    } catch (err) {
      console.log("Failed to refresh token");
      return false;
    }
  };

  const setSession = (access, refresh) => {
    setAccessToken(access);
    setRefreshToken(refresh);
  };

  const login = async (email, password) => {
    const res = await auth.login(email, password);

    const newAccess = await getItem("access_token");
    const newRefresh = await getItem("refresh_token");

    setSession(newAccess, newRefresh);

    const userData = await auth.getUser();
    setUser(userData);

    startAutoRefresh(newAccess, newRefresh);

    return true;
  };

  // Fixed logout
  const logout = async () => {
    try {
      await auth.logout();
    } catch {}

    await clearSession();

    if (refreshIntervalId) clearInterval(refreshIntervalId);

    router.replace("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        isLoading,
        isAuthenticated: !!accessToken,
        login,
        logout,
        register: auth.register,
        getActiveRole: auth.getActiveRole,
        switchRole: auth.switchRole,
        updateProfile: auth.updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

async function setItem(key, value) {
  if (Platform.OS === "web") return AsyncStorage.setItem(key, value);
  const SecureStore = require("expo-secure-store");
  return SecureStore.setItemAsync(key, value);
}

async function getItem(key) {
  if (Platform.OS === "web") return AsyncStorage.getItem(key);
  const SecureStore = require("expo-secure-store");
  return SecureStore.getItemAsync(key);
}

async function deleteItem(key) {
  if (Platform.OS === "web") return AsyncStorage.removeItem(key);
  const SecureStore = require("expo-secure-store");
  return SecureStore.deleteItemAsync(key);
}

export default AuthContext;
