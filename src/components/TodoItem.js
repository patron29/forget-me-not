import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';

export default function TodoItem({
  todo,
  onToggle,
  onDelete,
  showCompletedDate = false,
  showDate = false,
}) {
  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  const handleSpeak = () => {
    Speech.speak(todo.text, {
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

  const formatDueDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(date);
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: 'Overdue', color: '#FF3B30' };
    } else if (diffDays === 0) {
      return { text: 'Today', color: '#FF9500' };
    } else if (diffDays === 1) {
      return { text: 'Tomorrow', color: '#007AFF' };
    } else if (diffDays <= 7) {
      return { text: `${diffDays} days`, color: '#007AFF' };
    } else {
      return {
        text: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        color: '#666',
      };
    }
  };

  const dueInfo = todo.dueDate && !todo.completed ? formatDueDate(todo.dueDate) : null;

  return (
    <View style={[styles.container, todo.completed && styles.completedContainer]}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <Ionicons
          name={todo.completed ? 'checkmark-circle' : 'ellipse-outline'}
          size={28}
          color={todo.completed ? '#4CD964' : '#007AFF'}
        />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text
          style={[
            styles.text,
            todo.completed && styles.completedText,
          ]}
          numberOfLines={3}
        >
          {todo.text}
        </Text>

        <View style={styles.metaContainer}>
          {dueInfo && (
            <View style={[styles.dueBadge, { backgroundColor: `${dueInfo.color}15` }]}>
              <Ionicons name="calendar-outline" size={12} color={dueInfo.color} />
              <Text style={[styles.dueText, { color: dueInfo.color }]}>
                {dueInfo.text}
              </Text>
            </View>
          )}

          {showCompletedDate && todo.completedAt && (
            <Text style={styles.dateText}>
              Completed {formatDate(todo.completedAt)}
            </Text>
          )}

          {showDate && (
            <Text style={styles.dateText}>
              Created {formatDate(todo.createdAt)}
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
    gap: 6,
  },
  text: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  dueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dueText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
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
