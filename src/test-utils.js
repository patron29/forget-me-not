import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from './utils/ThemeContext';

/**
 * Renders a component wrapped in the providers it depends on.
 * ReminderItem (and most components) call useTheme(), which throws
 * outside a ThemeProvider — so wrap everything here.
 */
export function renderWithProviders(ui, options) {
  return render(<ThemeProvider>{ui}</ThemeProvider>, options);
}

export * from '@testing-library/react-native';
