/**
 * Shared domain types for Forget Me Not.
 *
 * These describe the data shapes persisted to AsyncStorage and passed between
 * the context, screens and components. Kept in one place so the JS->TS
 * migration has a single source of truth to import from.
 */

export interface LocationData {
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  /** Trigger radius in metres. */
  radius: number;
  /** Chain/franchise mode — trigger at ANY location of this business. */
  isChain?: boolean;
  /** Optional multi-location list for a single reminder. */
  locations?: LocationData[];
  placeId?: string;
}

export interface Reminder {
  id: string;
  text: string;
  location: LocationData;
  completed: boolean;
  /** ISO timestamp. */
  createdAt: string;
  /** ISO timestamp, or null while the reminder is still active. */
  completedAt: string | null;
  /** How many times the geofence has fired for this reminder. */
  triggeredCount: number;
  /** ISO timestamp of the last geofence trigger, or null. */
  lastTriggeredAt: string | null;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export type SubscriptionStatus = 'free' | 'monthly' | 'yearly';

/** Result returned by addReminder when a subscription gate blocks the action. */
export interface ReminderActionError {
  error: 'UPGRADE_REQUIRED' | 'PREMIUM_FEATURE';
  message: string;
}
