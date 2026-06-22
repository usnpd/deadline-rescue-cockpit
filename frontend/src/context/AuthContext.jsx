import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('HOME');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setCurrentView('DASHBOARD');
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/signin', { email, password });
      const { token, id, name, email: userEmail, roles } = response.data;
      
      const userData = { id, name, email: userEmail, roles };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setCurrentView('DASHBOARD');
      return { success: true };
    } catch (error) {
      console.error('Login error', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid credentials'
      };
    }
  };

  const signup = async (name, email, password) => {
    try {
      await axios.post('/api/auth/signup', { name, email, password });
      return { success: true };
    } catch (error) {
      console.error('Signup error', error);
      return {
        success: false,
        message: error.response?.data?.error || error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setCurrentView('HOME');
  };

  return (
    <AuthContext.Provider value={{ user, loading, currentView, setCurrentView, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
