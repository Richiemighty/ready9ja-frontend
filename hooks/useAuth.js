import { useState } from "react";
import api from "../constants/api";
import * as SecureStore from "expo-secure-store";

export function useAuth() {
  const [loading, setLoading] = useState(false);

  const saveToken = async (token) => {
    await SecureStore.setItemAsync("access_token", token);
  };

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { username, password });
      if (res.data.access_token) await saveToken(res.data.access_token);
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/register", data);
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Improved logout
  const logout = async () => {
    try {
      const response = await api.post("/auth/logout");
      console.log("Logout response:", response.data?.message);
    } catch (error) {
      console.warn("Logout API failed:", error.message);
    } finally {
      try {
        await SecureStore.deleteItemAsync("access_token");
        console.log("Access token deleted successfully");
      } catch (err) {
        console.error("Error deleting token:", err);
      }
    }
  };

  return { login, register, logout, loading };
}
