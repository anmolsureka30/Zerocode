// client/src/components/TemplatesWrapper.tsx
import React, { useState, useEffect } from 'react';
import { useLocation } from "wouter";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import TemplatesComponent from '@/pages/templates';

const TemplatesWrapper: React.FC = () => {
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

  // Handle logout
  const handleLogout = () => {
    toast({
      title: "Logging out",
      description: "You will be redirected to the landing page",
      duration: 1500,
    });
    
    // Short delay to show toast before logout
    setTimeout(() => {
      logout();
      navigate('/');
    }, 500);
  };

  // Navigate to home
  const goToHome = () => {
    navigate('/home');
  };
  
  // Navigate to documentation
  const goToDocumentation = () => {
    navigate('/documentation');
  };
  
  // Go to profile page
  const goToProfile = () => {
    navigate('/profile');
  };
  
  // When a template is selected
  const handleTemplateSelect = (templateId: string) => {
    // Store the selected template ID in localStorage or state management
    localStorage.setItem('selectedTemplate', templateId);
    
    // Navigate back to home
    navigate('/home');
  };

  return (
    <TemplatesComponent
      isDarkMode={isDarkMode}
      toggleTheme={toggleTheme}
      goToHome={goToHome}
      onSelectTemplate={handleTemplateSelect}
      goToDocumentation={goToDocumentation}
    />
  );
};

export default TemplatesWrapper;