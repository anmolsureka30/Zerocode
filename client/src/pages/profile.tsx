// client/src/pages/Profile.tsx
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { 
  ArrowLeft, 
  Sun, 
  Moon, 
  User, 
  Mail, 
  Lock, 
  Code, 
  Zap, 
  CreditCard, 
  Shield, 
  Bell,
  Save,
  LogOut
} from "lucide-react";

interface ProfileProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  onLogout?: () => void;
}

export default function Profile({ isDarkMode, toggleTheme, onLogout }: ProfileProps) {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<'account' | 'security' | 'notifications' | 'billing'>('account');
  
  // User state (mock data)
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john.doe@example.com");
  const [bio, setBio] = useState("Full-stack developer passionate about building AI-powered applications");
  const [github, setGithub] = useState("johndoe");
  const [isEditing, setIsEditing] = useState(false);
  
  // Mock subscription data
  const subscriptionData = {
    plan: "Pro",
    status: "Active",
    renewalDate: "May 16, 2026",
    price: "$19.99/month",
    features: [
      "Unlimited projects",
      "All templates",
      "Priority support",
      "Custom export options",
      "Team collaboration"
    ]
  };
  
  // Theme classes
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
        sidebar: "bg-gray-900",
        highlight: "bg-gray-800",
        gradient: "bg-gradient-to-r from-blue-600 to-purple-600",
        tabActive: "bg-gray-800 text-white",
        tabInactive: "text-gray-400 hover:text-white hover:bg-gray-800",
        badge: "bg-blue-900 text-blue-300",
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
        sidebar: "bg-white",
        highlight: "bg-gray-100",
        gradient: "bg-gradient-to-r from-blue-500 to-purple-500",
        tabActive: "bg-white text-blue-600 shadow-sm",
        tabInactive: "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
        badge: "bg-blue-100 text-blue-600",
      };
      
  // Go back to main app
  const goBack = () => {
    navigate('/app');
  };
  
  // Handle form save
  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile changes have been saved",
      duration: 3000,
    });
  };
  
  // Handle logout
  const handleLogout = () => {
    if (onLogout) {
      toast({
        title: "Logging out",
        description: "You will be redirected to the login screen",
        duration: 1500,
      });
      
      setTimeout(() => {
        onLogout();
      }, 500);
    }
  };
  
  return (
    <div className={`min-h-screen flex flex-col ${themeClasses.bg} ${themeClasses.text} transition-colors duration-200`}>
      {/* Header */}
      <header className={`${themeClasses.gradient} shadow-md py-3 px-4 transition-colors duration-200`}>
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo and title */}
          <div className="flex items-center space-x-3">
            <button 
              onClick={goBack}
              className="p-1.5 rounded-md bg-white bg-opacity-10 hover:bg-opacity-20 text-white transition-colors shadow-sm"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <img 
  src="/Zerocode_onlyzerologo.png" 
  alt="ZeroCode Logo" 
  className="h-8" // Adjust height as needed
/>
            <span className="font-bold text-xl tracking-tight text-white">User Profile</span>
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
            
            {/* Logout button */}
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-1.5 bg-white bg-opacity-10 hover:bg-opacity-20 text-white text-sm rounded-md transition-colors duration-150 shadow-sm"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg overflow-hidden shadow-sm`}>
              {/* User avatar and name */}
              <div className="p-6 text-center border-b border-gray-200 dark:border-gray-800">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
                    {name.charAt(0)}
                  </div>
                  <span className={`absolute bottom-0 right-0 w-6 h-6 rounded-full ${subscriptionData.plan === "Pro" ? "bg-blue-500" : "bg-green-500"} border-2 border-white dark:border-gray-900 flex items-center justify-center`}>
                    <Zap className="h-3 w-3 text-white" />
                  </span>
                </div>
                <h3 className="text-lg font-semibold">{name}</h3>
                <p className={`text-sm ${themeClasses.textSecondary} mt-1`}>{email}</p>
                <div className={`mt-2 inline-block px-2 py-1 rounded text-xs font-medium ${themeClasses.badge}`}>
                  {subscriptionData.plan} Plan
                </div>
              </div>
              
              {/* Navigation tabs */}
              <nav className="p-3">
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => setActiveTab('account')}
                      className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                        activeTab === 'account' ? themeClasses.tabActive : themeClasses.tabInactive
                      }`}
                    >
                      <User className="h-4 w-4 mr-3" />
                      Account
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('security')}
                      className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                        activeTab === 'security' ? themeClasses.tabActive : themeClasses.tabInactive
                      }`}
                    >
                      <Shield className="h-4 w-4 mr-3" />
                      Security
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('notifications')}
                      className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                        activeTab === 'notifications' ? themeClasses.tabActive : themeClasses.tabInactive
                      }`}
                    >
                      <Bell className="h-4 w-4 mr-3" />
                      Notifications
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('billing')}
                      className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                        activeTab === 'billing' ? themeClasses.tabActive : themeClasses.tabInactive
                      }`}
                    >
                      <CreditCard className="h-4 w-4 mr-3" />
                      Billing
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
          
          {/* Main content */}
          <div className="flex-1">
            <div className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg shadow-sm`}>
              {/* Account tab */}
              {activeTab === 'account' && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Account Information</h2>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className={`px-3 py-1.5 text-sm rounded-md ${isEditing ? 'bg-gray-200 dark:bg-gray-700' : themeClasses.buttonSecondary}`}
                    >
                      {isEditing ? 'Cancel' : 'Edit Profile'}
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Full Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={`w-full p-2.5 rounded-md border text-sm ${themeClasses.input} ${themeClasses.text}`}
                        />
                      ) : (
                        <div className={`p-2.5 rounded-md ${themeClasses.highlight}`}>{name}</div>
                      )}
                    </div>
                    
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`w-full p-2.5 rounded-md border text-sm ${themeClasses.input} ${themeClasses.text}`}
                        />
                      ) : (
                        <div className={`p-2.5 rounded-md ${themeClasses.highlight}`}>{email}</div>
                      )}
                    </div>
                    
                    {/* Bio */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Bio</label>
                      {isEditing ? (
                        <textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          rows={3}
                          className={`w-full p-2.5 rounded-md border text-sm ${themeClasses.input} ${themeClasses.text}`}
                        />
                      ) : (
                        <div className={`p-2.5 rounded-md ${themeClasses.highlight}`}>{bio}</div>
                      )}
                    </div>
                    
                    {/* GitHub */}
                    <div>
                      <label className="block text-sm font-medium mb-1">GitHub Username</label>
                      {isEditing ? (
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                            <Code className="h-4 w-4" />
                          </span>
                          <input
                            type="text"
                            value={github}
                            onChange={(e) => setGithub(e.target.value)}
                            className={`w-full p-2.5 pl-10 rounded-md border text-sm ${themeClasses.input} ${themeClasses.text}`}
                          />
                        </div>
                      ) : (
                        <div className={`p-2.5 rounded-md ${themeClasses.highlight} flex items-center`}>
                          <Code className="h-4 w-4 mr-2 text-gray-500" />
                          {github}
                        </div>
                      )}
                    </div>
                    
                    {/* Save button */}
                    {isEditing && (
                      <div className="flex justify-end">
                        <button
                          onClick={handleSave}
                          className={`px-4 py-2 rounded-md text-white ${themeClasses.button} flex items-center`}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Security tab */}
              {activeTab === 'security' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-6">Security Settings</h2>
                  
                  <div className="space-y-6">
                    {/* Password change */}
                    <div className={`p-4 rounded-lg border ${themeClasses.border}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-medium mb-1">Change Password</h3>
                          <p className={`text-sm ${themeClasses.textSecondary}`}>
                            Update your password to keep your account secure
                          </p>
                        </div>
                        <button className={`px-3 py-1.5 text-sm rounded-md ${themeClasses.button} text-white`}>
                          Change
                        </button>
                      </div>
                    </div>
                    
                    {/* Two-factor authentication */}
                    <div className={`p-4 rounded-lg border ${themeClasses.border}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-medium mb-1">Two-Factor Authentication</h3>
                          <p className={`text-sm ${themeClasses.textSecondary}`}>
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <button className={`px-3 py-1.5 text-sm rounded-md ${themeClasses.buttonSecondary}`}>
                          Enable
                        </button>
                      </div>
                    </div>
                    
                    {/* Account access */}
                    <div className={`p-4 rounded-lg border ${themeClasses.border}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-medium mb-1">Connected Accounts</h3>
                          <p className={`text-sm ${themeClasses.textSecondary}`}>
                            Manage third-party accounts and applications
                          </p>
                        </div>
                        <button className={`px-3 py-1.5 text-sm rounded-md ${themeClasses.buttonSecondary}`}>
                          Manage
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Notifications tab */}
              {activeTab === 'notifications' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>
                  
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg border ${themeClasses.border}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Email Notifications</h3>
                          <p className={`text-sm ${themeClasses.textSecondary}`}>Receive updates about your account via email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                    
                    <div className={`p-4 rounded-lg border ${themeClasses.border}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Project Updates</h3>
                          <p className={`text-sm ${themeClasses.textSecondary}`}>Receive notifications about your projects</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                    
                    <div className={`p-4 rounded-lg border ${themeClasses.border}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Marketing Emails</h3>
                          <p className={`text-sm ${themeClasses.textSecondary}`}>Receive promotional content and offers</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Billing tab */}
              {activeTab === 'billing' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-6">Subscription & Billing</h2>
                  
                  <div className={`mb-6 p-4 rounded-lg border ${themeClasses.border}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-medium">{subscriptionData.plan} Plan</h3>
                        <p className={`text-sm ${themeClasses.textSecondary}`}>
                          {subscriptionData.status} · Renews on {subscriptionData.renewalDate}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-medium">{subscriptionData.price}</div>
                        <button className={`mt-2 px-3 py-1.5 text-sm rounded-md ${themeClasses.button} text-white`}>
                          Upgrade
                        </button>
                      </div>
                    </div>
                    
                    <h4 className="font-medium mb-2">Features included:</h4>
                    <ul className="space-y-1">
                      {subscriptionData.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg border ${themeClasses.border}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Payment Method</h3>
                          <p className={`text-sm ${themeClasses.textSecondary}`}>Visa ending in 4242</p>
                        </div>
                        <button className={`px-3 py-1.5 text-sm rounded-md ${themeClasses.buttonSecondary}`}>
                          Update
                        </button>
                      </div>
                    </div>
                    
                    <div className={`p-4 rounded-lg border ${themeClasses.border}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Billing Address</h3>
                          <p className={`text-sm ${themeClasses.textSecondary}`}>123 Main St, San Francisco, CA 94103</p>
                        </div>
                        <button className={`px-3 py-1.5 text-sm rounded-md ${themeClasses.buttonSecondary}`}>
                          Edit
                        </button>
                      </div>
                    </div>
                    
                    <div className={`p-4 rounded-lg border ${themeClasses.border}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Billing History</h3>
                          <p className={`text-sm ${themeClasses.textSecondary}`}>View and download past invoices</p>
                        </div>
                        <button className={`px-3 py-1.5 text-sm rounded-md ${themeClasses.buttonSecondary}`}>
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className={`${themeClasses.bg} border-t ${themeClasses.border} py-3 px-4 text-xs ${themeClasses.textSecondary} text-center transition-colors duration-200`}>
        ©2025 ZeroCode Labs. All Rights Reserved.
      </footer>
    </div>
  );
}