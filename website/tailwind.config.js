/**
 * Design tokens ported from the advanced-modern POC: white base, deep-navy
 * contrast bands, brand blue accent, soft radii and glow shadows to suit the
 * animated/parallax treatment.
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html', './assets/js/**/*.js'],
  theme: {
    extend: {
      colors: {
        bg: '#ffffff',
        surface: '#f5f8fd',
        // Deep navy bands that alternate with the white sections.
        ink: {
          DEFAULT: '#071a35',
          soft: '#0b2851',
        },
        text: '#0f1b2d',
        muted: '#5a6b83',
        divider: 'rgba(28,79,156,0.16)',
        accent: {
          DEFAULT: '#1c4f9c',
          50: '#f5f9ff',
          100: '#eef3fb',
          200: '#d7e3f6',
          300: '#b3caee',
          400: '#7aa3dd',
          500: '#3d72c0',
          600: '#1c4f9c',
          700: '#123a78',
          800: '#0b2851',
          900: '#071a35',
        },
      },
      fontFamily: {
        heading: ['Archivo', 'system-ui', 'sans-serif'],
        body: ['Archivo', 'system-ui', 'sans-serif'],
        // Kept from the previous design for periods, counters and other
        // technical micro-copy — the one addition to the ported token set.
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        sm: '0 1px 2px rgba(7,26,53,0.08)',
        md: '0 8px 24px rgba(7,26,53,0.10)',
        lg: '0 24px 60px rgba(7,26,53,0.16)',
        glow: '0 0 0 1px rgba(28,79,156,0.14), 0 18px 50px -12px rgba(28,79,156,0.45)',
      },
      borderRadius: {
        DEFAULT: '4px',
        card: '14px',
      },
      transitionTimingFunction: {
        // Long ease-out used by every reveal so the motion reads as one system.
        reveal: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        spin_slow: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        spin_reverse: {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        scroll_cue: {
          '0%': { transform: 'translateY(0)', opacity: '0' },
          '30%': { opacity: '1' },
          '100%': { transform: 'translateY(14px)', opacity: '0' },
        },
      },
      animation: {
        'spin-slow': 'spin_slow 26s linear infinite',
        'spin-slower': 'spin_slow 48s linear infinite',
        'spin-reverse': 'spin_reverse 34s linear infinite',
        marquee: 'marquee 38s linear infinite',
        float: 'float 7s ease-in-out infinite',
        'scroll-cue': 'scroll_cue 1.8s ease-out infinite',
      },
    },
  },
  plugins: [],
};
