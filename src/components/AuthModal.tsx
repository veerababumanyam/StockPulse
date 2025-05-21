
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'login' | 'register';
  onSwitchType: (type: 'login' | 'register') => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, type, onSwitchType }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would call an authentication API
    console.log('Auth submission:', { type, email, password, name });
    
    // Mock successful auth for demo purposes
    setTimeout(() => {
      onClose();
      // Would typically set auth state/cookies here
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-xl shadow-neumorphic bg-gradient-pastel">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading font-semibold">
            {type === 'login' ? 'Log in to StockPulse AI' : 'Create an Account'}
          </DialogTitle>
          <button 
            onClick={onClose} 
            className="absolute top-3 right-3 rounded-full p-1.5 hover:bg-stockpulse-pastel-blue transition-all duration-300"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {type === 'register' && (
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="John Doe"
                className="shadow-neumorphic-sm focus:shadow-neumorphic-sm-inset transition-all duration-300 rounded-xl border-none"
              />
            </div>
          )}
          
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="john@example.com"
              className="shadow-neumorphic-sm focus:shadow-neumorphic-sm-inset transition-all duration-300 rounded-xl border-none"
            />
          </div>
          
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="shadow-neumorphic-sm focus:shadow-neumorphic-sm-inset transition-all duration-300 rounded-xl border-none"
            />
          </div>
          
          <Button 
            type="submit"
            className="w-full"
          >
            {type === 'login' ? 'Log In' : 'Create Account'}
          </Button>
          
          <div className="text-center text-sm text-gray-500">
            {type === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => onSwitchType('register')}
                  className="text-stockpulse-blue hover:underline transition-all duration-300"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => onSwitchType('login')}
                  className="text-stockpulse-blue hover:underline transition-all duration-300"
                >
                  Log in
                </button>
              </p>
            )}
          </div>
          
          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500 rounded-full bg-gradient-pastel shadow-neumorphic-sm-inset">Or continue with</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button variant="neumorphic" type="button">
              Google
            </Button>
            <Button variant="neumorphic" type="button">
              Apple
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
