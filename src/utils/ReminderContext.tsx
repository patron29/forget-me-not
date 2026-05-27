import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { checkChainProximity } from '../services/placesService';
import { useSubscription, FREE_TIER_LIMITS } from './SubscriptionContext';
import type { Reminder, LocationData, ReminderActionError } from '../types';

const LOCATION_TASK_NAME = 'background-location-task';

type LocationPermissionState = 'full' | 'foreground' | 'denied' | null;

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
  const [isLoaded, setIsLoaded] = useState(false);
  const [isGeofencingActive, setIsGeofencingActive] = useState(false);

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

  useEffect(() => {
    // Only save after initial load is complete
    if (isLoaded) {
      saveReminders();
    }
  }, [reminders, isLoaded]);

  const requestPermissions = async () => {
    try {
      // Request notification permissions
      const { status: notifStatus } = await Notifications.requestPermissionsAsync();

      // Request location permissions
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();

      if (foregroundStatus === 'granted') {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        setLocationPermission(backgroundStatus === 'granted' ? 'full' : 'foreground');
      } else {
        setLocationPermission('denied');
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  const loadReminders = async () => {
    try {
      const savedReminders = await AsyncStorage.getItem('reminders');
      if (savedReminders) {
        setReminders(JSON.parse(savedReminders));
      }
      setIsLoaded(true);
    } catch (error) {
      console.error('Error loading reminders:', error);
      setIsLoaded(true);
    }
  };

  const saveReminders = async () => {
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

  const setupGeofencing = async () => {
    try {
      if (locationPermission !== 'full') {
        console.log('Background location permission not granted');
        return;
      }

      // Only start if not already active
      if (isGeofencingActive) {
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
  };

  const checkProximity = async (currentLocation: Coords) => {
    try {
      const activeReminders = reminders.filter(r => !r.completed);
      const remindersToUpdate: string[] = [];

      for (const reminder of activeReminders) {
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
            const distance = calculateDistance(
              currentLocation.latitude,
              currentLocation.longitude,
              loc.latitude,
              loc.longitude
            );

            if (distance <= (reminder.location.radius ?? 100)) {
              shouldTrigger = true;
              matchedLocation = loc;
              break; // Found a matching location, no need to check others
            }
          }
        }

        // If within radius, check if we should trigger
        if (shouldTrigger) {
          // Throttle: Only trigger if not triggered in last 15 minutes
          const now = Date.now();
          const lastTriggered = reminder.lastTriggeredAt ? new Date(reminder.lastTriggeredAt).getTime() : 0;
          const fifteenMinutes = 15 * 60 * 1000;

          if (now - lastTriggered >= fifteenMinutes) {
            await sendNotification(reminder, matchedLocation);
            remindersToUpdate.push(reminder.id);
          }
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

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    // Haversine formula to calculate distance between two coordinates
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
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
const calculateDistanceHelper = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

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

    const reminders: Reminder[] = JSON.parse(savedReminders);
    const activeReminders = reminders.filter((r) => !r.completed);

    if (activeReminders.length === 0) {
      return;
    }

    const now = Date.now();
    const fifteenMinutes = 15 * 60 * 1000;
    let hasUpdates = false;

    for (const reminder of activeReminders) {
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
          const distance = calculateDistanceHelper(
            currentLocation.latitude,
            currentLocation.longitude,
            loc.latitude,
            loc.longitude
          );

          if (distance <= (reminder.location.radius ?? 100)) {
            shouldTrigger = true;
            matchedLocation = loc;
            break;
          }
        }
      }

      if (shouldTrigger) {
        // Throttle: Only trigger if not triggered in last 15 minutes
        const lastTriggered = reminder.lastTriggeredAt
          ? new Date(reminder.lastTriggeredAt).getTime()
          : 0;

        if (now - lastTriggered >= fifteenMinutes) {
          // Update reminder in the array
          reminder.triggeredCount = (reminder.triggeredCount || 0) + 1;
          reminder.lastTriggeredAt = new Date().toISOString();
          hasUpdates = true;

          // Send notification
          let locationText = reminder.location.name;
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
            trigger: null,
          });
        }
      }
    }

    // Save updated reminders back to AsyncStorage
    if (hasUpdates) {
      await AsyncStorage.setItem('reminders', JSON.stringify(reminders));
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
