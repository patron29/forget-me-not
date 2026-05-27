import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../utils/ThemeContext';
import type { RootStackScreenProps } from '../navigation';

export default function PrivacyScreen({ navigation }: RootStackScreenProps<'Privacy'>) {
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
        <Text className="text-xl font-bold ml-2" style={{ color: colors.text }}>Privacy Policy</Text>
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
          Your privacy is important to us. This Privacy Policy explains how Forget Me Not ("the App", "we", "us", or "our") collects, uses, and protects your information.
        </Text>

        <Text className="text-lg font-bold mt-4 mb-2" style={{ color: colors.text }}>
          1. Information We Collect
        </Text>

        <Text className="text-base font-semibold mt-2 mb-1" style={{ color: colors.text }}>
          Location Data
        </Text>
        <Text className="text-base leading-6 mb-4" style={{ color: colors.text }}>
          The App collects your device's location data to provide location-based reminders. This includes:{'\n'}
          {'\n'}- GPS coordinates when you create location-based reminders
          {'\n'}- Background location data to trigger notifications when you approach saved locations
          {'\n'}- Location accuracy and timestamp information
        </Text>

        <Text className="text-base font-semibold mt-2 mb-1" style={{ color: colors.text }}>
          Reminder Data
        </Text>
        <Text className="text-base leading-6 mb-4" style={{ color: colors.text }}>
          We store the reminders you create, including:{'\n'}
          {'\n'}- Reminder text and descriptions
          {'\n'}- Associated location names and addresses
          {'\n'}- Creation and completion timestamps
          {'\n'}- Notification trigger history
        </Text>

        <Text className="text-base font-semibold mt-2 mb-1" style={{ color: colors.text }}>
          Subscription Information
        </Text>
        <Text className="text-base leading-6 mb-4" style={{ color: colors.text }}>
          If you subscribe to Premium, we receive subscription status information from Apple App Store or Google Play Store. We do not have access to your payment details.
        </Text>

        <Text className="text-base font-semibold mt-2 mb-1" style={{ color: colors.text }}>
          Device Information
        </Text>
        <Text className="text-base leading-6 mb-4" style={{ color: colors.text }}>
          We may collect basic device information for app functionality and troubleshooting, including device type, operating system version, and app version.
        </Text>

        <Text className="text-lg font-bold mt-4 mb-2" style={{ color: colors.text }}>
          2. How We Use Your Information
        </Text>
        <Text className="text-base leading-6 mb-4" style={{ color: colors.text }}>
          We use your information to:{'\n'}
          {'\n'}- Provide location-based reminder notifications
          {'\n'}- Store and sync your reminders
          {'\n'}- Manage your subscription status
          {'\n'}- Improve the App's functionality and user experience
          {'\n'}- Troubleshoot technical issues
          {'\n'}- Comply with legal obligations
        </Text>

        <Text className="text-lg font-bold mt-4 mb-2" style={{ color: colors.text }}>
          3. Data Storage and Security
        </Text>
        <Text className="text-base leading-6 mb-4" style={{ color: colors.text }}>
          Your reminder data is stored locally on your device using secure storage mechanisms. Subscription status may be cached locally for offline access.{'\n'}
          {'\n'}We implement appropriate technical and organizational measures to protect your data against unauthorized access, alteration, disclosure, or destruction.
        </Text>

        <Text className="text-lg font-bold mt-4 mb-2" style={{ color: colors.text }}>
          4. Data Sharing
        </Text>
        <Text className="text-base leading-6 mb-4" style={{ color: colors.text }}>
          We do not sell your personal data. We may share data with:{'\n'}
          {'\n'}- Service providers: We use RevenueCat to manage subscriptions. Their privacy policy governs their handling of data.
          {'\n'}- Google Places API: For location search and business information. Google's privacy policy applies.
          {'\n'}- Legal requirements: When required by law or to protect our rights.
        </Text>

        <Text className="text-lg font-bold mt-4 mb-2" style={{ color: colors.text }}>
          5. Your Rights and Choices
        </Text>
        <Text className="text-base leading-6 mb-4" style={{ color: colors.text }}>
          You have the right to:{'\n'}
          {'\n'}- Access: View your stored reminders within the App
          {'\n'}- Delete: Remove individual reminders or all your data
          {'\n'}- Location Control: Disable location services in your device settings (note: this will prevent the App from functioning)
          {'\n'}- Notifications: Control notification permissions in your device settings
          {'\n'}- Cancel Subscription: Cancel your Premium subscription at any time
        </Text>

        <Text className="text-lg font-bold mt-4 mb-2" style={{ color: colors.text }}>
          6. Data Retention
        </Text>
        <Text className="text-base leading-6 mb-4" style={{ color: colors.text }}>
          Your reminder data is stored locally on your device and persists until you delete it or uninstall the App. Completed reminders are kept in your history until you choose to clear them.{'\n'}
          {'\n'}Subscription status information is retained as long as you have an active subscription or as required for billing purposes.
        </Text>

        <Text className="text-lg font-bold mt-4 mb-2" style={{ color: colors.text }}>
          7. Children's Privacy
        </Text>
        <Text className="text-base leading-6 mb-4" style={{ color: colors.text }}>
          The App is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us.
        </Text>

        <Text className="text-lg font-bold mt-4 mb-2" style={{ color: colors.text }}>
          8. International Users
        </Text>
        <Text className="text-base leading-6 mb-4" style={{ color: colors.text }}>
          If you are accessing the App from outside the United States, please be aware that your information may be transferred to, stored, and processed in the United States where our servers are located.
        </Text>

        <Text className="text-lg font-bold mt-4 mb-2" style={{ color: colors.text }}>
          9. California Privacy Rights
        </Text>
        <Text className="text-base leading-6 mb-4" style={{ color: colors.text }}>
          If you are a California resident, you have specific rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information we collect, delete your personal information, and opt-out of the sale of personal information (which we do not do).
        </Text>

        <Text className="text-lg font-bold mt-4 mb-2" style={{ color: colors.text }}>
          10. European Users (GDPR)
        </Text>
        <Text className="text-base leading-6 mb-4" style={{ color: colors.text }}>
          If you are in the European Economic Area, you have additional rights under GDPR, including:{'\n'}
          {'\n'}- Right to access your personal data
          {'\n'}- Right to rectification of inaccurate data
          {'\n'}- Right to erasure ("right to be forgotten")
          {'\n'}- Right to restrict processing
          {'\n'}- Right to data portability
          {'\n'}- Right to object to processing{'\n'}
          {'\n'}The legal basis for processing your data is your consent (for location services) and contract performance (for providing the App's services).
        </Text>

        <Text className="text-lg font-bold mt-4 mb-2" style={{ color: colors.text }}>
          11. Changes to This Policy
        </Text>
        <Text className="text-base leading-6 mb-4" style={{ color: colors.text }}>
          We may update this Privacy Policy from time to time. We will notify you of any material changes by updating the "Last updated" date and, where appropriate, through in-app notifications.
        </Text>

        <Text className="text-lg font-bold mt-4 mb-2" style={{ color: colors.text }}>
          12. Contact Us
        </Text>
        <Text className="text-base leading-6 mb-4" style={{ color: colors.text }}>
          If you have any questions about this Privacy Policy or our data practices, please contact us at:{'\n'}
          {'\n'}Email: privacy@forgetmenot.app{'\n'}
          {'\n'}For GDPR-related inquiries, you may also contact our Data Protection Officer at: dpo@forgetmenot.app
        </Text>

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
