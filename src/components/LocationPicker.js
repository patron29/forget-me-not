import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

export default function LocationPicker({ visible, onClose, onLocationSelect }) {
  const [locationName, setLocationName] = useState('');
  const [address, setAddress] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [radius, setRadius] = useState('200');

  const getCurrentLocation = async () => {
    try {
      setLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location permission is needed to use your current location.'
        );
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setCurrentLocation(location.coords);

      // Reverse geocode to get address
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode && reverseGeocode.length > 0) {
        const place = reverseGeocode[0];
        const addressText = [
          place.name,
          place.street,
          place.city,
          place.region,
        ]
          .filter(Boolean)
          .join(', ');

        setAddress(addressText);

        if (!locationName) {
          setLocationName(place.name || 'Current Location');
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Could not get your current location');
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!locationName.trim()) {
      Alert.alert('Error', 'Please enter a location name');
      return;
    }

    if (!currentLocation) {
      Alert.alert('Error', 'Please select a location');
      return;
    }

    const radiusNum = parseInt(radius);
    if (isNaN(radiusNum) || radiusNum < 50 || radiusNum > 1000) {
      Alert.alert('Error', 'Radius must be between 50 and 1000 meters');
      return;
    }

    onLocationSelect({
      name: locationName.trim(),
      address: address,
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      radius: radiusNum,
    });

    handleClose();
  };

  const handleClose = () => {
    setLocationName('');
    setAddress('');
    setCurrentLocation(null);
    setRadius('200');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Location</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form}>
            <Text style={styles.label}>Location Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., CVS Pharmacy"
              value={locationName}
              onChangeText={setLocationName}
            />

            <Text style={styles.label}>Address/Place</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter address or use current location"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={2}
            />

            <TouchableOpacity
              style={styles.locationButton}
              onPress={getCurrentLocation}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#007AFF" />
              ) : (
                <>
                  <Ionicons name="location" size={24} color="#007AFF" />
                  <Text style={styles.locationButtonText}>
                    Use Current Location
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {currentLocation && (
              <View style={styles.coordinatesContainer}>
                <Ionicons name="checkmark-circle" size={20} color="#4CD964" />
                <Text style={styles.coordinatesText}>
                  Location set: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                </Text>
              </View>
            )}

            <Text style={styles.label}>Alert Radius (meters)</Text>
            <TextInput
              style={styles.input}
              placeholder="200"
              value={radius}
              onChangeText={setRadius}
              keyboardType="number-pad"
            />
            <Text style={styles.helperText}>
              You'll be notified when within this distance (50-1000m)
            </Text>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={20} color="#007AFF" />
              <Text style={styles.infoText}>
                The app will track your location and send you a reminder when you arrive at this place.
              </Text>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[
              styles.saveButton,
              (!locationName.trim() || !currentLocation) && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!locationName.trim() || !currentLocation}
          >
            <Text style={styles.saveButtonText}>Save Location</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  form: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    gap: 8,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  locationButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  coordinatesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  coordinatesText: {
    color: '#2e7d32',
    fontSize: 13,
    flex: 1,
  },
  helperText: {
    fontSize: 13,
    color: '#999',
    marginTop: 6,
    marginLeft: 4,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#f0f8ff',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#007AFF',
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
