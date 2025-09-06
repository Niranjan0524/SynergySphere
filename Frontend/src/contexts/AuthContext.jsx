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
  const [token, setToken] = useState(null);

  // Base API URL - update this to match your backend
  const API_BASE_URL = 'http://localhost:5000';

  // Sign up with real API call
  const signUp = async (email, password, name) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create account');
      }

      // For registration, we don't get a token immediately
      // User needs to login after successful registration
      return data.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to create account');
    }
  };

  // Sign in with real API call
  const signIn = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to sign in');
      }

      // Extract token, userId, and userName from API response
      const { token: userToken, userId, userName } = data.data;

      // Create user object
      const userData = {
        id: userId,
        userId: userId,
        name: userName,
        userName: userName,
        email,
        token: userToken,
        loginTime: new Date().toISOString()
      };

      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', userToken);
      localStorage.setItem('userId', userId.toString());
      localStorage.setItem('userName', userName);

      // Update state
      setCurrentUser(userData);
      setToken(userToken);

      return userData;
    } catch (error) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  };

  const signOut = async () => {
    try {
      // Call logout API if needed
      const storedToken = localStorage.getItem('synergy_token');
      if (storedToken) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${storedToken}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local logout even if API call fails
    }

    // Clear all stored data
    localStorage.removeItem('synergy_user');
    localStorage.removeItem('synergy_token');
    localStorage.removeItem('synergy_userId');
    localStorage.removeItem('synergy_userName');
    
    // Clear state
    setCurrentUser(null);
    setToken(null);
  };

  const resetPassword = async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset email');
      }

      return data.message;
    } catch (error) {
      throw new Error(error.message || 'Failed to send reset email');
    }
  };

  // Helper function to get auth headers for API calls
  const getAuthHeaders = () => {
    const storedToken = localStorage.getItem('synergy_token');
    return {
      'Content-Type': 'application/json',
      ...(storedToken && { 'Authorization': `Bearer ${storedToken}` })
    };
  };

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('synergy_user');
    const storedToken = localStorage.getItem('synergy_token');
    
    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser);
        setCurrentUser(userData);
        setToken(storedToken);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        // Clear corrupted data
        localStorage.removeItem('synergy_user');
        localStorage.removeItem('synergy_token');
        localStorage.removeItem('synergy_userId');
        localStorage.removeItem('synergy_userName');
      }
    }
    setLoading(false);
  }, []);

  const value = {
    currentUser,
    token,
    signUp,
    signIn,
    signOut,
    resetPassword,
    loading,
    getAuthHeaders,
    // Helper getters for easy access
    userId: currentUser?.userId || null,
    userName: currentUser?.userName || null,
    userEmail: currentUser?.email || null
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
