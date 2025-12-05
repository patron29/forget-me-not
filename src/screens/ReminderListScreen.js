import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useReminders } from '../utils/ReminderContext';
import VoiceInput from '../components/VoiceInput';
import ReminderItem from '../components/ReminderItem';
import LocationPicker from '../components/LocationPicker';

export default function ReminderListScreen() {
  const { addReminder, getActiveReminders, toggleReminder, deleteReminder, locationPermission } = useReminders();
  const [inputText, setInputText] = useState('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const activeReminders = getActiveReminders();

  const handleVoiceInput = (text) => {
    setInputText(text);
  };

  const handleAddReminder = () => {
    if (!inputText.trim()) {
      Alert.alert('Error', 'Please enter a reminder');
      return;
    }

    setShowLocationPicker(true);
  };

  const handleLocationSelect = async (location) => {
    try {
      await addReminder(inputText.trim(), location);
      setInputText('');
      setShowLocationPicker(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to create reminder');
      console.error(error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.container}>
        {locationPermission === 'denied' && (
          <View style={styles.warningBanner}>
            <Ionicons name="warning" size={20} color="#FF9500" />
            <Text style={styles.warningText}>
              Location permission is required for reminders to work
            </Text>
          </View>
        )}

        <FlatList
          data={activeReminders}
          renderItem={({ item }) => (
            <ReminderItem
              reminder={item}
              onToggle={() => toggleReminder(item.id)}
              onDelete={() => deleteReminder(item.id)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="location-outline" size={80} color="#ccc" />
              <Text style={styles.emptyText}>No reminders yet!</Text>
              <Text style={styles.emptySubtext}>
                Add a reminder for a specific location
              </Text>
              <Text style={styles.exampleText}>
                Example: "Buy BPO" at CVS Pharmacy
              </Text>
            </View>
          }
        />

        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <VoiceInput onVoiceResult={handleVoiceInput} />

            <TextInput
              style={styles.input}
              placeholder="What do you need to remember?"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleAddReminder}
              returnKeyType="done"
              multiline
            />

            <TouchableOpacity
              style={[styles.addButton, !inputText.trim() && styles.addButtonDisabled]}
              onPress={handleAddReminder}
              disabled={!inputText.trim()}
            >
              <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="information-circle-outline" size={16} color="#999" />
            <Text style={styles.infoText}>
              Enter your reminder, then choose where you want to be notified
            </Text>
          </View>
        </View>

        <LocationPicker
          visible={showLocationPicker}
          onClose={() => setShowLocationPicker(false)}
          onLocationSelect={handleLocationSelect}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ffc107',
  },
  warningText: {
    flex: 1,
    color: '#856404',
    fontSize: 13,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
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
  exampleText: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 16,
    fontStyle: 'italic',
  },
  inputContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    maxHeight: 100,
  },
  addButton: {
    width: 44,
    height: 44,
    backgroundColor: '#007AFF',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#ccc',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 4,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#999',
    lineHeight: 16,
  },
});
