import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import jwtDecode from "jwt-decode";
import { createContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import api from "../constants/api"; // axios instance
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

  // -----------------------------
  // INITIALIZE AUTH
  // -----------------------------
  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      const storedAccess = await getItem("access_token");
      const storedRefresh = await getItem("refresh_token");

      if (!storedAccess || !storedRefresh) {
        return logout(true);
      }

      const decoded = jwtDecode(storedAccess);
      const now = Date.now() / 1000;

      // If token expired → try refresh
      if (decoded.exp < now) {
        const refreshed = await refreshAccessToken(storedRefresh);
        if (!refreshed) return logout(true);
      } else {
        setSession(storedAccess, storedRefresh);
        const userData = await auth.getUser();
        setUser(userData);
      }

      startAutoRefresh(storedAccess, storedRefresh);

    } catch (error) {
      console.log("Auth init failed", error);
      logout(true);
    } finally {
      setIsLoading(false);
    }
  };

  // -----------------------------
  // START AUTO REFRESH TIMER
  // -----------------------------
  const startAutoRefresh = (access, refresh) => {
    if (!access) return;

    const { exp } = jwtDecode(access);
    const now = Date.now() / 1000;

    const refreshInSeconds = exp - now - 120; // refresh 2 min before expiry
    const ms = Math.max(refreshInSeconds * 1000, 5000);

    if (refreshIntervalId) clearInterval(refreshIntervalId);

    const intervalId = setInterval(() => {
      console.log("🔄 Auto refreshing token...");
      refreshAccessToken(refresh);
    }, ms);

    setRefreshIntervalId(intervalId);
  };

  // -----------------------------
  // REFRESH TOKEN FUNCTION
  // -----------------------------
  const refreshAccessToken = async (refreshTok) => {
    try {
      const res = await api.post("/auth/refresh", {
        refreshToken: refreshTok,
      });

      const newAccess = res.data.accessToken;
      const newRefresh = res.data.refreshToken;

      await setItem("access_token", newAccess);
      await setItem("refresh_token", newRefresh);

      setSession(newAccess, newRefresh);

      console.log("🔑 Token successfully refreshed");

      startAutoRefresh(newAccess, newRefresh);

      return true;
    } catch (err) {
      console.log("❌ Failed to refresh token", err);
      return false;
    }
  };

  // -----------------------------
  // SET SESSION TOKENS
  // -----------------------------
  const setSession = (access, refresh) => {
    setAccessToken(access);
    setRefreshToken(refresh);
  };

  // -----------------------------
  // LOGIN 
  // -----------------------------
  const login = async (email, password) => {
    try {
      const res = await auth.login(email, password);

      const newAccess = await getItem("access_token");
      const newRefresh = await getItem("refresh_token");

      setSession(newAccess, newRefresh);

      const userData = await auth.getUser();
      setUser(userData);

      startAutoRefresh(newAccess, newRefresh);

      return true;
    } catch (err) {
      throw err;
    }
  };

  // -----------------------------
  // GLOBAL AXIOS INTERCEPTOR
  // -----------------------------
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalReq = error.config;

        if (error?.response?.status === 401 && !originalReq._retry) {
          originalReq._retry = true;

          const refreshed = await refreshAccessToken(refreshToken);
          if (refreshed) {
            originalReq.headers["Authorization"] = `Bearer ${await getItem(
              "access_token"
            )}`;
            return api(originalReq);
          } else {
            logout(true);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => api.interceptors.response.eject(interceptor);
  }, [refreshToken]);

  // -----------------------------
  // LOGOUT
  // -----------------------------
  const logout = async (redirect = false) => {
    try {
      await auth.logout();
    } catch {}

    await deleteItem("access_token");
    await deleteItem("refresh_token");

    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);

    if (refreshIntervalId) clearInterval(refreshIntervalId);

    if (redirect) router.replace("/login");
  };

  // -----------------------------
  // EXPORT VALUE
  // -----------------------------
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

// ------------------------
// STORAGE HELPERS
// ------------------------
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
