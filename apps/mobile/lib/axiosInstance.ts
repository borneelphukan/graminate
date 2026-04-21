import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      await AsyncStorage.multiRemove(["accessToken", "user"]);
      // Optional: You could use a global event to trigger a redirect if needed
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
