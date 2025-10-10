import { useState } from "react";
import { Platform } from "react-native";
import api from "../constants/api";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

// --- Helpers for cross-platform storage ---
async function setItem(key, value) {
  if (Platform.OS === "web") return AsyncStorage.setItem(key, value);
  return SecureStore.setItemAsync(key, value);
}

async function getItem(key) {
  if (Platform.OS === "web") return AsyncStorage.getItem(key);
  return SecureStore.getItemAsync(key);
}

async function deleteItem(key) {
  if (Platform.OS === "web") return AsyncStorage.removeItem(key);
  return SecureStore.deleteItemAsync(key);
}

// --- Hook start ---
export function useAuth() {
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { username, password });

      if (res.data.accessToken) {
        await setItem("access_token", res.data.accessToken);
        await setItem("user_data", JSON.stringify(res.data));
      }

      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await api.post("/auth/register", data);
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await api.post("/auth/logout");
      console.log("Logout response:", res.data?.message || res.status);
    } catch (err) {
      console.warn("Logout error:", err.message);
    } finally {
      await deleteItem("access_token");
      await deleteItem("user_data");
      console.log("Access token deleted successfully");
      setLoading(false);
    }
  };

  const getUser = async () => {
    const data = await getItem("user_data");
    return data ? JSON.parse(data) : null;
  };

  return { login, register, logout, getUser, loading };
}
