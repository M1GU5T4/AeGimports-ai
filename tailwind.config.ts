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
				poppins: ['Poppins', 'sans-serif'],
				playfair: ['Playfair Display', 'serif'],
				inter: ['Inter', 'sans-serif'],
				luxury: ['Playfair Display', 'serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
				},
				// A&G Imports Eye-Comfort Theme Colors
				gold: {
					50: 'hsl(45 90% 95%)',
					100: 'hsl(45 85% 90%)',
					200: 'hsl(45 85% 80%)',
					300: 'hsl(45 85% 70%)',
					400: 'hsl(45 85% 65%)',
					500: 'hsl(45 85% 62%)', // Primary comfortable gold
					600: 'hsl(45 80% 58%)',
					700: 'hsl(45 75% 50%)',
					800: 'hsl(45 70% 40%)',
					900: 'hsl(45 65% 30%)',
					DEFAULT: 'hsl(45 85% 62%)', // Refined default
				},
				black: {
					50: 'hsl(0 0% 95%)', // Light grays remain
					100: 'hsl(0 0% 90%)',
					200: 'hsl(0 0% 80%)',
					300: 'hsl(0 0% 70%)',
					400: 'hsl(0 0% 60%)',
					500: 'hsl(0 0% 50%)',
					600: 'hsl(0 0% 40%)',
					700: 'hsl(0 0% 25%)', // Comfortable border tone
					800: 'hsl(0 0% 17%)', // Muted backgrounds
					900: 'hsl(0 0% 11%)', // Soft black primary
					950: 'hsl(0 0% 8%)', // Deepest tone
					DEFAULT: 'hsl(0 0% 11%)', // Eye-friendly default
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
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.6s ease-out',
				'slide-up': 'slide-up 0.4s ease-out',
				'glow-pulse': 'glow-pulse 2s ease-in-out infinite alternate',
				'gold-glow': 'gold-glow 3s ease-in-out infinite',
				'premium-shine': 'premium-shine 3s ease-in-out infinite',
				'border-gold': 'border-gold 2s ease-in-out infinite',
				'luxury-float': 'luxury-float 4s ease-in-out infinite',
				'card-entrance': 'card-entrance 0.6s ease-out',
				'text-shimmer': 'text-shimmer 2s ease-in-out infinite'
			},
			keyframes: {
				...{
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
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'slide-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'glow-pulse': {
					'0%': {
						boxShadow: '0 0 5px hsl(51 100% 50% / 0.5)'
					},
					'100%': {
						boxShadow: '0 0 20px hsl(51 100% 50% / 0.8)'
					}
				},
				'gold-glow': {
					'0%, 100%': {
						boxShadow: '0 0 15px hsl(45 85% 62% / 0.2), 0 0 30px hsl(45 85% 62% / 0.08)'
					},
					'50%': {
						boxShadow: '0 0 20px hsl(45 85% 62% / 0.3), 0 0 40px hsl(45 85% 62% / 0.12)'
					}
				},
				'premium-shine': {
					'0%': {
						transform: 'translateX(-100%)'
					},
					'100%': {
						transform: 'translateX(100%)'
					}
				},
				'border-gold': {
					'0%, 100%': {
						borderColor: 'hsl(45 85% 62% / 0.25)'
					},
					'50%': {
						borderColor: 'hsl(45 85% 62% / 0.6)'
					}
				},
				'luxury-float': {
					'0%, 100%': {
						transform: 'translateY(0px) rotate(0deg)'
					},
					'50%': {
						transform: 'translateY(-10px) rotate(1deg)'
					}
				},
				'card-entrance': {
					'0%': {
						opacity: '0',
						transform: 'translateY(30px) scale(0.9)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0) scale(1)'
					}
				},
				'text-shimmer': {
					'0%': {
						backgroundPosition: '0% 50%'
					},
					'100%': {
						backgroundPosition: '100% 50%'
					}
				}
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
