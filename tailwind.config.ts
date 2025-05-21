
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// Updated StockPulse color scheme
				stockpulse: {
					blue: {
						DEFAULT: '#1E40AF',
						light: '#3B82F6',
						dark: '#1E3A8A',
					},
					teal: {
						DEFAULT: '#14B8A6',
						light: '#5EEAD4',
						dark: '#0D9488',
					},
					coral: {
						DEFAULT: '#F43F5E',
						light: '#FDA4AF',
						dark: '#E11D48',
					},
					gray: {
						DEFAULT: '#E2E8F0',
						light: '#F7FAFC',
						dark: '#64748B',
					},
					// New accent colors
					gold: {
						DEFAULT: '#F59E0B',
						light: '#FCD34D',
						dark: '#D97706',
					},
					purple: {
						DEFAULT: '#8B5CF6',
						light: '#C4B5FD',
						dark: '#7C3AED',
					},
					green: {
						DEFAULT: '#10B981',
						light: '#6EE7B7',
						dark: '#059669',
					},
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				'pulse-subtle': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'slide-in-right': {
					'0%': { transform: 'translateX(100%)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'pulse-subtle': 'pulse-subtle 2s infinite',
				'slide-up': 'slide-up 0.4s ease-out',
				'slide-in-right': 'slide-in-right 0.4s ease-out'
			},
			boxShadow: {
				'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
				'glow': '0 0 15px 2px rgba(59, 130, 246, 0.3)',
				'glass': '0 4px 15px 0 rgba(0, 0, 0, 0.05)',
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-card': 'linear-gradient(to bottom right, #ffffff, #f7fafc)',
				'gradient-blue': 'linear-gradient(90deg, #1E40AF, #3B82F6)',
				'gradient-teal': 'linear-gradient(90deg, #0D9488, #14B8A6)',
				'gradient-gold': 'linear-gradient(90deg, #D97706, #F59E0B)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
