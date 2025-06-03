/**
 * Loading Spinner Component
 * Reusable loading indicator with consistent styling
 */
import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className = "",
  text,
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-b-2 border-primary ${sizeClasses[size]}`}
      />
      {text && (
        <p className={`mt-2 text-text/60 ${textSizeClasses[size]}`}>{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
