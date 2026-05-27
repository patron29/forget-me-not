import React, { useState, useRef, useCallback, useEffect } from 'react';
import { TouchableOpacity, Alert, Animated, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/ThemeContext';

/**
 * Load expo-speech-recognition defensively. Its top-level require resolves a
 * native module that does NOT exist in Expo Go, and that throws during module
 * evaluation — which crashes the whole app before the root component can
 * register ("App entry not found"). A guarded require lets the app boot
 * everywhere; voice input simply reports as unavailable when the module
 * isn't present (e.g. Expo Go), and works in a real dev/production build.
 */
type SpeechModule = typeof import('expo-speech-recognition');
let Speech: SpeechModule | null = null;
try {
  Speech = require('expo-speech-recognition');
} catch {
  Speech = null;
}
const isSpeechAvailable = !!Speech?.ExpoSpeechRecognitionModule;

interface VoiceInputProps {
  /** Called with each (partial then final) transcript as the user speaks. */
  onVoiceResult: (transcript: string) => void;
}

/**
 * Voice-to-text button. Uses the device's on-device speech recognizer
 * (iOS Speech framework / Android SpeechRecognizer) via
 * expo-speech-recognition. Streams partial results to `onVoiceResult`
 * as the user speaks, and a final transcript when recognition ends.
 *
 * Degrades gracefully where the native module is unavailable (e.g. when
 * running in plain Expo Go): the button explains that a dev/preview build
 * is required instead of silently failing.
 */
export default function VoiceInput({ onVoiceResult }: VoiceInputProps) {
  const [isListening, setIsListening] = useState<boolean>(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);
  const { colors } = useTheme();

  const startPulse = useCallback(() => {
    loopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    loopRef.current.start();
  }, [pulseAnim]);

  const stopPulse = useCallback(() => {
    loopRef.current?.stop();
    loopRef.current = null;
    pulseAnim.setValue(1);
  }, [pulseAnim]);

  // Subscribe to recognition lifecycle events only when the native module is
  // present. addListener returns a subscription we clean up on unmount.
  useEffect(() => {
    if (!isSpeechAvailable || !Speech) return;
    const mod = Speech.ExpoSpeechRecognitionModule;

    const subs = [
      mod.addListener('start', () => {
        setIsListening(true);
        startPulse();
      }),
      mod.addListener('end', () => {
        setIsListening(false);
        stopPulse();
      }),
      mod.addListener('result', (event: any) => {
        const transcript = event?.results?.[0]?.transcript;
        if (transcript) onVoiceResult(transcript);
      }),
      mod.addListener('error', (event: any) => {
        setIsListening(false);
        stopPulse();
        // "no-speech" / "aborted" are routine, not worth interrupting the user.
        if (event?.error && event.error !== 'no-speech' && event.error !== 'aborted') {
          Alert.alert('Voice input', `Could not recognize speech (${event.error}).`);
        }
      }),
    ];
    return () => subs.forEach((s) => s?.remove?.());
  }, [onVoiceResult, startPulse, stopPulse]);

  const startListening = useCallback(async () => {
    if (!isSpeechAvailable || !Speech) {
      // Running where the native module isn't linked (e.g. Expo Go).
      Alert.alert(
        'Voice input unavailable',
        'Speech recognition needs a development or production build of the app — it is not available in Expo Go.'
      );
      return;
    }
    try {
      const mod = Speech.ExpoSpeechRecognitionModule;
      const permissions = await mod.requestPermissionsAsync();
      if (!permissions.granted) {
        Alert.alert(
          'Permission required',
          'Microphone and speech recognition permissions are needed for voice input. You can enable them in Settings.'
        );
        return;
      }

      mod.start({
        lang: 'en-US',
        interimResults: true, // stream words as they're recognized
        continuous: false, // stop automatically when the user pauses
      });
    } catch (error) {
      console.error('Voice input error:', error);
      Alert.alert('Voice input', 'Could not start voice recognition.');
      setIsListening(false);
      stopPulse();
    }
  }, [stopPulse]);

  const stopListening = useCallback(() => {
    try {
      Speech?.ExpoSpeechRecognitionModule.stop();
    } catch (error) {
      console.error('Error stopping voice input:', error);
    }
    setIsListening(false);
    stopPulse();
  }, [stopPulse]);

  const handlePress = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return (
    <TouchableOpacity
      className="w-11 h-11 justify-center items-center"
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={isListening ? 'Stop voice input' : 'Start voice input'}
    >
      <Animated.View
        className="w-11 h-11 rounded-full justify-center items-center border-2"
        style={{
          transform: [{ scale: pulseAnim }],
          backgroundColor: isListening ? colors.danger : colors.pastelBlue,
          borderColor: isListening ? colors.danger : colors.primary,
        }}
      >
        <Ionicons
          name={isListening ? 'mic' : 'mic-outline'}
          size={24}
          color={isListening ? '#FFFFFF' : colors.primary}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}
