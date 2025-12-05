import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTodos } from '../utils/TodoContext';
import TodoItem from '../components/TodoItem';

export default function HistoryScreen() {
  const { getCompletedTodos, toggleTodo, deleteTodo, todos } = useTodos();
  const [filter, setFilter] = useState('all'); // 'all', 'today', 'week', 'month'

  const completedTodos = getCompletedTodos();

  const getFilteredTodos = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return completedTodos.filter((todo) => {
      const completedDate = new Date(todo.completedAt);

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

  const filteredTodos = getFilteredTodos();

  const handleClearAll = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to delete all completed tasks?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            completedTodos.forEach((todo) => deleteTodo(todo.id));
          },
        },
      ]
    );
  };

  const FilterButton = ({ label, value }) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === value && styles.filterButtonActive]}
      onPress={() => setFilter(value)}
    >
      <Text style={[styles.filterText, filter === value && styles.filterTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.filterContainer}>
          <FilterButton label="All" value="all" />
          <FilterButton label="Today" value="today" />
          <FilterButton label="Week" value="week" />
          <FilterButton label="Month" value="month" />
        </View>

        {completedTodos.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{completedTodos.length}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{filteredTodos.length}</Text>
          <Text style={styles.statLabel}>
            {filter === 'all' ? 'Total' : filter === 'today' ? 'Today' : `This ${filter}`}
          </Text>
        </View>
      </View>

      <FlatList
        data={filteredTodos}
        renderItem={({ item }) => (
          <TodoItem
            todo={item}
            onToggle={() => toggleTodo(item.id)}
            onDelete={() => deleteTodo(item.id)}
            showCompletedDate
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-done-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>No completed tasks</Text>
            <Text style={styles.emptySubtext}>
              {filter === 'all'
                ? 'Complete tasks to see them here'
                : `No tasks completed ${filter === 'today' ? 'today' : `in the last ${filter}`}`}
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
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  clearButtonText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 40,
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
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
