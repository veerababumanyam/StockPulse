import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '@components/auth/ProtectedRoute';
import { ToastProvider } from '@hooks/useToast';
import { ThemeProvider } from '@contexts/ThemeContext';
import { themeEngine } from './theme/themeEngine';

// Public Pages
import LandingPage from '@pages/auth/LandingPage';
import FeaturesPage from '@pages/FeaturesPage';
import PricingPage from '@pages/auth/PricingPage';
import AboutPage from '@pages/AboutPage';
import ContactPage from '@pages/auth/ContactPage';

// Auth Pages
import Login from '@pages/auth/Login';
import Register from '@pages/auth/Register';
import ForgotPassword from '@pages/auth/ForgotPassword';
import ResetPassword from '@pages/auth/ResetPassword';

// Main App Pages
import Dashboard from '@/pages/Dashboard';
import PortfolioPage from '@pages/PortfolioPage';
import StockDetailPage from '@pages/StockDetailPage';
import ScreenerPage from '@pages/ScreenerPage';
import SettingsPage from '@pages/SettingsPage';
import NotFoundPage from '@pages/NotFoundPage';

// Trading Pages
import TradingDashboard from '@pages/trading/TradingDashboard';
import IntradayTrading from '@pages/trading/IntradayTrading';
import OptionsTrading from '@pages/trading/OptionsTrading';
import PositionalTrading from '@pages/trading/PositionalTrading';
import LongTermInvesting from '@pages/trading/LongTermInvesting';
import GeneralTradingWorkspace from '@pages/trading/GeneralTradingWorkspace';

// Analysis Pages
import StockAnalysis from '@pages/analysis/StockAnalysis';

// AI Agents & MCP Pages
import AIAgents from '@pages/agents/AIAgents';
import AgentAutomation from '@pages/agents/AgentAutomation';
import MCPFederationRegistry from '@pages/agents/MCPFederationRegistry';
import MCPSetupWizard from '@pages/agents/MCPSetupWizard';
import MCPCapabilityMapping from '@pages/agents/MCPCapabilityMapping';
import ModelOrchestration from '@pages/agents/ModelOrchestration';
import MCPObservability from '@pages/agents/MCPObservability';
import MCPSecurity from '@pages/agents/MCPSecurity';
import MCPMobileManagement from '@pages/agents/MCPMobileManagement';
import ComplianceGovernance from '@pages/agents/ComplianceGovernance';

// Settings Pages
import ApiKeyManagement from '@pages/settings/ApiKeyManagement';
import LlmManagement from '@pages/settings/LlmManagement';
import MCPServerConfiguration from '@pages/settings/MCPServerConfiguration';

// Admin Pages
import UserApproval from '@pages/admin/UserApproval';

// Onboarding
import Onboarding from '@pages/onboarding/Onboarding';

// Import the new MainLayout
import MainLayout from '@components/layout/MainLayout';

/**
 * StockPulse App - Enterprise-Grade Financial Application
 * Enhanced with unified theme management and ThemeEngine integration
 */
function App() {
  // Initialize ThemeEngine on app startup
  useEffect(() => {
    const initializeThemeEngine = async () => {
      try {
        console.log('🚀 Initializing StockPulse ThemeEngine...');
        // ThemeEngine is initialized automatically in its constructor
        // Additional configuration can be done here if needed
        
        // Apply initial theme from storage or defaults
        const savedState = themeEngine.getState();
        console.log('🎨 Theme Engine initialized with state:', savedState);
        
        // Optional: Set up performance monitoring
        if (process.env.NODE_ENV === 'development') {
          console.log('🔧 Development mode: Theme debugging enabled');
        }
      } catch (error) {
        console.error('❌ Failed to initialize ThemeEngine:', error);
        // Fallback to default theme
        await themeEngine.resetToDefault();
      }
    };

    initializeThemeEngine();
  }, []);

  return (
    <ThemeProvider 
      config={{
        enableAnalytics: true,
        enableStorage: true,
        enableCrossTabSync: true,
        enableRecommendations: true,
      }}
    >
      <ToastProvider>
        <Routes>
          {/* Public Routes - These do not use MainLayout */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />

          {/* Protected Routes - Wrapped by ProtectedRoute and MainLayout */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* All routes below will render inside MainLayout's <Outlet /> */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/stock/:symbol" element={<StockDetailPage />} />
            <Route path="/screener" element={<ScreenerPage />} />

            {/* Onboarding - Now inside MainLayout for consistent navigation */}
            <Route path="/onboarding" element={<Onboarding />} />

            {/* Trading Routes */}
            <Route path="/trading" element={<TradingDashboard />} />
            <Route path="/trading/intraday" element={<IntradayTrading />} />
            <Route path="/trading/options" element={<OptionsTrading />} />
            <Route path="/trading/positional" element={<PositionalTrading />} />
            <Route path="/trading/long-term" element={<LongTermInvesting />} />
            <Route
              path="/trading/workspace"
              element={<GeneralTradingWorkspace />}
            />

            {/* Analysis Routes */}
            <Route path="/analysis/stocks" element={<StockAnalysis />} />

            {/* AI Agents & MCP Routes */}
            <Route path="/agents/ai-agents" element={<AIAgents />} />
            <Route path="/agents/automation" element={<AgentAutomation />} />
            <Route
              path="/agents/federation"
              element={<MCPFederationRegistry />}
            />
            <Route path="/agents/setup" element={<MCPSetupWizard />} />
            <Route
              path="/agents/capabilities"
              element={<MCPCapabilityMapping />}
            />
            <Route
              path="/agents/orchestration"
              element={<ModelOrchestration />}
            />
            <Route
              path="/agents/observability"
              element={<MCPObservability />}
            />
            <Route path="/agents/security" element={<MCPSecurity />} />
            <Route path="/agents/mobile" element={<MCPMobileManagement />} />
            <Route
              path="/agents/compliance"
              element={<ComplianceGovernance />}
            />

            {/* Settings Routes */}
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/api-keys" element={<ApiKeyManagement />} />
            <Route path="/settings/llm" element={<LlmManagement />} />
            <Route path="/settings/mcp" element={<MCPServerConfiguration />} />

            {/* Admin Routes */}
            <Route path="/admin/user-approval" element={<UserApproval />} />

            {/* Catch-all Not Found Route - Now inside MainLayout for consistent navigation */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
