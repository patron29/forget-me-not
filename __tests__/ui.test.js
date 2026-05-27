import React from 'react';
import { renderWithProviders as render, fireEvent } from '../src/test-utils';
import { StatCard, EmptyState, PrimaryButton } from '../src/components/ui';

describe('UI primitives', () => {
  it('StatCard renders value and label', () => {
    const { getByText } = render(<StatCard value="3/5" label="Active" />);
    expect(getByText('3/5')).toBeTruthy();
    expect(getByText('Active')).toBeTruthy();
  });

  it('EmptyState renders title, message and hint', () => {
    const { getByText } = render(
      <EmptyState title="Nothing here" message="Add one" hint="Tip" />
    );
    expect(getByText('Nothing here')).toBeTruthy();
    expect(getByText('Add one')).toBeTruthy();
    expect(getByText('Tip')).toBeTruthy();
  });

  it('PrimaryButton fires onPress when enabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <PrimaryButton label="Save" onPress={onPress} />
    );
    fireEvent.press(getByText('Save'));
    expect(onPress).toHaveBeenCalled();
  });
});
