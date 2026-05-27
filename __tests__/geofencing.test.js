import {
  calculateDistance,
  isWithinRadius,
  canTrigger,
  parseStoredReminders,
  TRIGGER_THROTTLE_MS,
  DEFAULT_RADIUS_M,
} from '../src/utils/geofencing';

describe('calculateDistance', () => {
  it('returns ~0 for identical coordinates', () => {
    expect(calculateDistance(37.7749, -122.4194, 37.7749, -122.4194)).toBeCloseTo(0, 5);
  });

  it('computes a known distance (SF to LA ≈ 559 km) within 1%', () => {
    const meters = calculateDistance(37.7749, -122.4194, 34.0522, -118.2437);
    expect(meters).toBeGreaterThan(553000);
    expect(meters).toBeLessThan(565000);
  });

  it('is symmetric', () => {
    const a = calculateDistance(40.7128, -74.006, 51.5074, -0.1278);
    const b = calculateDistance(51.5074, -0.1278, 40.7128, -74.006);
    expect(a).toBeCloseTo(b, 5);
  });

  it('returns NaN when any coordinate is not finite', () => {
    expect(calculateDistance(NaN, 0, 0, 0)).toBeNaN();
    expect(calculateDistance(0, undefined, 0, 0)).toBeNaN();
    expect(calculateDistance(0, 0, Infinity, 0)).toBeNaN();
  });
});

describe('isWithinRadius', () => {
  const sf = { latitude: 37.7749, longitude: -122.4194 };

  it('is true for a point essentially on top of the target', () => {
    expect(isWithinRadius(sf, { latitude: 37.7749, longitude: -122.4194 }, 100)).toBe(true);
  });

  it('is false for a point far outside the radius', () => {
    const la = { latitude: 34.0522, longitude: -118.2437 };
    expect(isWithinRadius(sf, la, 100)).toBe(false);
  });

  it('is true for a point ~50m away within a 100m radius', () => {
    // ~0.00045 deg latitude ≈ 50m
    const near = { latitude: 37.7749 + 0.00045, longitude: -122.4194 };
    expect(isWithinRadius(sf, near, 100)).toBe(true);
  });

  it('does NOT trigger on NaN coordinates (bad data must not match)', () => {
    expect(isWithinRadius(sf, { latitude: NaN, longitude: NaN }, 100)).toBe(false);
  });

  it('falls back to the default radius when radius is not finite', () => {
    // a point ~80m away should match the default 100m radius
    const near = { latitude: 37.7749 + 0.0007, longitude: -122.4194 };
    expect(isWithinRadius(sf, near, undefined)).toBe(true);
    expect(DEFAULT_RADIUS_M).toBe(100);
  });
});

describe('canTrigger', () => {
  const now = 1_700_000_000_000;

  it('allows triggering when never triggered before', () => {
    expect(canTrigger(null, now)).toBe(true);
    expect(canTrigger(undefined, now)).toBe(true);
  });

  it('throttles within the window', () => {
    const fiveMinAgo = new Date(now - 5 * 60 * 1000).toISOString();
    expect(canTrigger(fiveMinAgo, now)).toBe(false);
  });

  it('allows triggering once the window has passed', () => {
    const twentyMinAgo = new Date(now - 20 * 60 * 1000).toISOString();
    expect(canTrigger(twentyMinAgo, now)).toBe(true);
  });

  it('treats a malformed timestamp as "never triggered" (no permanent throttle)', () => {
    // This is the audit bug: NaN would otherwise throttle forever.
    expect(canTrigger('not-a-date', now)).toBe(true);
  });

  it('uses a 15-minute throttle window by default', () => {
    expect(TRIGGER_THROTTLE_MS).toBe(15 * 60 * 1000);
  });
});

describe('parseStoredReminders', () => {
  const valid = JSON.stringify([
    { id: '1', text: 'a', location: { name: 'X', latitude: 1, longitude: 2 } },
    { id: '2', text: 'b', location: { name: 'Y', latitude: 3, longitude: 4 } },
  ]);

  it('parses a valid array of reminders', () => {
    expect(parseStoredReminders(valid)).toHaveLength(2);
  });

  it('returns [] for null/empty input', () => {
    expect(parseStoredReminders(null)).toEqual([]);
    expect(parseStoredReminders('')).toEqual([]);
  });

  it('returns [] for invalid JSON (no throw)', () => {
    expect(parseStoredReminders('{not json')).toEqual([]);
  });

  it('returns [] when stored JSON is valid but not an array', () => {
    expect(parseStoredReminders('{"foo":"bar"}')).toEqual([]);
    expect(parseStoredReminders('"a string"')).toEqual([]);
    expect(parseStoredReminders('42')).toEqual([]);
  });

  it('drops entries missing a location', () => {
    const mixed = JSON.stringify([
      { id: '1', text: 'ok', location: { name: 'X', latitude: 1, longitude: 2 } },
      { id: '2', text: 'no location' },
      { id: '3', text: 'null location', location: null },
      null,
    ]);
    const result = parseStoredReminders(mixed);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });
});
