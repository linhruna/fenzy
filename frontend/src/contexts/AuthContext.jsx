import React, { createContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Check authentication on mount and when token changes
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedRole = localStorage.getItem('userRole');
    
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
      setIsAdmin(storedRole === 'admin');
    }
    setLoading(false);
  }, []);

  const login = useCallback((token, role, userData = null) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userRole', role);
    setToken(token);
    setIsAuthenticated(true);
    setIsAdmin(role === 'admin');
    if (userData) {
      setUser(userData);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('loginData');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  }, []);

  const updateAdminStatus = useCallback((isAdminUser) => {
    setIsAdmin(isAdminUser);
    if (isAdminUser) {
      localStorage.setItem('userRole', 'admin');
    } else {
      localStorage.setItem('userRole', 'client');
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        setIsAuthenticated,
        isAdmin,
        setIsAdmin: updateAdminStatus,
        loading,
        token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
