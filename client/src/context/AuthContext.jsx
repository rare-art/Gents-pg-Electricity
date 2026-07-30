import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('gentspg_token') || null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const me = await api.getMe();
          if (me) {
            setUser(me);
          } else {
            logout();
          }
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    localStorage.setItem('gentspg_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setShowLoginModal(false);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('gentspg_token');
    setToken(null);
    setUser(null);
  };

  const isOwner = !!user && user.role === 'owner';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isOwner,
        loading,
        login,
        logout,
        showLoginModal,
        setShowLoginModal,
        openLoginModal: () => setShowLoginModal(true),
        closeLoginModal: () => setShowLoginModal(false)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
