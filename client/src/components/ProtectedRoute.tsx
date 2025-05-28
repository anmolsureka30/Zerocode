// client/src/components/ProtectedRoute.tsx
import React from 'react';
import { useLocation } from "wouter";
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectPath?: string;
}

// Component to protect routes that require authentication
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectPath = '/login' 
}) => {
  const { isAuthenticated } = useAuth();
  const [_, setLocation] = useLocation();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      setLocation(redirectPath);
    }
  }, [isAuthenticated, redirectPath, setLocation]);

  return isAuthenticated ? <>{children}</> : null;
};

export default ProtectedRoute;
