
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
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
				heading: ['Poppins', 'sans-serif'],
			},
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
				// StockPulse color scheme - modernized with pastel tones
				stockpulse: {
					blue: {
						DEFAULT: '#4F46E5',
						light: '#818CF8',
						dark: '#3730A3',
					},
					teal: {
						DEFAULT: '#06B6D4',
						light: '#67E8F9',
						dark: '#0891B2',
					},
					coral: {
						DEFAULT: '#F87171',
						light: '#FECACA',
						dark: '#DC2626',
					},
					gray: {
						DEFAULT: '#E2E8F0',
						light: '#F8FAFC',
						dark: '#64748B',
					},
					gold: {
						DEFAULT: '#FBBF24',
						light: '#FDE68A',
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
					pastel: {
						blue: '#D1E9FF',
						green: '#E0F2F1',
						purple: '#F3E8FF',
						pink: '#FCE7F3',
						yellow: '#FEFCE8',
						orange: '#FFF1E6',
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
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'pulse-subtle': 'pulse-subtle 2s infinite',
				'slide-up': 'slide-up 0.4s ease-out',
				'slide-in-right': 'slide-in-right 0.4s ease-out',
				'float': 'float 3s ease-in-out infinite'
			},
			boxShadow: {
				'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
				'glow': '0 0 15px 2px rgba(79, 70, 229, 0.3)',
				'glass': '0 4px 15px 0 rgba(0, 0, 0, 0.05)',
				'neumorphic': '9px 9px 16px rgba(189, 189, 189, 0.6), -9px -9px 16px rgba(255, 255, 255, 0.5)',
				'neumorphic-inset': 'inset 5px 5px 10px rgba(189, 189, 189, 0.6), inset -5px -5px 10px rgba(255, 255, 255, 0.5)',
				'neumorphic-sm': '5px 5px 10px rgba(189, 189, 189, 0.6), -5px -5px 10px rgba(255, 255, 255, 0.5)',
				'neumorphic-sm-inset': 'inset 3px 3px 6px rgba(189, 189, 189, 0.6), inset -3px -3px 6px rgba(255, 255, 255, 0.5)',
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-card': 'linear-gradient(to bottom right, #ffffff, #f8fafc)',
				'gradient-blue': 'linear-gradient(90deg, #4F46E5, #818CF8)',
				'gradient-teal': 'linear-gradient(90deg, #0891B2, #06B6D4)',
				'gradient-gold': 'linear-gradient(90deg, #D97706, #FBBF24)',
				'gradient-pastel': 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.3))'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
