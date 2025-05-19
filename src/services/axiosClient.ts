import axios from "axios";
import Cookies from "js-cookie";

const BACKEND_URL = import.meta.env.VITE_API_URL;

export const axiosClient = axios.create({
  baseURL: BACKEND_URL || "http://localhost:8080",
});

export const axiosPrivate = axios.create({
  baseURL: BACKEND_URL || "http://localhost:8080",
});

axiosPrivate.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosPrivate.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("Unauthorized, redirecting to login");
    }
    return Promise.reject(error);
  },
);
