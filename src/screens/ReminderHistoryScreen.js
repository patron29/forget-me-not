import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useReminders } from '../utils/ReminderContext';
import { useTheme } from '../utils/ThemeContext';
import ReminderItem from '../components/ReminderItem';

export default function ReminderHistoryScreen() {
  const { reminders, toggleReminder, deleteReminder } = useReminders();
  const { colors, isDark } = useTheme();
  const [filter, setFilter] = useState('all');

  const completedReminders = reminders.filter(r => r.completed);

  const getFilteredReminders = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return completedReminders.filter((reminder) => {
      const completedDate = new Date(reminder.completedAt);

      switch (filter) {
        case 'today':
          return completedDate >= today;
        case 'week':
          return completedDate >= weekAgo;
        case 'month':
          return completedDate >= monthAgo;
        default:
          return true;
      }
    });
  };

  const filteredReminders = getFilteredReminders();

  const handleClearAll = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to delete all completed reminders?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            completedReminders.forEach((reminder) => deleteReminder(reminder.id));
          },
        },
      ]
    );
  };

  const FilterButton = ({ label, value }) => (
    <TouchableOpacity
      className="px-4 py-2 rounded-full"
      style={{
        backgroundColor: filter === value ? colors.primary : colors.surfaceGray,
      }}
      onPress={() => setFilter(value)}
    >
      <Text
        className="text-sm font-semibold"
        style={{
          color: filter === value ? '#FFFFFF' : colors.textMuted,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <View
        className="p-6 border-b"
        style={{ backgroundColor: colors.background, borderBottomColor: colors.border }}
      >
        <View className="flex-row gap-2 mb-4">
          <FilterButton label="All" value="all" />
          <FilterButton label="Today" value="today" />
          <FilterButton label="Week" value="week" />
          <FilterButton label="Month" value="month" />
        </View>

        {completedReminders.length > 0 && (
          <TouchableOpacity
            className="flex-row items-center gap-1 self-start px-4 py-2 rounded-lg"
            style={{ backgroundColor: colors.pastelPink }}
            onPress={handleClearAll}
          >
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
            <Text className="text-sm font-semibold" style={{ color: colors.text }}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <View
        className="flex-row py-6 px-8 mx-6 my-6 rounded-lg items-center justify-center"
        style={{ backgroundColor: colors.pastelBlue }}
      >
        <View className="flex-1 items-center">
          <Text className="text-4xl font-bold" style={{ color: colors.text }}>{completedReminders.length}</Text>
          <Text className="text-sm mt-1 font-medium" style={{ color: colors.text, opacity: 0.8 }}>Completed</Text>
        </View>
        <View
          className="w-px h-10"
          style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.15)' }}
        />
        <View className="flex-1 items-center">
          <Text className="text-4xl font-bold" style={{ color: colors.text }}>{filteredReminders.length}</Text>
          <Text className="text-sm mt-1 font-medium" style={{ color: colors.text, opacity: 0.8 }}>
            {filter === 'all' ? 'Showing' : filter === 'today' ? 'Today' : `This ${filter}`}
          </Text>
        </View>
      </View>

      <FlatList
        data={filteredReminders}
        renderItem={({ item }) => (
          <ReminderItem
            reminder={item}
            onToggle={() => toggleReminder(item.id)}
            onDelete={() => deleteReminder(item.id)}
            showCompletedDate
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 24, flexGrow: 1 }}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center pt-16">
            <View
              className="w-20 h-20 rounded-full justify-center items-center mb-6"
              style={{ backgroundColor: colors.pastelPeach }}
            >
              <Ionicons name="checkmark-done-outline" size={48} color={colors.text} />
            </View>
            <Text className="text-xl font-bold" style={{ color: colors.text }}>No completed reminders</Text>
            <Text className="text-base mt-2 text-center px-8" style={{ color: colors.textSecondary }}>
              {filter === 'all'
                ? 'Complete reminders to see them here'
                : `No reminders completed ${filter === 'today' ? 'today' : `in the last ${filter}`}`}
            </Text>
          </View>
        }
      />
    </View>
  );
}
