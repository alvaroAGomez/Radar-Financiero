/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        // Professional Fintech / TradingView Inspired Theme
        // Surface Hierarchy
        'background':                 '#131722',
        'surface':                    '#1E222D',
        'surface-dim':                '#1A1E26',
        'surface-container-lowest':   '#131722',
        'surface-container-low':      '#1E222D',
        'surface-container':          '#2A2E39',
        'surface-container-high':     '#363A45',
        'surface-container-highest':  '#434651',
        'surface-bright':             '#2A2E39',
        'surface-variant':            '#2A2E39',
        // On Surface
        'on-surface':                 '#D1D4DC',
        'on-surface-variant':         '#787B86',
        'on-background':              '#D1D4DC',
        
        // Primary — Sleek Accent
        'primary':                    '#2962FF',
        'on-primary':                 '#FFFFFF',
        'primary-container':          '#003E9C',
        'on-primary-container':       '#D4E2FF',
        'primary-fixed':              '#D4E2FF',
        'primary-fixed-dim':          '#2962FF',
        'on-primary-fixed':           '#001C3A',
        'on-primary-fixed-variant':   '#0042A6',
        
        // Secondary — Positive / Growth (TradingView Green)
        'secondary':                  '#26A69A',
        'on-secondary':               '#FFFFFF',
        'secondary-container':        '#003833',
        'on-secondary-container':     '#7EF8E9',
        'secondary-fixed':            '#7EF8E9',
        'secondary-fixed-dim':        '#26A69A',
        'on-secondary-fixed':         '#00201C',
        'on-secondary-fixed-variant': '#005047',
        
        // Tertiary — Negative / Loss (TradingView Red)
        'tertiary':                   '#F23645',
        'on-tertiary':                '#FFFFFF',
        'tertiary-container':         '#410006',
        'on-tertiary-container':      '#FFDAD8',
        'tertiary-fixed':             '#FFDAD8',
        'tertiary-fixed-dim':         '#F23645',
        'on-tertiary-fixed':          '#410006',
        'on-tertiary-fixed-variant':  '#930015',
        
        // Neutral
        'outline':                    '#434651',
        'outline-variant':            '#2A2E39',
        
        // Error
        'error':                      '#F23645',
        'on-error':                   '#FFFFFF',
        'error-container':            '#410006',
        'on-error-container':         '#FFDAD8',
        
        // Inverse
        'inverse-surface':            '#D1D4DC',
        'inverse-on-surface':         '#131722',
        'inverse-primary':            '#2962FF',
        
        // Surface tint
        'surface-tint':               '#2A2E39',
      },
      fontFamily: {
        headline: ['Inter', 'sans-serif'],
        display:  ['Inter', 'sans-serif'],
        body:     ['Inter', 'sans-serif'],
        label:    ['Inter', 'sans-serif'],
        sans:     ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        sm:      '0.125rem',
        md:      '0.375rem',
        lg:      '0.5rem',
        xl:      '0.75rem',
        '2xl':   '1rem',
        full:    '9999px',
      },
      boxShadow: {
        'card':       '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
        'glass':      '0 8px 32px rgba(0, 0, 0, 0.2)',
      },
      animation: {
        'pulse-slow':   'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flash-update': 'flashUpdate 0.5s ease-in-out',
        'slide-up':     'slideUp 0.3s ease-out',
        'fade-in':      'fadeIn 0.2s ease-out',
      },
      keyframes: {
        flashUpdate: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.4' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',   opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
