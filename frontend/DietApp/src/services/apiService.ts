import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { EXPO_PUBLIC_BASE_URL } from '@env';
import { Platform } from "react-native";

const HOST = Platform.select({
  ios: "http://172.16.100.203:8080",            // iOS device/simulator
  android: "http://10.0.2.2:8080",              // Android emulator (AVD)
  default: EXPO_PUBLIC_BASE_URL ||"http://172.16.100.203:8080",        // Physical devices (both)
});

// Fallback if .env is not loaded
const API_URL = EXPO_PUBLIC_BASE_URL || 'http://172.16.100.203:8000/api';

console.log("API_URL:", API_URL);

class ApiService {
  private api: any;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config: any) => {
        const token = await SecureStore.getItemAsync('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: any) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response: any) => response,
      async (error: any) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = await SecureStore.getItemAsync('refresh_token');
            if (refreshToken) {
              const response = await axios.post(`${API_URL}/auth/jwt/refresh/`, {
                refresh: refreshToken,
              });

              const responseData = response.data as any;
              const newAccessToken = responseData.access as string;
              await SecureStore.setItemAsync('access_token', newAccessToken);

              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            await this.clearTokens();
            // You might want to emit an event here to redirect to login
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async clearTokens() {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
  }

  // Generic API methods
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.api.get(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.post(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.put(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    try {
      console.log(`Making PATCH request to ${url}:`, JSON.stringify(data));
      const response = await this.api.patch(url, data);
      console.log(`PATCH response from ${url}:`, JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error(`PATCH request to ${url} failed:`, error);
      throw error;
    }
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.api.delete(url);
    return response.data;
  }

  // File upload method
  async uploadFile<T>(url: string, formData: FormData): Promise<T> {
    const response = await this.api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
