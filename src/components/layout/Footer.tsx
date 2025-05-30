import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-surface border-t border-border/50 backdrop-blur-sm">
      {/* CSS Variables for Theme System */}
      <style>{`
        :root {
          /* Footer Theme Colors */
          --color-footer-bg: #ffffff;
          --color-footer-text: #64748b;
          --color-footer-border: #e2e8f0;
          
          /* Dark theme variant */
          --color-footer-bg-dark: #0f172a;
          --color-footer-text-dark: #94a3b8;
          --color-footer-border-dark: #1e293b;
        }
        
        /* Auto dark mode support */
        @media (prefers-color-scheme: dark) {
          :root {
            --color-footer-bg: var(--color-footer-bg-dark);
            --color-footer-text: var(--color-footer-text-dark);
            --color-footer-border: var(--color-footer-border-dark);
          }
        }
        
        /* Theme override classes */
        [data-theme="light"] {
          --color-footer-bg: #ffffff;
          --color-footer-text: #64748b;
          --color-footer-border: #e2e8f0;
        }
        
        [data-theme="dark"] {
          --color-footer-bg: #0f172a;
          --color-footer-text: #94a3b8;
          --color-footer-border: #1e293b;
        }
        
        .footer-container {
          background-color: var(--color-footer-bg);
          color: var(--color-footer-text);
          border-color: var(--color-footer-border);
        }
      `}</style>

      <div className="footer-container px-4 py-3 sm:py-4">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 sm:gap-4">
            
            {/* Copyright Text */}
            <p className="text-xs sm:text-sm text-center sm:text-left order-2 sm:order-1">
              © 2025 StockPulse. All rights reserved to{" "}
              <span className="font-medium">SAWAS</span>.
            </p>
            
            {/* Version Info */}
            <div className="flex items-center gap-2 text-xs sm:text-sm order-1 sm:order-2">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full bg-green-500 animate-pulse" 
                  title="System Status: Online"
                  aria-label="Online"
                ></div>
                <span className="hidden xs:inline">Online</span>
              </div>
              <span className="text-border">•</span>
              <span className="font-mono">Version 0.2.1</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;