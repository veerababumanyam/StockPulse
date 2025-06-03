import React from "react";

interface LogoProps {
  className?: string;
  variant?: "default" | "white" | "icon-only";
}

const Logo: React.FC<LogoProps> = ({
  className = "h-8 w-8",
  variant = "default",
}) => {
  return (
    <img
      src="/logo.png"
      alt="StockPulse Logo"
      className={`${className} object-contain`}
      style={{
        filter: variant === "white" ? "brightness(0) invert(1)" : "none",
      }}
    />
  );
};

export default Logo;
