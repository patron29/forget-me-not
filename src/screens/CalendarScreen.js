import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useTodos } from '../utils/TodoContext';
import TodoItem from '../components/TodoItem';

export default function CalendarScreen() {
  const { todos, toggleTodo, deleteTodo } = useTodos();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Get marked dates for the calendar
  const getMarkedDates = () => {
    const marked = {};

    todos.forEach((todo) => {
      // Mark due dates
      if (todo.dueDate) {
        const dateKey = new Date(todo.dueDate).toISOString().split('T')[0];
        if (!marked[dateKey]) {
          marked[dateKey] = { dots: [] };
        }
        marked[dateKey].dots.push({
          color: todo.completed ? '#4CD964' : '#007AFF',
        });
      }

      // Mark creation dates
      const createdDateKey = new Date(todo.createdAt).toISOString().split('T')[0];
      if (!marked[createdDateKey]) {
        marked[createdDateKey] = { dots: [] };
      }
      if (!marked[createdDateKey].dots.some(dot => dot.color === '#FFA500')) {
        marked[createdDateKey].dots.push({ color: '#FFA500', key: 'created' });
      }
    });

    // Add selection indicator
    marked[selectedDate] = {
      ...marked[selectedDate],
      selected: true,
      selectedColor: '#007AFF',
    };

    return marked;
  };

  // Get todos for selected date
  const getTodosForDate = () => {
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    const nextDay = new Date(selected);
    nextDay.setDate(nextDay.getDate() + 1);

    return todos.filter((todo) => {
      // Check if created on this date
      const createdDate = new Date(todo.createdAt);
      createdDate.setHours(0, 0, 0, 0);

      // Check if due on this date
      let dueDate = null;
      if (todo.dueDate) {
        dueDate = new Date(todo.dueDate);
        dueDate.setHours(0, 0, 0, 0);
      }

      return (
        createdDate.getTime() === selected.getTime() ||
        (dueDate && dueDate.getTime() === selected.getTime())
      );
    });
  };

  const todosForDate = getTodosForDate();

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  return (
    <View style={styles.container}>
      <Calendar
        current={selectedDate}
        onDayPress={handleDayPress}
        markedDates={getMarkedDates()}
        markingType="multi-dot"
        theme={{
          todayTextColor: '#007AFF',
          selectedDayBackgroundColor: '#007AFF',
          selectedDayTextColor: '#ffffff',
          arrowColor: '#007AFF',
          monthTextColor: '#000',
          textMonthFontWeight: 'bold',
          textDayFontSize: 16,
          textMonthFontSize: 18,
        }}
      />

      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#007AFF' }]} />
          <Text style={styles.legendText}>Due Date</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#4CD964' }]} />
          <Text style={styles.legendText}>Completed</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FFA500' }]} />
          <Text style={styles.legendText}>Created</Text>
        </View>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listHeaderText}>
          {new Date(selectedDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{todosForDate.length}</Text>
        </View>
      </View>

      <FlatList
        data={todosForDate}
        renderItem={({ item }) => (
          <TodoItem
            todo={item}
            onToggle={() => toggleTodo(item.id)}
            onDelete={() => deleteTodo(item.id)}
            showDate
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No tasks for this date</Text>
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
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  listHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  countBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  countText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
  },
});
