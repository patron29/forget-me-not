import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';

const LOCATION_TASK_NAME = 'background-location-task';
const ReminderContext = createContext();

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const ReminderProvider = ({ children }) => {
  const [reminders, setReminders] = useState([]);
  const [locationPermission, setLocationPermission] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isGeofencingActive, setIsGeofencingActive] = useState(false);

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

  const addReminder = async (text, location) => {
    const newReminder = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text,
      location: {
        name: location.name,
        address: location.address || '',
        latitude: location.latitude,
        longitude: location.longitude,
        radius: location.radius || 200, // Default 200 meters
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

  const checkProximity = async (currentLocation) => {
    try {
      const activeReminders = reminders.filter(r => !r.completed);
      const remindersToUpdate = [];

      for (const reminder of activeReminders) {
        const distance = calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          reminder.location.latitude,
          reminder.location.longitude
        );

        // If within radius, check if we should trigger
        if (distance <= reminder.location.radius) {
          // Throttle: Only trigger if not triggered in last 15 minutes
          const now = Date.now();
          const lastTriggered = reminder.lastTriggeredAt ? new Date(reminder.lastTriggeredAt).getTime() : 0;
          const fifteenMinutes = 15 * 60 * 1000;

          if (now - lastTriggered >= fifteenMinutes) {
            await sendNotification(reminder);
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

  const sendNotification = async (reminder) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Forget Me Not!',
          body: `${reminder.text} at ${reminder.location.name}`,
          data: { reminderId: reminder.id },
          sound: true,
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
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

  const toggleReminder = (id) => {
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

  const deleteReminder = (id) => {
    setReminders(prevReminders => prevReminders.filter((reminder) => reminder.id !== id));
  };

  const getActiveReminders = () => {
    return reminders.filter((reminder) => !reminder.completed);
  };

  const getCompletedReminders = () => {
    return reminders.filter((reminder) => reminder.completed);
  };

  const getRemindersByLocation = (locationName) => {
    return reminders.filter(
      (reminder) =>
        reminder.location.name.toLowerCase().includes(locationName.toLowerCase())
    );
  };

  return (
    <ReminderContext.Provider
      value={{
        reminders,
        addReminder,
        toggleReminder,
        deleteReminder,
        getActiveReminders,
        getCompletedReminders,
        getRemindersByLocation,
        checkProximity,
        locationPermission,
      }}
    >
      {children}
    </ReminderContext.Provider>
  );
};

// Define background task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Location task error:', error);
    return;
  }
  if (data) {
    const { locations } = data;
    const location = locations[0];

    // Note: This is a simplified version. In production, you'd need to
    // access the reminder context differently in the background task
    console.log('Background location:', location);
  }
});

export const useReminders = () => {
  const context = useContext(ReminderContext);
  if (!context) {
    throw new Error('useReminders must be used within a ReminderProvider');
  }
  return context;
};
