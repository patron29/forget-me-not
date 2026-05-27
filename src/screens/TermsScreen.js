import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../utils/ThemeContext';

export default function TermsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <View
        className="flex-row items-center px-4 py-3 border-b"
        style={{ paddingTop: insets.top + 10, backgroundColor: colors.background, borderBottomColor: colors.border }}
      >
        <TouchableOpacity
          className="p-2 -ml-2"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text className="text-xl font-bold ml-2" style={{ color: colors.text }}>Terms of Service</Text>
      </View>

      <ScrollView
        className="flex-1 px-6 py-6"
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-sm mb-4" style={{ color: colors.textSecondary }}>
          Last updated: January 6, 2025
        </Text>

        <Text className="text-base leading-6 mb-4" style={{ color: colors.text }}>
          Welcome to Forget Me Not. By using our application, you agree to be bound by these Terms of Service. Please read them carefully.
        </Text>

        <Text className="text-lg font-bold mt-4 mb-2" style={{ color: colors.text }}>
          1. Acceptance of Terms
        </Text>
        <Text className="text-base leading-6 mb-4" style={{ color: colors.text }}>
          By downloading, installing, or using Forget Me Not ("the App"), you agree to these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use the App.
        </Text>

        <Text className="text-lg font-bold mt-4 mb-2" style={{ color: colors.text }}>
          2. Description of Service
        </Text>
        <Text className="text-base leading-6 mb-4" style={{ color: colors.text }}>
          Forget Me Not is a location-based reminder application that sends notifications when you arrive at or near specified locations. The App uses your device's location services to provide this functionality.
        </Text>

        <Text className="text-lg font-bold mt-4 mb-2" style={{ color: colors.text }}>
          3. User Accounts and Subscriptions
        </Text>
        <Text className="text-base leading-6 mb-4" style={{ color: colors.text }}>
          The App offers both free and premium subscription tiers. Free users are limited to 5 active reminders with basic features. Premium subscribers have access to unlimited reminders, chain/franchise mode, and multiple locations per reminder.
        </Text>
        <Text className="text-base leading-6 mb-4" style={{ color: colors.text }}>
          Premium subscriptions are billed monthly ($2.99/month) or annually ($19.99/year) through your App Store or Google Play account. Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current billing period.
        </Text>

        <Text className="text-lg font-bold mt-4 mb-2" style={{ color: colors.text }}>
          4. Subscription Cancellation and Refunds
        </Text>
        <Text className="text-base leading-6 mb-4" style={{ color: colors.text }}>
          You may cancel your subscription at any time through your App Store or Google Play account settings. Cancellation will take effect at the end of the current billing period. We do not provide refunds for partial subscription periods, except as required by applicable law.
        </Text>

        <Text className="text-lg font-bold mt-4 mb-2" style={{ color: colors.text }}>
          5. Location Services
        </Text>
        <Text className="text-base leading-6 mb-4" style={{ color: colors.text }}>
          The App requires access to your device's location services to function. You acknowledge that:{'\n'}
          {'\n'}- Location accuracy depends on your device and environmental factors
          {'\n'}- Background location access is needed for timely notifications
          {'\n'}- Location data is processed as described in our Privacy Policy
          {'\n'}- You can disable location services at any time, but this will prevent the App from functioning properly
        </Text>

        <Text className="text-lg font-bold mt-4 mb-2" style={{ color: colors.text }}>
          6. User Responsibilities
        </Text>
        <Text className="text-base leading-6 mb-4" style={{ color: colors.text }}>
          You agree to:{'\n'}
          {'\n'}- Use the App only for lawful purposes
          {'\n'}- Not attempt to circumvent subscription restrictions
          {'\n'}- Not reverse engineer or modify the App
          {'\n'}- Provide accurate information when required
          {'\n'}- Keep your device secure
        </Text>

        <Text className="text-lg font-bold mt-4 mb-2" style={{ color: colors.text }}>
          7. Intellectual Property
        </Text>
        <Text className="text-base leading-6 mb-4" style={{ color: colors.text }}>
          The App, including its design, features, and content, is protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works without our express written permission.
        </Text>

        <Text className="text-lg font-bold mt-4 mb-2" style={{ color: colors.text }}>
          8. Disclaimer of Warranties
        </Text>
        <Text className="text-base leading-6 mb-4" style={{ color: colors.text }}>
          THE APP IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT GUARANTEE THAT THE APP WILL BE UNINTERRUPTED, ERROR-FREE, OR COMPLETELY SECURE. LOCATION-BASED NOTIFICATIONS MAY BE DELAYED OR MISSED DUE TO FACTORS BEYOND OUR CONTROL.
        </Text>

        <Text className="text-lg font-bold mt-4 mb-2" style={{ color: colors.text }}>
          9. Limitation of Liability
        </Text>
        <Text className="text-base leading-6 mb-4" style={{ color: colors.text }}>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE APP, INCLUDING BUT NOT LIMITED TO MISSED REMINDERS OR NOTIFICATIONS.
        </Text>

        <Text className="text-lg font-bold mt-4 mb-2" style={{ color: colors.text }}>
          10. Changes to Terms
        </Text>
        <Text className="text-base leading-6 mb-4" style={{ color: colors.text }}>
          We reserve the right to modify these Terms at any time. We will notify you of significant changes through the App or via email. Your continued use of the App after such modifications constitutes acceptance of the updated Terms.
        </Text>

        <Text className="text-lg font-bold mt-4 mb-2" style={{ color: colors.text }}>
          11. Termination
        </Text>
        <Text className="text-base leading-6 mb-4" style={{ color: colors.text }}>
          We may terminate or suspend your access to the App at any time, without prior notice, for conduct that we believe violates these Terms or is harmful to other users or us.
        </Text>

        <Text className="text-lg font-bold mt-4 mb-2" style={{ color: colors.text }}>
          12. Governing Law
        </Text>
        <Text className="text-base leading-6 mb-4" style={{ color: colors.text }}>
          These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to conflict of law principles.
        </Text>

        <Text className="text-lg font-bold mt-4 mb-2" style={{ color: colors.text }}>
          13. Contact Us
        </Text>
        <Text className="text-base leading-6 mb-4" style={{ color: colors.text }}>
          If you have any questions about these Terms, please contact us at:{'\n'}
          {'\n'}Email: support@forgetmenot.app
        </Text>

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
