/**
 * Google Places API Service
 * Finds nearby locations matching a business name
 */

// API key loaded from environment variable for security
const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || '';

// New Places API (v1) endpoints
const AUTOCOMPLETE_API_URL = 'https://places.googleapis.com/v1/places:autocomplete';
const PLACE_DETAILS_URL = 'https://places.googleapis.com/v1/places';
const NEARBY_SEARCH_URL = 'https://places.googleapis.com/v1/places:searchNearby';

// Legacy Places API endpoint (for nearby search)
const PLACES_API_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

/**
 * Popular chain businesses categorized by type
 * This provides instant suggestions without API calls
 */
export const POPULAR_CHAINS = {
  'Pharmacies': [
    { name: 'CVS Pharmacy', category: 'Pharmacy' },
    { name: 'Walgreens', category: 'Pharmacy' },
    { name: 'Rite Aid', category: 'Pharmacy' },
    { name: 'Duane Reade', category: 'Pharmacy' },
  ],
  'Grocery Stores': [
    { name: 'Whole Foods', category: 'Grocery' },
    { name: 'Trader Joe\'s', category: 'Grocery' },
    { name: 'Safeway', category: 'Grocery' },
    { name: 'Kroger', category: 'Grocery' },
    { name: 'Publix', category: 'Grocery' },
    { name: 'Stop & Shop', category: 'Grocery' },
    { name: 'Giant Food', category: 'Grocery' },
    { name: 'Albertsons', category: 'Grocery' },
  ],
  'Retail Stores': [
    { name: 'Target', category: 'Retail' },
    { name: 'Walmart', category: 'Retail' },
    { name: 'Costco', category: 'Retail' },
    { name: 'Best Buy', category: 'Electronics' },
    { name: 'Home Depot', category: 'Home Improvement' },
    { name: 'Lowe\'s', category: 'Home Improvement' },
    { name: 'Staples', category: 'Office Supplies' },
  ],
  'Coffee Shops': [
    { name: 'Starbucks', category: 'Coffee' },
    { name: 'Dunkin\'', category: 'Coffee' },
    { name: 'Peet\'s Coffee', category: 'Coffee' },
    { name: 'The Coffee Bean & Tea Leaf', category: 'Coffee' },
  ],
  'Fast Food': [
    { name: 'McDonald\'s', category: 'Fast Food' },
    { name: 'Subway', category: 'Fast Food' },
    { name: 'Chipotle', category: 'Fast Food' },
    { name: 'Panera Bread', category: 'Fast Food' },
    { name: 'Chick-fil-A', category: 'Fast Food' },
    { name: 'Taco Bell', category: 'Fast Food' },
    { name: 'KFC', category: 'Fast Food' },
  ],
  'Gas Stations': [
    { name: 'Shell', category: 'Gas Station' },
    { name: 'Chevron', category: 'Gas Station' },
    { name: 'BP', category: 'Gas Station' },
    { name: 'Exxon', category: 'Gas Station' },
    { name: 'Mobil', category: 'Gas Station' },
  ],
  'Banks': [
    { name: 'Chase Bank', category: 'Bank' },
    { name: 'Bank of America', category: 'Bank' },
    { name: 'Wells Fargo', category: 'Bank' },
    { name: 'Citibank', category: 'Bank' },
  ],
};

/**
 * Search for nearby places matching a business name
 * @param {number} latitude - Current latitude
 * @param {number} longitude - Current longitude
 * @param {string} businessName - Name of the business/chain to search for
 * @param {number} radius - Search radius in meters (max 50000)
 * @returns {Promise<Array>} Array of matching places with coordinates
 */
export const findNearbyChainLocations = async (latitude, longitude, businessName, radius = 5000) => {
  try {
    // If no API key is set, fall back to simple name matching
    if (!GOOGLE_PLACES_API_KEY || GOOGLE_PLACES_API_KEY === 'YOUR_API_KEY_HERE') {
      console.warn('Google Places API key not configured. Using fallback location matching.');
      return null;
    }

    const url = `${PLACES_API_URL}?location=${latitude},${longitude}&radius=${radius}&keyword=${encodeURIComponent(businessName)}&key=${GOOGLE_PLACES_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Places API error:', data.status, data.error_message);
      return null;
    }

    if (data.results && data.results.length > 0) {
      return data.results.map(place => ({
        name: place.name,
        address: place.vicinity,
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        placeId: place.place_id,
      }));
    }

    return [];
  } catch (error) {
    console.error('Error fetching nearby chain locations:', error);
    return null;
  }
};

/**
 * Check if current location matches any nearby chain locations
 * @param {number} currentLat - Current latitude
 * @param {number} currentLng - Current longitude
 * @param {string} businessName - Name of the business/chain
 * @param {number} searchRadius - How far to search for chain locations (default 5km)
 * @param {number} proximityRadius - How close to be to trigger (default 200m)
 * @returns {Promise<Object|null>} Matching location or null
 */
export const checkChainProximity = async (
  currentLat,
  currentLng,
  businessName,
  searchRadius = 5000,
  proximityRadius = 200
) => {
  try {
    const nearbyLocations = await findNearbyChainLocations(
      currentLat,
      currentLng,
      businessName,
      searchRadius
    );

    if (!nearbyLocations || nearbyLocations.length === 0) {
      return null;
    }

    // Calculate distance to each location
    for (const location of nearbyLocations) {
      const distance = calculateDistance(
        currentLat,
        currentLng,
        location.latitude,
        location.longitude
      );

      // If within proximity radius, return this location
      if (distance <= proximityRadius) {
        return {
          ...location,
          distance,
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error checking chain proximity:', error);
    return null;
  }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in meters
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Search for business chains by name
 * Returns both popular chains and API results
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of matching businesses
 */
export const searchBusinessChains = async (query) => {
  if (!query || query.length < 2) {
    // Return all popular chains if no query
    const allChains = [];
    Object.entries(POPULAR_CHAINS).forEach(([category, chains]) => {
      chains.forEach(chain => {
        allChains.push({ ...chain, categoryGroup: category });
      });
    });
    return allChains;
  }

  const results = [];
  const lowerQuery = query.toLowerCase();

  // Search popular chains first (instant, no API call)
  Object.entries(POPULAR_CHAINS).forEach(([categoryGroup, chains]) => {
    chains.forEach(chain => {
      if (chain.name.toLowerCase().includes(lowerQuery)) {
        results.push({
          ...chain,
          categoryGroup,
          source: 'popular',
        });
      }
    });
  });

  // If API key is configured, also search via Google Places
  if (GOOGLE_PLACES_API_KEY && GOOGLE_PLACES_API_KEY !== 'YOUR_API_KEY_HERE') {
    try {
      const apiResults = await searchBusinessesViaAPI(query);
      if (apiResults && apiResults.length > 0) {
        // Add API results that aren't already in popular chains
        apiResults.forEach(result => {
          const exists = results.some(r => r.name.toLowerCase() === result.name.toLowerCase());
          if (!exists) {
            results.push({
              ...result,
              source: 'api',
            });
          }
        });
      }
    } catch (error) {
      console.error('Error searching businesses via API:', error);
    }
  }

  return results;
};

/**
 * Search businesses using Google Places Autocomplete API (New v1 API)
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of business suggestions
 */
async function searchBusinessesViaAPI(query) {
  try {
    const requestBody = {
      input: query,
      includedPrimaryTypes: ['establishment'],
      languageCode: 'en',
    };

    const response = await fetch(AUTOCOMPLETE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Autocomplete API error:', response.status, data);
      return [];
    }

    if (data.suggestions && data.suggestions.length > 0) {
      // Extract business names from suggestions
      return data.suggestions
        .map(suggestion => {
          const prediction = suggestion.placePrediction;
          if (!prediction) return null;

          const businessName = prediction.structuredFormat?.mainText?.text ||
                              prediction.text?.text ||
                              'Unknown';

          return {
            name: businessName,
            fullDescription: prediction.text?.text || '',
            placeId: prediction.placeId,
            category: prediction.types?.[0] || 'Business',
          };
        })
        .filter(business => business !== null)
        .filter((business, index, self) =>
          // Remove duplicates by name
          index === self.findIndex(b => b.name === business.name)
        )
        .slice(0, 10); // Limit to 10 results
    }

    return [];
  } catch (error) {
    console.error('Error in searchBusinessesViaAPI:', error);
    return [];
  }
}

/**
 * Get a flat list of all popular chain names for quick filtering
 * @returns {Array<string>} Array of popular chain names
 */
export const getPopularChainNames = () => {
  const names = [];
  Object.values(POPULAR_CHAINS).forEach(chains => {
    chains.forEach(chain => names.push(chain.name));
  });
  return names;
};

/**
 * Universal autocomplete search for any place (business, address, landmark)
 * Returns results with coordinates - works like Google Maps search
 * @param {string} query - Search query (business name, address, etc)
 * @param {Object} userLocation - Optional user location for biasing results {latitude, longitude}
 * @returns {Promise<Array>} Array of place suggestions with full details
 */
export const autocompleteSearch = async (query, userLocation = null) => {
  try {
    console.log('[autocompleteSearch] Query:', query);

    if (!query || query.length < 2) {
      console.log('[autocompleteSearch] Query too short');
      return [];
    }

    // New Places API (v1) - uses POST with JSON body
    console.log('[autocompleteSearch] Using New Places API (v1)');

    // Build request body
    const requestBody = {
      input: query,
      includedPrimaryTypes: ['street_address', 'establishment', 'geocode'],
      languageCode: 'en',
    };

    // Add location bias if user location is available (50km radius - API max is 50,000m)
    if (userLocation && userLocation.latitude && userLocation.longitude) {
      requestBody.locationBias = {
        circle: {
          center: {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          },
          radius: 50000.0, // 50km (~31 miles) - max allowed by API
        },
      };
      console.log('[autocompleteSearch] Using location bias:', userLocation);
    }

    const response = await fetch(AUTOCOMPLETE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    console.log('[autocompleteSearch] Response:', data);

    if (!response.ok) {
      console.error('Autocomplete API error:', response.status, data);
      return [];
    }

    if (data.suggestions && data.suggestions.length > 0) {
      console.log('[autocompleteSearch] Found', data.suggestions.length, 'suggestions');

      // Get place details for each suggestion to get coordinates (up to 15 results)
      const placesWithDetails = await Promise.all(
        data.suggestions.slice(0, 15).map(async (suggestion) => {
          const placeId = suggestion.placePrediction?.placeId;
          if (!placeId) return null;

          const details = await getPlaceDetailsNew(placeId);

          return {
            placeId: placeId,
            name: suggestion.placePrediction?.structuredFormat?.mainText?.text ||
                  suggestion.placePrediction?.text?.text ||
                  'Unknown',
            address: suggestion.placePrediction?.text?.text || '',
            latitude: details?.latitude || null,
            longitude: details?.longitude || null,
            types: suggestion.placePrediction?.types || [],
          };
        })
      );

      const filtered = placesWithDetails.filter(place => place && place.latitude && place.longitude);
      console.log('[autocompleteSearch] Returning', filtered.length, 'places with coordinates');
      return filtered;
    }

    console.log('[autocompleteSearch] No suggestions found');
    return [];
  } catch (error) {
    console.error('Error in autocomplete search:', error);
    return [];
  }
};

// Removed autocompleteSearchWithSDK - now using New Places API (v1) exclusively

/**
 * Search for specific place addresses using Places Autocomplete
 * This is for finding a specific location of a business
 * @param {string} businessName - Name of the business
 * @param {string} query - Additional search query (optional)
 * @returns {Promise<Array>} Array of place suggestions with addresses
 */
export const searchSpecificPlaces = async (businessName, query = '') => {
  const searchQuery = query ? `${businessName} ${query}` : businessName;
  return autocompleteSearch(searchQuery);
};

/**
 * Get detailed information about a place using New Places API (v1)
 * @param {string} placeId - Google Place ID
 * @returns {Promise<Object|null>} Place details with coordinates
 */
export const getPlaceDetailsNew = async (placeId) => {
  try {
    const url = `${PLACE_DETAILS_URL}/${placeId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
        'X-Goog-FieldMask': 'id,location,formattedAddress',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Place Details API error:', response.status, data);
      return null;
    }

    if (data.location) {
      return {
        latitude: data.location.latitude,
        longitude: data.location.longitude,
        address: data.formattedAddress || '',
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting place details:', error);
    return null;
  }
};

/**
 * Get detailed information about a place including coordinates (Legacy - kept for compatibility)
 * @param {string} placeId - Google Place ID
 * @returns {Promise<Object|null>} Place details with coordinates
 * @deprecated Use getPlaceDetailsNew instead
 */
export const getPlaceDetails = async (placeId) => {
  // Forward to new API
  return getPlaceDetailsNew(placeId);
};
