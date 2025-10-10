import { useState } from "react";
import api from "../constants/api";
import * as SecureStore from "expo-secure-store";

export function useAuth() {
  const [loading, setLoading] = useState(false);

  const saveToken = async (token) => {
    if (token) await SecureStore.setItemAsync("access_token", token);
  };

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { username, password });
      await saveToken(res.data?.access_token);
      return res.data; // <-- includes role
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/register", data);
      return res.data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
      await SecureStore.deleteItemAsync("access_token");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return { login, register, logout, loading };
}
