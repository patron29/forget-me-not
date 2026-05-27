import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  Animated,
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useReminders } from '../utils/ReminderContext';
import { useSubscription, FREE_TIER_LIMITS } from '../utils/SubscriptionContext';
import { useTheme } from '../utils/ThemeContext';
import VoiceInput from '../components/VoiceInput';
import ReminderItem from '../components/ReminderItem';
import LocationPicker from '../components/LocationPicker';
import { UpgradeBanner } from '../components/PremiumBadge';

export default function ReminderListScreen() {
  const navigation = useNavigation();
  const { reminders, addReminder, toggleReminder, deleteReminder, updateReminder, locationPermission } = useReminders();
  const { colors, isDark } = useTheme();

  // Get subscription status
  let subscriptionContext = null;
  try {
    subscriptionContext = useSubscription();
  } catch (e) {
    // Running outside SubscriptionProvider
  }
  const isPremium = subscriptionContext?.isPremium || false;

  const [inputText, setInputText] = useState('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [showEditTextModal, setShowEditTextModal] = useState(false);
  const [editText, setEditText] = useState('');
  const [editingTextReminder, setEditingTextReminder] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  const activeReminders = reminders.filter(r => !r.completed);
  const completedCount = reminders.filter(r => r.completed).length;
  const remainingReminders = isPremium ? Infinity : Math.max(0, FREE_TIER_LIMITS.MAX_REMINDERS - activeReminders.length);
  const isNearLimit = !isPremium && remainingReminders <= 2;
  const isAtLimit = !isPremium && remainingReminders === 0;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleVoiceInput = (text) => {
    setInputText(text);
  };

  const handleAddReminder = () => {
    if (!inputText.trim()) {
      Alert.alert('Error', 'Please enter a reminder');
      return;
    }

    // Check if free user is at limit
    if (isAtLimit) {
      Alert.alert(
        'Reminder Limit Reached',
        `Free accounts are limited to ${FREE_TIER_LIMITS.MAX_REMINDERS} active reminders. Complete or delete some reminders, or upgrade to Premium for unlimited!`,
        [
          { text: 'Maybe Later', style: 'cancel' },
          {
            text: 'Upgrade',
            onPress: () => navigation.navigate('Paywall'),
          },
        ]
      );
      return;
    }

    setShowLocationPicker(true);
  };

  const handleLocationSelect = async (location) => {
    try {
      if (editingReminder) {
        updateReminder(editingReminder.id, {
          text: inputText.trim(),
          location: {
            name: location.name,
            address: location.address || '',
            latitude: location.latitude,
            longitude: location.longitude,
            radius: location.radius || 100,
            isChain: location.isChain || false,
          },
        });
        setEditingReminder(null);
      } else {
        const result = await addReminder(inputText.trim(), location);

        // Check if the result indicates an error (subscription limits)
        if (result?.error) {
          if (result.error === 'UPGRADE_REQUIRED' || result.error === 'PREMIUM_FEATURE') {
            Alert.alert(
              'Premium Feature',
              result.message,
              [
                { text: 'Maybe Later', style: 'cancel' },
                {
                  text: 'Upgrade',
                  onPress: () => navigation.navigate('Paywall'),
                },
              ]
            );
            return;
          }
        }
      }
      setInputText('');
      setShowLocationPicker(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save reminder');
      console.error(error);
    }
  };

  const handleEditReminder = (reminder) => {
    Alert.alert(
      'Edit Reminder',
      'What would you like to edit?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Edit Text',
          onPress: () => {
            setEditingTextReminder(reminder);
            setEditText(reminder.text);
            setShowEditTextModal(true);
          },
        },
        {
          text: 'Edit Location',
          onPress: () => {
            setEditingReminder(reminder);
            setInputText(reminder.text);
            setShowLocationPicker(true);
          },
        },
      ]
    );
  };

  const handleSaveEditText = () => {
    if (editingTextReminder && editText.trim()) {
      updateReminder(editingTextReminder.id, { text: editText.trim() });
    }
    setShowEditTextModal(false);
    setEditingTextReminder(null);
    setEditText('');
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        {/* Header with Logo */}
        <Animated.View
          className="px-6 pb-5"
          style={{
            opacity: fadeAnim,
            paddingTop: 10,
            backgroundColor: colors.background,
          }}
        >
          <View className="flex-row items-center mb-5">
            <View
              className="rounded-2xl overflow-hidden mr-4"
              style={{
                width: 56,
                height: 56,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Image
                source={require('../../assets/logo.png')}
                style={{ width: 56, height: 56 }}
                resizeMode="cover"
              />
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold tracking-tight" style={{ color: colors.text }}>
                Forget Me Not
              </Text>
              <Text className="text-sm font-medium mt-0.5" style={{ color: colors.textMuted }}>
                Location-based reminders
              </Text>
            </View>
          </View>
          <View className="flex-row" style={{ gap: 12 }}>
            <View
              className="flex-1 rounded-2xl p-5"
              style={{
                backgroundColor: isAtLimit ? colors.dangerLight : isNearLimit ? colors.warningLight : colors.surfaceGray,
                borderWidth: 1,
                borderColor: isAtLimit ? colors.danger : isNearLimit ? colors.warning : colors.border,
              }}
            >
              <Text
                className="text-3xl font-bold mb-1"
                style={{ color: isAtLimit ? colors.danger : isNearLimit ? colors.warning : colors.text }}
              >
                {isPremium ? activeReminders.length : `${activeReminders.length}/${FREE_TIER_LIMITS.MAX_REMINDERS}`}
              </Text>
              <Text
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: isAtLimit ? colors.danger : isNearLimit ? colors.warning : colors.textMuted }}
              >
                {isPremium ? 'Active' : isAtLimit ? 'Limit Reached' : 'Active'}
              </Text>
            </View>
            <View
              className="flex-1 rounded-2xl p-5"
              style={{
                backgroundColor: colors.primaryLight,
                borderWidth: 1,
                borderColor: colors.primary,
              }}
            >
              <Text className="text-3xl font-bold mb-1" style={{ color: colors.primary }}>
                {completedCount}
              </Text>
              <Text className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary }}>
                Completed
              </Text>
            </View>
          </View>

          {/* Upgrade banner for users near limit */}
          {isNearLimit && !isAtLimit && (
            <View className="mt-4">
              <UpgradeBanner
                compact
                message={`${remainingReminders} reminder${remainingReminders === 1 ? '' : 's'} left`}
                onPress={() => navigation.navigate('Paywall')}
              />
            </View>
          )}
        </Animated.View>

        {locationPermission === 'denied' && (
          <View
            className="flex-row items-center gap-2 py-4 px-6 mx-6 mb-4 rounded-lg"
            style={{ backgroundColor: colors.warningLight, borderWidth: 1, borderColor: colors.warning }}
          >
            <Ionicons name="warning-outline" size={20} color={colors.warning} />
            <Text className="flex-1 text-sm font-medium" style={{ color: colors.warning }}>
              Location permission required for reminders
            </Text>
          </View>
        )}

        {/* Reminders List */}
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <FlatList
            data={activeReminders}
            renderItem={({ item }) => (
              <ReminderItem
                reminder={item}
                onToggle={() => toggleReminder(item.id)}
                onDelete={() => deleteReminder(item.id)}
                onEdit={handleEditReminder}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 24, flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="justify-center items-center py-8 px-6">
                <View
                  className="w-20 h-20 rounded-full justify-center items-center mb-4"
                  style={{ backgroundColor: colors.surfaceGray, borderWidth: 1, borderColor: colors.border }}
                >
                  <Ionicons name="location-outline" size={40} color={colors.textMuted} />
                </View>
                <Text className="text-xl font-bold mb-1 tracking-tight" style={{ color: colors.text }}>
                  No active reminders
                </Text>
                <Text className="text-sm text-center leading-5 mb-4" style={{ color: colors.textSecondary }}>
                  Get notified at the right place and time
                </Text>
                <View
                  className="flex-row items-center py-2 px-4 rounded-lg gap-1"
                  style={{ backgroundColor: colors.pastelPurple }}
                >
                  <View className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.primary }} />
                  <Text className="text-sm font-medium" style={{ color: colors.text }}>
                    Try: "Buy milk" at your local grocery store
                  </Text>
                </View>
              </View>
            }
          />
        </Animated.View>

        {/* Input Section */}
        <Animated.View
          className="px-6 py-6"
          style={{
            opacity: fadeAnim,
            paddingBottom: 24 + insets.bottom,
            backgroundColor: colors.background,
          }}
        >
          <View className="gap-2">
            <View className="flex-row items-center gap-2">
              <VoiceInput onVoiceResult={handleVoiceInput} />

              <View
                className="flex-1 rounded-lg min-h-[48px] justify-center"
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 2,
                  borderColor: colors.primary,
                }}
              >
                <TextInput
                  className="px-4 py-3 text-base font-medium max-h-[100px]"
                  style={{ color: colors.text }}
                  placeholder="What do you need to remember?"
                  placeholderTextColor={colors.textMuted}
                  value={inputText}
                  onChangeText={setInputText}
                  onSubmitEditing={handleAddReminder}
                  returnKeyType="done"
                  multiline
                />
              </View>

              <TouchableOpacity
                className="w-12 h-12 rounded-full justify-center items-center"
                style={{ backgroundColor: inputText.trim() ? colors.primary : colors.surfaceGray }}
                onPress={handleAddReminder}
                disabled={!inputText.trim()}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="add"
                  size={24}
                  color={inputText.trim() ? '#FFFFFF' : colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center gap-1 px-1">
              <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
              <Text className="text-sm font-medium" style={{ color: colors.textMuted }}>
                Tap + to choose a location
              </Text>
            </View>
          </View>
        </Animated.View>

        <LocationPicker
          visible={showLocationPicker}
          onClose={() => {
            setShowLocationPicker(false);
            setEditingReminder(null);
            // Keep inputText so user doesn't lose what they typed
          }}
          onLocationSelect={handleLocationSelect}
        />

        {/* Edit Text Modal */}
        <Modal
          visible={showEditTextModal}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowEditTextModal(false)}
        >
          <View className="flex-1 justify-center items-center p-6" style={{ backgroundColor: colors.overlay }}>
            <View className="rounded-lg p-6 w-full max-w-[400px]" style={{ backgroundColor: colors.surface }}>
              <Text className="text-xl font-bold mb-4" style={{ color: colors.text }}>Edit Reminder</Text>
              <TextInput
                className="rounded-lg p-4 text-base min-h-[80px]"
                style={{
                  textAlignVertical: 'top',
                  backgroundColor: colors.surfaceGray,
                  color: colors.text,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
                value={editText}
                onChangeText={setEditText}
                placeholder="Enter reminder text"
                placeholderTextColor={colors.textMuted}
                multiline
                autoFocus
              />
              <View className="flex-row justify-end gap-2 mt-6">
                <TouchableOpacity
                  className="px-6 py-3 rounded-lg"
                  style={{ backgroundColor: colors.surfaceGray }}
                  onPress={() => {
                    setShowEditTextModal(false);
                    setEditingTextReminder(null);
                    setEditText('');
                  }}
                >
                  <Text className="text-base font-semibold" style={{ color: colors.textSecondary }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="px-6 py-3 rounded-lg"
                  style={{ backgroundColor: editText.trim() ? colors.primary : colors.border }}
                  onPress={handleSaveEditText}
                  disabled={!editText.trim()}
                >
                  <Text className="text-base font-semibold" style={{ color: editText.trim() ? '#FFFFFF' : colors.textMuted }}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}
