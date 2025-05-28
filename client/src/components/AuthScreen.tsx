// client/src/components/AuthScreen.tsx
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Sun, Moon, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { registerUser, loginUser } from "../api/auth"; // Import from dedicated API module

// Auth screen props - updated
interface AuthScreenProps {
  onLogin: () => void;  // Function to call when login is successful
  isDarkMode: boolean;
  toggleTheme: () => void;
  initialMode?: boolean; // true for login, false for register
}

export default function AuthScreen({ 
  onLogin, 
  isDarkMode, 
  toggleTheme, 
  initialMode = true 
}: AuthScreenProps) {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [isLogin, setIsLogin] = useState(initialMode); // Toggle between login and register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Update isLogin state when initialMode prop changes
  useEffect(() => {
    setIsLogin(initialMode);
  }, [initialMode]);
  
  // Theme-specific colors
  const themeClasses = isDarkMode 
    ? {
        bg: "bg-gray-950",
        cardBg: "bg-gray-900",
        border: "border-gray-800",
        text: "text-white",
        textSecondary: "text-gray-400",
        input: "bg-gray-800 border-gray-700",
        button: "bg-blue-600 hover:bg-blue-700",
        buttonSecondary: "bg-gray-800 hover:bg-gray-700",
        divider: "bg-gray-800",
      }
    : {
        bg: "bg-gray-50",
        cardBg: "bg-white",
        border: "border-gray-200",
        text: "text-gray-900",
        textSecondary: "text-gray-600",
        input: "bg-white border-gray-300",
        button: "bg-blue-500 hover:bg-blue-600",
        buttonSecondary: "bg-gray-100 hover:bg-gray-200",
        divider: "bg-gray-200",
      };
  
  // Handle login form submission
  const handleLogin = async () => {
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Call the login API function
      const result = await loginUser({
        email,
        password
      });
      
      // If login was successful
      if (result.success) {
        // Show success message
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        
        // Call onLogin to update auth state and navigate to home
        onLogin();
      } else {
        throw new Error(result.message || "Login failed");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Show error message
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle registration form submission
  const handleRegister = async () => {
    // Validation
    if (!name || !email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    if (password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Call the registration API function
      const result = await registerUser({
        name,
        email,
        password
      });
      
      // If registration was successful
      if (result.success) {
        // Show success message
        toast({
          title: "Registration successful",
          description: "Please log in with your credentials",
        });
        
        // Clear form fields
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        
        // Redirect to login page
        navigate('/login');
      } else {
        throw new Error(result.message || "Registration failed");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      
      // Show error message
      toast({
        title: "Registration failed",
        description: error.message || "Please check your information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Main form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Call the appropriate handler based on form mode
    if (isLogin) {
      handleLogin();
    } else {
      handleRegister();
    }
  };
  
  // Toggle between login and register modes
  const toggleAuthMode = () => {
    // Update the URL to reflect the current mode
    navigate(isLogin ? '/register' : '/login');
  };
  
  // Handle Google Sign-in (disabled for now)
  const handleGoogleSignIn = () => {
    toast({
      title: "Google Sign-in",
      description: "This feature is coming soon!",
    });
  };
  
  // Go back to landing page
  const goToLandingPage = () => {
    navigate('/');
  };
  
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${themeClasses.bg} ${themeClasses.text}`}>
      {/* Back button - added for navigation to landing page */}
      <button 
        onClick={goToLandingPage}
        className={`absolute top-4 left-4 p-2 rounded-full ${themeClasses.buttonSecondary} transition-colors flex items-center space-x-2`}
        aria-label="Back to landing page"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="text-sm">Back</span>
      </button>
      
      {/* Theme toggle button */}
      <button 
        onClick={toggleTheme}
        className={`absolute top-4 right-4 p-2 rounded-full ${themeClasses.buttonSecondary} transition-colors`}
        aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      >
        {isDarkMode ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </button>
      
      {/* Auth card */}
      <div className={`w-full max-w-md ${themeClasses.cardBg} rounded-lg shadow-lg border ${themeClasses.border} overflow-hidden`}>
        {/* Header with logo */}
        <div className="p-6 text-center">
          <div className="flex justify-center mb-3">
            <img 
      src="/Zerocode_onlyzerologo.png" 
      alt="ZeroCode Logo" 
  className="h-8" // Adjust height as needed
/>
          </div>
          <h1 className="text-2xl font-bold">ZeroCode</h1>
          <p className={`text-sm mt-1 ${themeClasses.textSecondary}`}>
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>
        
        {/* Auth mode toggle */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 mb-4 mx-6">
          <button
            onClick={() => navigate('/login')}
            className={`flex-1 py-2 text-center text-sm font-medium transition-colors ${
              isLogin 
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' 
                : `${themeClasses.textSecondary} hover:${themeClasses.text}`
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/register')}
            className={`flex-1 py-2 text-center text-sm font-medium transition-colors ${
              !isLogin 
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' 
                : `${themeClasses.textSecondary} hover:${themeClasses.text}`
            }`}
          >
            Register
          </button>
        </div>
        
        {/* Google Sign-in Button */}
        <div className="px-6 mb-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className={`w-full flex items-center justify-center space-x-2 py-2.5 rounded-md border ${themeClasses.border} text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span>{isLogin ? 'Sign in with Google' : 'Register with Google'}</span>
          </button>
        </div>
        
        {/* Or divider */}
        <div className="flex items-center px-6 mb-4">
          <div className={`flex-1 h-px ${themeClasses.divider}`}></div>
          <div className={`px-3 text-xs ${themeClasses.textSecondary}`}>OR</div>
          <div className={`flex-1 h-px ${themeClasses.divider}`}></div>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 pt-0 space-y-4">
          {/* Name field (only for registration) */}
          {!isLogin && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full p-2.5 rounded-md border text-sm ${themeClasses.input} ${themeClasses.text}`}
                placeholder="John Doe"
                disabled={isLoading}
              />
            </div>
          )}
          
          {/* Email field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-2.5 rounded-md border text-sm ${themeClasses.input} ${themeClasses.text}`}
              placeholder="name@example.com"
              disabled={isLoading}
              required
            />
          </div>
          
          {/* Password field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full p-2.5 pr-10 rounded-md border text-sm ${themeClasses.input} ${themeClasses.text}`}
                placeholder="Your password"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          
          {/* Confirm Password field (only for registration) */}
          {!isLogin && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full p-2.5 rounded-md border text-sm ${themeClasses.input} ${themeClasses.text}`}
                placeholder="Confirm your password"
                disabled={isLoading}
              />
            </div>
          )}
          
          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full p-2.5 mt-6 rounded-md text-white font-medium ${themeClasses.button} transition-colors`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
              </div>
            ) : (
              <span>{isLogin ? 'Sign in' : 'Create account'}</span>
            )}
          </button>
        </form>
        
        {/* Footer */}
        <div className="p-6 pt-0 text-center">
          <p className={`text-sm ${themeClasses.textSecondary}`}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button"
              onClick={toggleAuthMode}
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              {isLogin ? 'Register' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-8 text-center">
        <p className={`text-xs ${themeClasses.textSecondary}`}>
          ©2025 ZeroCode Labs. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}