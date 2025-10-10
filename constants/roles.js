import * as SecureStore from "expo-secure-store";
import api from "../constants/api";

// Helper to attach token
const withAuth = async () => {
  const token = await SecureStore.getItemAsync("accessToken");
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

// ✅ Get all roles
export const getRoles = async () => {
  const config = await withAuth();
  return api.get("/roles", config);
};

// ✅ Get a single role
export const getRoleById = async (id) => {
  const config = await withAuth();
  return api.get(`/roles/${id}`, config);
};

// ✅ Create a new role
export const createRole = async (data) => {
  const config = await withAuth();
  return api.post("/roles", data, config);
};

// ✅ Update a role
export const updateRole = async (id, data) => {
  const config = await withAuth();
  return api.patch(`/roles/${id}`, data, config);
};

// ✅ Delete a role
export const deleteRole = async (id) => {
  const config = await withAuth();
  return api.delete(`/roles/${id}`, config);
};

// ✅ Assign a role to a user
export const assignRoleToUser = async (roleId, userId) => {
  const config = await withAuth();
  return api.post(`/roles/${roleId}/assign/${userId}`, {}, config);
};
