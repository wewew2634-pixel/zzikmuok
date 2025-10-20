import type { Config } from "tailwindcss";

/**
 * Linear 2025 Mobile Design System - 100% Tailwind Native
 * 목표: CSS Custom Properties 최소화, Tailwind 네이티브 클래스 최대 활용
 * 
 * 핵심 원칙:
 * 1. 모바일 퍼스트 (iOS/Android native conventions)
 * 2. Frosted Glass Material (backdrop-blur)
 * 3. Native Platform Fonts (SF Pro / Roboto)
 * 4. WCAG 2.1 AA (Touch targets 44-56px)
 * 5. 8pt Grid System
 */

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class", // Default to dark mode
  
  theme: {
    extend: {
      // ===== COLORS (Linear 2025 Mobile) =====
      colors: {
        // Primary background (use native Tailwind gray/slate)
        // Light mode: white, gray-50
        // Dark mode: gray-900, gray-950
        
        // Accent color (Linear Purple-Indigo) - WCAG AA Compliant
        accent: {
          DEFAULT: '#4f46e5', // indigo-600 (WCAG AA: 5.71:1 contrast ratio)
          light: '#818cf8',   // indigo-400
          dark: '#4338ca',    // indigo-700
        },
      },
      
      // ===== TYPOGRAPHY (Native Platform Fonts) =====
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          'Roboto',
          '"Segoe UI"',
          'sans-serif',
        ],
        display: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          'Roboto',
          '"Segoe UI"',
          'sans-serif',
        ],
        mono: [
          '"SF Mono"',
          '"Roboto Mono"',
          '"Courier New"',
          'monospace',
        ],
      },
      
      // Mobile-optimized font sizes (15px base)
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],  // 10px
        'xs': ['0.75rem', { lineHeight: '1rem' }],        // 12px - Caption
        'sm': ['0.8125rem', { lineHeight: '1.25rem' }],   // 13px - Small body
        'base': ['0.9375rem', { lineHeight: '1.5rem' }],  // 15px - Body text
        'md': ['1rem', { lineHeight: '1.5rem' }],         // 16px - Large body
        'lg': ['1.0625rem', { lineHeight: '1.75rem' }],   // 17px - Subhead
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],     // 20px - H3
        '2xl': ['1.5rem', { lineHeight: '2rem' }],        // 24px - H2
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],   // 30px - H1
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],     // 36px - Hero
      },
      
      // ===== SPACING (8pt Grid) =====
      // Tailwind 기본 spacing 사용 (4px 배수)
      // 추가 필요한 것만 extend
      spacing: {
        '0.5': '0.125rem',  // 2px
        '11': '2.75rem',    // 44px - iOS nav bar
        '13': '3.25rem',    // 52px
        '14': '3.5rem',     // 56px - Android nav bar, FAB
        '15': '3.75rem',    // 60px
        '18': '4.5rem',     // 72px
      },
      
      // ===== BORDER RADIUS (Linear Mobile Style) =====
      borderRadius: {
        'lg': '0.75rem',   // 12px - Cards
        'xl': '1rem',      // 16px - Buttons
        '2xl': '1.5rem',   // 24px - Modals
        '3xl': '2rem',     // 32px - Large cards
      },
      
      // ===== SHADOWS (Minimal Linear Style) =====
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'sm': '0 2px 4px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'md': '0 4px 8px 0 rgba(0, 0, 0, 0.08), 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'lg': '0 8px 16px 0 rgba(0, 0, 0, 0.10), 0 4px 6px 0 rgba(0, 0, 0, 0.06)',
        'xl': '0 12px 24px 0 rgba(0, 0, 0, 0.12), 0 6px 12px 0 rgba(0, 0, 0, 0.08)',
      },
      
      // ===== BACKDROP BLUR (Frosted Glass) =====
      backdropBlur: {
        'light': '8px',
        'medium': '16px',
        'strong': '24px',
        'extra': '32px',
      },
      
      backdropSaturate: {
        '180': '1.8',
        '200': '2.0',
        '220': '2.2',
      },
      
      // ===== TRANSITIONS =====
      transitionDuration: {
        'fast': '150ms',
        'base': '200ms',
        'slow': '300ms',
      },
      
      transitionTimingFunction: {
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      
      // ===== Z-INDEX =====
      zIndex: {
        'dropdown': '1000',
        'sticky': '1100',
        'fixed': '1200',
        'modal-backdrop': '1300',
        'modal': '1400',
        'popover': '1500',
        'toast': '1600',
        'tooltip': '1700',
      },
      
      // ===== ANIMATIONS (TikTok-style) =====
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  
  plugins: [],
};

export default config;
