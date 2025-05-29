import React, { createContext, useContext, useState, ReactNode } from 'react';
import { authService } from '../services/authService'; // Import the authService

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<ReturnType<typeof authService.registerUser>>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Mock authentication for demo purposes
  // In a real app, this would connect to a backend API
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login
      setUser({
        id: '1',
        email,
        name: 'Demo User',
        role: 'user',
        avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=FF1A6C&color=fff'
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<ReturnType<typeof authService.registerUser>> => {
    setIsLoading(true);
    try {
      // Collect additional data for fraud check
      const userAgent = navigator.userAgent;
      // const ipAddress = await getClientIpAddress(); // Placeholder for a real IP fetching mechanism
      // For now, IP address collection from frontend is unreliable; backend should ideally provide/log it.
      // Passing undefined, authService should handle optionality.

      const registrationData = { 
        name, 
        email, 
        password, 
        userAgent, 
        // Assuming the existing Register.tsx passes all form data eventually
        // We need to decide how/if tradingExperience etc. from Register.tsx formData flows here
        // For now, authService.registerUser UserRegistrationData includes them as optional
        ipAddress: undefined 
      };
      
      const authServiceResponse = await authService.registerUser(registrationData);
      
      setUser({
        id: authServiceResponse.userId,
        email: email, 
        name: name, 
        role: 'user',
        avatar: `https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=FF1A6C&color=fff`
      });
      localStorage.setItem('authToken', authServiceResponse.token); // Example: Storing token

      return authServiceResponse;

    } catch (error) {
      console.error('Registration error in AuthContext:', error);
      // Re-throw the error so it can be caught and handled by the UI component (Register.tsx)
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real app, this would send a reset email
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real app, this would verify the token and update the password
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user is already logged in (e.g., from localStorage in a real app)
  React.useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        // Simulate checking auth state
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // For demo, we'll start logged out
        setUser(null);
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
