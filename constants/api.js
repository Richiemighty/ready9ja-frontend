// import axios from "axios";

// export const API_BASE_URL = "https://ready9ja-api.onrender.com/api/v1";

// export const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: { "Content-Type": "application/json" },
// });

// export const register = (data) => api.post("/auth/register", data);
// export const login = (data) => api.post("/auth/login", data);
// export const getProfile = (token) =>
//   api.get("/users/me", { headers: { Authorization: `Bearer ${token}` } });
// export const requestSeller = (token) =>
//   api.post("/users/request-seller", {}, { headers: { Authorization: `Bearer ${token}` } });
// export const getRoles = (token) =>
//   api.get("/roles", { headers: { Authorization: `Bearer ${token}` } });


import axios from "axios";

const api = axios.create({
  baseURL: "https://ready9ja-api.onrender.com/api/v1", // ✅ Updated to match your backend
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default api;
