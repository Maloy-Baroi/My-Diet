import * as SecureStore from 'expo-secure-store';

/**
 * Utility functions for authentication management
 */

/**
 * Clear all authentication-related data from secure storage
 * This function can be called manually or during app initialization
 */
export const clearAllAuthTokens = async (): Promise<void> => {
  try {
    console.log('Clearing all authentication tokens...');
    
    // List of all possible auth-related keys
    const authKeys = [
      'access_token',
      'refresh_token',
      'user_preferences',
      'last_login',
      // Add any other auth-related storage keys here
    ];
    
    // Clear all auth-related data
    const clearPromises = authKeys.map(async (key) => {
      try {
        await SecureStore.deleteItemAsync(key);
        console.log(`Cleared: ${key}`);
      } catch (error) {
        console.log(`Key ${key} not found or already cleared`);
      }
    });
    
    await Promise.all(clearPromises);
    console.log('All authentication tokens cleared successfully');
  } catch (error) {
    console.error('Error clearing authentication tokens:', error);
  }
};

/**
 * Check if any auth tokens exist in storage
 */
export const hasAuthTokens = async (): Promise<boolean> => {
  try {
    const accessToken = await SecureStore.getItemAsync('access_token');
    const refreshToken = await SecureStore.getItemAsync('refresh_token');
    return !!(accessToken || refreshToken);
  } catch (error) {
    console.error('Error checking auth tokens:', error);
    return false;
  }
};

/**
 * Development utility: Force clear all tokens (for testing)
 */
export const forceLogoutAndClear = async (): Promise<void> => {
  try {
    console.log('Force clearing all auth data for development...');
    await clearAllAuthTokens();
    
    // You could also clear other app-related data here if needed
    // For example: AsyncStorage, user preferences, cached data, etc.
    
    console.log('Force logout completed');
  } catch (error) {
    console.error('Error during force logout:', error);
  }
};
