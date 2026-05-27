/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Primary gradient colors
        primary: {
          DEFAULT: '#4A7BFF',
          start: '#4A7BFF',
          middle: '#6B93FF',
          end: '#8BABFF',
        },
        // Secondary gradient colors
        secondary: {
          start: '#B4E4FF',
          middle: '#C5EBFF',
          end: '#D6F1FF',
        },
        // Accent
        accent: {
          DEFAULT: '#4A7BFF',
          light: 'rgba(74, 123, 255, 0.1)',
        },
        // Status colors
        success: {
          DEFAULT: '#A8E6CF',
          start: '#A8E6CF',
          middle: '#B8EDDB',
          end: '#C8F4E7',
        },
        warning: {
          DEFAULT: '#FFD6A5',
          start: '#FFD6A5',
          middle: '#FFE0B8',
          end: '#FFEACA',
        },
        danger: {
          DEFAULT: '#FFAAA5',
          start: '#FFAAA5',
          middle: '#FFB8B4',
          end: '#FFC6C3',
        },
        // Pastel card colors
        pastel: {
          purple: '#E8E4FF',
          green: '#D4F1E8',
          peach: '#FFE8D6',
          gray: '#F0F1F5',
          blue: '#E0EFFF',
          pink: '#FFE4E9',
        },
        // Surface colors
        surface: {
          DEFAULT: '#FFFFFF',
          light: '#F8F9FA',
          gray: '#F5F5F7',
        },
        // Text colors
        text: {
          DEFAULT: '#1A1A1A',
          secondary: '#6B7280',
          muted: '#9CA3AF',
          light: '#D1D5DB',
          dark: '#FFFFFF',
        },
        // Border colors
        border: {
          DEFAULT: '#E5E7EB',
          light: '#F3F4F6',
        },
      },
      borderRadius: {
        'sm': '12px',
        'md': '16px',
        'lg': '20px',
        'xl': '28px',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        'xxl': '48px',
      },
      fontSize: {
        'h1': ['32px', { fontWeight: '700', letterSpacing: '-0.5px' }],
        'h2': ['24px', { fontWeight: '700', letterSpacing: '-0.3px' }],
        'h3': ['20px', { fontWeight: '600', letterSpacing: '-0.2px' }],
        'body': ['16px', { lineHeight: '24px' }],
        'body-sm': ['14px', { lineHeight: '20px' }],
        'caption': ['12px', { lineHeight: '16px' }],
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'md': '0 2px 4px rgba(0, 0, 0, 0.08)',
        'lg': '0 4px 8px rgba(0, 0, 0, 0.1)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};
