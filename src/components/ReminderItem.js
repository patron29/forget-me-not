import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Animated,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useTheme } from '../utils/ThemeContext';

export default function ReminderItem({
  reminder,
  onToggle,
  onDelete,
  onEdit,
  showCompletedDate = false,
  showDate = false,
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const { colors, isDark } = useTheme();

  if (!reminder || !reminder.location) {
    console.error('ReminderItem: Invalid reminder data', reminder);
    return null;
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderGrant: () => {
        Animated.spring(scale, {
          toValue: 0.98,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
        }).start();

        if (gestureState.dx < -100) {
          Animated.timing(translateX, {
            toValue: -150,
            duration: 200,
            useNativeDriver: true,
          }).start();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            tension: 45,
            friction: 8,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleDelete = () => {
    Alert.alert(
      'Delete Reminder',
      'Are you sure you want to delete this reminder?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            Animated.spring(translateX, {
              toValue: 0,
              tension: 45,
              friction: 8,
              useNativeDriver: true,
            }).start();
          },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Animated.timing(scale, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }).start(() => onDelete());
          },
        },
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

  const handleTap = () => {
    Animated.spring(translateX, {
      toValue: 0,
      tension: 45,
      friction: 8,
      useNativeDriver: true,
    }).start();

    const options = [
      { text: 'Cancel', style: 'cancel' },
    ];

    if (onEdit && !reminder.completed) {
      options.push({
        text: 'Edit',
        onPress: () => onEdit(reminder),
      });
    }

    options.push({
      text: reminder.completed ? 'Mark as Active' : 'Mark as Complete',
      onPress: onToggle,
    });

    options.push({
      text: 'Delete',
      style: 'destructive',
      onPress: () => {
        Animated.timing(scale, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => onDelete());
      },
    });

    Alert.alert(
      reminder.text,
      reminder.location.name + (reminder.location.isChain ? ' (Any location)' : ''),
      options
    );
  };

  const handleEdit = () => {
    Animated.spring(translateX, {
      toValue: 0,
      tension: 45,
      friction: 8,
      useNativeDriver: true,
    }).start();

    if (onEdit) {
      onEdit(reminder);
    }
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
    <View className="mb-4 relative">
      {/* Swipe Actions */}
      <View className="absolute right-0 top-0 bottom-0 flex-row items-center gap-2 pr-4">
        {onEdit && !reminder.completed && (
          <TouchableOpacity
            className="w-11 h-11 rounded-full justify-center items-center"
            style={{ backgroundColor: colors.primary }}
            onPress={handleEdit}
            activeOpacity={0.8}
          >
            <Ionicons name="pencil-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          className="w-11 h-11 rounded-full justify-center items-center"
          style={{ backgroundColor: colors.success }}
          onPress={onToggle}
          activeOpacity={0.8}
        >
          <Ionicons name={reminder.completed ? "refresh-outline" : "checkmark"} size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          className="w-11 h-11 rounded-full justify-center items-center"
          style={{ backgroundColor: colors.danger }}
          onPress={handleDelete}
          activeOpacity={0.8}
        >
          <Ionicons name="trash-outline" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <Animated.View
        {...panResponder.panHandlers}
        className="overflow-hidden"
        style={[
          { transform: [{ translateX }, { scale }], borderRadius: 24 },
          reminder.completed && { opacity: 0.6 },
        ]}
      >
        <View
          className="flex-row p-6"
          style={{ backgroundColor: reminder.completed ? colors.surfaceGray : colors.pastelGreen }}
        >
          {/* Checkbox */}
          <TouchableOpacity
            className="mr-4 pt-0.5"
            onPress={onToggle}
            activeOpacity={0.7}
          >
            <View
              className="w-6 h-6 rounded-full border-2 justify-center items-center"
              style={{
                backgroundColor: reminder.completed ? colors.primary : 'transparent',
                borderColor: reminder.completed ? colors.primary : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'),
              }}
            >
              {reminder.completed && (
                <Ionicons name="checkmark" size={16} color={isDark ? colors.background : '#1A1A1A'} />
              )}
            </View>
          </TouchableOpacity>

          {/* Content - Tappable for options */}
          <TouchableOpacity
            className="flex-1 gap-1"
            onPress={handleTap}
            activeOpacity={0.7}
          >
            <Text
              className="text-base font-semibold leading-6 tracking-tight"
              style={{
                color: reminder.completed ? colors.textMuted : colors.text,
                textDecorationLine: reminder.completed ? 'line-through' : 'none',
              }}
              numberOfLines={2}
            >
              {reminder.text}
            </Text>

            {/* Location Badge */}
            <View className="flex-row items-center gap-2 flex-wrap">
              <View
                className="flex-row items-center gap-1 px-2 py-1 rounded-md"
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }}
              >
                <Ionicons
                  name={reminder.location.isChain ? 'business-outline' : 'location-outline'}
                  size={14}
                  color={colors.text}
                />
                <Text
                  className="text-sm font-semibold max-w-[180px]"
                  style={{ color: colors.text }}
                  numberOfLines={1}
                >
                  {reminder.location.name}
                  {reminder.location.isChain && ' (Any)'}
                </Text>
              </View>

              {/* Multiple locations indicator */}
              {reminder.location.locations && reminder.location.locations.length > 1 && (
                <View
                  className="px-2 py-0.5 rounded-md"
                  style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }}
                >
                  <Text className="text-xs font-semibold" style={{ color: colors.text, opacity: 0.8 }}>
                    +{reminder.location.locations.length - 1} more
                  </Text>
                </View>
              )}

              {reminder.triggeredCount > 0 && (
                <View className="flex-row items-center gap-1">
                  <View className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.primary }} />
                  <Text className="text-xs font-semibold" style={{ color: colors.text, opacity: 0.7 }}>
                    {reminder.triggeredCount}x
                  </Text>
                </View>
              )}
            </View>

            {/* Address */}
            {reminder.location.address && !reminder.location.isChain && (
              <Text className="text-sm font-medium" style={{ color: colors.textSecondary }} numberOfLines={1}>
                {reminder.location.address}
              </Text>
            )}

            {/* Completed Date */}
            {showCompletedDate && reminder.completedAt && (
              <Text className="text-xs font-semibold" style={{ color: colors.success }}>
                Completed {formatDate(reminder.completedAt)}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}
