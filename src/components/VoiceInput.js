import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  Alert,
  Animated,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { useTheme } from '../utils/ThemeContext';

export default function VoiceInput({ onVoiceResult }) {
  const [isListening, setIsListening] = useState(false);
  const [recording, setRecording] = useState(null);
  const pulseAnim = useState(new Animated.Value(1))[0];
  const { colors } = useTheme();

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
      const { status } = await Audio.requestPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Microphone permission is required for voice input.'
        );
        return;
      }

      setIsListening(true);
      Speech.speak('Listening', { rate: 1.2 });

      setTimeout(() => {
        stopListening();
        Alert.alert(
          'Voice Input',
          'Voice recognition requires additional setup. Please use the text input for now.',
          [
            {
              text: 'OK',
              onPress: () => {
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
      className="w-11 h-11 justify-center items-center"
      onPress={handlePress}
      activeOpacity={0.7}
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
