import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';

export default function VoiceInput({ onVoiceResult }) {
  const [isListening, setIsListening] = useState(false);
  const [recording, setRecording] = useState(null);
  const pulseAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    if (isListening) {
      Animated.loop(
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
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  const startListening = async () => {
    try {
      // Request microphone permissions
      const { status } = await Audio.requestPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Microphone permission is required for voice input.'
        );
        return;
      }

      // Note: React Native doesn't have built-in speech recognition
      // This is a placeholder that demonstrates the UI interaction
      // In a production app, you would integrate with a service like:
      // - @react-native-voice/voice
      // - Google Cloud Speech-to-Text
      // - AWS Transcribe
      // - Azure Speech Services

      setIsListening(true);

      // Provide feedback to user
      Speech.speak('Listening', { rate: 1.2 });

      // Simulate voice recognition (in production, replace with actual API call)
      setTimeout(() => {
        stopListening();
        // Example: onVoiceResult('This is a sample voice input');
        Alert.alert(
          'Voice Input',
          'Voice recognition requires additional setup. Please use the text input for now.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Provide sample text for demonstration
                onVoiceResult('Sample task from voice input');
              },
            },
          ]
        );
      }, 2000);

    } catch (error) {
      console.error('Error starting voice recognition:', error);
      Alert.alert('Error', 'Failed to start voice recognition');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    setIsListening(false);
    if (recording) {
      recording.stopAndUnloadAsync();
      setRecording(null);
    }
  };

  const handlePress = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isListening && styles.buttonActive,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Animated.View
        style={[
          styles.iconContainer,
          isListening && styles.iconContainerActive,
          { transform: [{ scale: pulseAnim }] },
        ]}
      >
        <Ionicons
          name={isListening ? 'mic' : 'mic-outline'}
          size={24}
          color={isListening ? '#fff' : '#007AFF'}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonActive: {
    // Active state styling
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f8ff',
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerActive: {
    backgroundColor: '#FF3B30',
    borderColor: '#FF3B30',
  },
});
