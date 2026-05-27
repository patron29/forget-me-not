import React from 'react';
import { Text } from 'react-native';
import { render, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SubscriptionProvider,
  useSubscription,
  FREE_TIER_LIMITS,
} from '../src/utils/SubscriptionContext';

// Capture the live context value for assertions.
let captured;
function Capture() {
  captured = useSubscription();
  return <Text>{String(captured.isPremium)}</Text>;
}

function renderProvider() {
  return render(
    <SubscriptionProvider>
      <Capture />
    </SubscriptionProvider>
  );
}

describe('SubscriptionContext (demo mode — placeholder API keys)', () => {
  beforeEach(async () => {
    captured = undefined;
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('defaults to non-premium / free', async () => {
    renderProvider();
    await waitFor(() => expect(captured.isLoading).toBe(false));
    expect(captured.isPremium).toBe(false);
    expect(captured.subscriptionStatus).toBe('free');
  });

  it('does NOT honor a spoofed cached isPremium flag in demo mode', async () => {
    // Simulate a user editing local storage to unlock premium for free.
    await AsyncStorage.setItem(
      'subscription-status',
      JSON.stringify({ isPremium: true, status: 'yearly' })
    );

    renderProvider();
    await waitFor(() => expect(captured.isLoading).toBe(false));

    // The whole point of the security fix: demo mode never trusts the cache.
    expect(captured.isPremium).toBe(false);
    expect(captured.subscriptionStatus).toBe('free');
  });

  it('gates reminders at the free limit for non-premium users', async () => {
    renderProvider();
    await waitFor(() => expect(captured.isLoading).toBe(false));

    expect(captured.canAddReminder(FREE_TIER_LIMITS.MAX_REMINDERS - 1)).toBe(true);
    expect(captured.canAddReminder(FREE_TIER_LIMITS.MAX_REMINDERS)).toBe(false);
    expect(captured.getRemainingReminders(2)).toBe(FREE_TIER_LIMITS.MAX_REMINDERS - 2);
    expect(captured.getRemainingReminders(FREE_TIER_LIMITS.MAX_REMINDERS)).toBe(0);
  });

  it('gates chain mode and multi-location behind premium', async () => {
    renderProvider();
    await waitFor(() => expect(captured.isLoading).toBe(false));

    // Free user (demo mode) — premium-only features are locked.
    expect(captured.canUseChainMode()).toBe(false);
    expect(captured.canUseMultiLocation()).toBe(false);
  });
});
