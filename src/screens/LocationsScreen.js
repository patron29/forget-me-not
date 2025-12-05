import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SectionList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useReminders } from '../utils/ReminderContext';
import ReminderItem from '../components/ReminderItem';

export default function LocationsScreen() {
  const { reminders, toggleReminder, deleteReminder } = useReminders();

  // Group reminders by location
  const getLocationGroups = () => {
    const locationMap = new Map();

    reminders.forEach((reminder) => {
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

      const group = locationMap.get(locationName);
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

  const LocationHeader = ({ location, activeCount, completedCount }) => (
    <View style={styles.locationHeader}>
      <View style={styles.locationHeaderLeft}>
        <View style={styles.locationIconContainer}>
          <Ionicons name="location" size={24} color="#007AFF" />
        </View>
        <View style={styles.locationInfo}>
          <Text style={styles.locationName}>{location.name}</Text>
          {location.address && (
            <Text style={styles.locationAddress} numberOfLines={1}>
              {location.address}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.locationStats}>
        {activeCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{activeCount}</Text>
          </View>
        )}
        {completedCount > 0 && (
          <View style={[styles.badge, styles.badgeCompleted]}>
            <Text style={[styles.badgeText, styles.badgeTextCompleted]}>
              {completedCount}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderLocationGroup = ({ item }) => (
    <View style={styles.groupContainer}>
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
    <View style={styles.container}>
      {locationGroups.length > 0 && (
        <View style={styles.summaryBar}>
          <View style={styles.summaryItem}>
            <Ionicons name="location-outline" size={20} color="#007AFF" />
            <Text style={styles.summaryText}>
              {locationGroups.length} {locationGroups.length === 1 ? 'Location' : 'Locations'}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons name="notifications-outline" size={20} color="#4CD964" />
            <Text style={styles.summaryText}>{reminders.length} Total</Text>
          </View>
        </View>
      )}

      <FlatList
        data={locationGroups}
        renderItem={renderLocationGroup}
        keyExtractor={(item) => item.locationName}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="map-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>No locations yet</Text>
            <Text style={styles.emptySubtext}>
              Add reminders to see them grouped by location
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    justifyContent: 'space-around',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  groupContainer: {
    marginBottom: 24,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  locationHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  locationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 13,
    color: '#666',
  },
  locationStats: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    minWidth: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  badgeCompleted: {
    backgroundColor: '#e8f5e9',
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  badgeTextCompleted: {
    color: '#4CD964',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#ccc',
    marginTop: 8,
    textAlign: 'center',
  },
});
