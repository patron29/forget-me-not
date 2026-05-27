import React from 'react';
import { Text } from 'react-native';
import { render, waitFor, act } from '@testing-library/react-native';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme } from '../src/utils/ThemeContext';

jest.mock('react-native/Libraries/Utilities/useColorScheme');

let captured;
function Capture() {
  captured = useTheme();
  return <Text>{captured.isDark ? 'dark' : 'light'}</Text>;
}

function renderProvider() {
  return render(
    <ThemeProvider>
      <Capture />
    </ThemeProvider>
  );
}

describe('ThemeContext', () => {
  beforeEach(async () => {
    captured = undefined;
    await AsyncStorage.clear();
    jest.clearAllMocks();
    useColorScheme.mockReturnValue('light');
  });

  it('exposes design tokens (spacing, radius, typography, elevation)', async () => {
    renderProvider();
    await waitFor(() => expect(captured.isLoaded).toBe(true));
    expect(captured.spacing.md).toBe(12);
    expect(captured.radius.full).toBe(9999);
    expect(captured.typography.title).toBeDefined();
    expect(captured.elevation.sm).toBeDefined();
  });

  it('follows the system color scheme by default', async () => {
    useColorScheme.mockReturnValue('dark');
    renderProvider();
    await waitFor(() => expect(captured.isLoaded).toBe(true));
    expect(captured.themeMode).toBe('system');
    expect(captured.isDark).toBe(true);
  });

  it('respects an explicit saved preference over the system scheme', async () => {
    useColorScheme.mockReturnValue('dark');
    await AsyncStorage.setItem('app-theme-preference', 'light');
    renderProvider();
    await waitFor(() => expect(captured.isLoaded).toBe(true));
    expect(captured.themeMode).toBe('light');
    expect(captured.isDark).toBe(false); // explicit light beats system dark
  });

  it('setTheme persists the choice and updates isDark', async () => {
    useColorScheme.mockReturnValue('light');
    renderProvider();
    await waitFor(() => expect(captured.isLoaded).toBe(true));

    await act(async () => {
      await captured.setTheme('dark');
    });

    expect(captured.isDark).toBe(true);
    expect(await AsyncStorage.getItem('app-theme-preference')).toBe('dark');
  });

  it('provides a different palette for dark vs light', async () => {
    useColorScheme.mockReturnValue('light');
    const { rerender } = renderProvider();
    await waitFor(() => expect(captured.isLoaded).toBe(true));
    const lightBg = captured.colors.background;

    await act(async () => {
      await captured.setTheme('dark');
    });
    expect(captured.colors.background).not.toBe(lightBg);
  });
});
