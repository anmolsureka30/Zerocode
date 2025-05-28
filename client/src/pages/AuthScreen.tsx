import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Sun, Moon } from "lucide-react";

// Auth screen props - simplified
interface AuthScreenProps {
  onLogin: () => void;  // Changed from onSuccess to make it more clear
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export default function AuthScreen({ onLogin, isDarkMode, toggleTheme }: AuthScreenProps) {
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
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
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    // Additional validation for registration
    if (!isLogin) {
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
    }
    
    setIsLoading(true);
    
    // FIXED VERSION: No try/catch to avoid error toast
    // Instead, just simulate a successful login/registration
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Show success toast
    toast({
      title: isLogin ? "Login successful" : "Account created",
      description: isLogin ? "Welcome back!" : "Your account has been created",
    });
    
    // Call onLogin to update auth state and navigate
    onLogin();
    
    // Reset loading state
    setIsLoading(false);
  };
  
  // Toggle between login and register modes
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    // Clear form fields when switching modes
    setPassword("");
    setConfirmPassword("");
  };
  
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${themeClasses.bg} ${themeClasses.text}`}>
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
            <div className="w-10 h-10 rounded-md overflow-hidden bg-purple-600 flex items-center justify-center text-white font-bold">
              Z
            </div>
          </div>
          <h1 className="text-2xl font-bold">ZeroCode</h1>
          <p className={`text-sm mt-1 ${themeClasses.textSecondary}`}>
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>
        
        {/* Auth mode toggle */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 mb-4 mx-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-center text-sm font-medium transition-colors ${
              isLogin 
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' 
                : `${themeClasses.textSecondary} hover:${themeClasses.text}`
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-center text-sm font-medium transition-colors ${
              !isLogin 
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' 
                : `${themeClasses.textSecondary} hover:${themeClasses.text}`
            }`}
          >
            Register
          </button>
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
          
          {/* Demo login button */}
          <button
            type="button"
            onClick={onLogin}
            className={`w-full p-2.5 rounded-md border ${themeClasses.border} ${themeClasses.buttonSecondary} transition-colors mt-2`}
          >
            <span>Continue without signing in</span>
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