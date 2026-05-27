import React, { useState, useRef, useCallback } from 'react';
import { TouchableOpacity, Alert, Animated, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { useTheme } from '../utils/ThemeContext';

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
export default function VoiceInput({ onVoiceResult }) {
  const [isListening, setIsListening] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const loopRef = useRef(null);
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

  // Recognition lifecycle events
  useSpeechRecognitionEvent('start', () => {
    setIsListening(true);
    startPulse();
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
    stopPulse();
  });

  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results?.[0]?.transcript;
    if (transcript) {
      onVoiceResult(transcript);
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    setIsListening(false);
    stopPulse();
    // "no-speech" / "aborted" are routine, not worth interrupting the user.
    if (event.error && event.error !== 'no-speech' && event.error !== 'aborted') {
      Alert.alert('Voice input', `Could not recognize speech (${event.error}).`);
    }
  });

  const startListening = useCallback(async () => {
    try {
      const permissions =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permissions.granted) {
        Alert.alert(
          'Permission required',
          'Microphone and speech recognition permissions are needed for voice input. You can enable them in Settings.'
        );
        return;
      }

      ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true, // stream words as they're recognized
        continuous: false, // stop automatically when the user pauses
      });
    } catch (error) {
      // Most common cause: running in Expo Go, where the native module
      // isn't linked. Tell the user how to get it working instead of
      // failing silently.
      console.error('Voice input unavailable:', error);
      Alert.alert(
        'Voice input unavailable',
        'Speech recognition needs a development or production build of the app — it is not available in Expo Go.'
      );
      setIsListening(false);
      stopPulse();
    }
  }, [stopPulse]);

  const stopListening = useCallback(() => {
    try {
      ExpoSpeechRecognitionModule.stop();
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
