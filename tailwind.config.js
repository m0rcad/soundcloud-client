export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sc: {
          bg: 'var(--sc-bg, #0c0c0e)',
          'bg-elevated': 'var(--sc-bg-elevated, #141418)',
          surface: 'var(--sc-surface, #18181e)',
          'surface-2': 'var(--sc-surface-2, #22222a)',
          'surface-3': 'var(--sc-surface-3, #2a2a34)',
          hover: 'var(--sc-hover, #262630)',
          border: 'var(--sc-border, rgba(255, 255, 255, 0.08))',
          'border-subtle': 'var(--sc-border-subtle, rgba(255, 255, 255, 0.04))',
          'border-strong': 'var(--sc-border-strong, rgba(255, 255, 255, 0.16))',
          'border-hover': 'var(--sc-border-hover, rgba(255, 255, 255, 0.22))',
          accent: 'var(--sc-accent, #ff5500)',
          'accent-hover': 'var(--sc-accent-hover, #ff6a00)',
          'accent-active': 'var(--sc-accent-active, #e64d00)',
          'accent-soft': 'var(--sc-accent-soft, rgba(255, 85, 0, 0.15))',
          'text-primary': 'var(--sc-text-primary, #ffffff)',
          'text-secondary': 'var(--sc-text-secondary, #a3a3b2)',
          'text-tertiary': 'var(--sc-text-tertiary, #71717e)',
          'wave-inactive': 'var(--sc-wave-inactive, rgba(255, 255, 255, 0.18))',
          'wave-active': 'var(--sc-wave-active, #ff5500)',
          success: 'var(--sc-success, #10b981)',
          warning: 'var(--sc-warning, #f59e0b)',
          danger: 'var(--sc-danger, #ef4444)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        sc: '8px',
        'sc-card': '14px',
        'sc-modal': '20px',
      },
      boxShadow: {
        'sc-glass': 'var(--sc-shadow-glass)',
        'sc-glow': 'var(--sc-accent-glow)',
      },
      animation: {
        'marquee': 'marquee 15s linear infinite',
        'spin-slow': 'spin 1.2s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
    },
  },
  plugins: [],
};
