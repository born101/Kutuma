import React, { useState, useEffect, useCallback } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trpcClient } from '@/lib/trpc';

interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  isRunner: boolean;
  verified: boolean;
  emailVerified?: boolean;
  rating: number;
  completedTasks: number;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const validationInProgress = React.useRef(false);

  const logout = useCallback(async () => {
    try {
      const currentToken = await AsyncStorage.getItem(TOKEN_KEY);
      if (currentToken) {
        try {
          await trpcClient.auth.logout.mutate({ token: currentToken });
          console.log('✅ Logged out successfully');
        } catch (error) {
          console.error('⚠️ Server logout failed, continuing with client cleanup:', error);
        }
      }

      setUser(null);
      setToken(null);
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
      console.log('✅ Client session cleared');
    } catch (error) {
      console.error('❌ Logout error:', error);
      setUser(null);
      setToken(null);
    }
  }, []);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
        const storedUser = await AsyncStorage.getItem(USER_KEY);

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
          console.log('📱 Loaded session from storage');

          // Validate session in the background after a short delay
          setTimeout(async () => {
            // Prevent concurrent validation calls
            if (validationInProgress.current) {
              console.log('⏸️ Session validation already in progress, skipping...');
              return;
            }

            validationInProgress.current = true;
            try {
              console.log('🔄 Validating session with server...');
              const currentUser = await trpcClient.auth.getCurrentUser.query({ token: storedToken });
              setUser(currentUser);
              await AsyncStorage.setItem(USER_KEY, JSON.stringify(currentUser));
              console.log('✅ Session validated successfully');
            } catch (error: any) {
              const errorMsg = error?.message || String(error);
              console.warn('⚠️ Session validation failed:', errorMsg);
              
              const isNetworkError = 
                errorMsg.includes('Failed to fetch') || 
                errorMsg.includes('Network request failed') ||
                errorMsg.includes('network') ||
                errorMsg.includes('timeout') ||
                errorMsg.includes('API not configured');
              
              if (isNetworkError) {
                console.log('📶 Network error - keeping local session, will retry later');
              } else {
                console.warn('🔐 Session invalid - clearing session');
                setUser(null);
                setToken(null);
                await AsyncStorage.removeItem(TOKEN_KEY);
                await AsyncStorage.removeItem(USER_KEY);
              }
            } finally {
              validationInProgress.current = false;
            }
          }, 500);
        } else {
          console.log('📭 No stored session found');
        }
      } catch (error) {
        console.error('❌ Failed to load session:', error);
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  const login = async (userData: User, authToken: string) => {
    try {
      setUser(userData);
      setToken(authToken);
      await AsyncStorage.setItem(TOKEN_KEY, authToken);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      console.log('✅ Login successful');
    } catch (error) {
      console.error('❌ Failed to save login data:', error);
      throw error;
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;

    try {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      console.log('✅ User updated');
    } catch (error) {
      console.error('❌ Failed to update user:', error);
    }
  };

  const switchToRunner = async () => {
    await updateUser({ isRunner: true });
  };

  const switchToRequester = async () => {
    await updateUser({ isRunner: false });
  };

  return {
    user,
    token,
    isLoading,
    login,
    logout,
    updateUser,
    switchToRunner,
    switchToRequester,
  };
});
