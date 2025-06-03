import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center text-center">
        <div className="max-w-md">
          <h1 className="text-9xl font-bold text-primary">404</h1>
          <h2 className="text-3xl font-bold mt-4 mb-6 text-text">
            Page Not Found
          </h2>
          <p className="text-lg text-text/70 mb-8">
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/" className="btn-primary">
              Go Home
            </Link>
            <Link to="/dashboard" className="btn-outline">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFoundPage;
