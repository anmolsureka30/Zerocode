// client/src/components/DocumentationWrapper.tsx
import React, { useState, useEffect } from 'react';
import { useLocation } from "wouter";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Documentation from '@/pages/Documentation';

const DocumentationWrapper: React.FC = () => {
  const { logout } = useAuth();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if there's a stored preference, otherwise use dark mode as default
    const storedTheme = localStorage.getItem('theme');
    return storedTheme ? storedTheme === 'dark' : true;
  });

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

  // Navigate to home
  const goToHome = () => {
    navigate('/home');
  };
  
  // Navigate to templates
  const goToTemplates = () => {
    navigate('/templates');
  };

  return (
    <Documentation
      isDarkMode={isDarkMode}
      toggleTheme={toggleTheme}
      goToHome={goToHome}
      goToTemplates={goToTemplates}
    />
  );
};

export default DocumentationWrapper;