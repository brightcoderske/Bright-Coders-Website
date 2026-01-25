import React, { useState, useEffect } from "react";
import UserContext from "./UserContext";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // New loading state

 useEffect(() => {
  const checkUser = async () => {
    console.log("🔍 [UserProvider] Checking session...");
    try {
      const response = await axiosInstance.get(API_PATHS.AUTH.GET_USER_INFO);
      console.log("✅ [UserProvider] Session valid:", response.data.user);
      setUser(response.data.user);
    } catch (err) {
      console.error("❌ [UserProvider] Session invalid or 401:", err.response?.status);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  checkUser();
}, []);

  const updateUser = (userData) => setUser(userData);
  const clearUser = () => setUser(null);

  return (
    <UserContext.Provider value={{ user, updateUser, clearUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
