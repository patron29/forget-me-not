import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
} from 'react-native-purchases';
import type { SubscriptionStatus } from '../types';

interface PurchaseResult {
  success: boolean;
  restored?: boolean;
  cancelled?: boolean;
  error?: unknown;
}

// RevenueCat API Keys - Replace with your actual keys from RevenueCat dashboard
const REVENUECAT_API_KEY_IOS = 'your_ios_api_key_here';
const REVENUECAT_API_KEY_ANDROID = 'your_android_api_key_here';

// Product identifiers
export const PRODUCT_IDS = {
  MONTHLY: 'premium_monthly',
  YEARLY: 'premium_yearly',
};

// Entitlement identifier
const ENTITLEMENT_ID = 'premium';

// Storage key
const SUBSCRIPTION_STORAGE_KEY = 'subscription-status';

// Free tier limits
export const FREE_TIER_LIMITS = {
  MAX_REMINDERS: 5,
  CHAIN_MODE: false,
  MULTI_LOCATION: false,
};

export interface SubscriptionContextValue {
  isPremium: boolean;
  subscriptionStatus: SubscriptionStatus;
  offerings: PurchasesOffering | null;
  isLoading: boolean;
  customerInfo: CustomerInfo | null;
  checkSubscription: () => Promise<CustomerInfo | null>;
  purchasePackage: (pkg: PurchasesPackage) => Promise<PurchaseResult>;
  restorePurchases: () => Promise<PurchaseResult>;
  canAddReminder: (currentActiveCount: number) => boolean;
  canUseChainMode: () => boolean;
  canUseMultiLocation: () => boolean;
  getRemainingReminders: (currentActiveCount: number) => number;
  FREE_TIER_LIMITS: typeof FREE_TIER_LIMITS;
}

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(
  undefined
);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionStatus>('free');
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  useEffect(() => {
    initializePurchases();
  }, []);

  const initializePurchases = async () => {
    try {
      // Load cached subscription status first for instant UI
      await loadCachedSubscription();

      // Configure RevenueCat
      const apiKey = Platform.OS === 'ios' ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;

      // Only configure if we have real API keys
      if (apiKey && !apiKey.includes('your_')) {
        await Purchases.configure({ apiKey });

        // Add listener for subscription changes
        Purchases.addCustomerInfoUpdateListener((info) => {
          handleCustomerInfoUpdate(info);
        });

        // Check current subscription status
        await checkSubscription();

        // Load offerings
        await loadOfferings();
      } else {
        console.log('[Subscription] Running in demo mode - no RevenueCat API keys configured');
      }
    } catch (error) {
      console.error('[Subscription] Error initializing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCachedSubscription = async () => {
    try {
      const cached = await AsyncStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
      if (cached) {
        const { isPremium: cachedPremium, status } = JSON.parse(cached);
        setIsPremium(cachedPremium);
        setSubscriptionStatus(status);
      }
    } catch (error) {
      console.error('[Subscription] Error loading cached status:', error);
    }
  };

  const cacheSubscriptionStatus = async (
    premium: boolean,
    status: SubscriptionStatus
  ) => {
    try {
      await AsyncStorage.setItem(
        SUBSCRIPTION_STORAGE_KEY,
        JSON.stringify({ isPremium: premium, status })
      );
    } catch (error) {
      console.error('[Subscription] Error caching status:', error);
    }
  };

  const handleCustomerInfoUpdate = (info: CustomerInfo) => {
    const premium = info.entitlements.active[ENTITLEMENT_ID] !== undefined;
    setIsPremium(premium);
    setCustomerInfo(info);

    // Determine subscription type
    let status: SubscriptionStatus = 'free';
    if (premium) {
      const entitlement = info.entitlements.active[ENTITLEMENT_ID];
      if (entitlement?.productIdentifier?.includes('yearly')) {
        status = 'yearly';
      } else {
        status = 'monthly';
      }
    }
    setSubscriptionStatus(status);
    cacheSubscriptionStatus(premium, status);
  };

  const checkSubscription = async () => {
    try {
      const info = await Purchases.getCustomerInfo();
      handleCustomerInfoUpdate(info);
      return info;
    } catch (error) {
      console.error('[Subscription] Error checking subscription:', error);
      return null;
    }
  };

  const loadOfferings = async () => {
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current) {
        setOfferings(offerings.current);
      }
    } catch (error) {
      console.error('[Subscription] Error loading offerings:', error);
    }
  };

  const purchasePackage = async (
    packageToPurchase: PurchasesPackage
  ): Promise<PurchaseResult> => {
    try {
      setIsLoading(true);
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      handleCustomerInfoUpdate(customerInfo);
      return { success: true };
    } catch (error) {
      const err = error as { userCancelled?: boolean; message?: string };
      if (!err.userCancelled) {
        console.error('[Subscription] Purchase error:', error);
        Alert.alert('Purchase Failed', err.message || 'Unable to complete purchase. Please try again.');
        return { success: false, error };
      }
      return { success: false, cancelled: true };
    } finally {
      setIsLoading(false);
    }
  };

  const restorePurchases = async (): Promise<PurchaseResult> => {
    try {
      setIsLoading(true);
      const info = await Purchases.restorePurchases();
      handleCustomerInfoUpdate(info);

      const restored = info.entitlements.active[ENTITLEMENT_ID] !== undefined;
      if (restored) {
        Alert.alert('Success', 'Your purchases have been restored!');
      } else {
        Alert.alert('No Purchases Found', 'No previous purchases were found for this account.');
      }
      return { success: true, restored };
    } catch (error) {
      console.error('[Subscription] Restore error:', error);
      Alert.alert('Restore Failed', 'Unable to restore purchases. Please try again.');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user can add more reminders
  const canAddReminder = (currentActiveCount: number) => {
    if (isPremium) return true;
    return currentActiveCount < FREE_TIER_LIMITS.MAX_REMINDERS;
  };

  // Check if user can use chain mode
  const canUseChainMode = () => {
    return isPremium || FREE_TIER_LIMITS.CHAIN_MODE;
  };

  // Check if user can add multiple locations
  const canUseMultiLocation = () => {
    return isPremium || FREE_TIER_LIMITS.MULTI_LOCATION;
  };

  // Get remaining reminders for free users
  const getRemainingReminders = (currentActiveCount: number) => {
    if (isPremium) return Infinity;
    return Math.max(0, FREE_TIER_LIMITS.MAX_REMINDERS - currentActiveCount);
  };

  const value: SubscriptionContextValue = {
    // State
    isPremium,
    subscriptionStatus,
    offerings,
    isLoading,
    customerInfo,

    // Actions
    checkSubscription,
    purchasePackage,
    restorePurchases,

    // Feature checks
    canAddReminder,
    canUseChainMode,
    canUseMultiLocation,
    getRemainingReminders,

    // Constants
    FREE_TIER_LIMITS,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

export default SubscriptionContext;
