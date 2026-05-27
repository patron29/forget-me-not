import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 justify-center items-center p-8 bg-white">
          <View className="w-20 h-20 rounded-full bg-pastel-pink justify-center items-center mb-6">
            <Ionicons name="warning-outline" size={48} color="#1A1A1A" />
          </View>
          <Text className="text-xl font-bold text-text mb-2">
            Something went wrong
          </Text>
          <Text className="text-base text-text-secondary text-center mb-8">
            {this.props.fallbackMessage || 'An unexpected error occurred. Please try again.'}
          </Text>
          <TouchableOpacity
            className="flex-row items-center gap-2 bg-primary px-6 py-4 rounded-lg active:opacity-80"
            onPress={this.handleRetry}
          >
            <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
            <Text className="text-white text-base font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
