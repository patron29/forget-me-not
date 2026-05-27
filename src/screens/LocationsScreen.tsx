import React from 'react';
import {
  View,
  Text,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useReminders } from '../utils/ReminderContext';
import { useTheme } from '../utils/ThemeContext';
import ReminderItem from '../components/ReminderItem';
import { EmptyState } from '../components/ui';
import type { Reminder, LocationData } from '../types';

interface LocationGroup {
  locationName: string;
  location: LocationData;
  reminders: Reminder[];
  activeCount: number;
  completedCount: number;
}

export default function LocationsScreen() {
  const { reminders, toggleReminder, deleteReminder } = useReminders();
  const { colors, elevation } = useTheme();

  const getLocationGroups = (): LocationGroup[] => {
    const locationMap = new Map<string, LocationGroup>();

    reminders.forEach((reminder: Reminder) => {
      const locationName = reminder.location.name;
      if (!locationMap.has(locationName)) {
        locationMap.set(locationName, {
          locationName,
          location: reminder.location,
          reminders: [],
          activeCount: 0,
          completedCount: 0,
        });
      }

      const group = locationMap.get(locationName)!;
      group.reminders.push(reminder);

      if (reminder.completed) {
        group.completedCount++;
      } else {
        group.activeCount++;
      }
    });

    return Array.from(locationMap.values()).sort((a, b) =>
      b.activeCount - a.activeCount || a.locationName.localeCompare(b.locationName)
    );
  };

  const locationGroups = getLocationGroups();

  const LocationHeader = ({
    location,
    activeCount,
    completedCount,
  }: {
    location: LocationData;
    activeCount: number;
    completedCount: number;
  }) => (
    <View
      className="flex-row items-center justify-between p-4 rounded-xl mb-3"
      style={{ backgroundColor: colors.surface, ...elevation.sm }}
    >
      <View className="flex-row items-center flex-1 gap-3">
        <View
          className="w-12 h-12 rounded-full justify-center items-center"
          style={{ backgroundColor: colors.pastelBlue }}
        >
          <Ionicons name="location" size={24} color={colors.primary} />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold mb-0.5" style={{ color: colors.text }}>{location.name}</Text>
          {location.address && (
            <Text className="text-sm" style={{ color: colors.textSecondary }} numberOfLines={1}>
              {location.address}
            </Text>
          )}
        </View>
      </View>
      <View className="flex-row gap-2">
        {activeCount > 0 && (
          <View
            className="rounded-xl min-w-[28px] h-7 justify-center items-center px-2"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-white text-sm font-bold">{activeCount}</Text>
          </View>
        )}
        {completedCount > 0 && (
          <View
            className="rounded-xl min-w-[28px] h-7 justify-center items-center px-2"
            style={{ backgroundColor: colors.pastelGreen }}
          >
            <Text className="text-sm font-bold" style={{ color: colors.success }}>{completedCount}</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderLocationGroup = ({ item }: { item: LocationGroup }) => (
    <View className="mb-6">
      <LocationHeader
        location={item.location}
        activeCount={item.activeCount}
        completedCount={item.completedCount}
      />
      {item.reminders.map((reminder) => (
        <ReminderItem
          key={reminder.id}
          reminder={reminder}
          onToggle={() => toggleReminder(reminder.id)}
          onDelete={() => deleteReminder(reminder.id)}
        />
      ))}
    </View>
  );

  return (
    <View className="flex-1" style={{ backgroundColor: colors.surfaceGray }}>
      {locationGroups.length > 0 && (
        <View
          className="flex-row py-4 px-5 border-b justify-around"
          style={{ backgroundColor: colors.surface, borderBottomColor: colors.border }}
        >
          <View className="flex-row items-center gap-2">
            <Ionicons name="location-outline" size={20} color={colors.primary} />
            <Text className="text-base font-semibold" style={{ color: colors.text }}>
              {locationGroups.length} {locationGroups.length === 1 ? 'Location' : 'Locations'}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Ionicons name="notifications-outline" size={20} color={colors.success} />
            <Text className="text-base font-semibold" style={{ color: colors.text }}>{reminders.length} Total</Text>
          </View>
        </View>
      )}

      <FlatList
        data={locationGroups}
        renderItem={renderLocationGroup}
        keyExtractor={(item) => item.locationName}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListEmptyComponent={
          <EmptyState
            icon="map-outline"
            title="No locations yet"
            message="Add reminders to see them grouped by location"
          />
        }
      />
    </View>
  );
}
