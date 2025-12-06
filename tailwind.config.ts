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
				'comfortaa': ['Comfortaa', 'cursive'],
				'roboto': ['Roboto', 'sans-serif'],
				'comfortaa-light': ['Comfortaa', 'cursive'],
				'comfortaa-medium': ['Comfortaa', 'cursive'],
				'comfortaa-bold': ['Comfortaa', 'cursive'],
				'roboto-light': ['Roboto', 'sans-serif'],
				'roboto-medium': ['Roboto', 'sans-serif'],
				'roboto-bold': ['Roboto', 'sans-serif'],
			},
			colors: {
				// Brand Colors
				'brand-yellow': 'hsl(var(--yp-yellow))',
				'brand-yellow-hover': 'hsl(var(--yp-yellow-hover))',
				'brand-blue': 'hsl(var(--yp-blue))',
				'brand-blue-hover': 'hsl(var(--yp-blue-hover))',
				
				// Gold Colors for Landing Page
				'gold': {
					'400': '#FFD700',
					'500': '#FFC700',
					'600': '#FFB700',
				},
				
				// Neutral Colors
				'dark': 'hsl(var(--yp-dark))',
				'gray-dark': 'hsl(var(--yp-gray-dark))',
				'gray-medium': 'hsl(var(--yp-gray-medium))',
				'gray-light': 'hsl(var(--yp-gray-light))',
				'white': 'hsl(var(--yp-white))',
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--yp-blue))',
					foreground: 'hsl(var(--yp-white))',
					hover: 'hsl(var(--yp-blue-hover))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--yp-yellow))',
					foreground: 'hsl(var(--yp-dark))',
					hover: 'hsl(var(--yp-yellow-hover))'
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
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
