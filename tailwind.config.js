module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets:[require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        foreground: '#ffffff',
        primary: '#3b82f6',
        secondary: '#1f2937',
        muted: '#6b7280',
        accent: '#f59e0b',
        destructive: '#ef4444',
      },
      borderRadius: {
        DEFAULT: '8',
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
};