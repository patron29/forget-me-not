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

  useEffect(() => {
    loadReminders();
    requestPermissions();
  }, []);

  useEffect(() => {
    if (reminders.length > 0 || reminders.length === 0) {
      saveReminders();
    }
  }, [reminders]);

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
    } catch (error) {
      console.error('Error loading reminders:', error);
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
      id: Date.now().toString(),
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
    };

    setReminders([newReminder, ...reminders]);

    // Set up geofencing for this location
    await setupGeofencing(newReminder);

    return newReminder;
  };

  const setupGeofencing = async (reminder) => {
    try {
      if (locationPermission !== 'full') {
        console.log('Background location permission not granted');
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
    } catch (error) {
      console.error('Error setting up geofencing:', error);
    }
  };

  const checkProximity = async (currentLocation) => {
    try {
      const activeReminders = reminders.filter(r => !r.completed);

      for (const reminder of activeReminders) {
        const distance = calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          reminder.location.latitude,
          reminder.location.longitude
        );

        // If within radius, trigger notification
        if (distance <= reminder.location.radius) {
          await sendNotification(reminder);

          // Increment trigger count
          setReminders(prevReminders =>
            prevReminders.map(r =>
              r.id === reminder.id
                ? { ...r, triggeredCount: r.triggeredCount + 1 }
                : r
            )
          );
        }
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
    setReminders(
      reminders.map((reminder) =>
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
    setReminders(reminders.filter((reminder) => reminder.id !== id));
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
