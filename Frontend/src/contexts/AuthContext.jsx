import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulated authentication functions (replace with actual API calls)
  const signUp = async (email, password, name) => {
    try {
      // Simulate API call
      const userData = {
        id: Date.now(),
        email,
        name,
        createdAt: new Date().toISOString()
      };
      
      // Store in localStorage for demo purposes
      localStorage.setItem('synergy_user', JSON.stringify(userData));
      setCurrentUser(userData);
      return userData;
    } catch (error) {
      throw new Error('Failed to create account');
    }
  };

  const signIn = async (email, password) => {
    try {
      // Simulate API call - in real app, validate credentials with backend
      const storedUser = localStorage.getItem('synergy_user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (userData.email === email) {
          setCurrentUser(userData);
          return userData;
        }
      }
      
      // If no stored user, create a demo user
      const userData = {
        id: Date.now(),
        email,
        name: email.split('@')[0],
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem('synergy_user', JSON.stringify(userData));
      setCurrentUser(userData);
      return userData;
    } catch (error) {
      throw new Error('Failed to sign in');
    }
  };

  const signOut = async () => {
    localStorage.removeItem('synergy_user');
    setCurrentUser(null);
  };

  const resetPassword = async (email) => {
    // Simulate password reset
    return Promise.resolve('Password reset email sent');
  };

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('synergy_user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const value = {
    currentUser,
    signUp,
    signIn,
    signOut,
    resetPassword,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
