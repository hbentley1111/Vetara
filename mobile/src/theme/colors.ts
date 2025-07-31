export const theme = {
  colors: {
    // Primary gradient colors matching web app
    primary: '#06b6d4', // cyan-500
    primaryDark: '#0891b2', // cyan-600
    secondary: '#3b82f6', // blue-500
    secondaryDark: '#2563eb', // blue-600
    
    // Dark theme colors
    background: '#0f172a', // slate-900
    surface: '#1e293b', // slate-800
    surfaceLight: '#334155', // slate-700
    
    // Text colors
    textPrimary: '#f1f5f9', // slate-100
    textSecondary: '#cbd5e1', // slate-300
    textMuted: '#94a3b8', // slate-400
    
    // Status colors
    success: '#22c55e', // green-500
    warning: '#f59e0b', // amber-500
    error: '#ef4444', // red-500
    info: '#06b6d4', // cyan-500
    
    // Utility colors
    white: '#ffffff',
    black: '#000000',
    transparent: 'transparent',
    
    // Specific UI colors
    slate900: '#0f172a',
    slate800: '#1e293b',
    slate700: '#334155',
    slate600: '#475569',
    slate500: '#64748b',
    slate400: '#94a3b8',
    slate300: '#cbd5e1',
    slate200: '#e2e8f0',
    slate100: '#f1f5f9',
    
    // Gradient colors
    gradientStart: '#06b6d4', // cyan-500
    gradientEnd: '#3b82f6', // blue-500
    
    // Pet-specific colors
    petBlue: '#3b82f6',
    petPink: '#ec4899',
    petGreen: '#22c55e',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  typography: {
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },
    fontWeight: {
      normal: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
  },
  
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 8},
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};

export type Theme = typeof theme;