import { jwtDecode } from "jwt-decode";

export const isLoggedIn = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    const isExpired = decoded.exp * 1000 < Date.now();

    if (isExpired) {
      logout(); // Clean up expired token
      return false;
    }

    return true;
  } catch (error) {
    console.error("Token decode error:", error);
    logout(); // Clean up invalid token
    return false;
  }
};

export const getUserRole = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded?.role || null;
  } catch (error) {
    console.error("Role decode error:", error);
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  // Optional: Add redirect logic if needed
};

// New: Get full user data from token
export const getAuthUser = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};
