/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			satoshi: [
  				'Satoshi'
  			],
  			inter: [
  				'Inter Tight'
  			],
  			sans: [
  				'Satoshi'
  			],
  			mono: [
  				'Inter Tight'
  			],
  			intergral: [
  				'Inter Tight'
  			],
  			black: [
  				'Sentient'
  			],
  			normal: [
  				'Satoshi'
  			],
  			light: [
  				'Inter Tigh'
  			],
  			bold: [
  				'Sentient'
  			],
  			serif: [
  				'Sentient'
  			],
  			medium: [
  				'Inter Tight'
  			],
  			regular: [
  				'Inter Tigh'
  			]
  		},
  		animation: {
  			'fade-in': 'fadeIn 0.5s ease-out forwards',
  			draw: 'draw 2s ease-out forwards',
  			'draw-delayed-1': 'draw 2s ease-out 0.5s forwards',
  			'draw-delayed-2': 'draw 2s ease-out 1s forwards',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
  		keyframes: {
  			fadeIn: {
  				'0%': {
  					opacity: '0'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			},
  			draw: {
  				'0%': {
  					strokeDashoffset: '2000'
  				},
  				'100%': {
  					strokeDashoffset: '0'
  				}
  			},
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
  		colors: {
  			base: {
  				'10': '#FDFAFF',
  				'50': '#F5F2F7',
  				'100': '#F7F0FC',
  				'200': '#EBE4F0',
  				'300': '#E0D8E5',
  				'400': '#C5BCCC',
  				'500': '#B7ACBF',
  				'600': '#8F8299',
  				'700': '#675673',
  				'800': '#220A33',
  				'900': '#0F011A'
  			},
  			primary: {
  				'50': '#F7EDFF',
  				'100': '#EFD9FF',
  				'200': '#DFB2FF',
  				'300': '#CF8BFF',
  				'400': '#BA59FF',
  				'500': '#9E39E5',
  				'600': '#731BB2',
  				'700': '#3D0566',
  				'800': '#1E0033',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
