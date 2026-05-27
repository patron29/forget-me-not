/**
 * Pure geofencing / persistence helpers, extracted from ReminderContext so the
 * risky bits (distance math, trigger throttling, stored-data validation) can be
 * unit-tested in isolation and shared by both the React provider and the
 * background location task — instead of being duplicated and untestable.
 */
import type { Reminder } from '../types';

/** Throttle window: don't re-fire the same reminder within 15 minutes. */
export const TRIGGER_THROTTLE_MS = 15 * 60 * 1000;

/** Default trigger radius (metres) when a location doesn't specify one. */
export const DEFAULT_RADIUS_M = 100;

/**
 * Great-circle distance between two coordinates in metres (Haversine).
 * Returns NaN if any input isn't a finite number, so callers can detect and
 * skip bad coordinates rather than silently treating them as "far away".
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (
    !Number.isFinite(lat1) ||
    !Number.isFinite(lon1) ||
    !Number.isFinite(lat2) ||
    !Number.isFinite(lon2)
  ) {
    return NaN;
  }
  const R = 6371e3; // Earth's radius in metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/** True when `point` is within `radius` metres of `target`. */
export function isWithinRadius(
  point: { latitude: number; longitude: number },
  target: { latitude: number; longitude: number },
  radius: number = DEFAULT_RADIUS_M
): boolean {
  const distance = calculateDistance(
    point.latitude,
    point.longitude,
    target.latitude,
    target.longitude
  );
  // NaN <= radius is false, so bad coordinates correctly don't trigger.
  return distance <= (Number.isFinite(radius) ? radius : DEFAULT_RADIUS_M);
}

/**
 * Whether a reminder is eligible to fire given its last-triggered timestamp.
 * Guards against a malformed timestamp (NaN) — which would otherwise make
 * `now - NaN >= window` always false and throttle the reminder forever.
 */
export function canTrigger(
  lastTriggeredAt: string | null | undefined,
  now: number = Date.now(),
  throttleMs: number = TRIGGER_THROTTLE_MS
): boolean {
  const parsed = lastTriggeredAt ? new Date(lastTriggeredAt).getTime() : 0;
  const last = Number.isFinite(parsed) ? parsed : 0;
  return now - last >= throttleMs;
}

/**
 * Parse the persisted reminders blob defensively. Stored data can be valid
 * JSON but the wrong shape (legacy data, manual edits, partial writes); an
 * unguarded JSON.parse + .filter would then crash the UI or silently kill the
 * background task. Require an array and drop entries missing a location.
 */
export function parseStoredReminders(raw: string | null | undefined): Reminder[] {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(
    (r): r is Reminder =>
      r != null && typeof r === 'object' && 'location' in r && r.location != null
  );
}
