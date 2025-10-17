import type { Config } from 'tailwindcss';

/**
 * Tailwind CSS v4 Configuration
 * 
 * M3 Design Tokens Integration:
 * - Primary/Secondary colors from M3 tone palette
 * - Light/Dark theme support via CSS variables
 * - Spacing, typography from tokens
 */
export default {
  content: [
    './src/**/*.{ts,tsx,js,jsx}',
    './app/**/*.{ts,tsx,js,jsx}',
    './pages/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}'
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // M3 Role Colors (Light/Dark automatic via CSS vars)
        primary: 'var(--colors-primary)',
        'on-primary': 'var(--colors-on-primary)',
        'primary-container': 'var(--colors-primary-container)',
        'on-primary-container': 'var(--colors-on-primary-container)',
        
        secondary: 'var(--colors-secondary)',
        'on-secondary': 'var(--colors-on-secondary)',
        'secondary-container': 'var(--colors-secondary-container)',
        'on-secondary-container': 'var(--colors-on-secondary-container)',
        
        surface: 'var(--colors-surface)',
        'on-surface': 'var(--colors-on-surface)',
        'surface-variant': 'var(--colors-surface-variant)',
        'on-surface-variant': 'var(--colors-on-surface-variant)',
        
        background: 'var(--colors-background)',
        'on-background': 'var(--colors-on-background)',
        
        error: 'var(--colors-error)',
        'on-error': 'var(--colors-on-error)',
        
        outline: 'var(--colors-outline)',
        'outline-variant': 'var(--colors-outline-variant)',
        
        // Legacy aliases (backward compatibility)
        'brand-primary': 'var(--colors-brand-primary)',
        'brand-secondary': 'var(--colors-brand-secondary)'
      },
      spacing: {
        'xs': 'var(--spacing-xs, 0.25rem)',
        'sm': 'var(--spacing-sm, 0.5rem)',
        'md': 'var(--spacing-md, 1rem)',
        'lg': 'var(--spacing-lg, 1.5rem)',
        'xl': 'var(--spacing-xl, 2rem)',
        '2xl': 'var(--spacing-2xl, 3rem)'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif']
      },
      fontSize: {
        'display-lg': ['var(--typography-display-large-font-size, 57px)', {
          lineHeight: 'var(--typography-display-large-line-height, 64px)',
          fontWeight: 'var(--typography-display-large-font-weight, 400)'
        }],
        'headline-lg': ['var(--typography-headline-large-font-size, 32px)', {
          lineHeight: 'var(--typography-headline-large-line-height, 40px)',
          fontWeight: 'var(--typography-headline-large-font-weight, 600)'
        }],
        'body-lg': ['var(--typography-body-large-font-size, 16px)', {
          lineHeight: 'var(--typography-body-large-line-height, 24px)',
          fontWeight: 'var(--typography-body-large-font-weight, 400)'
        }],
        'label-lg': ['var(--typography-label-large-font-size, 14px)', {
          lineHeight: 'var(--typography-label-large-line-height, 20px)',
          fontWeight: 'var(--typography-label-large-font-weight, 500)'
        }]
      },
      borderRadius: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '32px',
        'full': '9999px'
      }
    }
  },
  plugins: []
} satisfies Config;
