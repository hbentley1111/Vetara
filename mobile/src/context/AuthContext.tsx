import React, {createContext, useContext, useEffect, useState, ReactNode} from 'react';
import {User} from '@/types';
import {apiClient, storage} from '@/services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuthStatus = async () => {
    try {
      const token = await storage.getAuthToken();
      if (token) {
        const userData = await apiClient.getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
        await storage.setUserData(userData);
      }
    } catch (error) {
      console.log('Auth check failed:', error);
      await storage.clearAuthData();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await apiClient.login(email, password);
      
      await storage.setAuthToken(response.token);
      await storage.setUserData(response.user);
      
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.log('Logout error:', error);
    } finally {
      await storage.clearAuthData();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const userData = await apiClient.getCurrentUser();
      setUser(userData);
      await storage.setUserData(userData);
    } catch (error) {
      console.log('Refresh user failed:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};