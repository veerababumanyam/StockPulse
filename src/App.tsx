import { Routes, Route } from 'react-router-dom';
import LandingPage from '@pages/LandingPage';
import Dashboard from '@pages/Dashboard';
import PortfolioPage from '@pages/PortfolioPage';
import StockDetailPage from '@pages/StockDetailPage';
import ScreenerPage from '@pages/ScreenerPage';
import SettingsPage from '@pages/SettingsPage';
import NotFoundPage from '@pages/NotFoundPage';
import Login from '@pages/auth/Login';
import Register from '@pages/auth/Register';
import ForgotPassword from '@pages/auth/ForgotPassword';
import ResetPassword from '@pages/auth/ResetPassword';
import TradingDashboard from '@pages/trading/TradingDashboard';
import IntradayTrading from '@pages/trading/IntradayTrading';
import OptionsTrading from '@pages/trading/OptionsTrading';
import PositionalTrading from '@pages/trading/PositionalTrading';
import LongTermInvesting from '@pages/trading/LongTermInvesting';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/portfolio" element={<PortfolioPage />} />
      <Route path="/stock/:symbol" element={<StockDetailPage />} />
      <Route path="/screener" element={<ScreenerPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      
      {/* Auth Routes */}
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/register" element={<Register />} />
      <Route path="/auth/forgot-password" element={<ForgotPassword />} />
      <Route path="/auth/reset-password" element={<ResetPassword />} />
      
      {/* Trading Routes */}
      <Route path="/trading" element={<TradingDashboard />} />
      <Route path="/trading/intraday" element={<IntradayTrading />} />
      <Route path="/trading/options" element={<OptionsTrading />} />
      <Route path="/trading/positional" element={<PositionalTrading />} />
      <Route path="/trading/long-term" element={<LongTermInvesting />} />
      
      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
