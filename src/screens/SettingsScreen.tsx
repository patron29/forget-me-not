import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSubscription } from '../utils/SubscriptionContext';
import { useTheme } from '../utils/ThemeContext';
import { ProBadge } from '../components/PremiumBadge';
import Constants from 'expo-constants';
import type { ComponentProps, ReactNode } from 'react';
import type { ThemeMode } from '../types';

// SettingsScreen lives in the bottom-tab navigator under `Main`, but it
// navigates to root-stack routes (Terms/Privacy/Paywall). Those route names
// all exist on the root param list, so the loosely-composed navigation prop is
// fine here; we keep it typed via the root stack props.
type IoniconName = ComponentProps<typeof Ionicons>['name'];

export default function SettingsScreen({ navigation }: { navigation: any }) {
  // TODO: type with navigation param list (tab + parent stack composite)
  const insets = useSafeAreaInsets();
  const {
    isPremium,
    subscriptionStatus,
    restorePurchases,
    isLoading,
  } = useSubscription();
  const { themeMode, setTheme, isDark, colors, elevation } = useTheme();

  const appVersion = Constants.expoConfig?.version || '1.0.0';

  const getThemeLabel = (): string => {
    switch (themeMode) {
      case 'light': return 'Light';
      case 'dark': return 'Dark';
      default: return 'System';
    }
  };

  const cycleTheme = () => {
    const modes: ThemeMode[] = ['system', 'light', 'dark'];
    const currentIndex = modes.indexOf(themeMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setTheme(modes[nextIndex]);
  };

  const handleManageSubscription = () => {
    // Open platform-specific subscription management
    if (Platform.OS === 'ios') {
      Linking.openURL('https://apps.apple.com/account/subscriptions');
    } else {
      Linking.openURL('https://play.google.com/store/account/subscriptions');
    }
  };

  const handleRestore = async () => {
    await restorePurchases();
  };

  const openTerms = () => {
    navigation.navigate('Terms');
  };

  const openPrivacy = () => {
    navigation.navigate('Privacy');
  };

  const openSupport = () => {
    Linking.openURL('mailto:support@forgetmenot.app'); // Replace with your support email
  };

  const SettingsRow = ({
    icon,
    title,
    subtitle,
    onPress,
    rightElement,
    showChevron = true,
  }: {
    icon: IoniconName;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: ReactNode;
    showChevron?: boolean;
  }) => (
    <TouchableOpacity
      className="flex-row items-center py-4 px-4"
      style={{ backgroundColor: colors.surface }}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View
        className="w-10 h-10 rounded-full justify-center items-center mr-3"
        style={{ backgroundColor: colors.surfaceGray }}
      >
        <Ionicons name={icon} size={20} color={colors.textSecondary} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-medium" style={{ color: colors.text }}>{title}</Text>
        {subtitle && (
          <Text className="text-sm mt-0.5" style={{ color: colors.textSecondary }}>{subtitle}</Text>
        )}
      </View>
      {rightElement}
      {showChevron && onPress && (
        <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
      )}
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text
      className="text-sm font-semibold uppercase tracking-wide px-4 pt-6 pb-2"
      style={{ color: colors.textSecondary }}
    >
      {title}
    </Text>
  );

  return (
    <View className="flex-1" style={{ backgroundColor: colors.surfaceGray }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Subscription Card */}
        <View className="mx-4 mt-4 rounded-2xl overflow-hidden">
          {isPremium ? (
            <View
              className="p-5"
              style={{
                backgroundColor: colors.premiumBackground,
                borderWidth: 1,
                borderColor: colors.premiumGold,
              }}
            >
              <View className="flex-row items-center mb-3">
                <View
                  className="w-12 h-12 rounded-full justify-center items-center mr-3"
                  style={{ backgroundColor: colors.premiumGold }}
                >
                  <Ionicons name="star" size={24} color="#000" />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-lg font-bold" style={{ color: colors.text }}>Premium</Text>
                    <ProBadge />
                  </View>
                  <Text className="text-sm" style={{ color: colors.textSecondary }}>
                    {subscriptionStatus === 'yearly' ? 'Yearly Plan' : 'Monthly Plan'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                className="py-3 rounded-xl items-center"
                style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
                onPress={handleManageSubscription}
              >
                <Text className="text-base font-semibold" style={{ color: colors.text }}>
                  Manage Subscription
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              className="p-5"
              style={{ backgroundColor: colors.primaryLight }}
              onPress={() => navigation.navigate('Paywall')}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center mb-3">
                <View
                  className="w-12 h-12 rounded-full justify-center items-center mr-3"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Ionicons name="star" size={24} color="#FFF" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold" style={{ color: colors.text }}>
                    Upgrade to Premium
                  </Text>
                  <Text className="text-sm" style={{ color: colors.textSecondary }}>
                    Unlock unlimited reminders & more
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={colors.primary} />
              </View>
              <View className="flex-row gap-4">
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                  <Text className="text-sm ml-1" style={{ color: colors.text }}>Unlimited</Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                  <Text className="text-sm ml-1" style={{ color: colors.text }}>Chain Mode</Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                  <Text className="text-sm ml-1" style={{ color: colors.text }}>Multi-Location</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Appearance Section */}
        <SectionHeader title="Appearance" />
        <View className="mx-4 rounded-xl overflow-hidden" style={{ borderWidth: 1, borderColor: colors.borderLight }}>
          <SettingsRow
            icon={isDark ? "moon" : "sunny"}
            title="Theme"
            subtitle={`Currently: ${getThemeLabel()}`}
            onPress={cycleTheme}
            rightElement={
              <View
                className="px-3 py-1.5 rounded-full mr-2"
                style={{ backgroundColor: colors.surfaceGray }}
              >
                <Text className="text-sm font-medium" style={{ color: colors.primary }}>
                  {getThemeLabel()}
                </Text>
              </View>
            }
            showChevron={false}
          />
        </View>

        {/* Account Section */}
        <SectionHeader title="Account" />
        <View className="mx-4 rounded-xl overflow-hidden" style={{ borderWidth: 1, borderColor: colors.borderLight }}>
          <SettingsRow
            icon="refresh"
            title="Restore Purchases"
            subtitle="Restore previous subscriptions"
            onPress={handleRestore}
            showChevron={false}
          />
        </View>

        {/* Support Section */}
        <SectionHeader title="Support" />
        <View className="mx-4 rounded-xl overflow-hidden" style={{ borderWidth: 1, borderColor: colors.borderLight }}>
          <SettingsRow
            icon="mail-outline"
            title="Contact Support"
            subtitle="Get help with the app"
            onPress={openSupport}
          />
          <View className="h-px ml-16" style={{ backgroundColor: colors.border }} />
          <SettingsRow
            icon="star-outline"
            title="Rate the App"
            subtitle="Love Forget Me Not? Leave a review!"
            onPress={() => {
              // Replace with your app store URLs
              if (Platform.OS === 'ios') {
                Linking.openURL('https://apps.apple.com/app/id123456789');
              } else {
                Linking.openURL('https://play.google.com/store/apps/details?id=com.forgetmenot.app');
              }
            }}
          />
        </View>

        {/* Legal Section */}
        <SectionHeader title="Legal" />
        <View className="mx-4 rounded-xl overflow-hidden" style={{ borderWidth: 1, borderColor: colors.borderLight }}>
          <SettingsRow
            icon="document-text-outline"
            title="Terms of Service"
            onPress={openTerms}
          />
          <View className="h-px ml-16" style={{ backgroundColor: colors.border }} />
          <SettingsRow
            icon="shield-checkmark-outline"
            title="Privacy Policy"
            onPress={openPrivacy}
          />
        </View>

        {/* App Info */}
        <View className="items-center mt-8 mb-4">
          <Text className="text-sm" style={{ color: colors.textMuted }}>
            Forget Me Not v{appVersion}
          </Text>
          <Text className="text-xs mt-1" style={{ color: colors.textMuted }}>
            Made with ❤️ for forgetful people
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
