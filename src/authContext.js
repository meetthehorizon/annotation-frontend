// src/authContext.js
import React, { createContext, useContext, useState } from "react";
import {
  isLoggedIn,
  getUserRole,
  logout as authLogout,
  getAuthUser,
} from "./auth/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getAuthUser());

  const login = (token) => {
    localStorage.setItem("token", token);
    setUser(getAuthUser());
  };

  const logout = () => {
    authLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: isLoggedIn(),
        userRole: getUserRole(),
        user,
        token: localStorage.getItem("token"),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
