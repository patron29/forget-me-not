import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

const THEME_STORAGE_KEY = 'app-theme-preference';

// Light theme colors
const lightColors = {
  // Primary colors
  primary: '#4A7BFF',
  primaryLight: '#E0EFFF',
  accent: '#4A7BFF',
  accentLight: 'rgba(74, 123, 255, 0.1)',

  // Status colors
  success: '#3FAD6E',
  successLight: '#D4F1E8',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',

  // Pastel colors
  pastelPurple: '#E8E4FF',
  pastelGreen: '#D4F1E8',
  pastelPeach: '#FFE8D6',
  pastelGray: '#F0F1F5',
  pastelBlue: '#E0EFFF',
  pastelPink: '#FFE4E9',

  // Backgrounds
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceGray: '#F5F5F7',
  card: '#FFFFFF',

  // Text
  text: '#1A1A1A',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textLight: '#D1D5DB',

  // Borders
  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  modalBackground: 'rgba(0, 0, 0, 0.4)',

  // Tab bar
  tabBar: '#FFFFFF',
  tabBarBorder: '#E5E7EB',

  // Input
  inputBackground: '#F5F5F7',
  inputBorder: '#E5E7EB',

  // Premium
  premiumGold: '#FFD700',
  premiumBackground: '#FFF8E6',
};

// Dark theme colors
const darkColors = {
  // Primary colors
  primary: '#6B93FF',
  primaryLight: '#1E3A5F',
  accent: '#6B93FF',
  accentLight: 'rgba(107, 147, 255, 0.15)',

  // Status colors
  success: '#4ADE80',
  successLight: '#1A3D2E',
  warning: '#FBBF24',
  warningLight: '#3D3415',
  danger: '#F87171',
  dangerLight: '#3D1A1A',

  // Pastel colors (darker versions)
  pastelPurple: '#2D2A4A',
  pastelGreen: '#1A3D2E',
  pastelPeach: '#3D2A1A',
  pastelGray: '#2A2A2E',
  pastelBlue: '#1E3A5F',
  pastelPink: '#3D1A2A',

  // Backgrounds
  background: '#0F0F0F',
  surface: '#1A1A1A',
  surfaceGray: '#242424',
  card: '#1A1A1A',

  // Text
  text: '#F5F5F5',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  textLight: '#52525B',

  // Borders
  border: '#2A2A2E',
  borderLight: '#3A3A3E',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.7)',
  modalBackground: 'rgba(0, 0, 0, 0.6)',

  // Tab bar
  tabBar: '#1A1A1A',
  tabBarBorder: '#2A2A2E',

  // Input
  inputBackground: '#242424',
  inputBorder: '#2A2A2E',

  // Premium
  premiumGold: '#FFD700',
  premiumBackground: '#3D3415',
};

export function ThemeProvider({ children }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('system'); // 'light' | 'dark' | 'system'
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme) {
        setThemeMode(savedTheme);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const setTheme = async (mode) => {
    try {
      setThemeMode(mode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  // Determine actual theme based on preference
  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark');
  const colors = isDark ? darkColors : lightColors;

  const value = {
    themeMode,
    setTheme,
    isDark,
    colors,
    isLoaded,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export { lightColors, darkColors };
export default ThemeContext;
