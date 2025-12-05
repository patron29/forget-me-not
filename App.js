import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import ReminderListScreen from './src/screens/ReminderListScreen';
import ReminderHistoryScreen from './src/screens/ReminderHistoryScreen';
import LocationsScreen from './src/screens/LocationsScreen';
import { ReminderProvider } from './src/utils/ReminderContext';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <ReminderProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === 'Reminders') {
                iconName = focused ? 'notifications' : 'notifications-outline';
              } else if (route.name === 'History') {
                iconName = focused ? 'time' : 'time-outline';
              } else if (route.name === 'Locations') {
                iconName = focused ? 'location' : 'location-outline';
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
          <Tab.Screen name="Reminders" component={ReminderListScreen} />
          <Tab.Screen name="History" component={ReminderHistoryScreen} />
          <Tab.Screen name="Locations" component={LocationsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </ReminderProvider>
  );
}
