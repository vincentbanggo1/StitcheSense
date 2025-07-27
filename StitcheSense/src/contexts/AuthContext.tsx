import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiService } from '../services/api';
import type { User, UserLogin, UserCreate } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: UserLogin) => Promise<void>;
  register: (userData: UserCreate) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for stored user and token on app load
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('access_token');

        if (storedUser && token) {
          // Try to validate token by fetching current user
          const currentUser = await apiService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        // Token is invalid, clear storage
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        console.error('Token validation failed:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: UserLogin) => {
    try {
      setLoading(true);
      const response = await apiService.login(credentials);
      setUser(response.user);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: UserCreate) => {
    try {
      setLoading(true);
      await apiService.register(userData);
      
      // Auto login after registration
      await login({
        email: userData.email,
        password: userData.password,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      const updatedUser = await apiService.updateProfile(userData);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Update failed';
      throw new Error(message);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
