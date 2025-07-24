import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // First check if there's stored user data
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (e) {
          localStorage.removeItem('user');
        }
      }

      // Then verify with backend
      const authCheck = await apiService.checkAuthStatus();
      
      if (authCheck.isAuthenticated) {
        const userData = authCheck.user;
        const userDataFormatted = {
          id: userData.id,
          name: userData.username || userData.name,
          email: userData.email,
          phone: userData.phone || userData.phone_number,
          userType: userData.role === 'owner' ? 'restaurant' : 'customer',
          role: userData.role,
          avatar: null,
          restaurants: userData.restaurants || []
        };
        setUser(userDataFormatted);
        localStorage.setItem('user', JSON.stringify(userDataFormatted));
      } else {
        // Backend says not authenticated, clear local storage
        setUser(null);
        localStorage.removeItem('user');
      }
    } catch (error) {
      // Network error or other issues - keep existing user if available
      // Don't log 401/Unauthorized errors as they're expected when not authenticated
      if (!error.message.includes('401') && !error.message.includes('Unauthorized')) {
        console.warn('Auth check failed:', error.message);
      }
      
      const storedUser = localStorage.getItem('user');
      if (storedUser && !error.message.includes('401') && !error.message.includes('Unauthorized')) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          setUser(null);
          localStorage.removeItem('user');
        }
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = (userData) => {
    setUser(userData);
    // Store user data in localStorage for persistence
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      // Clear session on backend and stored token
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      // Optionally redirect to home page
      window.location.href = '/';
    }
  };

  const updateProfile = async (updatedData) => {
    try {
      await apiService.updateUserProfile(updatedData);
      // Refresh user data
      await checkAuthStatus();
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      updateProfile,
      loading,
      isAuthenticated: !!user,
      checkAuthStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
};
