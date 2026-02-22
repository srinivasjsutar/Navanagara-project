import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "../api/axios"; // Use axios instance

export function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        // Use axiosInstance for automatic token handling
        const response = await axiosInstance.get("/admin/verify");

        if (response.data.success) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminData");
        }
      } catch (error) {
        console.error("Token verification failed:", error);
        setIsAuthenticated(false);
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminData");
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // ✅ FIXED: Changed from '/admin/login' to '/adminlogin'
    return <Navigate to="/adminlogin" replace />;
  }

  return children;
}
