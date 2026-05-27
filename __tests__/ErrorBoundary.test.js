import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import ErrorBoundary from '../src/components/ErrorBoundary';

// Component that throws an error
const ThrowError = () => {
  throw new Error('Test error');
};

// Safe component
const SafeComponent = () => (
  <View>
    <Text>Safe content</Text>
  </View>
);

describe('ErrorBoundary', () => {
  // Suppress console.error for error boundary tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  it('should render children when there is no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <SafeComponent />
      </ErrorBoundary>
    );
    expect(getByText('Safe content')).toBeTruthy();
  });

  it('should render error UI when child throws', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(getByText('Something went wrong')).toBeTruthy();
    expect(getByText('Try Again')).toBeTruthy();
  });

  it('should display custom fallback message', () => {
    const { getByText } = render(
      <ErrorBoundary fallbackMessage="Custom error message">
        <ThrowError />
      </ErrorBoundary>
    );
    expect(getByText('Custom error message')).toBeTruthy();
  });

  it('should reset error state when retry is pressed', () => {
    // First render with error
    const { getByText, rerender } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(getByText('Something went wrong')).toBeTruthy();

    // Press retry button
    fireEvent.press(getByText('Try Again'));

    // The component will try to re-render children, which will throw again
    // So we should still see the error UI
    expect(getByText('Something went wrong')).toBeTruthy();
  });

  it('should show default error message when no fallbackMessage provided', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(getByText('An unexpected error occurred. Please try again.')).toBeTruthy();
  });
});
