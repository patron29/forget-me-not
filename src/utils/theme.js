export const COLORS = {
  // Fintech app inspired theme with soft pastels
  primary: {
    start: '#4A7BFF',
    middle: '#6B93FF',
    end: '#8BABFF',
  },
  secondary: {
    start: '#B4E4FF',
    middle: '#C5EBFF',
    end: '#D6F1FF',
  },
  accent: {
    start: '#4A7BFF',
    middle: '#4A7BFF',
    end: '#4A7BFF',
  },
  success: {
    start: '#A8E6CF',
    middle: '#B8EDDB',
    end: '#C8F4E7',
  },
  warning: {
    start: '#FFD6A5',
    middle: '#FFE0B8',
    end: '#FFEACA',
  },
  danger: {
    start: '#FFAAA5',
    middle: '#FFB8B4',
    end: '#FFC6C3',
  },

  // Pastel card colors (like the reference image)
  pastelPurple: '#E8E4FF',
  pastelGreen: '#D4F1E8',
  pastelPeach: '#FFE8D6',
  pastelGray: '#F0F1F5',
  pastelBlue: '#E0EFFF',
  pastelPink: '#FFE4E9',

  // Clean white backgrounds
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceLight: '#F8F9FA',
  surfaceGray: '#F5F5F7',
  card: '#FFFFFF',
  cardHover: '#FAFAFA',

  // Text - clean hierarchy
  text: '#1A1A1A',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textLight: '#D1D5DB',
  textOnDark: '#FFFFFF',

  // Borders
  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  modalBackground: 'rgba(0, 0, 0, 0.4)',

  // Blue accent (like the reference)
  accent: '#4A7BFF',
  accentLight: 'rgba(74, 123, 255, 0.1)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  full: 999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
};

export const ANIMATIONS = {
  timing: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  spring: {
    damping: 15,
    stiffness: 150,
  },
};

export const TYPOGRAPHY = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
};
