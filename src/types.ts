/**
 * Shared domain types for Forget Me Not.
 *
 * These describe the data shapes persisted to AsyncStorage and passed between
 * the context, screens and components. Kept in one place so the JS->TS
 * migration has a single source of truth to import from.
 */

/** One physical place. Used both standalone and as an entry in a
 *  multi-location reminder (where it may carry a UI-only id and omit radius). */
export interface LocationData {
  id?: string;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  /** Trigger radius in metres. Optional on sub-locations; the reminder's
   *  top-level location always sets it (defaulting to 100m). */
  radius?: number;
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
  /** Which premium feature was gated, when error === 'PREMIUM_FEATURE'. */
  feature?: 'chain_mode' | 'multi_location';
}
