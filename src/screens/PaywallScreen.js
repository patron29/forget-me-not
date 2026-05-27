import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSubscription, PRODUCT_IDS } from '../utils/SubscriptionContext';
import { useTheme } from '../utils/ThemeContext';
import { PremiumFeatureRow } from '../components/PremiumBadge';

export default function PaywallScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const {
    offerings,
    purchasePackage,
    restorePurchases,
    isLoading,
    isPremium,
  } = useSubscription();

  const [selectedPlan, setSelectedPlan] = useState('yearly');

  const monthlyPackage = offerings?.availablePackages?.find(
    (pkg) => pkg.product?.identifier === PRODUCT_IDS.MONTHLY
  );
  const yearlyPackage = offerings?.availablePackages?.find(
    (pkg) => pkg.product?.identifier === PRODUCT_IDS.YEARLY
  );

  // Fallback prices if offerings not loaded
  const monthlyPrice = monthlyPackage?.product?.priceString || '$2.99';
  const yearlyPrice = yearlyPackage?.product?.priceString || '$19.99';
  const yearlyMonthlyPrice = '$1.67'; // $19.99 / 12

  const handlePurchase = async () => {
    const packageToPurchase = selectedPlan === 'yearly' ? yearlyPackage : monthlyPackage;

    if (!packageToPurchase) {
      // Demo mode (no RevenueCat offering configured). Use the RN Alert API —
      // the web `alert()` global is undefined on native and would throw.
      Alert.alert(
        'Demo Mode',
        'In production, this would initiate the purchase flow.'
      );
      return;
    }

    const result = await purchasePackage(packageToPurchase);
    if (result.success) {
      navigation.goBack();
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

  if (isPremium) {
    return (
      <View className="flex-1 justify-center items-center p-6" style={{ backgroundColor: colors.background }}>
        <View
          className="w-20 h-20 rounded-full justify-center items-center mb-4"
          style={{ backgroundColor: colors.premiumGold }}
        >
          <Ionicons name="star" size={40} color="#000" />
        </View>
        <Text className="text-2xl font-bold mb-2" style={{ color: colors.text }}>You're Premium!</Text>
        <Text className="text-base text-center mb-6" style={{ color: colors.textSecondary }}>
          You have access to all premium features.
        </Text>
        <TouchableOpacity
          className="px-8 py-4 rounded-xl"
          style={{ backgroundColor: colors.primary }}
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white text-base font-semibold">Continue</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          className="items-center px-6 pb-6"
          style={{ paddingTop: insets.top + 20 }}
        >
          <TouchableOpacity
            className="absolute right-4 p-2"
            style={{ top: insets.top + 10 }}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={28} color={colors.text} />
          </TouchableOpacity>

          <View
            className="w-20 h-20 rounded-full justify-center items-center mb-4"
            style={{ backgroundColor: colors.premiumGold }}
          >
            <Ionicons name="star" size={40} color="#000" />
          </View>
          <Text className="text-3xl font-bold text-center" style={{ color: colors.text }}>
            Upgrade to Premium
          </Text>
          <Text className="text-base text-center mt-2" style={{ color: colors.textSecondary }}>
            Unlock the full power of Forget Me Not
          </Text>
        </View>

        {/* Features */}
        <View className="px-6 mb-6">
          <PremiumFeatureRow
            icon="infinite"
            title="Unlimited Reminders"
            description="Create as many reminders as you need"
          />
          <PremiumFeatureRow
            icon="business"
            title="Chain Mode"
            description="Get reminded at any location of a business"
          />
          <PremiumFeatureRow
            icon="location"
            title="Multiple Locations"
            description="Add multiple addresses per reminder"
          />
          <PremiumFeatureRow
            icon="notifications"
            title="Priority Support"
            description="Get help when you need it"
          />
        </View>

        {/* Pricing Cards */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-bold mb-4" style={{ color: colors.text }}>Choose Your Plan</Text>

          {/* Yearly Plan */}
          <TouchableOpacity
            className="rounded-2xl p-4 mb-3"
            style={{
              backgroundColor: selectedPlan === 'yearly' ? colors.primaryLight : colors.surfaceGray,
              borderWidth: 2,
              borderColor: selectedPlan === 'yearly' ? colors.primary : colors.border,
            }}
            onPress={() => setSelectedPlan('yearly')}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View
                  className="w-6 h-6 rounded-full border-2 mr-3 justify-center items-center"
                  style={{
                    borderColor: selectedPlan === 'yearly' ? colors.primary : colors.textLight,
                    backgroundColor: selectedPlan === 'yearly' ? colors.primary : 'transparent',
                  }}
                >
                  {selectedPlan === 'yearly' && (
                    <Ionicons name="checkmark" size={16} color="#FFF" />
                  )}
                </View>
                <View>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-lg font-bold" style={{ color: colors.text }}>Yearly</Text>
                    <View
                      className="px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: colors.success }}
                    >
                      <Text className="text-xs font-bold text-white">SAVE 44%</Text>
                    </View>
                  </View>
                  <Text className="text-sm" style={{ color: colors.textSecondary }}>
                    {yearlyMonthlyPrice}/month, billed annually
                  </Text>
                </View>
              </View>
              <Text className="text-xl font-bold" style={{ color: colors.primary }}>{yearlyPrice}</Text>
            </View>
          </TouchableOpacity>

          {/* Monthly Plan */}
          <TouchableOpacity
            className="rounded-2xl p-4"
            style={{
              backgroundColor: selectedPlan === 'monthly' ? colors.primaryLight : colors.surfaceGray,
              borderWidth: 2,
              borderColor: selectedPlan === 'monthly' ? colors.primary : colors.border,
            }}
            onPress={() => setSelectedPlan('monthly')}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View
                  className="w-6 h-6 rounded-full border-2 mr-3 justify-center items-center"
                  style={{
                    borderColor: selectedPlan === 'monthly' ? colors.primary : colors.textLight,
                    backgroundColor: selectedPlan === 'monthly' ? colors.primary : 'transparent',
                  }}
                >
                  {selectedPlan === 'monthly' && (
                    <Ionicons name="checkmark" size={16} color="#FFF" />
                  )}
                </View>
                <View>
                  <Text className="text-lg font-bold" style={{ color: colors.text }}>Monthly</Text>
                  <Text className="text-sm" style={{ color: colors.textSecondary }}>Billed monthly</Text>
                </View>
              </View>
              <Text className="text-xl font-bold" style={{ color: colors.text }}>{monthlyPrice}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Restore */}
        <TouchableOpacity
          className="items-center py-3"
          onPress={handleRestore}
          disabled={isLoading}
        >
          <Text className="text-base font-medium" style={{ color: colors.primary }}>
            Restore Purchases
          </Text>
        </TouchableOpacity>

        {/* Legal */}
        <View className="flex-row justify-center gap-4 px-6 mt-4">
          <TouchableOpacity onPress={openTerms}>
            <Text className="text-sm" style={{ color: colors.textMuted }}>Terms of Service</Text>
          </TouchableOpacity>
          <Text style={{ color: colors.textMuted }}>•</Text>
          <TouchableOpacity onPress={openPrivacy}>
            <Text className="text-sm" style={{ color: colors.textMuted }}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Purchase Button */}
      <View
        className="absolute bottom-0 left-0 right-0 border-t px-6 pt-4"
        style={{ backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: insets.bottom + 16 }}
      >
        <TouchableOpacity
          className="py-4 rounded-xl items-center"
          style={{ backgroundColor: colors.primary }}
          onPress={handlePurchase}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text className="text-white text-lg font-bold">
              Subscribe Now
            </Text>
          )}
        </TouchableOpacity>
        <Text className="text-xs text-center mt-3" style={{ color: colors.textMuted }}>
          Cancel anytime. Subscription renews automatically.
        </Text>
      </View>
    </View>
  );
}
