import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { autocompleteSearch } from '../services/placesService';
import { useSubscription } from '../utils/SubscriptionContext';
import { useTheme } from '../utils/ThemeContext';
import { ProBadge, LockBadge } from './PremiumBadge';

export default function LocationPicker({ visible, onClose, onLocationSelect }) {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();

  // Get subscription status
  let subscriptionContext = null;
  try {
    subscriptionContext = useSubscription();
  } catch (e) {
    // Running outside SubscriptionProvider
  }
  const isPremium = subscriptionContext?.isPremium || false;

  const [isChainMode, setIsChainMode] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [address, setAddress] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const FIXED_RADIUS = 100;

  const [locations, setLocations] = useState([]);
  const [addressSearchQuery, setAddressSearchQuery] = useState('');
  const [addressSearchResults, setAddressSearchResults] = useState([]);
  const [searchingAddresses, setSearchingAddresses] = useState(false);
  const [useImperial, setUseImperial] = useState(false);

  const isMountedRef = useRef(true);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const detectLocale = async () => {
      try {
        const locales = await Location.getLocalizationAsync();
        const imperialCountries = ['US', 'GB', 'LR', 'MM'];
        const isImperial = imperialCountries.includes(locales.region || '');
        setUseImperial(isImperial);
      } catch (error) {
        const browserLocale = navigator?.language || '';
        const isUS = browserLocale.startsWith('en-US');
        setUseImperial(isUS);
      }
    };

    if (visible) {
      detectLocale();
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      setIsChainMode(false);
      setLocationName('');
      setAddress('');
      setCurrentLocation(null);
      setLoading(false);
      setAddressSearchQuery('');
      setAddressSearchResults([]);
      setLocations([]);
    }
  }, [visible]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }

    if (addressSearchQuery.length >= 3) {
      setSearchingAddresses(true);

      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const results = await autocompleteSearch(addressSearchQuery, currentLocation);

          if (isMountedRef.current) {
            setAddressSearchResults(results || []);
            setSearchingAddresses(false);
          }
        } catch (error) {
          console.error('[LocationPicker] Error searching addresses:', error);
          if (isMountedRef.current) {
            setAddressSearchResults([]);
            setSearchingAddresses(false);
          }
        }
      }, 300);
    } else {
      setAddressSearchResults([]);
      setSearchingAddresses(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
    };
  }, [addressSearchQuery, currentLocation]);

  const handleSelectAddress = (place) => {
    if (isChainMode) {
      const businessName = place.name.split(' - ')[0].split(' (')[0].trim();
      setLocationName(businessName);
      setAddressSearchQuery('');
      setAddressSearchResults([]);
      return;
    }

    // Check if free user is trying to add multiple locations
    if (!isPremium && locations.length >= 1) {
      Alert.alert(
        'Premium Feature',
        'Free accounts can only add one location per reminder. Upgrade to Premium for multiple locations!',
        [
          { text: 'Maybe Later', style: 'cancel' },
          {
            text: 'Upgrade',
            onPress: () => {
              handleClose();
              setTimeout(() => {
                navigation.navigate('Paywall');
              }, 300);
            },
          },
        ]
      );
      return;
    }

    const newLocation = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: place.name,
      address: place.address,
      latitude: place.latitude,
      longitude: place.longitude,
    };

    const exists = locations.some(
      loc => loc.latitude === place.latitude && loc.longitude === place.longitude
    );

    if (!exists) {
      setLocations(prev => [...prev, newLocation]);
    }

    setAddressSearchQuery('');
    setAddressSearchResults([]);

    if (!locationName && locations.length === 0) {
      setLocationName(place.name);
    }
  };

  const handleRemoveLocation = (locationId) => {
    setLocations(prev => prev.filter(loc => loc.id !== locationId));
  };

  const locationCancelledRef = useRef(false);

  const handleCancelLocation = () => {
    locationCancelledRef.current = true;
  };

  const getCurrentLocation = async () => {
    // Check if free user is trying to add multiple locations
    if (!isPremium && locations.length >= 1) {
      Alert.alert(
        'Premium Feature',
        'Free accounts can only add one location per reminder. Upgrade to Premium for multiple locations!',
        [
          { text: 'Maybe Later', style: 'cancel' },
          {
            text: 'Upgrade',
            onPress: () => {
              handleClose();
              setTimeout(() => {
                navigation.navigate('Paywall');
              }, 300);
            },
          },
        ]
      );
      return;
    }

    try {
      setLoading(true);
      locationCancelledRef.current = false;

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (locationCancelledRef.current || !isMountedRef.current) {
        if (isMountedRef.current) setLoading(false);
        return;
      }

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location permission is needed to use your current location.'
        );
        if (isMountedRef.current) setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      if (locationCancelledRef.current || !isMountedRef.current) {
        if (isMountedRef.current) setLoading(false);
        return;
      }

      setCurrentLocation(location.coords);

      if (!isChainMode) {
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (locationCancelledRef.current || !isMountedRef.current) {
          if (isMountedRef.current) setLoading(false);
          return;
        }

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

          const newLocation = {
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            name: place.name || 'Current Location',
            address: addressText,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };

          const exists = locations.some(
            loc => Math.abs(loc.latitude - location.coords.latitude) < 0.0001 &&
                   Math.abs(loc.longitude - location.coords.longitude) < 0.0001
          );

          if (!exists) {
            setLocations(prev => [...prev, newLocation]);
          }

          setAddress(addressText);

          if (!locationName) {
            setLocationName(place.name || 'Current Location');
          }
        }
      }

      if (!locationCancelledRef.current && isMountedRef.current) {
        setLoading(false);
        Alert.alert('Success', 'Location added!');
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      if (!locationCancelledRef.current && isMountedRef.current) {
        Alert.alert('Error', 'Could not get your current location');
        setLoading(false);
      }
    }
  };

  const handleSave = () => {
    if (!locationName.trim()) {
      Alert.alert('Error', 'Please enter a location name');
      return;
    }

    if (isChainMode) {
      onLocationSelect({
        name: locationName.trim(),
        address: 'Any location',
        isChain: true,
        radius: FIXED_RADIUS,
      });
    } else {
      if (locations.length === 0) {
        Alert.alert('Error', 'Please select at least one location');
        return;
      }

      onLocationSelect({
        name: locationName.trim(),
        isChain: false,
        radius: FIXED_RADIUS,
        address: locations[0].address,
        latitude: locations[0].latitude,
        longitude: locations[0].longitude,
        locations: locations.map(loc => ({
          id: loc.id,
          name: loc.name,
          address: loc.address,
          latitude: loc.latitude,
          longitude: loc.longitude,
        })),
      });
    }

    handleClose();
  };

  const handleClose = () => {
    setIsChainMode(false);
    setLocationName('');
    setAddress('');
    setCurrentLocation(null);
    setAddressSearchQuery('');
    setAddressSearchResults([]);
    onClose();
  };

  const isDisabled = !locationName.trim() || (!isChainMode && locations.length === 0);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-end" style={{ backgroundColor: colors.modalBackground }}>
        <View className="rounded-t-3xl pt-6 px-6 max-h-[90%]" style={{ backgroundColor: colors.surface }}>
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold tracking-tight" style={{ color: colors.text }}>
              Select Location
            </Text>
            <TouchableOpacity onPress={handleClose} className="p-1">
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Chain Mode Toggle */}
            <TouchableOpacity
              className="flex-row items-center justify-between p-4 rounded-lg mb-4"
              style={{
                backgroundColor: colors.surfaceGray,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: !isPremium ? 0.8 : 1,
              }}
              onPress={() => {
                if (!isPremium) {
                  onClose();
                  setTimeout(() => {
                    navigation.navigate('Paywall');
                  }, 300);
                  return;
                }
                const newChainMode = !isChainMode;
                setIsChainMode(newChainMode);
                if (newChainMode) {
                  setLocationName('');
                  setAddressSearchQuery('');
                  setAddressSearchResults([]);
                }
              }}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center gap-4 flex-1">
                <View
                  className="w-6 h-6 rounded-md border-2 justify-center items-center"
                  style={{
                    backgroundColor: isChainMode ? colors.primary : colors.surface,
                    borderColor: isChainMode ? colors.primary : colors.border,
                  }}
                >
                  {isChainMode && (
                    <Ionicons name="checkmark" size={18} color={isDark ? colors.background : '#1A1A1A'} />
                  )}
                </View>
                <View>
                  <View className="flex-row items-center gap-2 mb-0.5">
                    <Text className="text-base font-semibold" style={{ color: colors.text }}>
                      Chain/Franchise Mode
                    </Text>
                    {!isPremium && <ProBadge small />}
                  </View>
                  <Text className="text-sm" style={{ color: colors.textSecondary }}>
                    {!isPremium ? 'Upgrade to use this feature' : 'Remind me at any location of this business'}
                  </Text>
                </View>
              </View>
              {!isPremium ? (
                <LockBadge size={16} />
              ) : (
                <Ionicons
                  name={isChainMode ? "business" : "business-outline"}
                  size={24}
                  color={isChainMode ? colors.primary : colors.textMuted}
                />
              )}
            </TouchableOpacity>

            {/* Location Name - Only show in non-chain mode */}
            {!isChainMode && (
              <>
                <Text className="text-base font-semibold mb-2 mt-4" style={{ color: colors.text }}>
                  Location Name *
                </Text>
                <TextInput
                  className="p-4 text-base"
                  style={{
                    backgroundColor: colors.surfaceGray,
                    color: colors.text,
                    borderWidth: 2,
                    borderColor: colors.border,
                    borderRadius: 8,
                    outlineStyle: 'none',
                  }}
                  placeholder="e.g., Grocery Store, Gym, Office"
                  placeholderTextColor={colors.textMuted}
                  value={locationName}
                  onChangeText={setLocationName}
                />
              </>
            )}

            {/* Address/Business Search */}
            <Text className="text-base font-semibold mb-2 mt-4" style={{ color: colors.text }}>
              {isChainMode ? 'Search for Business *' : 'Address/Location'}
            </Text>

            <TextInput
              className="p-4 text-base"
              style={{
                backgroundColor: colors.surfaceGray,
                color: colors.text,
                borderWidth: 2,
                borderColor: colors.border,
                borderRadius: 8,
                outlineStyle: 'none',
              }}
              placeholder={isChainMode ? "Search for a business (e.g., pharmacy, gym)" : "Search for an address or place"}
              placeholderTextColor={colors.textMuted}
              value={addressSearchQuery}
              onChangeText={setAddressSearchQuery}
              returnKeyType="search"
            />

            {/* Search Status Messages */}
            {searchingAddresses && (
              <View className="flex-row items-center justify-center p-4 gap-2">
                <ActivityIndicator size="small" color={colors.primary} />
                <Text className="text-sm" style={{ color: colors.textSecondary }}>Searching...</Text>
              </View>
            )}

            {!searchingAddresses && addressSearchQuery.length >= 3 && addressSearchResults.length === 0 && (
              <View
                className="flex-row items-center justify-center p-4 gap-2 rounded-lg mt-2"
                style={{ backgroundColor: colors.surfaceGray }}
              >
                <Ionicons name="search-outline" size={20} color={colors.textMuted} />
                <Text className="text-sm" style={{ color: colors.textMuted }}>No results found. Try a different search.</Text>
              </View>
            )}

            {/* Search Results - Inline below the input */}
            {addressSearchResults.length > 0 && (
              <View
                className="rounded-lg mt-2 max-h-64 overflow-hidden"
                style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
              >
                {addressSearchResults.map((place, index) => (
                  <TouchableOpacity
                    key={index}
                    className="flex-row items-center p-4 gap-2"
                    style={{ borderBottomWidth: 1, borderBottomColor: colors.borderLight }}
                    onPress={() => handleSelectAddress(place)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="location" size={20} color={colors.primary} />
                    <View className="flex-1">
                      <Text className="text-base font-semibold mb-0.5" style={{ color: colors.text }}>
                        {place.name}
                      </Text>
                      <Text className="text-sm" style={{ color: colors.textSecondary }} numberOfLines={1}>
                        {place.address}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Selected Business Display for Chain Mode */}
            {isChainMode && locationName && (
              <View className="mt-2">
                <View
                  className="flex-row items-center p-4 rounded-lg gap-2"
                  style={{ backgroundColor: colors.successLight, borderWidth: 1, borderColor: colors.success }}
                >
                  <Ionicons name="business" size={20} color={colors.success} />
                  <Text className="flex-1 text-sm font-medium" style={{ color: colors.success }}>
                    Will notify at any "{locationName}" location
                  </Text>
                </View>
                <TouchableOpacity
                  className="flex-row items-center justify-center gap-1 py-2"
                  onPress={() => {
                    setLocationName('');
                    setAddressSearchQuery('');
                  }}
                >
                  <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                  <Text className="text-sm font-medium" style={{ color: colors.textMuted }}>Change</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Selected Locations List - Only for specific location mode */}
            {!isChainMode && locations.length > 0 && !addressSearchQuery && (
              <View
                className="mt-4 rounded-lg p-4"
                style={{ backgroundColor: colors.surfaceGray, borderWidth: 1, borderColor: colors.border }}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                    Selected Locations ({locations.length})
                  </Text>
                  {!isPremium && locations.length === 1 && (
                    <View className="flex-row items-center gap-1">
                      <ProBadge small />
                      <Text className="text-xs" style={{ color: colors.textMuted }}>for multiple</Text>
                    </View>
                  )}
                </View>
                {locations.map((loc, index) => (
                  <View
                    key={loc.id}
                    className="flex-row items-center justify-between rounded-md p-2 mb-1"
                    style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.success }}
                  >
                    <View className="flex-row items-center flex-1 gap-2">
                      <View className="flex-row items-center gap-0.5">
                        <Ionicons name="location" size={18} color={colors.success} />
                        <Text className="text-xs font-semibold" style={{ color: colors.success }}>{index + 1}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-semibold" style={{ color: colors.text }} numberOfLines={1}>
                          {loc.name}
                        </Text>
                        <Text className="text-xs mt-0.5" style={{ color: colors.textSecondary }} numberOfLines={1}>
                          {loc.address}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      className="p-1"
                      onPress={() => handleRemoveLocation(loc.id)}
                    >
                      <Ionicons name="close-circle" size={22} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Use Current Location Button - Only for specific location mode */}
            {!isChainMode && (
              <>
                {loading ? (
                  <View
                    className="flex-row items-center justify-between rounded-lg px-4 py-2 mt-2"
                    style={{ backgroundColor: colors.surfaceGray, borderWidth: 1, borderColor: colors.primary }}
                  >
                    <View className="flex-row items-center gap-2">
                      <ActivityIndicator size="small" color={colors.primary} />
                      <Text className="text-sm font-medium" style={{ color: colors.textSecondary }}>Getting location...</Text>
                    </View>
                    <TouchableOpacity
                      className="px-4 py-1 rounded-md"
                      style={{ backgroundColor: colors.danger }}
                      onPress={handleCancelLocation}
                      activeOpacity={0.8}
                    >
                      <Text className="text-white text-sm font-semibold">Cancel</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    className="flex-row items-center justify-center rounded-lg px-4 py-2 mt-2 gap-1"
                    style={{ backgroundColor: colors.surfaceGray, borderWidth: 1, borderColor: colors.primary }}
                    onPress={getCurrentLocation}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="navigate" size={18} color={colors.primary} />
                    <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
                      Use Current Location
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}

            {(isChainMode || isPremium || locations.length > 1) && (
              <View
                className="flex-row p-4 rounded-lg mt-6 gap-4"
                style={{ backgroundColor: colors.accentLight, borderWidth: 1, borderColor: colors.primary }}
              >
                <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
                <Text className="flex-1 text-sm leading-5" style={{ color: colors.text }}>
                  {isChainMode
                    ? 'The app will find any nearby location of this business and notify you when you arrive.'
                    : locations.length > 1
                      ? `You've added ${locations.length} locations. The app will notify you when you arrive at any of them.`
                      : 'You can add multiple locations for this reminder. The app will notify you when you arrive at any of them.'
                  }
                </Text>
              </View>
            )}

            {/* Save Button */}
            <TouchableOpacity
              className="rounded-lg p-4 items-center mt-6 mb-4"
              style={{ backgroundColor: isDisabled ? colors.border : colors.primary }}
              onPress={handleSave}
              disabled={isDisabled}
              activeOpacity={0.8}
            >
              <Text className="text-lg font-semibold" style={{ color: isDisabled ? colors.textMuted : '#FFFFFF' }}>
                {locations.length > 1 ? `Save ${locations.length} Locations` : 'Save Location'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
