import axios from "axios";

// Create an Axios instance
const api = axios.create({
  // This matches the proxy key in your vite.config.ts
  // In production, this becomes your real domain automatically
  baseURL: "/api",

  // Standard headers
  headers: {
    "Content-Type": "application/json",
  },
});

// --- INTERCEPTORS ---

// Request Interceptor: Automatically adds the Token before sending
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Or however you store it
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global Error Handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 Unauthorized (token expired), redirect to login automatically
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const getRecommendedRoadmaps = async () => {
    const response = await api.get('/users/recommended-roadmaps');
    return response.data.recommendedRoadmaps;
};

export default api;
