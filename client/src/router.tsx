// client/src/router.tsx
import React from 'react';
import { Route, Switch, useLocation } from 'wouter';
import LandingPage from './pages/LandingPage';
import Home from './pages/home'; // Import your Home component
import AuthScreenWrapper from './components/AuthScreenWrapper'; // Use the wrapper instead of AuthScreen
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import FAQPage from './pages/FAQPage';
import PricingPage from './pages/PricingPage';

// Create AppRouter component that uses auth context
const AppRouter: React.FC = () => {
  // Get authentication status from context
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();

  return (
    <Switch location={location}>
      <Route path="/">
        <LandingPage isAuthenticated={isAuthenticated} />
      </Route>
      <Route path="/faq">
        <FAQPage isDarkMode={false} toggleTheme={() => {}} />
      </Route>
      <Route path="/pricing">
        <PricingPage isDarkMode={false} toggleTheme={() => {}} />
      </Route>
      <Route path="/app">
        <ProtectedRoute>
          <Home isDarkMode={false} onLogout={() => window.location.href = '/'} />
        </ProtectedRoute>
      </Route>
      <Route path="/login">
        {isAuthenticated ? (() => { window.location.href = '/app'; return null; })() : <AuthScreenWrapper />}
      </Route>
      <Route path="/:rest*">
        {() => {
          window.location.href = '/';
          return null;
        }}
      </Route>
    </Switch>
  );
};

export default AppRouter;