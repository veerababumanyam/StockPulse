
import { useState } from 'react';
import { Search, Bell, User, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthModal from './AuthModal';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authType, setAuthType] = useState<'login' | 'register'>('login');

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
    <nav className="bg-white border-b border-gray-200 fixed w-full top-0 z-20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-stockpulse-blue font-bold text-xl">StockPulse<span className="text-stockpulse-teal">AI</span></span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <a href="#" className="border-stockpulse-blue text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Dashboard
              </a>
              <a href="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Markets
              </a>
              <a href="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Portfolio
              </a>
              <a href="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                AI Insights
              </a>
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-stockpulse-blue focus:border-stockpulse-blue sm:text-sm"
                placeholder="Search stocks..."
                type="search"
              />
            </div>
            
            <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
              <Bell className="h-6 w-6" />
            </button>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={handleLogin}
                className="border-stockpulse-blue text-stockpulse-blue hover:bg-stockpulse-blue hover:text-white"
              >
                Log in
              </Button>
              <Button 
                variant="default" 
                onClick={handleRegister}
                className="bg-stockpulse-blue hover:bg-stockpulse-blue-dark"
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
        <div className="sm:hidden bg-white border-b border-gray-200">
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
                <User className="h-10 w-10 rounded-full bg-gray-100 p-2" />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">Guest User</div>
                <div className="text-sm font-medium text-gray-500">Sign in to access all features</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <button
                onClick={handleLogin}
                className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 w-full text-left"
              >
                Log in
              </button>
              <button
                onClick={handleRegister}
                className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 w-full text-left"
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
