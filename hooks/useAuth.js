import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import { Platform } from "react-native";
import api from "../constants/api";

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

        // Set default role to the first role in the user's roles array
        const defaultRole = res.data.user.roles?.[0]?.name || "user";
        await setItem("active_role", defaultRole);
        
        console.log(`✅ Login successful. Default role set to: ${defaultRole}`);
      }

      return res.data;
    } catch (error) {
      console.error("❌ Login error:", error);
      throw error;
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
    } catch (error) {
      console.error("❌ Registration error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      // Try to call logout endpoint if token exists
      try {
        const token = await getItem("access_token");
        if (token) {
          const res = await api.post("/auth/logout");
          console.log("Logout response:", res.data?.message || res.status);
        }
      } catch (err) {
        console.warn("Logout API error:", err.message);
      }
    } finally {
      // Always clear local storage
      await deleteItem("access_token");
      await deleteItem("user_data");
      await deleteItem("active_role");
      console.log("✅ User data cleared successfully");
      setLoading(false);
    }
  };

  const getUser = async () => {
    try {
      const data = await getItem("user_data");
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("❌ Error getting user data:", error);
      return null;
    }
  };

  const getActiveRole = async () => {
    try {
      const role = await getItem("active_role");
      // If no role is stored, get from user data and set it
      if (!role) {
        const userData = await getUser();
        if (userData?.user?.roles?.[0]?.name) {
          const defaultRole = userData.user.roles[0].name;
          await setItem("active_role", defaultRole);
          return defaultRole;
        }
        return "user"; // Fallback to 'user'
      }
      return role;
    } catch (error) {
      console.error("❌ Error getting active role:", error);
      return "user";
    }
  };

  const switchRole = async (newRole) => {
    try {
      // Validate the role exists in user's roles
      const userData = await getUser();
      const userRoles = userData?.user?.roles?.map(role => role.name) || [];
      
      if (!userRoles.includes(newRole)) {
        throw new Error(`Role '${newRole}' is not assigned to this user`);
      }

      // Store the new active role
      await setItem("active_role", newRole);
      
      console.log(`✅ Role switched to: ${newRole}`);
      return true;
    } catch (error) {
      console.error("❌ Error switching role:", error);
      throw error;
    }
  };

  const getAvailableRoles = async () => {
    try {
      const userData = await getUser();
      return userData?.user?.roles?.map(role => ({
        name: role.name,
        description: role.description || `Access ${role.name} features`
      })) || [];
    } catch (error) {
      console.error("❌ Error getting available roles:", error);
      return [];
    }
  };

  const hasMultipleRoles = async () => {
    try {
      const roles = await getAvailableRoles();
      return roles.length > 1;
    } catch (error) {
      console.error("❌ Error checking multiple roles:", error);
      return false;
    }
  };

  const updateUserProfile = async (userData) => {
    if (loading) return false;
    setLoading(true);
    try {
      let token = await getItem("access_token");
      if (!token) {
        console.warn("⚠️ No access token found in storage!");
        return false;
      }

      const body = {
        firstname: userData.firstname || "",
        lastname: userData.lastname || "",
        email: userData.email || "",
        phone: userData.phone || "",
        address: userData.address || "",
      };

      const response = await api.patch("/profile", body, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error("Profile update failed:", response.statusText);
        return false;
      }

      // Update local user data
      const currentUserData = await getUser();
      if (currentUserData) {
        const updatedUserData = {
          ...currentUserData,
          user: {
            ...currentUserData.user,
            ...body
          }
        };
        await setItem("user_data", JSON.stringify(updatedUserData));
      }

      console.log("✅ User profile updated successfully");
      return true;
    } catch (error) {
      console.error("❌ Profile update error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = await getItem("refresh_token");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const res = await api.post("/auth/refresh", { refreshToken });
      
      if (res.data.accessToken) {
        await setItem("access_token", res.data.accessToken);
        console.log("✅ Token refreshed successfully");
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("❌ Token refresh error:", error);
      await logout(); // Logout if refresh fails
      throw error;
    }
  };

  const isAuthenticated = async () => {
    try {
      const token = await getItem("access_token");
      const userData = await getUser();
      return !!(token && userData);
    } catch (error) {
      console.error("❌ Auth check error:", error);
      return false;
    }
  };

  const updateProfile = async (profileData) => {
    if (loading) return false;
    setLoading(true);
    
    try {
      const token = await getItem("access_token");
      if (!token) {
        console.warn("⚠️ No access token found!");
        return false;
      }

      const response = await fetch("https://ready9ja-api.onrender.com/api/v1/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Profile update failed:", errorData);
        throw new Error(errorData.message || "Failed to update profile");
      }

      const result = await response.json();
      console.log("✅ Profile updated successfully:", result);
      
      // Update local user data
      const currentUserData = await getUser();
      if (currentUserData) {
        const updatedUserData = {
          ...currentUserData,
          user: {
            ...currentUserData.user,
            ...profileData
          }
        };
        await setItem("user_data", JSON.stringify(updatedUserData));
      }
      
      return result;
    } catch (error) {
      console.error("❌ Profile update error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  return { 
    login, 
    register, 
    logout, 
    getUser, 
    getActiveRole, 
    switchRole,
    getAvailableRoles,
    hasMultipleRoles,
    updateUserProfile: updateProfile, // Use the new function
    refreshToken,
    isAuthenticated,
    loading 
  };
}