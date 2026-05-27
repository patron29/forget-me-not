import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../utils/ThemeContext';

/**
 * Shared UI primitives built on the theme's design tokens (spacing / radius /
 * typography / elevation). Screens compose these instead of re-deriving the
 * same card/header/button styling inline, which keeps the look consistent and
 * makes future visual changes a one-file edit.
 */

// Elevated surface card.
export function Card({ children, style, elevation = 'sm', padded = true, ...rest }) {
  const { colors, radius, spacing, elevation: el } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.xl,
          borderWidth: 1,
          borderColor: colors.borderLight,
          padding: padded ? spacing.xl : 0,
        },
        el[elevation],
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

// Screen header: optional logo/icon, title, subtitle, and right-side slot.
export function ScreenHeader({ title, subtitle, icon, right, style }) {
  const { colors, spacing, typography } = useTheme();
  return (
    <View
      style={[
        { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
        style,
      ]}
    >
      {icon ? <View>{icon}</View> : null}
      <View style={{ flex: 1 }}>
        <Text style={[typography.title, { color: colors.text }]}>{title}</Text>
        {subtitle ? (
          <Text
            style={[
              typography.caption,
              { color: colors.textMuted, marginTop: 2 },
            ]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ? <View>{right}</View> : null}
    </View>
  );
}

// Compact statistic tile (the "Active" / "Completed" counters).
export function StatCard({ value, label, tone = 'neutral', style }) {
  const { colors, radius, spacing, typography } = useTheme();
  const tones = {
    neutral: { bg: colors.surfaceGray, border: colors.border, fg: colors.text, label: colors.textMuted },
    primary: { bg: colors.primaryLight, border: colors.primary, fg: colors.primary, label: colors.primary },
    warning: { bg: colors.warningLight, border: colors.warning, fg: colors.warning, label: colors.warning },
    danger: { bg: colors.dangerLight, border: colors.danger, fg: colors.danger, label: colors.danger },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: t.bg,
          borderColor: t.border,
          borderWidth: 1,
          borderRadius: radius.xl,
          padding: spacing.xl,
        },
        style,
      ]}
    >
      <Text style={[typography.display, { color: t.fg, marginBottom: 2 }]}>
        {value}
      </Text>
      <Text style={[typography.overline, { color: t.label }]}>{label}</Text>
    </View>
  );
}

// Centered empty-state with icon, title, message and optional hint chip.
export function EmptyState({ icon = 'sparkles-outline', title, message, hint }) {
  const { colors, radius, spacing, typography } = useTheme();
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.xl }}>
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: radius.full,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.lg,
          backgroundColor: colors.surfaceGray,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Ionicons name={icon} size={40} color={colors.textMuted} />
      </View>
      {title ? (
        <Text style={[typography.title, { color: colors.text, marginBottom: 4 }]}>{title}</Text>
      ) : null}
      {message ? (
        <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg }]}>
          {message}
        </Text>
      ) : null}
      {hint ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: spacing.lg, borderRadius: radius.md, backgroundColor: colors.pastelPurple }}>
          <View style={{ width: 6, height: 6, borderRadius: radius.full, backgroundColor: colors.primary }} />
          <Text style={[typography.caption, { color: colors.text }]}>{hint}</Text>
        </View>
      ) : null}
    </View>
  );
}

// Filled primary action button.
export function PrimaryButton({ label, onPress, icon, disabled, style, tone = 'primary' }) {
  const { colors, radius, spacing, typography, elevation } = useTheme();
  const bg = disabled ? colors.surfaceGray : colors[tone] || colors.primary;
  const fg = disabled ? colors.textMuted : '#FFFFFF';
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          backgroundColor: bg,
          borderRadius: radius.lg,
          paddingVertical: spacing.lg,
          paddingHorizontal: spacing.xl,
        },
        !disabled && elevation.sm,
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={20} color={fg} /> : null}
      <Text style={[typography.heading, { color: fg }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export const AnimatedCard = Animated.createAnimatedComponent(View);
