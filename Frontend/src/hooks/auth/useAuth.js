import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

/**
 * Hook to require authentication
 * Redirects to login if not authenticated
 */
export const useRequireAuth = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/auth/login");
    }
  }, [isAuthenticated, loading, navigate]);

  return { loading };
};

/**
 * Hook to require admin role
 */
export const useRequireAdmin = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  return { loading };
};

/**
 * Hook to protect routes by role
 */
export const useRequireRole = (requiredRole) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || user.role !== requiredRole)) {
      navigate("/");
    }
  }, [user, loading, requiredRole, navigate]);

  return { loading };
};

/**
 * Hook to check if user is authenticated
 */
export const useIsAuthenticated = () => {
  const { isAuthenticated, loading } = useAuth();
  return { isAuthenticated, loading };
};

/**
 * Hook to check if user is admin
 */
export const useIsAdmin = () => {
  const { user } = useAuth();
  return user?.role === "admin";
};
