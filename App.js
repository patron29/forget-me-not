import "./global.css";
import React from 'react';
import { View, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ReminderListScreen from './src/screens/ReminderListScreen';
import ReminderHistoryScreen from './src/screens/ReminderHistoryScreen';
import LocationsScreen from './src/screens/LocationsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import PaywallScreen from './src/screens/PaywallScreen';
import TermsScreen from './src/screens/TermsScreen';
import PrivacyScreen from './src/screens/PrivacyScreen';
import { ReminderProvider } from './src/utils/ReminderContext';
import { SubscriptionProvider } from './src/utils/SubscriptionContext';
import { ThemeProvider, useTheme } from './src/utils/ThemeContext';
import ErrorBoundary from './src/components/ErrorBoundary';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  const { colors } = useTheme();

  return (
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
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          if (focused) {
            return (
              <View style={{
                backgroundColor: colors.primary,
                padding: 8,
                borderRadius: 12,
              }}>
                <Ionicons name={iconName} size={size} color="#FFFFFF" />
              </View>
            );
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopWidth: 1,
          borderTopColor: colors.tabBarBorder,
          elevation: 0,
          height: 80,
          paddingBottom: 12,
          paddingTop: 10,
        },
        headerStyle: {
          backgroundColor: colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTintColor: colors.text,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen
        name="Reminders"
        component={ReminderListScreen}
        options={{
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="History"
        component={ReminderHistoryScreen}
        options={{
          headerTitle: 'Completed',
        }}
      />
      <Tab.Screen
        name="Locations"
        component={LocationsScreen}
        options={{
          headerTitle: 'My Places',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerTitle: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
}

function AppContent() {
  const { isDark, colors } = useTheme();

  return (
    <>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <NavigationContainer
        theme={{
          dark: isDark,
          colors: {
            primary: colors.primary,
            background: colors.background,
            card: colors.surface,
            text: colors.text,
            border: colors.border,
            notification: colors.primary,
          },
          fonts: {
            regular: {
              fontFamily: 'System',
              fontWeight: '400',
            },
            medium: {
              fontFamily: 'System',
              fontWeight: '500',
            },
            bold: {
              fontFamily: 'System',
              fontWeight: '700',
            },
            heavy: {
              fontFamily: 'System',
              fontWeight: '900',
            },
          },
        }}
      >
        <Stack.Navigator>
          <Stack.Screen
            name="Main"
            component={TabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Paywall"
            component={PaywallScreen}
            options={{
              headerShown: false,
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="Terms"
            component={TermsScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Privacy"
            component={PrivacyScreen}
            options={{
              headerShown: false,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <SubscriptionProvider>
            <ReminderProvider>
              <AppContent />
            </ReminderProvider>
          </SubscriptionProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
