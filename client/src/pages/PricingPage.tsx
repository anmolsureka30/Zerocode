// client/src/pages/PricingPage.tsx - Complete implementation with fixed navigation
import React, { useState } from 'react';
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Sun, Moon, ArrowLeft, User, LogOut, Settings, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PricingPageProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

type PricingPlan = {
  name: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  buttonLabel: string;
};

type BillingCycle = 'monthly' | 'yearly';

export default function PricingPage({ isDarkMode, toggleTheme }: PricingPageProps) {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const { logout } = useAuth();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  
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
        popularBadge: "bg-blue-900 text-blue-300",
        planCard: "bg-gray-900 border-gray-800 hover:border-gray-700",
        planCardPopular: "bg-gray-800 border-blue-700 hover:border-blue-600",
        switchBg: "bg-gray-800",
        switchActive: "bg-blue-600",
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
        popularBadge: "bg-blue-50 text-blue-600",
        planCard: "bg-white border-gray-200 hover:border-gray-300",
        planCardPopular: "bg-white border-blue-300 hover:border-blue-400",
        switchBg: "bg-gray-200",
        switchActive: "bg-blue-500",
      };
      
  // Navigation functions - FIXED
  const goToHome = () => {
    navigate('/');
  };
  
  const goToFAQ = () => {
    navigate('/faq');
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
  
  // Handle plan selection
  const selectPlan = (planName: string) => {
    toast({
      title: `Selected ${planName} Plan`,
      description: billingCycle === 'yearly' ? 'You will be billed yearly' : 'You will be billed monthly',
    });
    
    // In a real app, redirect to checkout or registration
    setTimeout(() => {
      navigate('/login');
    }, 1500);
  };
  
  // Pricing plans
  const plans: PricingPlan[] = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for trying out ZeroCode and building simple applications.",
      features: [
        "1 app project",
        "Basic templates",
        "Limited AI generations",
        "Preview mode",
        "Community support"
      ],
      buttonLabel: "Get Started"
    },
    {
      name: "Pro",
      price: billingCycle === 'monthly' ? "$19" : "$192",
      description: "Ideal for individuals and small teams building multiple applications.",
      features: [
        "10 app projects",
        "All templates",
        "Unlimited AI generations",
        "Export code",
        "Custom domains",
        "Advanced components",
        "Email support"
      ],
      isPopular: true,
      buttonLabel: "Start Free Trial"
    },
    {
      name: "Business",
      price: billingCycle === 'monthly' ? "$49" : "$490",
      description: "For teams and businesses needing advanced features and priority support.",
      features: [
        "Unlimited app projects",
        "Team collaboration",
        "Priority AI queue",
        "White label exports",
        "API access",
        "Custom integrations",
        "Priority support",
        "Training & onboarding"
      ],
      buttonLabel: "Contact Sales"
    }
  ];

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
            <a 
              href="/faq"
              className="text-white text-opacity-80 hover:text-opacity-100 text-sm transition-colors duration-150"
            >
              FAQs
            </a>
            <span className="text-white text-opacity-100 border-b border-white pb-0.5 text-sm transition-colors duration-150">
              Pricing
            </span>
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
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className={`${themeClasses.textSecondary} max-w-2xl mx-auto`}>
            Choose the plan that's right for you and start building amazing applications without code.
          </p>
        </div>
        
        {/* Billing toggle */}
        <div className="flex justify-center items-center mb-8">
          <span className={`mr-3 ${billingCycle === 'monthly' ? themeClasses.text : themeClasses.textSecondary}`}>Monthly</span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              billingCycle === 'yearly' ? themeClasses.switchActive : themeClasses.switchBg
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <div className="ml-3 flex items-center">
            <span className={`${billingCycle === 'yearly' ? themeClasses.text : themeClasses.textSecondary}`}>Yearly</span>
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 font-medium">
              Save 20%
            </span>
          </div>
        </div>
        
        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`rounded-lg border-2 ${
                plan.isPopular 
                  ? `${themeClasses.planCardPopular} relative overflow-hidden` 
                  : themeClasses.planCard
              } transition-all hover:shadow-lg p-6`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 right-0">
                  <div className={`${themeClasses.popularBadge} shadow-sm px-3 py-1 font-medium text-xs rounded-bl-lg`}>
                    Most Popular
                  </div>
                </div>
              )}
              
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="flex items-end mb-2">
                <span className="text-3xl font-bold">{plan.price}</span>
                {plan.name !== "Free" && (
                  <span className={`ml-1 ${themeClasses.textSecondary}`}>/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                )}
              </div>
              <p className={`text-sm ${themeClasses.textSecondary} mb-6`}>
                {plan.description}
              </p>
              
              <button
                onClick={() => selectPlan(plan.name)}
                className={`w-full mb-6 py-2 rounded-md font-medium ${
                  plan.isPopular 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : plan.name === "Free" 
                      ? `${themeClasses.buttonSecondary}` 
                      : `${themeClasses.button} text-white`
                } transition-colors`}
              >
                {plan.buttonLabel}
              </button>
              
              <div className="space-y-3">
                <p className="text-sm font-medium">Features included:</p>
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Enterprise section */}
      <div className={`py-12 ${themeClasses.highlight}`}>
        <div className="container mx-auto px-4 max-w-4xl">
          <div className={`rounded-xl ${themeClasses.cardBg} p-8 border ${themeClasses.border}`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Need a custom solution?</h2>
                <p className={`${themeClasses.textSecondary}`}>
                  We offer customized enterprise plans with dedicated support, custom integrations, and more.
                </p>
              </div>
              <button className={`${themeClasses.button} text-white px-6 py-3 rounded-md font-medium whitespace-nowrap`}>
                Contact our Sales Team
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* FAQ section */}
      <div className="py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className={`${themeClasses.textSecondary} max-w-lg mx-auto mb-6`}>
            Find answers to common questions about our pricing and plans.
          </p>
          <button 
            onClick={goToFAQ}
            className={`${themeClasses.buttonSecondary} px-6 py-3 rounded-md font-medium`}
          >
            View All FAQs
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