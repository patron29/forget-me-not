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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTodos } from '../utils/TodoContext';
import VoiceInput from '../components/VoiceInput';
import TodoItem from '../components/TodoItem';

export default function TodoListScreen() {
  const { addTodo, getActiveTodos, toggleTodo, deleteTodo } = useTodos();
  const [inputText, setInputText] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const activeTodos = getActiveTodos();

  const handleAddTodo = () => {
    if (inputText.trim()) {
      addTodo(inputText.trim(), selectedDate);
      setInputText('');
      setSelectedDate(null);
    }
  };

  const handleVoiceInput = (text) => {
    setInputText(text);
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.container}>
        <FlatList
          data={activeTodos}
          renderItem={({ item }) => (
            <TodoItem
              todo={item}
              onToggle={() => toggleTodo(item.id)}
              onDelete={() => deleteTodo(item.id)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="checkmark-circle-outline" size={80} color="#ccc" />
              <Text style={styles.emptyText}>No tasks yet!</Text>
              <Text style={styles.emptySubtext}>Add a task using voice or text below</Text>
            </View>
          }
        />

        <View style={styles.inputContainer}>
          {selectedDate && (
            <View style={styles.dateChip}>
              <Ionicons name="calendar" size={16} color="#007AFF" />
              <Text style={styles.dateChipText}>
                {selectedDate.toLocaleDateString()}
              </Text>
              <TouchableOpacity onPress={() => setSelectedDate(null)}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputRow}>
            <VoiceInput onVoiceResult={handleVoiceInput} />

            <TextInput
              style={styles.input}
              placeholder="Add a new task..."
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleAddTodo}
              returnKeyType="done"
            />

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons
                name="calendar-outline"
                size={24}
                color={selectedDate ? '#007AFF' : '#999'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.addButton, !inputText.trim() && styles.addButtonDisabled]}
              onPress={handleAddTodo}
              disabled={!inputText.trim()}
            >
              <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
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
  },
  inputContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
    alignSelf: 'flex-start',
    gap: 6,
  },
  dateChipText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
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
  },
  dateButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#e0e0e0',
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
});
