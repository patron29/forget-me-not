# Forget Me Not

A location-based reminder app that sends you notifications when you arrive at specific places. Never forget to buy something or do a task when you're at the right location!

## Concept

**Forget Me Not** helps you remember tasks at the perfect moment - when you're at the right place. Set a reminder like "Buy BPO" at CVS, and the app will automatically notify you when you arrive at that location.

### Example Use Cases

- 🏪 "Buy milk" when at the grocery store
- 💊 "Pick up prescription" at the pharmacy
- 📬 "Mail package" at the post office
- ⚽ "Return library books" at the library
- 🏋️ "Bring water bottle" at the gym
- 🏢 "Submit expense report" at work

## Features

- **Location-Based Reminders**: Set reminders tied to specific locations
- **Automatic Geofencing**: Get notified when you enter the location radius
- **Voice & Text Input**: Add reminders using voice commands or text
- **Current Location Detection**: Quickly select your current location
- **Custom Radius**: Set how close you need to be (50-1000 meters)
- **Location Groups**: View all reminders organized by location
- **History Tracking**: See completed reminders with timestamps
- **Text-to-Speech**: Listen to your reminders read aloud
- **Background Location Tracking**: Works even when the app is closed
- **Persistent Storage**: All reminders are saved locally

## How It Works

1. **Create a Reminder**: Enter what you need to remember (e.g., "Buy BPO")
2. **Select Location**: Choose the place where you want to be reminded (e.g., "CVS Pharmacy")
3. **Set Radius**: Define how close you need to be (default: 200 meters)
4. **Get Notified**: When you arrive at the location, you'll receive a notification
5. **Mark Complete**: Check off the reminder when done

## Screens

### Reminders Tab
- View all active location-based reminders
- Add new reminders with voice or text input
- See location names and addresses for each reminder
- Track how many times a reminder has been triggered

### History Tab
- View completed reminders
- Filter by time period (All, Today, Week, Month)
- See completion statistics
- Clear history when needed

### Locations Tab
- View reminders grouped by location
- See active and completed counts per location
- Quickly access all reminders for a specific place

## Tech Stack

- **React Native** 0.81.5
- **Expo** SDK 54
- **Expo Location** - Geolocation and geofencing
- **Expo Notifications** - Local push notifications
- **Expo Task Manager** - Background location tracking
- **React Navigation** - Bottom tabs navigation
- **AsyncStorage** - Local data persistence
- **Expo Speech** - Text-to-speech functionality

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Expo Go app (for mobile testing)

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on specific platform
npm run ios        # iOS simulator
npm run android    # Android emulator
npm run web        # Web browser (limited functionality)
```

### Permissions Required

The app requires the following permissions:

- **Location (Foreground)**: To detect your current location when adding reminders
- **Location (Background)**: To track location and send notifications when you arrive at reminder locations
- **Notifications**: To send you reminders when you reach a location

## Project Structure

```
forget-me-not/
├── src/
│   ├── components/
│   │   ├── ReminderItem.js      # Individual reminder component
│   │   ├── VoiceInput.js        # Voice recording button
│   │   └── LocationPicker.js    # Location selection modal
│   ├── screens/
│   │   ├── ReminderListScreen.js    # Main reminders view
│   │   ├── ReminderHistoryScreen.js # Completed reminders
│   │   └── LocationsScreen.js       # Location groups view
│   └── utils/
│       └── ReminderContext.js   # Global state & geofencing
├── assets/                      # App icons and images
├── App.js                       # Root component
├── app.json                     # Expo configuration
└── package.json                 # Dependencies
```

## How Geofencing Works

The app uses Expo Location's geofencing capabilities to monitor your location in the background:

1. **Background Tracking**: The app tracks your location even when closed (with permission)
2. **Radius Detection**: Calculates distance to each reminder location using the Haversine formula
3. **Notification Trigger**: Sends a notification when you're within the specified radius
4. **Battery Optimized**: Uses balanced accuracy to minimize battery drain

## Limitations

- **Web Version**: Location tracking and notifications have limited functionality in web browsers
- **Battery Usage**: Background location tracking can impact battery life
- **iOS Background Restrictions**: iOS has strict rules about background location tracking
- **Android Doze Mode**: Android's battery optimization may limit background tracking

## Privacy & Data

- All location data and reminders are stored locally on your device
- No data is sent to external servers
- Location tracking only occurs for active reminders
- You can disable location permissions at any time

## Future Enhancements

- [ ] Smart location suggestions based on history
- [ ] Recurring reminders for frequent locations
- [ ] Categories and tags for reminders
- [ ] Map view showing all reminder locations
- [ ] Share locations with others
- [ ] Cloud sync across devices
- [ ] Smart notifications (don't alert if recently triggered)
- [ ] Integration with calendar events
- [ ] Popular places database (e.g., major retail chains)
- [ ] Voice recognition for hands-free reminder creation

## Troubleshooting

### Notifications Not Working

1. Check that notification permissions are enabled
2. Ensure background location permission is granted
3. On iOS, make sure "Always Allow" location access is selected
4. Check that the app isn't being killed by battery optimization

### Location Not Updating

1. Verify location permissions are granted
2. Check that location services are enabled on your device
3. Try increasing the radius for reminders
4. Ensure the app has background location permission

## License

MIT

## Acknowledgments

Built with Claude Code

---

**Forget Me Not** - Because your phone knows where you are, so your reminders should too.
