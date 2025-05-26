import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@components/layout/Navbar';
import Footer from '@components/layout/Footer';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-secondary-900">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center text-center">
        <div className="max-w-md">
          <h1 className="text-9xl font-bold text-primary">404</h1>
          <h2 className="text-3xl font-bold mt-4 mb-6">Page Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/" 
              className="px-6 py-3 bg-primary hover:bg-primary-600 text-white font-medium rounded-md transition-colors"
            >
              Go Home
            </Link>
            <Link 
              to="/dashboard" 
              className="px-6 py-3 bg-white dark:bg-secondary-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-md transition-colors hover:bg-gray-50 dark:hover:bg-secondary-700"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFoundPage;
