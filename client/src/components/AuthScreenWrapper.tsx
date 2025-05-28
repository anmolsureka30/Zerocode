// client/src/components/AuthScreenWrapper.tsx
import React, { useState, useEffect } from 'react';
import { useLocation } from "wouter";
import AuthScreen from './AuthScreen'; // Import the AuthScreen component
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AuthScreenWrapperProps {
  initialMode?: 'login' | 'register';
}

const AuthScreenWrapper: React.FC<AuthScreenWrapperProps> = ({ initialMode = 'login' }) => {
  const { login, isAuthenticated } = useAuth();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if there's a stored preference, otherwise use dark mode as default
    const storedTheme = localStorage.getItem('theme');
    return storedTheme ? storedTheme === 'dark' : true;
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app');
    }
  }, [isAuthenticated, navigate]);

  // Apply theme on component mount and when it changes
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);
  
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    
    toast({
      title: `Switched to ${!isDarkMode ? 'Dark' : 'Light'} Mode`,
      description: `The interface is now in ${!isDarkMode ? 'dark' : 'light'} mode.`,
      duration: 2000,
    });
  };

  // Handle successful login only (not registration)
  const handleLoginSuccess = () => {
    console.log("Login successful in AuthScreenWrapper");
    
    // Call the login function from AuthContext to update the authenticated state
    login();
    
    // Show toast for login success
    toast({
      title: "Login Successful",
      description: "Welcome to ZeroCode!",
      duration: 2000,
    });
    
    // Navigate to main app page
    navigate('/app');
  };

  return (
    <AuthScreen 
      onLogin={handleLoginSuccess} 
      isDarkMode={isDarkMode} 
      toggleTheme={toggleTheme}
      initialMode={initialMode === 'register' ? false : true}
    />
  );
};

export default AuthScreenWrapper;

