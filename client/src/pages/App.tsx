// client/src/App.tsx - Updated to use your existing Profile component
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import LandingPage from "../pages/LandingPage";
import AuthScreenWrapper from "@/components/AuthScreenWrapper";
import ProtectedRoute from "../components/ProtectedRoute";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import HomeWrapper from "@/components/HomeWrapper"; // Import the updated HomeWrapper
import Profile from "@/pages/Profile"; // Import your existing Profile component
import "./index.css"; // Import global styles
import React, { useEffect } from "react";

// Not Found redirect component
function NotFoundRedirect() {
  const [_, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app');
    } else {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  return <NotFound />;
}

// Router with authentication checks
function Router() {
  const { isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [_, navigate] = useLocation();
  
  // Apply theme based on the current location
  useEffect(() => {
    // Default to dark theme for app pages, light for landing/login
    const prefersDark = location !== '/' && !location.startsWith('/login');
    document.documentElement.classList.toggle('dark', prefersDark);
  }, [location]);
  
  // Get theme from localStorage
  const isDarkMode = localStorage.getItem('theme') === 'dark';
  
  // Toggle theme function
  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newDarkMode);
  };
  
  // Handle logout function
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={() => <LandingPage isAuthenticated={isAuthenticated} />} />
      <Route path="/login" component={() => <AuthScreenWrapper initialMode="login" />} />
      <Route path="/register" component={() => <AuthScreenWrapper initialMode="register" />} />
      
      {/* Protected routes */}
      <Route path="/app">
        {() => (
          <ProtectedRoute>
            <HomeWrapper />
          </ProtectedRoute>
        )}
      </Route>
      
      {/* Direct profile route using your existing Profile component */}
      <Route path="/profile">
        {() => (
          <ProtectedRoute>
            <Profile 
              isDarkMode={isDarkMode} 
              toggleTheme={toggleTheme}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        )}
      </Route>
      
      {/* Handle template and documentation routing */}
      <Route path="/templates">
        {() => (
          <ProtectedRoute>
            <HomeWrapper initialTab="templates" />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/documentation">
        {() => (
          <ProtectedRoute>
            <HomeWrapper initialTab="documentation" />
          </ProtectedRoute>
        )}
      </Route>
      
      {/* 404 Route with smart redirect */}
      <Route component={NotFoundRedirect} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;