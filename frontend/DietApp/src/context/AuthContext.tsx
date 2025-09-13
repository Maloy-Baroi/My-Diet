import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, LoginData, RegisterData, AuthTokens } from '../types';
import authService from '../services/authService';
import { clearAllAuthTokens } from '../utils/authUtils';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginData) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  updateProfileWithPhoto: (formData: FormData) => Promise<void>;
  uploadProfilePhoto: (imageFile: FormData) => Promise<void>;
  refreshUser: () => Promise<void>;
  clearAllTokens: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      // Clear all tokens on every app start/build
      console.log('Clearing all stored tokens on app initialization...');
      await authService.clearAllAuthData();
      
      // Since we cleared all data, set initial state
      setUser(null);
      setIsAuthenticated(false);
      
      console.log('App initialized with clean auth state');
    } catch (error) {
      console.error('Auth initialization failed:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const authenticated = await authService.isAuthenticated();
      
      if (authenticated) {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginData) => {
    try {
      setIsLoading(true);
      const { user: userData } = await authService.login(credentials);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      await authService.register(userData);
      // Note: User might need to verify email before login
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, clear local state
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      const updatedUser = await authService.updateProfile(userData);
      setUser(updatedUser);
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  };

  const updateProfileWithPhoto = async (formData: FormData) => {
    try {
      const updatedUser = await authService.updateProfileWithPhoto(formData);
      setUser(updatedUser);
    } catch (error) {
      console.error('Profile photo update failed:', error);
      throw error;
    }
  };

  const uploadProfilePhoto = async (imageFile: FormData) => {
    try {
      const updatedUser = await authService.uploadProfilePhoto(imageFile);
      setUser(updatedUser);
    } catch (error) {
      console.error('Profile photo upload failed:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      if (isAuthenticated) {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('User refresh failed:', error);
      throw error;
    }
  };

  const clearAllTokens = async () => {
    try {
      console.log('Manually clearing all tokens...');
      await clearAllAuthTokens();
      setUser(null);
      setIsAuthenticated(false);
      console.log('All tokens cleared manually');
    } catch (error) {
      console.error('Manual token clear failed:', error);
      // Still update state even if clear fails
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    updateProfileWithPhoto,
    uploadProfilePhoto,
    refreshUser,
    clearAllTokens,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
