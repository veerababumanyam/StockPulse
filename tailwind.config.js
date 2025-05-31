/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Default theme (based on logo)
        primary: {
          DEFAULT: "var(--color-primary)",
          50: "var(--primary-50)",
          100: "var(--primary-100)",
          200: "var(--primary-200)",
          300: "var(--primary-300)",
          400: "var(--primary-400)",
          500: "var(--primary-500)",
          600: "var(--primary-600)",
          700: "var(--primary-700)",
          800: "var(--primary-800)",
          900: "var(--primary-900)",
          950: "var(--primary-950)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          50: "var(--secondary-50)",
          100: "var(--secondary-100)",
          200: "var(--secondary-200)",
          300: "var(--secondary-300)",
          400: "var(--secondary-400)",
          500: "var(--secondary-500)",
          600: "var(--secondary-600)",
          700: "var(--secondary-700)",
          800: "var(--secondary-800)",
          900: "var(--secondary-900)",
          950: "var(--secondary-950)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          50: "var(--accent-50)",
          100: "var(--accent-100)",
          200: "var(--accent-200)",
          300: "var(--accent-300)",
          400: "var(--accent-400)",
          500: "var(--accent-500)",
          600: "var(--accent-600)",
          700: "var(--accent-700)",
          800: "var(--accent-800)",
          900: "var(--accent-900)",
          950: "var(--accent-950)",
        },
        background: {
          DEFAULT: "var(--background-primary)",
          primary: "var(--background-primary)",
          secondary: "var(--background-secondary)",
          tertiary: "var(--background-tertiary)",
        },
        
        // Semantic color system - maps to design tokens
        foreground: {
          DEFAULT: "var(--text-primary)",
        },
        "muted-foreground": {
          DEFAULT: "var(--text-secondary)",
        },
        surface: {
          DEFAULT: "var(--surface-primary)",
          secondary: "var(--surface-secondary)",
          elevated: "var(--surface-raised, var(--surface-secondary))",
          dark: "var(--surface-dark)",
        },
        muted: {
          DEFAULT: "var(--background-tertiary)",
          foreground: "var(--text-tertiary)",
        },
        elevated: {
          DEFAULT: "var(--surface-secondary)",
        },
        
        // Status colors - semantic system
        success: {
          DEFAULT: "var(--success-500)",
          50: "var(--success-50)",
          500: "var(--success-500)",
          700: "var(--success-700)",
          light: "var(--success-light)",
          medium: "var(--success-medium)",
          dark: "var(--success-dark)",
        },
        danger: {
          DEFAULT: "var(--error-500)",
          50: "var(--error-50)",
          500: "var(--error-500)",
          700: "var(--error-700)",
          light: "var(--error-light)",
          medium: "var(--error-medium)",
          dark: "var(--error-dark)",
        },
        warning: {
          DEFAULT: "var(--warning-500)",
          50: "var(--warning-50)",
          500: "var(--warning-500)",
          700: "var(--warning-700)",
          light: "var(--warning-light)",
          medium: "var(--warning-medium)",
          dark: "var(--warning-dark)",
        },
        info: {
          DEFAULT: "var(--info-500)",
          50: "var(--info-50)",
          500: "var(--info-500)",
          700: "var(--info-700)",
          light: "var(--info-light)",
          medium: "var(--info-medium)",
          dark: "var(--info-dark)",
        },
        
        // Interactive states
        border: {
          DEFAULT: "var(--border-medium)",
          light: "var(--border-light)",
          medium: "var(--border-medium)",
          strong: "var(--border-strong)",
          interactive: "var(--border-interactive)",
          focus: "var(--border-focus)",
          surface: "var(--border-light)",
          primary: "var(--border-interactive)",
        },
        ring: {
          DEFAULT: "var(--focus-ring)",
        },
        input: {
          DEFAULT: "var(--surface-primary)",
        },
        card: {
          DEFAULT: "var(--surface-primary)",
          foreground: "var(--text-primary)",
        },
        popover: {
          DEFAULT: "var(--surface-secondary)",
          foreground: "var(--text-primary)",
        },
        destructive: {
          DEFAULT: "var(--error-500)",
          foreground: "var(--text-inverse)",
        },
        
        // Legacy compatibility
        text: {
          DEFAULT: "var(--text-primary)",
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
          disabled: "var(--text-disabled)",
          inverse: "var(--text-inverse)",
        },
      },
      
      // Shadow system using design tokens
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
      },
      
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      screens: {
        "3xl": "1920px",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
