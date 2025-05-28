import React, { useState, useEffect } from 'react';
import { Facebook, Twitter, Github, Instagram } from 'lucide-react';

export default function AppFooter() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Create an observer for the footer
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Update visibility state based on intersection
        setIsVisible(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
      }
    );

    // Get the footer observer element
    const target = document.getElementById('footer-observer');
    if (target) {
      observer.observe(target);
    }

    // Cleanup observer on unmount
    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, []);

  return (
    <footer 
      className={`bg-gray-100 border-t border-gray-200 transition-all duration-500 ease-in-out ${
        isVisible 
          ? 'opacity-100 transform translate-y-0' 
          : 'opacity-0 transform translate-y-full'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-2 md:col-span-1">
            <img
              src="/headerlogo.png"
              alt="ZeroCode Logo"
              className="h-8 w-auto mb-4"
            />
            <p className="text-sm text-gray-600 mb-4">
              Empowering everyone to build amazing apps without code.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-gray-600">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600">
                <Github size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Product</h3>
            <ul className="space-y-2">
              <li><a href="#features" className="text-gray-600 hover:text-gray-900 text-sm">Features</a></li>
              <li><a href="#how-it-works" className="text-gray-600 hover:text-gray-900 text-sm">How it Works</a></li>
              <li><a href="/pricing" className="text-gray-600 hover:text-gray-900 text-sm">Pricing</a></li>
              <li><a href="/faq" className="text-gray-600 hover:text-gray-900 text-sm">FAQ</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Documentation</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Blog</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Tutorials</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Support</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Terms of Service</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} ZeroCode. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Status</a>
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Security</a>
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
