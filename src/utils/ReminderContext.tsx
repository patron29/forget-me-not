import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
  ReactNode,
} from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { checkChainProximity } from '../services/placesService';
import { useSubscription, FREE_TIER_LIMITS } from './SubscriptionContext';
import type { Reminder, LocationData, ReminderActionError } from '../types';
import {
  isWithinRadius,
  canTrigger,
  parseStoredReminders,
} from './geofencing';

const LOCATION_TASK_NAME = 'background-location-task';

type LocationPermissionState = 'full' | 'foreground' | 'denied' | null;

type NotificationPermissionState = 'granted' | 'denied' | null;

/** A coordinate pair, the minimum needed for proximity checks. */
interface Coords {
  latitude: number;
  longitude: number;
}

/** Location-or-error result returned by addReminder. */
type AddReminderResult = Reminder | ReminderActionError;

export interface ReminderContextValue {
  reminders: Reminder[];
  addReminder: (
    text: string,
    location: LocationData
  ) => Promise<AddReminderResult>;
  toggleReminder: (id: string) => void;
  deleteReminder: (id: string) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  getActiveReminders: () => Reminder[];
  getCompletedReminders: () => Reminder[];
  getRemindersByLocation: (locationName: string) => Reminder[];
  checkProximity: (currentLocation: Coords) => Promise<void>;
  locationPermission: LocationPermissionState;
  notificationPermission: NotificationPermissionState;
  isPremium: boolean;
  getReminderUsage: () => {
    active: number;
    limit: number;
    remaining: number;
    isPremium: boolean;
  };
  canAddReminder: () => boolean;
}

const ReminderContext = createContext<ReminderContextValue | undefined>(
  undefined
);

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    // shouldShowAlert is deprecated; shouldShowBanner/List are the current
    // fields. Keep all three so behavior is correct across SDK versions.
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const ReminderProvider = ({ children }: { children: ReactNode }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [locationPermission, setLocationPermission] =
    useState<LocationPermissionState>(null);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermissionState>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isGeofencingActive, setIsGeofencingActive] = useState(false);
  // When the initial load fails we must not persist the (empty) in-memory
  // state, or a transient storage error would permanently wipe saved data.
  const persistenceBlocked = useRef(false);
  const isLoadedRef = useRef(false);
  // Serializes start/stop geofencing so a rapid state change can't interleave
  // an in-flight stop with a new start (or vice versa).
  const geofencingOp = useRef<Promise<void>>(Promise.resolve());

  // Get subscription status - may be null if not wrapped in SubscriptionProvider
  let subscriptionContext = null;
  try {
    subscriptionContext = useSubscription();
  } catch (e) {
    // Running outside SubscriptionProvider (e.g., in tests)
  }
  const isPremium = subscriptionContext?.isPremium || false;

  useEffect(() => {
    loadReminders();
    requestPermissions();
  }, []);

  // Only save after initial load is complete
  useEffect(() => {
    if (isLoaded) {
      isLoadedRef.current = true;
      saveReminders();
    }
  }, [reminders, isLoaded]);

  // Stop background location tracking once nothing needs geofencing, and
  // (re)start it when active reminders exist and we're permitted. Depends on
  // locationPermission so tracking starts as soon as the permission resolves —
  // not only on the next reminder mutation.
  useEffect(() => {
    if (!isLoaded) return;
    const hasActive = reminders.some((r) => !r.completed);
    if (!hasActive && isGeofencingActive) {
      stopGeofencing();
    } else if (hasActive && !isGeofencingActive && locationPermission === 'full') {
      setupGeofencing();
    }
  }, [reminders, isLoaded, locationPermission, isGeofencingActive]);

  // When the app returns to the foreground: pick up any trigger metadata the
  // background task wrote while we were away (otherwise our next save would
  // clobber it and reminders would re-fire early), and re-read permissions in
  // case the user changed them in the system Settings.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        refreshFromStorage();
        refreshPermissions();
      }
    });
    return () => subscription.remove();
  }, []);

  const refreshFromStorage = async () => {
    if (!isLoadedRef.current) return;
    try {
      const saved = await AsyncStorage.getItem('reminders');
      const wasBlocked = persistenceBlocked.current;
      // Storage readable again: safe to resume persisting.
      persistenceBlocked.current = false;
      if (saved === null) return;
      const stored = parseStoredReminders(saved);

      // Merge instead of replace: in-memory state stays authoritative for
      // adds/edits/deletes (a replace could revert a user action committed
      // while the read was in flight); storage contributes only the newer
      // trigger metadata the background task wrote while we were away.
      setReminders((current) => {
        const storedById = new Map(stored.map((r) => [r.id, r]));
        const parseTime = (iso: string | null | undefined) => {
          const t = iso ? Date.parse(iso) : 0;
          return Number.isFinite(t) ? t : 0;
        };
        const merged = current.map((r) => {
          const s = storedById.get(r.id);
          if (!s || parseTime(s.lastTriggeredAt) <= parseTime(r.lastTriggeredAt)) {
            return r;
          }
          return {
            ...r,
            triggeredCount: s.triggeredCount,
            lastTriggeredAt: s.lastTriggeredAt,
          };
        });
        if (wasBlocked) {
          // The initial load failed, so memory never saw what storage holds —
          // adopt those reminders too instead of dropping them.
          const knownIds = new Set(current.map((r) => r.id));
          merged.push(...stored.filter((r) => !knownIds.has(r.id)));
        }
        return merged;
      });
    } catch (error) {
      // Keep the in-memory state; we'll try again on the next foreground.
      console.warn('Could not refresh reminders from storage:', error);
    }
  };

  // Non-prompting permission re-check (unlike requestPermissions, safe to run
  // on every foreground). Leaves state untouched while a prompt is undecided.
  const refreshPermissions = async () => {
    try {
      const foreground = await Location.getForegroundPermissionsAsync();
      if (foreground.status === 'granted') {
        const background = await Location.getBackgroundPermissionsAsync();
        setLocationPermission(background.status === 'granted' ? 'full' : 'foreground');
      } else if (foreground.status === 'denied') {
        setLocationPermission('denied');
      }
      const notif = await Notifications.getPermissionsAsync();
      if (notif.status === 'granted') {
        setNotificationPermission('granted');
      } else if (notif.status === 'denied') {
        setNotificationPermission('denied');
      }
    } catch (error) {
      console.warn('Could not refresh permissions:', error);
    }
  };

  const requestPermissions = async () => {
    try {
      // Request notification permissions
      const { status: notifStatus } = await Notifications.requestPermissionsAsync();
      setNotificationPermission(notifStatus === 'granted' ? 'granted' : 'denied');

      // Request location permissions
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();

      if (foregroundStatus === 'granted') {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        setLocationPermission(backgroundStatus === 'granted' ? 'full' : 'foreground');
      } else {
        setLocationPermission('denied');
      }
    } catch (error) {
      // Requesting can throw when the platform usage-description strings
      // aren't present (e.g. running in Expo Go, which uses a generic
      // Info.plist). Treat that as "denied" so the UI shows the normal
      // permission prompt instead of getting stuck, and log it quietly —
      // it's an environment limitation, not an app error.
      setLocationPermission('denied');
      console.warn(
        'Location permission unavailable in this environment (expected in Expo Go):',
        error instanceof Error ? error.message : error
      );
    }
  };

  const loadReminders = async () => {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const savedReminders = await AsyncStorage.getItem('reminders');
        if (savedReminders) {
          setReminders(parseStoredReminders(savedReminders));
        }
        setIsLoaded(true);
        return;
      } catch (error) {
        if (attempt === 1) {
          // Transient native-storage hiccup; retry once before giving up.
          await new Promise((resolve) => setTimeout(resolve, 300));
        } else {
          console.error('Error loading reminders:', error);
          // Couldn't read storage. Block saving for this session so the empty
          // in-memory state can't overwrite the user's persisted reminders;
          // refreshFromStorage lifts the block once a read succeeds again.
          persistenceBlocked.current = true;
          setIsLoaded(true);
        }
      }
    }
  };

  const saveReminders = async () => {
    if (persistenceBlocked.current) return;
    try {
      await AsyncStorage.setItem('reminders', JSON.stringify(reminders));
    } catch (error) {
      console.error('Error saving reminders:', error);
    }
  };

  const addReminder = async (
    text: string,
    location: LocationData
  ): Promise<AddReminderResult> => {
    // Check subscription limits for free users
    const activeReminders = reminders.filter(r => !r.completed);
    if (!isPremium && activeReminders.length >= FREE_TIER_LIMITS.MAX_REMINDERS) {
      return { error: 'UPGRADE_REQUIRED', message: `Free accounts are limited to ${FREE_TIER_LIMITS.MAX_REMINDERS} active reminders` };
    }

    // Check for premium-only features
    if (!isPremium) {
      // Chain mode is premium only
      if (location.isChain) {
        return { error: 'PREMIUM_FEATURE', feature: 'chain_mode', message: 'Chain mode is a premium feature' };
      }
      // Multiple locations is premium only
      if (location.locations && location.locations.length > 1) {
        return { error: 'PREMIUM_FEATURE', feature: 'multi_location', message: 'Multiple locations is a premium feature' };
      }
    }

    // Support for multiple locations
    const locationsArray = location.locations || [{
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      name: location.name,
      address: location.address || '',
      latitude: location.latitude,
      longitude: location.longitude,
    }];

    const newReminder = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      text,
      location: {
        name: location.name,
        address: location.address || '',
        latitude: location.latitude,
        longitude: location.longitude,
        radius: location.radius || 100, // Default 100 meters (matches FIXED_RADIUS)
        isChain: location.isChain || false, // Chain/franchise mode
        // New: Array of all locations for multi-location reminders
        locations: locationsArray,
      },
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
      triggeredCount: 0,
      lastTriggeredAt: null,
    };

    setReminders(prevReminders => [newReminder, ...prevReminders]);

    // Set up geofencing only once for all reminders
    await setupGeofencing();

    return newReminder;
  };

  // Queue an operation behind any in-flight geofencing start/stop so the two
  // can't interleave (e.g. a stop still awaiting the OS while a start begins).
  const enqueueGeofencingOp = (op: () => Promise<void>): Promise<void> => {
    const run = () => op();
    geofencingOp.current = geofencingOp.current.then(run, run);
    return geofencingOp.current;
  };

  const setupGeofencing = () => enqueueGeofencingOp(async () => {
    try {
      if (locationPermission !== 'full') {
        return;
      }

      // Reconcile with the OS, not just React state: isGeofencingActive
      // resets to false on every app restart while the registered task may
      // already be running, which would otherwise start it twice.
      const alreadyRunning = await Location.hasStartedLocationUpdatesAsync(
        LOCATION_TASK_NAME
      );
      if (alreadyRunning) {
        setIsGeofencingActive(true);
        return;
      }

      // Start location updates in background
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 30000, // Check every 30 seconds
        distanceInterval: 50, // Or when moved 50 meters
        foregroundService: {
          notificationTitle: 'Forget Me Not',
          notificationBody: 'Tracking your location for reminders',
        },
      });

      setIsGeofencingActive(true);
    } catch (error) {
      console.error('Error setting up geofencing:', error);
    }
  });

  // Tear down background location tracking. Called when no active reminders
  // remain so we don't keep draining battery / holding location access (a
  // real privacy concern) once there's nothing left to geofence for.
  const stopGeofencing = () => enqueueGeofencingOp(async () => {
    try {
      const running = await Location.hasStartedLocationUpdatesAsync(
        LOCATION_TASK_NAME
      );
      if (running) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      }
      setIsGeofencingActive(false);
    } catch (error) {
      console.error('Error stopping geofencing:', error);
    }
  });

  const checkProximity = async (currentLocation: Coords) => {
    try {
      const activeReminders = reminders.filter(r => !r.completed);
      const remindersToUpdate: string[] = [];

      for (const reminder of activeReminders) {
        // Throttled reminders can't fire regardless of proximity — skip them
        // BEFORE the chain check below, which costs a billable Places request.
        if (!canTrigger(reminder.lastTriggeredAt)) {
          continue;
        }

        let shouldTrigger = false;
        let matchedLocation: Partial<LocationData> | null = null;

        // Chain mode: Check for nearby chain locations
        if (reminder.location.isChain) {
          const chainMatch = await checkChainProximity(
            currentLocation.latitude,
            currentLocation.longitude,
            reminder.location.name,
            5000, // Search within 5km for chain locations
            reminder.location.radius // Use the reminder's proximity radius
          );

          if (chainMatch) {
            shouldTrigger = true;
            matchedLocation = chainMatch;
          }
        } else {
          // Regular mode: Check distance to all locations in the array
          const locationsToCheck = reminder.location.locations || [{
            latitude: reminder.location.latitude,
            longitude: reminder.location.longitude,
            name: reminder.location.name,
            address: reminder.location.address,
          }];

          for (const loc of locationsToCheck) {
            if (isWithinRadius(currentLocation, loc, reminder.location.radius)) {
              shouldTrigger = true;
              matchedLocation = loc;
              break; // Found a matching location, no need to check others
            }
          }
        }

        if (shouldTrigger) {
          await sendNotification(reminder, matchedLocation);
          remindersToUpdate.push(reminder.id);
        }
      }

      // Update all triggered reminders in one batch
      if (remindersToUpdate.length > 0) {
        setReminders(prevReminders =>
          prevReminders.map(r =>
            remindersToUpdate.includes(r.id)
              ? {
                  ...r,
                  triggeredCount: r.triggeredCount + 1,
                  lastTriggeredAt: new Date().toISOString()
                }
              : r
          )
        );
      }
    } catch (error) {
      console.error('Error checking proximity:', error);
    }
  };

  const sendNotification = async (
    reminder: Reminder,
    matchedLocation: Partial<LocationData> | null = null
  ) => {
    try {
      let locationText = reminder.location.name;

      // If chain mode and we have a specific matched location, include address
      if (reminder.location.isChain && matchedLocation) {
        locationText = `${matchedLocation.name}${matchedLocation.address ? ` (${matchedLocation.address})` : ''}`;
      } else if (matchedLocation && matchedLocation.name) {
        // Multi-location mode: show which specific location was matched
        locationText = `${matchedLocation.name}${matchedLocation.address ? ` (${matchedLocation.address})` : ''}`;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Forget Me Not!',
          body: `${reminder.text} at ${locationText}`,
          data: { reminderId: reminder.id },
          sound: true,
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const toggleReminder = (id: string) => {
    setReminders(prevReminders =>
      prevReminders.map((reminder) =>
        reminder.id === id
          ? {
              ...reminder,
              completed: !reminder.completed,
              completedAt: !reminder.completed ? new Date().toISOString() : null,
            }
          : reminder
      )
    );
  };

  const deleteReminder = (id: string) => {
    setReminders(prevReminders => prevReminders.filter((reminder) => reminder.id !== id));
  };

  const updateReminder = (id: string, updates: Partial<Reminder>) => {
    setReminders(prevReminders =>
      prevReminders.map((reminder) =>
        reminder.id === id
          ? { ...reminder, ...updates }
          : reminder
      )
    );
  };

  const getActiveReminders = () => {
    return reminders.filter((reminder) => !reminder.completed);
  };

  const getCompletedReminders = () => {
    return reminders.filter((reminder) => reminder.completed);
  };

  const getRemindersByLocation = (locationName: string) => {
    return reminders.filter(
      (reminder) =>
        reminder.location.name.toLowerCase().includes(locationName.toLowerCase())
    );
  };

  // Helper to get count info for UI
  const getReminderUsage = () => {
    const active = reminders.filter(r => !r.completed).length;
    const limit = isPremium ? Infinity : FREE_TIER_LIMITS.MAX_REMINDERS;
    const remaining = isPremium ? Infinity : Math.max(0, limit - active);
    return { active, limit, remaining, isPremium };
  };

  // Check if user can add more reminders
  const canAddReminder = () => {
    const active = reminders.filter(r => !r.completed).length;
    return isPremium || active < FREE_TIER_LIMITS.MAX_REMINDERS;
  };

  return (
    <ReminderContext.Provider
      value={{
        reminders,
        addReminder,
        toggleReminder,
        deleteReminder,
        updateReminder,
        getActiveReminders,
        getCompletedReminders,
        getRemindersByLocation,
        checkProximity,
        locationPermission,
        notificationPermission,
        // Subscription-related
        isPremium,
        getReminderUsage,
        canAddReminder,
      }}
    >
      {children}
    </ReminderContext.Provider>
  );
};

// Helper function to calculate distance (same as in provider)
// Background task that runs independently of React context
TaskManager.defineTask<{ locations: Location.LocationObject[] }>(
  LOCATION_TASK_NAME,
  async ({ data, error }) => {
  if (error) {
    console.error('Location task error:', error);
    return;
  }

  if (!data || !data.locations || data.locations.length === 0) {
    return;
  }

  const { locations } = data;
  const currentLocation = locations[0].coords;

  try {
    // Load reminders directly from AsyncStorage (not from React context)
    const savedReminders = await AsyncStorage.getItem('reminders');
    if (!savedReminders) {
      return;
    }

    const reminders = parseStoredReminders(savedReminders);
    const activeReminders = reminders.filter((r) => !r.completed);

    if (activeReminders.length === 0) {
      return;
    }

    const now = Date.now();
    // id -> new lastTriggeredAt for reminders that fired this pass.
    const triggerUpdates = new Map<string, string>();

    for (const reminder of activeReminders) {
      // Throttled reminders can't fire regardless of proximity — skip them
      // BEFORE the chain check below, which costs a billable Places request.
      if (!canTrigger(reminder.lastTriggeredAt, now)) {
        continue;
      }

      let shouldTrigger = false;
      let matchedLocation: Partial<LocationData> | null = null;

      // Chain mode: Check for nearby chain locations
      if (reminder.location.isChain) {
        try {
          const chainMatch = await checkChainProximity(
            currentLocation.latitude,
            currentLocation.longitude,
            reminder.location.name,
            5000,
            reminder.location.radius
          );
          if (chainMatch) {
            shouldTrigger = true;
            matchedLocation = chainMatch;
          }
        } catch (chainError) {
          console.error('Chain proximity check failed:', chainError);
        }
      } else {
        // Regular mode: Check distance to all locations in the array
        const locationsToCheck = reminder.location.locations || [{
          latitude: reminder.location.latitude,
          longitude: reminder.location.longitude,
          name: reminder.location.name,
          address: reminder.location.address,
        }];

        for (const loc of locationsToCheck) {
          if (isWithinRadius(currentLocation, loc, reminder.location.radius)) {
            shouldTrigger = true;
            matchedLocation = loc;
            break;
          }
        }
      }

      if (shouldTrigger) {
        triggerUpdates.set(reminder.id, new Date().toISOString());

        // Send notification
        let locationText = reminder.location.name;
        if (matchedLocation && matchedLocation.name) {
          // Chain / multi-location: show which specific location matched.
          locationText = `${matchedLocation.name}${matchedLocation.address ? ` (${matchedLocation.address})` : ''}`;
        }

        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Forget Me Not!',
            body: `${reminder.text} at ${locationText}`,
            data: { reminderId: reminder.id },
            sound: true,
          },
          trigger: null,
        });
      }
    }

    // Persist the new trigger timestamps. The chain checks above can await the
    // network for seconds, during which the user may have added, edited, or
    // deleted reminders — writing back our stale copy would resurrect deleted
    // reminders and drop edits. Re-read storage and merge only the trigger
    // metadata into the fresh array instead.
    if (triggerUpdates.size > 0) {
      const freshRaw = await AsyncStorage.getItem('reminders');
      const fresh = parseStoredReminders(freshRaw);
      const merged = fresh.map((r) =>
        triggerUpdates.has(r.id)
          ? {
              ...r,
              triggeredCount: (r.triggeredCount || 0) + 1,
              lastTriggeredAt: triggerUpdates.get(r.id)!,
            }
          : r
      );
      await AsyncStorage.setItem('reminders', JSON.stringify(merged));
    }
  } catch (taskError) {
    console.error('Background location task error:', taskError);
  }
  }
);

export const useReminders = () => {
  const context = useContext(ReminderContext);
  if (!context) {
    throw new Error('useReminders must be used within a ReminderProvider');
  }
  return context;
};
