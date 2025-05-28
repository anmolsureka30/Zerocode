// client/src/pages/FAQPage.tsx - Complete implementation with fixed navigation
import React, { useState } from 'react';
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, ChevronUp, Sun, Moon, ArrowLeft, User, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FAQPageProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

type FAQItem = {
  question: string;
  answer: string;
  category: 'general' | 'product' | 'pricing' | 'technical';
};

export default function FAQPage({ isDarkMode, toggleTheme }: FAQPageProps) {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const { logout } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  
  // Theme-specific colors
  const themeClasses = isDarkMode 
    ? {
        bg: "bg-gray-950",
        cardBg: "bg-gray-900",
        border: "border-gray-800",
        text: "text-white",
        textSecondary: "text-gray-400",
        button: "bg-blue-600 hover:bg-blue-700",
        buttonSecondary: "bg-gray-800 hover:bg-gray-700",
        highlight: "bg-gray-800",
        activeTab: "bg-gray-800 text-white",
        inactiveTab: "text-gray-400 hover:text-white hover:bg-gray-800"
      }
    : {
        bg: "bg-gray-50",
        cardBg: "bg-white",
        border: "border-gray-200",
        text: "text-gray-900",
        textSecondary: "text-gray-600",
        button: "bg-blue-500 hover:bg-blue-600",
        buttonSecondary: "bg-gray-100 hover:bg-gray-200",
        highlight: "bg-gray-100",
        activeTab: "bg-blue-500 text-white",
        inactiveTab: "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      };
      
  // Navigation functions - FIXED
  const goToHome = () => {
    navigate('/');
  };
  
  const goToPricing = () => {
    navigate('/pricing');
  };
  
  // Handle logout
  const handleLogout = () => {
    toast({
      title: "Logging out",
      description: "You will be redirected to the landing page",
      duration: 1500,
    });
    
    setTimeout(() => {
      logout();
      window.location.href = '/';
    }, 500);
  };
  
  // Navigate to profile
  const goToProfile = () => {
    navigate('/profile');
  };
  
  // Toggle FAQ item expansion
  const toggleExpand = (index: number) => {
    setExpandedItem(expandedItem === index ? null : index);
  };
  
  // List of FAQs
  const faqs: FAQItem[] = [
    {
      question: "What is ZeroCode?",
      answer: "ZeroCode is an AI-powered platform that allows you to create fully functional mobile and web applications simply by describing what you want. Our platform transforms your descriptions into real, deployable code without requiring any programming knowledge.",
      category: 'general'
    },
    {
      question: "How does ZeroCode work?",
      answer: "ZeroCode uses advanced AI models to understand your requirements and generate the code needed to build your application. Simply describe your app in natural language, watch it being built in real-time, and make adjustments through conversation. When you're satisfied, you can deploy your app to various platforms.",
      category: 'general'
    },
    {
      question: "Do I need to know how to code to use ZeroCode?",
      answer: "Not at all! ZeroCode is specifically designed for non-technical users. You only need to describe what you want your app to do, and our AI handles the coding. Of course, if you are a developer, you can also use ZeroCode to accelerate your workflow and you'll have full access to the generated code.",
      category: 'general'
    },
    {
      question: "What kinds of applications can I build with ZeroCode?",
      answer: "ZeroCode supports a wide range of applications, including e-commerce platforms, social networks, business dashboards, content management systems, educational tools, and more. Our platform is versatile enough to handle most common app types and can integrate with various third-party services.",
      category: 'product'
    },
    {
      question: "Can I customize the applications ZeroCode generates?",
      answer: "Absolutely! You can customize your application in several ways: by refining your description, by using our interactive chat interface to request changes, or by directly editing the generated code if you have programming experience. ZeroCode gives you full control over the final product.",
      category: 'product'
    },
    {
      question: "How much does ZeroCode cost?",
      answer: "ZeroCode offers several pricing tiers to meet different needs. We have a free plan for simple projects, and paid plans starting at $19/month for more advanced features and larger projects. Please visit our Pricing page for detailed information about our plans and what each includes.",
      category: 'pricing'
    },
    {
      question: "Is there a free trial available?",
      answer: "Yes, we offer a 14-day free trial of our Pro plan, allowing you to explore all the features ZeroCode has to offer before committing to a subscription. No credit card is required to start your trial.",
      category: 'pricing'
    },
    {
      question: "What technologies does ZeroCode use to build applications?",
      answer: "ZeroCode generates applications using modern technologies and frameworks such as React, React Native, Vue.js, Node.js, Firebase, and more. The specific technologies used depend on your requirements and the type of application you're creating.",
      category: 'technical'
    },
    {
      question: "Can I export the code ZeroCode generates?",
      answer: "Yes, with our paid plans, you can export the generated code as a complete project that you can further develop, host, or deploy anywhere you like. The code belongs to you and is clean, maintainable, and follows industry best practices.",
      category: 'technical'
    },
    {
      question: "How do I deploy my application once it's built?",
      answer: "ZeroCode offers one-click deployment to various platforms including web hosting services, app stores (Google Play and Apple App Store), and even blockchain networks. Our guided deployment process makes it easy to get your application live and available to users.",
      category: 'technical'
    },
  ];
  
  // Filter FAQs based on active category
  const filteredFAQs = activeCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === activeCategory);
  
  return (
    <div className={`min-h-screen flex flex-col ${themeClasses.bg} ${themeClasses.text} transition-colors duration-200`}>
      {/* Header */}
      <header className={`bg-gradient-to-r from-blue-600 to-purple-600 shadow-md py-3 px-4`}>
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <a 
              href="/"
              className="p-1.5 rounded-md bg-white bg-opacity-10 hover:bg-opacity-20 text-white transition-colors shadow-sm"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </a>
            <img src="/zerocode_white.png" alt="ZeroCode Logo" className="h-10 w-auto object-contain" />
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <a 
              href="/" 
              className="text-white text-opacity-80 hover:text-opacity-100 text-sm transition-colors duration-150"
            >
              Home
            </a>
            <span className="text-white text-opacity-100 border-b border-white pb-0.5 text-sm transition-colors duration-150">
              FAQs
            </span>
            <a 
              href="/pricing"
              className="text-white text-opacity-80 hover:text-opacity-100 text-sm transition-colors duration-150"
            >
              Pricing
            </a>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Theme toggle button */}
            <button 
              onClick={toggleTheme}
              className="p-1.5 rounded-md bg-white bg-opacity-10 hover:bg-opacity-20 text-white transition-colors shadow-sm"
              aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="flex items-center space-x-2 px-3 py-1.5 bg-white bg-opacity-10 hover:bg-opacity-20 text-white text-sm rounded-md transition-colors duration-150 shadow-sm"
                  aria-label="User menu"
                >
                  <User className="h-4 w-4" />
                  <span>Account</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={`${themeClasses.cardBg} border ${themeClasses.border}`}>
                <DropdownMenuItem className="cursor-pointer" onClick={goToProfile}>
                  <User className="h-4 w-4 mr-2" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-red-500" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="container mx-auto py-8 px-4 flex-1">
        {/* Page title */}
        <div className="max-w-3xl mx-auto mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className={`${themeClasses.textSecondary} max-w-2xl mx-auto`}>
            Find answers to common questions about ZeroCode. If you can't find what you're looking for, 
            feel free to contact our support team.
          </p>
        </div>
        
        {/* Category tabs */}
        <div className="flex flex-wrap justify-center mb-8 gap-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeCategory === 'all' ? themeClasses.activeTab : themeClasses.inactiveTab
            }`}
          >
            All Questions
          </button>
          <button
            onClick={() => setActiveCategory('general')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeCategory === 'general' ? themeClasses.activeTab : themeClasses.inactiveTab
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveCategory('product')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeCategory === 'product' ? themeClasses.activeTab : themeClasses.inactiveTab
            }`}
          >
            Product
          </button>
          <button
            onClick={() => setActiveCategory('pricing')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeCategory === 'pricing' ? themeClasses.activeTab : themeClasses.inactiveTab
            }`}
          >
            Pricing
          </button>
          <button
            onClick={() => setActiveCategory('technical')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeCategory === 'technical' ? themeClasses.activeTab : themeClasses.inactiveTab
            }`}
          >
            Technical
          </button>
        </div>
        
        {/* FAQ accordion */}
        <div className="max-w-3xl mx-auto">
          {filteredFAQs.map((faq, index) => (
            <div 
              key={index} 
              className={`mb-4 rounded-lg overflow-hidden border ${themeClasses.border} ${themeClasses.cardBg}`}
            >
              <button
                onClick={() => toggleExpand(index)}
                className="w-full flex justify-between items-center p-4 text-left"
              >
                <span className="font-medium">{faq.question}</span>
                {expandedItem === index ? (
                  <ChevronUp className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 flex-shrink-0" />
                )}
              </button>
              
              {expandedItem === index && (
                <div className={`p-4 pt-0 ${themeClasses.textSecondary} border-t ${themeClasses.border}`}>
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
          
          {filteredFAQs.length === 0 && (
            <div className="text-center py-8">
              <p className={`${themeClasses.textSecondary}`}>No FAQs found in this category.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Contact section */}
      <div className={`py-10 ${themeClasses.highlight}`}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
          <p className={`${themeClasses.textSecondary} max-w-lg mx-auto mb-6`}>
            If you couldn't find the answer you were looking for, feel free to reach out to our support team.
          </p>
          <button className={`${themeClasses.button} text-white px-6 py-3 rounded-md font-medium`}>
            Contact Support
          </button>
        </div>
      </div>
      
      {/* Footer */}
      <footer className={`${themeClasses.bg} border-t ${themeClasses.border} py-3 px-4 text-xs ${themeClasses.textSecondary} text-center`}>
        ©2025 ZeroCode Labs. All Rights Reserved.
      </footer>
    </div>
  );
}