import apiService from './apiService';
import * as SecureStore from 'expo-secure-store';
import { 
  LoginData, 
  RegisterData, 
  AuthTokens, 
  User 
} from '../types';

class AuthService {
  // Login user
  async login(credentials: LoginData): Promise<{ tokens: AuthTokens; user: User }> {
    try {
      const response = await apiService.post<AuthTokens>('/auth/jwt/create/', credentials);
      
      // Store tokens securely
      await SecureStore.setItemAsync('access_token', response.access);
      await SecureStore.setItemAsync('refresh_token', response.refresh);
      
      // Get user profile
      const user = await this.getCurrentUser();
      
      return { tokens: response, user };
    } catch (error) {
      throw error;
    }
  }

  // Register user
  async register(userData: RegisterData): Promise<User> {
    try {
      const response = await apiService.post<User>('/auth/users/', userData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get current user profile
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiService.get<User>('/auth/users/me/');
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update user profile
  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const response = await apiService.patch<User>('/auth/users/me/', userData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await apiService.post('/auth/users/set_password/', {
        current_password: currentPassword,
        new_password: newPassword,
      });
    } catch (error) {
      throw error;
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<void> {
    try {
      await apiService.post('/auth/users/reset_password/', { email });
    } catch (error) {
      throw error;
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      // Clear stored tokens
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('refresh_token');
    } catch (error) {
      throw error;
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      return !!token;
    } catch (error) {
      return false;
    }
  }

  // Refresh token
  async refreshToken(): Promise<string> {
    try {
      const refreshToken = await SecureStore.getItemAsync('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiService.post<{ access: string }>('/auth/jwt/refresh/', {
        refresh: refreshToken,
      });

      await SecureStore.setItemAsync('access_token', response.access);
      return response.access;
    } catch (error) {
      throw error;
    }
  }

  // Activate account
  async activateAccount(uid: string, token: string): Promise<void> {
    try {
      await apiService.post('/auth/users/activation/', { uid, token });
    } catch (error) {
      throw error;
    }
  }
}

export const authService = new AuthService();
export default authService;
