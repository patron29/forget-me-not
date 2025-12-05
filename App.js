import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import TodoListScreen from './src/screens/TodoListScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import { TodoProvider } from './src/utils/TodoContext';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <TodoProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === 'My Tasks') {
                iconName = focused ? 'list' : 'list-outline';
              } else if (route.name === 'History') {
                iconName = focused ? 'time' : 'time-outline';
              } else if (route.name === 'Calendar') {
                iconName = focused ? 'calendar' : 'calendar-outline';
              }
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#007AFF',
            tabBarInactiveTintColor: 'gray',
            headerStyle: {
              backgroundColor: '#007AFF',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          })}
        >
          <Tab.Screen name="My Tasks" component={TodoListScreen} />
          <Tab.Screen name="History" component={HistoryScreen} />
          <Tab.Screen name="Calendar" component={CalendarScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </TodoProvider>
  );
}
