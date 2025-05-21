
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
        ? 'bg-white/90 backdrop-blur-md shadow-neumorphic-sm' 
        : 'bg-white/70 backdrop-blur-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="font-heading text-xl font-bold">
                <span className="text-stockpulse-blue">Stock</span>
                <span className="text-stockpulse-teal">Pulse</span>
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
                <div className="absolute left-0 mt-2 w-48 rounded-xl shadow-neumorphic bg-white/95 backdrop-blur-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 border border-gray-100">
                  <div className="py-1.5" role="menu">
                    <a href="#" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-stockpulse-pastel-blue rounded-md mx-1.5">Price Predictions</a>
                    <a href="#" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-stockpulse-pastel-blue rounded-md mx-1.5">Market Sentiment</a>
                    <a href="#" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-stockpulse-pastel-blue rounded-md mx-1.5">Trend Analysis</a>
                    <a href="#" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-stockpulse-pastel-blue rounded-md mx-1.5">News Impact</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-stockpulse-blue-light" />
              </div>
              <input
                className="block w-full pl-10 pr-3 py-2 rounded-xl shadow-neumorphic-sm focus:shadow-neumorphic-sm-inset transition-all duration-300 bg-white/80 border-none text-gray-900 placeholder-gray-500 focus:placeholder-gray-400 sm:text-sm"
                placeholder="Quick search..."
                type="search"
              />
            </div>
            
            <button className="p-2 rounded-full text-gray-500 hover:text-stockpulse-blue focus:outline-none hover:bg-stockpulse-pastel-blue transition-all duration-300">
              <Bell className="h-5 w-5" />
            </button>
            
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={handleLogin}
                className="font-medium border-stockpulse-blue text-stockpulse-blue hover:bg-stockpulse-blue hover:text-white rounded-xl px-5"
              >
                Log in
              </Button>
              <Button 
                variant="default" 
                onClick={handleRegister}
                className="font-medium bg-gradient-blue text-white hover:opacity-90 rounded-xl px-5"
              >
                Sign up
              </Button>
            </div>
          </div>
          
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-xl shadow-neumorphic-sm active:shadow-neumorphic-sm-inset text-gray-500 hover:text-stockpulse-blue focus:outline-none"
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
        <div className="sm:hidden bg-white border-b border-gray-200 animate-slide-in-right shadow-neumorphic-sm">
          <div className="pt-2 pb-3 space-y-1 px-2">
            <a
              href="#"
              className="bg-stockpulse-pastel-blue border-l-4 border-stockpulse-blue text-stockpulse-blue block pl-3 pr-4 py-2.5 text-base font-medium rounded-r-xl"
            >
              Dashboard
            </a>
            <a
              href="#"
              className="border-l-4 border-transparent text-gray-500 hover:bg-stockpulse-pastel-blue hover:border-stockpulse-blue-light hover:text-gray-700 block pl-3 pr-4 py-2.5 text-base font-medium rounded-r-xl"
            >
              Markets
            </a>
            <a
              href="#"
              className="border-l-4 border-transparent text-gray-500 hover:bg-stockpulse-pastel-blue hover:border-stockpulse-blue-light hover:text-gray-700 block pl-3 pr-4 py-2.5 text-base font-medium rounded-r-xl"
            >
              Portfolio
            </a>
            <a
              href="#"
              className="border-l-4 border-transparent text-gray-500 hover:bg-stockpulse-pastel-blue hover:border-stockpulse-blue-light hover:text-gray-700 block pl-3 pr-4 py-2.5 text-base font-medium rounded-r-xl"
            >
              AI Insights
            </a>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-stockpulse-pastel-purple flex items-center justify-center">
                  <User className="h-6 w-6 text-stockpulse-purple" />
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">Guest User</div>
                <div className="text-sm font-medium text-gray-500">Sign in to access all features</div>
              </div>
            </div>
            <div className="mt-3 space-y-1 px-2">
              <button
                onClick={handleLogin}
                className="block w-full text-left px-4 py-2.5 text-base font-medium text-gray-500 hover:text-stockpulse-blue hover:bg-stockpulse-pastel-blue rounded-xl transition-all duration-300"
              >
                Log in
              </button>
              <button
                onClick={handleRegister}
                className="block w-full text-left px-4 py-2.5 text-base font-medium text-gray-500 hover:text-stockpulse-blue hover:bg-stockpulse-pastel-blue rounded-xl transition-all duration-300"
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
