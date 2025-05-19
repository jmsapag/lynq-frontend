import axios from "axios";
import Cookies from "js-cookie";

const BACKEND_URL = "/api";

console.log("BACKEND_URL:", BACKEND_URL, "DEV mode:", import.meta.env.DEV);

export const axiosClient = axios.create({
  baseURL: BACKEND_URL,
  timeout: 10000,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const axiosPrivate = axios.create({
  baseURL: BACKEND_URL,
  timeout: 10000,
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
