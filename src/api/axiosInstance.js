// In your axios instance setup (api/axiosInstance.js)
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api", // or your backend URL
});

// Add request interceptor to include the token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // or wherever you store your token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
