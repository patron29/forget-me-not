import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TodoContext = createContext();

export const TodoProvider = ({ children }) => {
  const [todos, setTodos] = useState([]);

  // Load todos from storage on app start
  useEffect(() => {
    loadTodos();
  }, []);

  // Save todos to storage whenever they change
  useEffect(() => {
    if (todos.length > 0 || todos.length === 0) {
      saveTodos();
    }
  }, [todos]);

  const loadTodos = async () => {
    try {
      const savedTodos = await AsyncStorage.getItem('todos');
      if (savedTodos) {
        setTodos(JSON.parse(savedTodos));
      }
    } catch (error) {
      console.error('Error loading todos:', error);
    }
  };

  const saveTodos = async () => {
    try {
      await AsyncStorage.setItem('todos', JSON.stringify(todos));
    } catch (error) {
      console.error('Error saving todos:', error);
    }
  };

  const addTodo = (text, dueDate = null) => {
    const newTodo = {
      id: Date.now().toString(),
      text,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    };
    setTodos([newTodo, ...todos]);
  };

  const toggleTodo = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              completed: !todo.completed,
              completedAt: !todo.completed ? new Date().toISOString() : null,
            }
          : todo
      )
    );
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const getActiveTodos = () => {
    return todos.filter((todo) => !todo.completed);
  };

  const getCompletedTodos = () => {
    return todos.filter((todo) => todo.completed);
  };

  const getTodosByDate = (date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return todos.filter((todo) => {
      const createdDate = new Date(todo.createdAt);
      return createdDate >= startOfDay && createdDate <= endOfDay;
    });
  };

  return (
    <TodoContext.Provider
      value={{
        todos,
        addTodo,
        toggleTodo,
        deleteTodo,
        getActiveTodos,
        getCompletedTodos,
        getTodosByDate,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};

export const useTodos = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodos must be used within a TodoProvider');
  }
  return context;
};
