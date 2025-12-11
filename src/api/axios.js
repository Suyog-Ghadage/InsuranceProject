import axios from "axios";
import CONFIG from "../config/config";

const axiosInstance = axios.create({
  baseURL: CONFIG.BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    console.log("Request URL:", config.url);
    console.log("Request headers before interceptor:", config.headers);

     // Add API prefix automatically if not already present
    //  if (!config.url.startsWith(CONFIG.API_PREFIX)) {
    //   config.url = `${CONFIG.API_PREFIX}${config.url}`;
    // }

    // Skip token for registration & login APIs
    if (
      !config.url.includes("/api/v1/save") && // registration
      !config.url.includes("/api/auth/login") && // login
      !config.url.includes("/api/auth/verify-otp") &&// OTP verify
      !config.url.includes("/api/user/forgot-password") &&
      !config.url.includes("/api/user/verify-otp") &&
      !config.url.includes("/api/user/reset-password")
    ) {
      const authData = JSON.parse(sessionStorage.getItem("authData"));
      const token = authData?.token;
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }

    console.log("Request headers after interceptor:", config.headers);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("401 detected → clearing auth and redirecting to login");
      sessionStorage.removeItem("authData");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
