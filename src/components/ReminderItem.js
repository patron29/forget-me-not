import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';

export default function ReminderItem({
  reminder,
  onToggle,
  onDelete,
  showCompletedDate = false,
  showDate = false,
}) {
  // Safety check
  if (!reminder || !reminder.location) {
    console.error('ReminderItem: Invalid reminder data', reminder);
    return null;
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Reminder',
      'Are you sure you want to delete this reminder?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  const handleSpeak = () => {
    const textToSpeak = `${reminder.text} at ${reminder.location.name}`;
    Speech.speak(textToSpeak, {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.9,
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={[styles.container, reminder.completed && styles.completedContainer]}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <Ionicons
          name={reminder.completed ? 'checkmark-circle' : 'ellipse-outline'}
          size={28}
          color={reminder.completed ? '#4CD964' : '#007AFF'}
        />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text
          style={[
            styles.text,
            reminder.completed && styles.completedText,
          ]}
          numberOfLines={3}
        >
          {reminder.text}
        </Text>

        <View style={styles.metaContainer}>
          <View style={styles.locationBadge}>
            <Ionicons name="location" size={14} color="#007AFF" />
            <Text style={styles.locationText} numberOfLines={1}>
              {reminder.location.name}
            </Text>
          </View>

          {reminder.location.address && (
            <Text style={styles.addressText} numberOfLines={1}>
              {reminder.location.address}
            </Text>
          )}

          {reminder.triggeredCount > 0 && (
            <View style={styles.triggerBadge}>
              <Ionicons name="notifications" size={12} color="#FF9500" />
              <Text style={styles.triggerText}>
                Triggered {reminder.triggeredCount}x
              </Text>
            </View>
          )}

          {showCompletedDate && reminder.completedAt && (
            <Text style={styles.dateText}>
              Completed {formatDate(reminder.completedAt)}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleSpeak}
          activeOpacity={0.7}
        >
          <Ionicons name="volume-medium-outline" size={22} color="#007AFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleDelete}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={22} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completedContainer: {
    opacity: 0.6,
  },
  checkbox: {
    marginRight: 12,
  },
  content: {
    flex: 1,
    gap: 8,
  },
  text: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    fontWeight: '500',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  metaContainer: {
    gap: 6,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  locationText: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '600',
    maxWidth: 180,
  },
  addressText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  triggerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  triggerText: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '500',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 8,
  },
  actionButton: {
    padding: 8,
  },
});
