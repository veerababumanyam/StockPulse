
import { useState, useEffect } from 'react';
import { Search, Bell, User, Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthModal from './AuthModal';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authType, setAuthType] = useState<'login' | 'register'>('login');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const handleLogin = () => {
    setAuthType('login');
    setShowAuthModal(true);
  };
  
  const handleRegister = () => {
    setAuthType('register');
    setShowAuthModal(true);
  };

  return (
    <nav className={`fixed w-full top-0 z-20 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white border-b border-gray-200 shadow-sm' 
        : 'bg-white/90 backdrop-blur-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-stockpulse-blue font-bold text-xl">
                Stock<span className="text-stockpulse-teal">Pulse</span>
                <span className="text-stockpulse-blue-dark">AI</span>
              </span>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
              <a href="#" className="nav-item active">
                Dashboard
              </a>
              <a href="#" className="nav-item">
                Markets
              </a>
              <a href="#" className="nav-item">
                Portfolio
              </a>
              <div className="relative group">
                <button className="nav-item flex items-center">
                  AI Insights
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="py-1" role="menu">
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Price Predictions</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Market Sentiment</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Trend Analysis</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">News Impact</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-stockpulse-blue focus:border-stockpulse-blue sm:text-sm"
                placeholder="Search..."
                type="search"
              />
            </div>
            
            <button className="p-2 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none hover:bg-gray-100">
              <Bell className="h-5 w-5" />
            </button>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={handleLogin}
                className="font-medium border-stockpulse-blue text-stockpulse-blue hover:bg-stockpulse-blue hover:text-white"
              >
                Log in
              </Button>
              <Button 
                variant="default" 
                onClick={handleRegister}
                className="font-medium bg-stockpulse-blue hover:bg-stockpulse-blue-dark"
              >
                Sign up
              </Button>
            </div>
          </div>
          
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-white border-b border-gray-200 animate-slide-in-right">
          <div className="pt-2 pb-3 space-y-1">
            <a
              href="#"
              className="bg-stockpulse-blue-light bg-opacity-10 border-l-4 border-stockpulse-blue text-stockpulse-blue block pl-3 pr-4 py-2 text-base font-medium"
            >
              Dashboard
            </a>
            <a
              href="#"
              className="border-l-4 border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 text-base font-medium"
            >
              Markets
            </a>
            <a
              href="#"
              className="border-l-4 border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 text-base font-medium"
            >
              Portfolio
            </a>
            <a
              href="#"
              className="border-l-4 border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 text-base font-medium"
            >
              AI Insights
            </a>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-500" />
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">Guest User</div>
                <div className="text-sm font-medium text-gray-500">Sign in to access all features</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <button
                onClick={handleLogin}
                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                Log in
              </button>
              <button
                onClick={handleRegister}
                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
          type={authType}
          onSwitchType={(type) => setAuthType(type)}
        />
      )}
    </nav>
  );
};

export default Navbar;
