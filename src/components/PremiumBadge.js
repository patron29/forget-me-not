import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/ThemeContext';

// PRO badge - shown next to premium features
export function ProBadge({ small = false }) {
  const { colors } = useTheme();

  return (
    <View
      className={`rounded-full justify-center items-center ${
        small ? 'px-1.5 py-0.5' : 'px-2 py-1'
      }`}
      style={{
        backgroundColor: colors.premiumGold,
      }}
    >
      <Text
        className={`font-bold text-black ${small ? 'text-[8px]' : 'text-[10px]'}`}
        style={{ letterSpacing: 0.5 }}
      >
        PRO
      </Text>
    </View>
  );
}

// Lock badge - shown on locked features for free users
export function LockBadge({ size = 16 }) {
  const { colors, isDark } = useTheme();

  return (
    <View
      className="rounded-full justify-center items-center"
      style={{
        width: size + 8,
        height: size + 8,
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      }}
    >
      <Ionicons name="lock-closed" size={size} color={colors.textSecondary} />
    </View>
  );
}

// Premium feature row - used in paywall and settings
export function PremiumFeatureRow({ icon, title, description, included = true }) {
  const { colors } = useTheme();

  return (
    <View className="flex-row items-center py-3 gap-3">
      <View
        className="w-10 h-10 rounded-full justify-center items-center"
        style={{
          backgroundColor: included ? colors.primaryLight : colors.surfaceGray,
        }}
      >
        <Ionicons
          name={icon}
          size={20}
          color={included ? colors.primary : colors.textMuted}
        />
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold" style={{ color: colors.text }}>{title}</Text>
        {description && (
          <Text className="text-sm mt-0.5" style={{ color: colors.textSecondary }}>{description}</Text>
        )}
      </View>
      {included ? (
        <Ionicons name="checkmark-circle" size={24} color={colors.success} />
      ) : (
        <Ionicons name="close-circle" size={24} color={colors.textLight} />
      )}
    </View>
  );
}

// Upgrade prompt banner
export function UpgradeBanner({ onPress, message, compact = false }) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      className={`flex-row items-center rounded-xl ${compact ? 'p-3' : 'p-4'}`}
      style={{
        backgroundColor: colors.premiumBackground,
        borderWidth: 1,
        borderColor: colors.premiumGold,
      }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View
        className="w-8 h-8 rounded-full justify-center items-center mr-3"
        style={{ backgroundColor: colors.premiumGold }}
      >
        <Ionicons name="star" size={18} color="#000" />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold" style={{ color: colors.text }}>
          {message || 'Upgrade to Premium'}
        </Text>
        {!compact && (
          <Text className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
            Unlock unlimited reminders & more
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}

// Premium locked overlay - shows when tapping a locked feature
export function PremiumLockedOverlay({ feature, onUpgrade, onClose }) {
  const { colors } = useTheme();

  return (
    <View className="absolute inset-0 justify-center items-center p-6 z-50" style={{ backgroundColor: colors.overlay }}>
      <View className="rounded-2xl p-6 w-full max-w-sm" style={{ backgroundColor: colors.surface }}>
        <View className="items-center mb-4">
          <View
            className="w-16 h-16 rounded-full justify-center items-center mb-3"
            style={{ backgroundColor: colors.premiumGold }}
          >
            <Ionicons name="lock-closed" size={32} color="#000" />
          </View>
          <Text className="text-xl font-bold text-center" style={{ color: colors.text }}>
            Premium Feature
          </Text>
          <Text className="text-base text-center mt-2" style={{ color: colors.textSecondary }}>
            {feature} is available with Premium
          </Text>
        </View>

        <TouchableOpacity
          className="py-4 rounded-xl items-center mb-3"
          style={{ backgroundColor: colors.primary }}
          onPress={onUpgrade}
          activeOpacity={0.8}
        >
          <Text className="text-white text-base font-semibold">Upgrade to Premium</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="py-3 items-center"
          onPress={onClose}
          activeOpacity={0.8}
        >
          <Text className="text-base" style={{ color: colors.textSecondary }}>Maybe Later</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default { ProBadge, LockBadge, PremiumFeatureRow, UpgradeBanner, PremiumLockedOverlay };
