import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { searchBusinessChains, POPULAR_CHAINS } from '../services/placesService';

export default function BusinessSearch({ visible, onClose, onSelectBusiness }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showingCategory, setShowingCategory] = useState(null);

  useEffect(() => {
    if (visible && !searchQuery) {
      loadAllPopularChains();
    }
  }, [visible]);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      handleSearch();
    } else if (searchQuery.length === 0) {
      loadAllPopularChains();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const loadAllPopularChains = () => {
    const allChains = [];
    Object.entries(POPULAR_CHAINS).forEach(([category, chains]) => {
      chains.forEach(chain => {
        allChains.push({ ...chain, categoryGroup: category });
      });
    });
    setSearchResults(allChains);
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const results = await searchBusinessChains(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBusiness = (business) => {
    onSelectBusiness(business.name);
    handleClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowingCategory(null);
    onClose();
  };

  const renderBusinessItem = ({ item }) => (
    <TouchableOpacity
      className="flex-row items-center p-4 bg-white rounded-lg mb-2 border border-border"
      onPress={() => handleSelectBusiness(item)}
      activeOpacity={0.7}
    >
      <View className="w-12 h-12 bg-accent-light rounded-full justify-center items-center mr-4">
        <Ionicons name="business" size={24} color="#4A7BFF" />
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-text mb-1">{item.name}</Text>
        <Text className="text-sm text-text-secondary">
          {item.categoryGroup || item.category}
          {item.source === 'popular' && ' • Popular'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  const renderCategoryButton = (categoryName) => (
    <TouchableOpacity
      key={categoryName}
      className="flex-row justify-between items-center bg-pastel-purple p-6 rounded-lg mb-2"
      onPress={() => {
        setShowingCategory(categoryName);
        const chains = POPULAR_CHAINS[categoryName].map(chain => ({
          ...chain,
          categoryGroup: categoryName,
        }));
        setSearchResults(chains);
      }}
    >
      <Text className="text-base font-semibold text-text">{categoryName}</Text>
      <Ionicons name="chevron-forward" size={16} color="#4A7BFF" />
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/40 justify-end">
        <View className="bg-white rounded-t-3xl pt-6 px-6 pb-6 max-h-[90%]">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-bold text-text tracking-tight">
              {showingCategory || 'Select Business'}
            </Text>
            <TouchableOpacity onPress={handleClose} className="p-1">
              <Ionicons name="close" size={28} color="#1A1A1A" />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center bg-surface-gray rounded-lg px-4 py-3 mb-4 border border-border">
            <Ionicons name="search" size={20} color="#9CA3AF" className="mr-2" />
            <TextInput
              className="flex-1 text-base text-text ml-2"
              placeholder="Search for a business (e.g., CVS, Starbucks)"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="words"
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {showingCategory && (
              <TouchableOpacity
                className="flex-row items-center gap-2 mb-4"
                onPress={() => {
                  setShowingCategory(null);
                  loadAllPopularChains();
                }}
              >
                <Ionicons name="arrow-back" size={20} color="#4A7BFF" />
                <Text className="text-base text-primary font-semibold">All Categories</Text>
              </TouchableOpacity>
            )}

            {!searchQuery && !showingCategory && (
              <View className="mb-4">
                <Text className="text-base font-semibold text-text mb-4">Browse by Category</Text>
                <View className="gap-2">
                  {Object.keys(POPULAR_CHAINS).map(renderCategoryButton)}
                </View>
              </View>
            )}

            {loading && (
              <View className="flex-1 justify-center items-center py-16">
                <ActivityIndicator size="large" color="#4A7BFF" />
                <Text className="mt-4 text-base text-text-secondary">Searching...</Text>
              </View>
            )}

            {!loading && searchResults.length > 0 && (
              <>
                {searchQuery.length > 0 && (
                  <Text className="text-sm text-text-secondary mb-4 px-1">
                    {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                  </Text>
                )}
                {searchResults.map((item, index) => (
                  <View key={`${item.name}-${index}`}>
                    {renderBusinessItem({ item })}
                  </View>
                ))}
              </>
            )}

            {!loading && searchQuery.length >= 2 && searchResults.length === 0 && (
              <View className="flex-1 justify-center items-center py-16">
                <Ionicons name="search-outline" size={60} color="#9CA3AF" />
                <Text className="text-xl font-bold text-text-muted mt-4">No businesses found</Text>
                <Text className="text-sm text-text-muted mt-2 text-center px-8">
                  Try searching for a different name or browse categories above
                </Text>
                <TouchableOpacity
                  className="flex-row items-center justify-center bg-accent-light p-4 rounded-lg mt-4 gap-2"
                  onPress={() => {
                    onSelectBusiness(searchQuery);
                    handleClose();
                  }}
                >
                  <Ionicons name="create-outline" size={20} color="#4A7BFF" />
                  <Text className="text-base text-primary font-semibold">
                    Use "{searchQuery}" anyway
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {!searchQuery && (
              <View className="p-6 border-t border-border mt-6">
                <Text className="text-sm font-semibold text-text-secondary mb-4 text-center">
                  Can't find your business?
                </Text>
                <TouchableOpacity
                  className="flex-row items-center justify-center bg-accent-light p-4 rounded-lg gap-2"
                  onPress={handleClose}
                >
                  <Ionicons name="create-outline" size={20} color="#4A7BFF" />
                  <Text className="text-base text-primary font-semibold">Enter business name manually</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
