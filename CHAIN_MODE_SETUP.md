# Chain/Franchise Mode Setup Guide

## Overview

Chain Mode allows you to create one reminder that triggers at **ANY** location with the same business name. For example, create one "Buy BPO" reminder for "CVS Pharmacy" and get notified at ANY CVS location you visit.

## Features

✅ Single reminder for multiple locations
✅ Automatic detection of nearby chain locations
✅ Works with Google Places API for accurate results
✅ Fallback to manual matching if API not configured

## Setup Instructions

### 1. Get a Google Places API Key (Recommended)

For the best experience, you'll need a Google Places API key:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Places API**
4. Create credentials → API Key
5. Restrict the API key to "Places API" for security
6. Copy your API key

### 2. Add Your API Key to the App

Open `src/services/placesService.js` and replace `YOUR_API_KEY_HERE` with your actual API key:

```javascript
const GOOGLE_PLACES_API_KEY = 'AIzaSyC...your-actual-key-here';
```

**Important:** Never commit your API key to public repositories. Consider using environment variables for production.

### 3. (Optional) Add Billing to Google Cloud

Google Places API requires billing to be enabled, but includes $200 free credit per month, which covers:
- ~40,000 nearby search requests per month
- More than enough for personal use

## How to Use Chain Mode

### Creating a Chain Reminder

1. **Enter your reminder text**
   - Example: "Buy BPO"

2. **Click the Add button** to open LocationPicker

3. **Enable Chain/Franchise Mode**
   - Toggle the checkbox at the top
   - Notice the text changes to "Remind me at ANY [location name] with this name"

4. **Select or search for the business**
   - **Option A: Browse Popular Chains** (No API key needed!)
     - Click the search button
     - Browse by category: Pharmacies, Grocery Stores, Coffee Shops, etc.
     - Select from 50+ popular chains including CVS, Walgreens, Starbucks, Target, etc.

   - **Option B: Search Any Business** (Requires API key)
     - Type the business name in the search box
     - Get instant results from our popular chains list
     - API results will also appear if configured
     - Select from the results

5. **Set your alert radius**
   - Default: 200 meters
   - This controls how close you need to be to trigger

6. **Save the reminder**

**New in v1.1:** Business Search Feature!
- ✅ 50+ popular chains built-in (no API required!)
- ✅ Browse by category
- ✅ Search functionality
- ✅ Works offline with popular chains

### How It Works

When chain mode is enabled:

1. **Every 30 seconds** (or when you move 50 meters), the app checks your location
2. It searches for nearby locations matching the business name **within 5km radius**
3. If ANY matching location is within your **alert radius** (e.g., 200m), you get notified
4. The notification shows the specific location you're near

### Example Notification

```
🔔 Forget Me Not!
Buy BPO at CVS Pharmacy (123 Main St, Boston, MA)
```

## Without Google Places API (Fallback Mode)

If you don't configure the API key, chain mode will be disabled but you can still:
- Create reminders for specific locations
- Use "Use Current Location" to set exact coordinates
- Get notified when near that specific location

## Visual Indicators

Chain mode reminders are visually different:

- **Icon:** 🏢 Business icon instead of 📍 location pin
- **Color:** Orange (#FF9500) instead of blue
- **Text:** Shows "(Any location)" after the business name

## Tips for Best Results

### Business Name Format

✅ **Good:**
- "CVS Pharmacy"
- "Starbucks"
- "Target"
- "McDonald's"

❌ **Avoid:**
- "CVS Store #1234" (too specific)
- "The CVS near my house" (not searchable)
- Abbreviations that aren't commonly used

### Radius Settings

- **50-100m:** Very close proximity (useful for small stores)
- **200m:** Default, good for most situations
- **500-1000m:** Large shopping areas or malls

## Troubleshooting

### Not getting notifications at chain locations?

1. **Check API key is configured**
   - Look for warning in console: "Google Places API key not configured"

2. **Verify location permissions**
   - iOS: Settings → Privacy → Location Services → Forget Me Not → "Always"
   - Android: Settings → Apps → Forget Me Not → Permissions → Location → "Allow all the time"

3. **Check business name**
   - Try the exact name shown on Google Maps
   - Search Google Maps first to see how the business appears

4. **Verify radius settings**
   - Default 5km search radius should cover most areas
   - If in rural areas, you might be too far from nearest location

### API quota exceeded?

Free tier includes $200/month credit:
- Each proximity check uses ~1 request per chain reminder
- At 30-second intervals, that's ~2 requests/minute
- Daily cost: ~$0.05 per active chain reminder
- Monthly: ~$1.50 per active chain reminder

To reduce costs:
- Delete chain reminders you're not actively using
- Use specific location mode when possible

## Privacy & Data

- Your API key is stored locally in the app
- Location data is only checked on your device
- Google Places API receives:
  - Your current coordinates (only when checking proximity)
  - The business name you're searching for
- No location history is stored on servers

## Advanced: Customizing Search Radius

Edit `src/utils/ReminderContext.js` line ~149:

```javascript
const chainMatch = await checkChainProximity(
  currentLocation.latitude,
  currentLocation.longitude,
  reminder.location.name,
  5000, // ← Change this value (in meters)
  reminder.location.radius
);
```

Default is 5000m (5km). You can increase for rural areas or decrease to reduce API usage.

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify API key is valid and Places API is enabled
3. Ensure billing is enabled on Google Cloud (even for free tier)
4. Check location permissions are set to "Always"

## Cost Estimate

**Free tier (most users):**
- $0/month with $200 free credit
- Supports ~133 active chain reminders

**Heavy usage:**
- Each active chain reminder costs ~$1.50/month
- 10 chain reminders = $15/month (still under $200 credit)
