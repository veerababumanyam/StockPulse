/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      // Add CSS variables for comprehensive theme support
      colors: {
        // Core theme variables
        primary: {
          50: 'rgb(var(--primary-50) / <alpha-value>)',
          100: 'rgb(var(--primary-100) / <alpha-value>)',
          200: 'rgb(var(--primary-200) / <alpha-value>)',
          300: 'rgb(var(--primary-300) / <alpha-value>)',
          400: 'rgb(var(--primary-400) / <alpha-value>)',
          500: 'rgb(var(--primary-500) / <alpha-value>)',
          600: 'rgb(var(--primary-600) / <alpha-value>)',
          700: 'rgb(var(--primary-700) / <alpha-value>)',
          800: 'rgb(var(--primary-800) / <alpha-value>)',
          900: 'rgb(var(--primary-900) / <alpha-value>)',
          950: 'rgb(var(--primary-950) / <alpha-value>)',
          DEFAULT: 'rgb(var(--primary-600) / <alpha-value>)',
        },
        secondary: {
          50: 'rgb(var(--secondary-50) / <alpha-value>)',
          100: 'rgb(var(--secondary-100) / <alpha-value>)',
          200: 'rgb(var(--secondary-200) / <alpha-value>)',
          300: 'rgb(var(--secondary-300) / <alpha-value>)',
          400: 'rgb(var(--secondary-400) / <alpha-value>)',
          500: 'rgb(var(--secondary-500) / <alpha-value>)',
          600: 'rgb(var(--secondary-600) / <alpha-value>)',
          700: 'rgb(var(--secondary-700) / <alpha-value>)',
          800: 'rgb(var(--secondary-800) / <alpha-value>)',
          900: 'rgb(var(--secondary-900) / <alpha-value>)',
          950: 'rgb(var(--secondary-950) / <alpha-value>)',
          DEFAULT: 'rgb(var(--secondary-600) / <alpha-value>)',
        },
        accent: {
          50: 'rgb(var(--accent-50) / <alpha-value>)',
          100: 'rgb(var(--accent-100) / <alpha-value>)',
          200: 'rgb(var(--accent-200) / <alpha-value>)',
          300: 'rgb(var(--accent-300) / <alpha-value>)',
          400: 'rgb(var(--accent-400) / <alpha-value>)',
          500: 'rgb(var(--accent-500) / <alpha-value>)',
          600: 'rgb(var(--accent-600) / <alpha-value>)',
          700: 'rgb(var(--accent-700) / <alpha-value>)',
          800: 'rgb(var(--accent-800) / <alpha-value>)',
          900: 'rgb(var(--accent-900) / <alpha-value>)',
          950: 'rgb(var(--accent-950) / <alpha-value>)',
          DEFAULT: 'rgb(var(--accent-600) / <alpha-value>)',
        },
        // Semantic colors
        success: {
          50: 'rgb(var(--success-50) / <alpha-value>)',
          100: 'rgb(var(--success-100) / <alpha-value>)',
          200: 'rgb(var(--success-200) / <alpha-value>)',
          300: 'rgb(var(--success-300) / <alpha-value>)',
          400: 'rgb(var(--success-400) / <alpha-value>)',
          500: 'rgb(var(--success-500) / <alpha-value>)',
          600: 'rgb(var(--success-600) / <alpha-value>)',
          700: 'rgb(var(--success-700) / <alpha-value>)',
          800: 'rgb(var(--success-800) / <alpha-value>)',
          900: 'rgb(var(--success-900) / <alpha-value>)',
          950: 'rgb(var(--success-950) / <alpha-value>)',
          DEFAULT: 'rgb(var(--success-500) / <alpha-value>)',
        },
        warning: {
          50: 'rgb(var(--warning-50) / <alpha-value>)',
          100: 'rgb(var(--warning-100) / <alpha-value>)',
          200: 'rgb(var(--warning-200) / <alpha-value>)',
          300: 'rgb(var(--warning-300) / <alpha-value>)',
          400: 'rgb(var(--warning-400) / <alpha-value>)',
          500: 'rgb(var(--warning-500) / <alpha-value>)',
          600: 'rgb(var(--warning-600) / <alpha-value>)',
          700: 'rgb(var(--warning-700) / <alpha-value>)',
          800: 'rgb(var(--warning-800) / <alpha-value>)',
          900: 'rgb(var(--warning-900) / <alpha-value>)',
          950: 'rgb(var(--warning-950) / <alpha-value>)',
          DEFAULT: 'rgb(var(--warning-500) / <alpha-value>)',
        },
        error: {
          50: 'rgb(var(--error-50) / <alpha-value>)',
          100: 'rgb(var(--error-100) / <alpha-value>)',
          200: 'rgb(var(--error-200) / <alpha-value>)',
          300: 'rgb(var(--error-300) / <alpha-value>)',
          400: 'rgb(var(--error-400) / <alpha-value>)',
          500: 'rgb(var(--error-500) / <alpha-value>)',
          600: 'rgb(var(--error-600) / <alpha-value>)',
          700: 'rgb(var(--error-700) / <alpha-value>)',
          800: 'rgb(var(--error-800) / <alpha-value>)',
          900: 'rgb(var(--error-900) / <alpha-value>)',
          950: 'rgb(var(--error-950) / <alpha-value>)',
          DEFAULT: 'rgb(var(--error-500) / <alpha-value>)',
        },
        // Layout system
        background: {
          DEFAULT: 'rgb(var(--background) / <alpha-value>)',
          secondary: 'rgb(var(--background-secondary) / <alpha-value>)',
          tertiary: 'rgb(var(--background-tertiary) / <alpha-value>)',
          accent: 'rgb(var(--background-accent) / <alpha-value>)',
          muted: 'rgb(var(--background-muted) / <alpha-value>)',
        },
        surface: {
          DEFAULT: 'rgb(var(--surface) / <alpha-value>)',
          elevated: 'rgb(var(--surface-elevated) / <alpha-value>)',
          overlay: 'rgb(var(--surface-overlay) / <alpha-value>)',
          card: 'rgb(var(--surface-card) / <alpha-value>)',
        },
        text: {
          primary: 'rgb(var(--text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
          tertiary: 'rgb(var(--text-tertiary) / <alpha-value>)',
          disabled: 'rgb(var(--text-disabled) / <alpha-value>)',
          inverse: 'rgb(var(--text-inverse) / <alpha-value>)',
          accent: 'rgb(var(--text-accent) / <alpha-value>)',
          DEFAULT: 'rgb(var(--text-primary) / <alpha-value>)',
          // Add missing mappings that components expect
          text: 'rgb(var(--text-primary) / <alpha-value>)', // for text-text class
          foreground: 'rgb(var(--text-primary) / <alpha-value>)', // for text-foreground class
          'muted-foreground': 'rgb(var(--text-secondary) / <alpha-value>)', // for text-muted-foreground class
        },
        border: {
          light: 'rgb(var(--border-light) / <alpha-value>)',
          medium: 'rgb(var(--border-medium) / <alpha-value>)',
          strong: 'rgb(var(--border-strong) / <alpha-value>)',
          accent: 'rgb(var(--border-accent) / <alpha-value>)',
          focus: 'rgb(var(--border-focus) / <alpha-value>)',
          DEFAULT: 'rgb(var(--border-light) / <alpha-value>)',
          // Add missing mapping that components expect
          border: 'rgb(var(--border-light) / <alpha-value>)', // for border-border class
        },
        // Additional component-expected colors
        foreground: 'rgb(var(--text-primary) / <alpha-value>)', // for text-foreground
        muted: {
          DEFAULT: 'rgb(var(--background-muted) / <alpha-value>)',
          foreground: 'rgb(var(--text-secondary) / <alpha-value>)',
        },
        // Dashboard-specific colors
        dashboard: {
          success: 'rgb(var(--dashboard-success) / <alpha-value>)',
          danger: 'rgb(var(--dashboard-danger) / <alpha-value>)',
          warning: 'rgb(var(--dashboard-warning) / <alpha-value>)',
          primary: 'rgb(var(--dashboard-primary) / <alpha-value>)',
        },
      },
      // Theme-aware spacing
      spacing: {
        xs: 'var(--spacing-xs)',
        sm: 'var(--spacing-sm)', 
        md: 'var(--spacing-md)',
        lg: 'var(--spacing-lg)',
        xl: 'var(--spacing-xl)',
        '2xl': 'var(--spacing-2xl)',
        '3xl': 'var(--spacing-3xl)',
      },
      // Theme-aware border radius
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        full: 'var(--radius-full)',
      },
      // Theme-aware shadows
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
      },
      // Theme-aware fonts
      fontFamily: {
        sans: 'var(--font-family-sans)',
        mono: 'var(--font-family-mono)',
        display: 'var(--font-family-display)',
      },
      // Theme-aware animations
      transitionDuration: {
        fast: 'var(--transition-fast)',
        normal: 'var(--transition-normal)',
        slow: 'var(--transition-slow)',
      },
      // Typography using CSS variables
      fontSize: {
        xs: "var(--font-size-xs)",
        sm: "var(--font-size-sm)",
        base: "var(--font-size-base)",
        lg: "var(--font-size-lg)",
        xl: "var(--font-size-xl)",
        "2xl": "var(--font-size-2xl)",
        "3xl": "var(--font-size-3xl)",
        "4xl": "var(--font-size-4xl)",
        "5xl": "var(--font-size-5xl)",
        "6xl": "var(--font-size-6xl)",
      },
      fontWeight: {
        light: "var(--font-weight-light)",
        normal: "var(--font-weight-normal)",
        medium: "var(--font-weight-medium)",
        semibold: "var(--font-weight-semibold)",
        bold: "var(--font-weight-bold)",
        extrabold: "var(--font-weight-extrabold)",
      },
      lineHeight: {
        tight: "var(--line-height-tight)",
        snug: "var(--line-height-snug)",
        normal: "var(--line-height-normal)",
        relaxed: "var(--line-height-relaxed)",
        loose: "var(--line-height-loose)",
      },
      // Responsive breakpoints
      screens: {
        "3xl": "1920px",
      },
    },
  },
  plugins: [],
};
