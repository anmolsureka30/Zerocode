// client/src/pages/LandingPage.tsx - Complete implementation with fixed navigation
import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, ArrowRight, Sun, Moon, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import WaitlistForm from '../components/WaitlistForm';
import AppFooter from '../components/AppFooter';
import '../mascot-animation.css'; // Import the animation CSS

// Create a Link component that works like react-router's Link but uses wouter
interface LinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
}

const Link: React.FC<LinkProps> = ({ href, className, children }) => {
  const [_, navigate] = useLocation();
  return (
    <a href={href} className={className} onClick={(e) => {
      e.preventDefault();
      navigate(href);
    }}>
      {children}
    </a>
  );
};

// ZeroCode Logo Component
const ZeroCodeLogo = ({ className = 'h-8 w-auto' }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <img
        src="/headerlogo.png" // Replace with your actual logo path
        alt="ZeroCode Logo"
        height={32}      // Adjust as needed
        width={120}      // Adjust as needed
        className="object-contain"
      />
    </div>
  );
};

// ZeroCode Mascot Component with CSS-based animation
const ZeroCodeMascot = ({ className = 'h-64' }) => {
  return (
    <div className={`mascot-container ${className}`}>
      <img 
        src='/logos/mascot.png'
        alt="ZeroCode Mascot" 
        className="w-full h-full object-contain mascot-animate"
      />
    </div>
  );
};

// Partner Logos Component
const PartnerLogos = () => {
  const partners = [
    { name: 'IIT Guwahati', logo: '/logos/iit-guwahati.png' },
    { name: 'IIT Bombay', logo: '/logos/iit-bombay.png' },
    { name: 'IIT Kanpur', logo: '/logos/iit-kanpur.png' },
    { name: 'IIT Delhi', logo: '/logos/iit-delhi.png' },
  ];
  
  return (
    <div className="flex flex-wrap justify-center items-center" style={{ gap: '8rem' }}>
      {partners.map((partner, index) => (
        <div 
          key={index}
          className="h-16 md:h-50 flex items-center justify-center mx-4"
        >
          <img 
            src={partner.logo} 
            alt={partner.name} 
            className="h-full object-contain"
            style={{ maxWidth: '80px' }}
          />
        </div>
      ))}
    </div>
  );
};

// Payment Methods Component
const PaymentMethods = () => {
  const methods = ['Visa', 'Mastercard', 'PayPal', 'ApplePay', 'GooglePay'];
  
  return (
    <div className="flex space-x-2">
      {methods.map((method, index) => (
        <div key={index} className="bg-gray-100 rounded px-2 py-1 text-xs font-medium text-gray-700">
          {method}
        </div>
      ))}
    </div>
  );
};

// Testimonials
const testimonials = [
  {
    stars: 5,
    name: 'Sarah M.',
    verified: true,
    text: '"I\'m blown away by the quality and style of the website I received from Zerocode. From casual wear to elegant dresses, every piece I\'ve bought has exceeded my expectations."'
  },
  {
    stars: 5,
    name: 'Alex K.',
    verified: true,
    text: '"Finding a site that builds deployable sites in just one prompt is something I have always been looking for."'
    stars: 5,
  },
  {
    name: 'James L.',
    verified: true,
    text: '"Finding a site that builds trendy sites in just one prompt is something exciting."'
  }
];

// Feature boxes
const features = [
  {
    title: 'Real-Time App Generation',
    description: 'AI turns your description into fully functional mobile apps'
  },
  {
    title: 'Live UI Preview',
    description: 'See your app evolve visually as you chat'
  },
  {
    title: 'One-Click Deployment',
    description: 'Publish to App Store, Play Store, or even on-chain'
  },
  {
    title: 'Trendy, Optimized Design',
    description: 'Market-standard UI/UX from the start'
  },
  {
    title: 'Niche Use Hosting',
    description: 'Host and share apps for micro-communities (e.g. tutors, trainers)'
  },
  {
    title: 'No Coding or Setup Needed',
    description: 'Just describe — we do the rest'
  }
];

// Steps
const steps = [
  {
    number: 1,
    title: 'Describe your app in plain language'
  },
  {
    number: 2,
    title: 'Watch it come to life with AI-powered live UI preview'
  },
  {
    number: 3,
    title: 'Deploy on App Store, Play Store or Web3 instantly'
  }
];

// Main Landing Page Component Props
interface LandingPageProps {
  isAuthenticated: boolean;
}

// Main Landing Page Component
export default function LandingPage({ isAuthenticated }: LandingPageProps) {
  const { logout } = useAuth();
  const [_, navigate] = useLocation();
  const [showWaitlistForm, setShowWaitlistForm] = useState(false);

  // Handle navigation based on auth state
  const handleBuildNow = () => {
    if (isAuthenticated) {
      navigate('/app');
    } else {
      navigate('/login');
    }
  };
  
  // Navigation handlers
  const goToFAQ = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/faq');
  };
  
  const goToPricing = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/pricing');
  };
  
  // Open waitlist form
  const openWaitlistForm = () => {
    setShowWaitlistForm(true);
  };
  
  // Close waitlist form
  const closeWaitlistForm = () => {
    setShowWaitlistForm(false);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Waitlist form modal */}
      {showWaitlistForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <WaitlistForm onClose={closeWaitlistForm} isDarkMode={false} />
          </div>
        </div>
      )}
      
      {/* Navigation - Fixed at top */}
      <nav className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <a href="/" className="cursor-pointer">
                <ZeroCodeLogo className="h-8" />
              </a>
            </div>
            <div className="hidden sm:flex items-center space-x-10">
              <a href="/" className="text-gray-700 hover:text-blue-600">Home</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-blue-600">How it works?</a>
              <a href="/faq" onClick={goToFAQ} className="text-gray-700 hover:text-blue-600">FAQs</a>
              <a href="/pricing" onClick={goToPricing} className="text-gray-700 hover:text-blue-600">Pricing</a>
            </div>
            <div className="flex items-center space-x-3">
              {isAuthenticated ? (
                <a href="/app" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                  Go to App
                </a>
              ) : (
                <>
                  <a href="/login" className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50">
                    Log in
                  </a>
                  <a href="/login" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    Sign up
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Scrollable container */}
      <div className="flex-1 overflow-y-auto">
        {/* Main content area */}
        <main>
          {/* Hero Section */}
          <section className="bg-gray-300 py-16 rounded-b-3xl">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h1 className="text-4xl font-bold mb-4">Empowering Ideas, <br />No Code Required</h1>
                  <p className="text-lg mb-8">
                    Build and launch real mobile apps simply by describing them. ZeroCode turns your ideas into downloadable apps
                  </p>
                  <div className="flex space-x-4">
                    <button 
                      onClick={handleBuildNow}
                      className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Build now
                    </button>
                    <button 
                      onClick={openWaitlistForm}
                      className="px-6 py-3 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50"
                    >
                      Join the waitlist
                    </button>
                  </div>
                </div>
                <div className="flex justify-center">
                  <img 
                    src="/mascot.png" 
                    alt="ZeroCode Mascot with code and charts" 
                    className="h-85 object-contain mx-auto"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Partners */}
          <section className="py-12 bg-white" id="partners">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <h2 className="text-center text-xl font-medium mb-8">Trusted Partners across the nation</h2>
              <PartnerLogos />
            </div>
          </section>

          {/* App Builder Steps */}
          <section className="py-12 bg-gray-300 rounded-3xl mx-4 my-6" id="how-it-works">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <h3 className="text-sm font-medium uppercase mb-2">App Builder</h3>
              <h2 className="text-3xl font-bold mb-8">Your Apps, your way with ZeroCode</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {steps.map((step) => (
                  <div key={step.number} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start">
                      <div className="text-3xl font-bold text-blue-500 mr-3">
                        {step.number}.
                      </div>
                      <div>
                        {step.title}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="py-12 bg-white" id="features">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <h3 className="text-sm font-medium uppercase mb-2">Key Features</h3>
              <h2 className="text-3xl font-bold mb-8">Built for Speed, Scale & Simplicity</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-12 bg-white" id="testimonials">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <h2 className="text-3xl font-bold mb-8">Our Happy Users</h2>
              
              <div className="relative">
                <div className="flex justify-end space-x-2 mb-4">
                  <button className="p-2 border border-gray-300 rounded-full hover:bg-gray-300">
                    <ArrowLeft size={16} />
                  </button>
                  <button className="p-2 border border-gray-300 rounded-full hover:bg-gray-300">
                    <ArrowRight size={16} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {testimonials.map((testimonial, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex text-yellow-400 mb-3">
                        {[...Array(testimonial.stars)].map((_, i) => (
                          <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      
                      <div className="flex items-center mb-3">
                        <span className="font-medium">{testimonial.name}</span>
                        {testimonial.verified && (
                          <span className="ml-2 bg-green-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                            ✓
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 text-sm">{testimonial.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Newsletter */}
          <section className="py-12 bg-black text-white rounded-3xl mx-4 my-6" id="newsletter">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <h2 className="text-5xl font-bold mb-4 md:mb-0">
                  STAY UPTO DATE ABOUT<br />
                  OUR LATEST OFFERS
                </h2>
                <div className="w-full md:w-auto flex flex-col space-y-3">
                  <div className="flex items-center w-full md:w-80 bg-white rounded-lg overflow-hidden">
                    <span className="px-3 text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                        <path d="M22 7l-10 7L2 7"></path>
                      </svg>
                    </span>
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      className="px-2 py-3 w-full text-black outline-none"
                    />
                  </div>
                  <button 
                    onClick={openWaitlistForm}
                    className="px-4 py-3 w-full md:w-80 bg-white text-black rounded-lg font-medium hover:bg-gray-300"
                  >
                    Subscribe to Newsletter
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Spacer for footer visibility detection */}
          <div className="h-32" id="footer-observer"></div>
        </main>

        {/* Footer */}
        <AppFooter />
      </div>
    </div>
  );
}
