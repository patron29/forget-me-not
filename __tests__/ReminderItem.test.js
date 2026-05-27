import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ReminderItem from '../src/components/ReminderItem';

// Mock the theme
jest.mock('../src/utils/theme', () => ({
  COLORS: {
    text: '#1a1a2e',
    textMuted: '#666666',
    textSecondary: '#888888',
    accent: '#FFD93D',
    surface: '#FFFFFF',
    surfaceGray: '#F5F5F5',
    pastelGreen: '#C8E6C9',
    border: '#E0E0E0',
    danger: { start: '#FF6B6B' },
    success: { start: '#4CAF50', middle: '#66BB6A' },
  },
  SPACING: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  BORDER_RADIUS: {
    sm: 4,
    md: 8,
    lg: 12,
  },
  SHADOWS: {},
}));

const mockReminder = {
  id: '1',
  text: 'Buy groceries',
  location: {
    name: 'Whole Foods',
    address: '123 Main St',
    latitude: 37.7749,
    longitude: -122.4194,
    radius: 100,
    isChain: false,
  },
  completed: false,
  createdAt: new Date().toISOString(),
  completedAt: null,
  triggeredCount: 0,
  lastTriggeredAt: null,
};

const mockChainReminder = {
  ...mockReminder,
  id: '2',
  text: 'Pick up prescription',
  location: {
    ...mockReminder.location,
    name: 'CVS Pharmacy',
    isChain: true,
    address: 'Any location',
  },
};

describe('ReminderItem', () => {
  const defaultProps = {
    reminder: mockReminder,
    onToggle: jest.fn(),
    onDelete: jest.fn(),
    onEdit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render reminder text', () => {
    const { getByText } = render(<ReminderItem {...defaultProps} />);
    expect(getByText('Buy groceries')).toBeTruthy();
  });

  it('should render location name', () => {
    const { getByText } = render(<ReminderItem {...defaultProps} />);
    expect(getByText('Whole Foods')).toBeTruthy();
  });

  it('should render chain location with (Any) suffix', () => {
    const { getByText } = render(
      <ReminderItem {...defaultProps} reminder={mockChainReminder} />
    );
    expect(getByText(/CVS Pharmacy/)).toBeTruthy();
    expect(getByText(/\(Any\)/)).toBeTruthy();
  });

  it('should return null for invalid reminder', () => {
    const { toJSON } = render(
      <ReminderItem {...defaultProps} reminder={null} />
    );
    expect(toJSON()).toBeNull();
  });

  it('should return null for reminder without location', () => {
    const invalidReminder = { ...mockReminder, location: null };
    const { toJSON } = render(
      <ReminderItem {...defaultProps} reminder={invalidReminder} />
    );
    expect(toJSON()).toBeNull();
  });

  it('should show completed date when showCompletedDate is true', () => {
    const completedReminder = {
      ...mockReminder,
      completed: true,
      completedAt: '2024-01-15T10:30:00.000Z',
    };
    const { getByText } = render(
      <ReminderItem
        {...defaultProps}
        reminder={completedReminder}
        showCompletedDate
      />
    );
    expect(getByText(/Completed/)).toBeTruthy();
  });

  it('should show address for non-chain reminders', () => {
    const { getByText } = render(<ReminderItem {...defaultProps} />);
    expect(getByText('123 Main St')).toBeTruthy();
  });

  it('should not show address for chain reminders', () => {
    const { queryByText } = render(
      <ReminderItem {...defaultProps} reminder={mockChainReminder} />
    );
    // Chain reminders should not show address "Any location" since isChain is true
    // The address display is hidden when isChain is true
    expect(queryByText('123 Main St')).toBeNull();
  });

  it('should show trigger count badge when triggeredCount > 0', () => {
    const triggeredReminder = {
      ...mockReminder,
      triggeredCount: 3,
    };
    const { getByText } = render(
      <ReminderItem {...defaultProps} reminder={triggeredReminder} />
    );
    expect(getByText('3x')).toBeTruthy();
  });
});
