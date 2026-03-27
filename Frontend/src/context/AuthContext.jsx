import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import apiClient from "@/lib/apiClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("authToken"));
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const setSession = useCallback((nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    setIsAuthenticated(Boolean(nextToken && nextUser));

    if (nextToken && nextUser) {
      localStorage.setItem("authToken", nextToken);
      localStorage.setItem("currentUser", JSON.stringify(nextUser));
      return;
    }

    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
  }, []);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("authToken");
      const storedUser = localStorage.getItem("currentUser");

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setSession(storedToken, parsedUser);

          try {
            const response = await apiClient.get("/users/profile");
            const freshUser = response.data?.data;

            if (freshUser) {
              setSession(storedToken, freshUser);
            }
          } catch (profileError) {
            console.error("Error validating saved session:", profileError);

            if (profileError.status === 401 || profileError.status === 403) {
              setSession(null, null);
            }
          }
        } catch (error) {
          console.error("Error restoring auth state:", error);
          localStorage.removeItem("authToken");
          localStorage.removeItem("currentUser");
        }
      }

      setLoading(false);
    };

    initializeAuth();
  }, [setSession]);

  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      const response = await apiClient.post("/users/register", userData);
      const payload = response.data?.data;
      const newToken = payload?.token;
      const nextUser = payload?.user;

      setSession(newToken, nextUser);

      toast({
        title: "Success",
        description: "Registration successful!",
        variant: "default",
      });

      return { success: true, user: nextUser };
    } catch (error) {
      const message = error.data?.message || error.message;
      toast({
        title: "Registration Failed",
        description: message,
        variant: "destructive",
      });
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [setSession]);

  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      const response = await apiClient.post("/users/login", {
        email,
        password,
      });
      const payload = response.data?.data;
      const newToken = payload?.token;
      const loginUser = payload?.user;

      setSession(newToken, loginUser);

      toast({
        title: "Success",
        description: "Logged in successfully!",
        variant: "default",
      });

      return { success: true, user: loginUser };
    } catch (error) {
      const message = error.data?.message || error.message;
      toast({
        title: "Login Failed",
        description: message,
        variant: "destructive",
      });
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [setSession]);

  const logout = useCallback(() => {
    setSession(null, null);

    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
      variant: "default",
    });
  }, [setSession]);

  const updateProfile = useCallback(async (profileData) => {
    try {
      setLoading(true);
      const response = await apiClient.put("/users/profile", profileData);

      const updatedUser = response.data.data;
      setUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));

      toast({
        title: "Success",
        description: "Profile updated successfully!",
        variant: "default",
      });

      return { success: true, user: updatedUser };
    } catch (error) {
      const message = error.data?.message || error.message;
      toast({
        title: "Update Failed",
        description: message,
        variant: "destructive",
      });
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    register,
    login,
    logout,
    setSession,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
