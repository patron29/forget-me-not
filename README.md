# Todo Voice App

A full-featured React Native todo application with voice input capabilities, built with Expo.

## Features

- **Voice & Text Input**: Add tasks using voice commands or traditional text input
- **Task Management**: Create, complete, and delete tasks with ease
- **Due Dates**: Set due dates for tasks with visual indicators (overdue, today, upcoming)
- **Text-to-Speech**: Listen to your tasks read aloud
- **History Tracking**: View completed tasks with filtering options (All, Today, Week, Month)
- **Calendar View**: Visualize tasks on a calendar with color-coded markers
- **Persistent Storage**: All tasks are saved locally using AsyncStorage
- **Cross-Platform**: Runs on iOS, Android, and Web

## Screenshots

### My Tasks
- Add new tasks with voice or text
- Set due dates for tasks
- Mark tasks as complete
- Visual indicators for overdue and upcoming tasks

### History
- View all completed tasks
- Filter by time period
- See completion statistics
- Clear all completed tasks

### Calendar
- Interactive calendar view
- Color-coded task markers (due dates, completed, created)
- Select any date to view tasks
- Legend showing marker meanings

## Tech Stack

- **React Native** 0.81.5
- **Expo** SDK 54
- **React Navigation** - Bottom tabs navigation
- **AsyncStorage** - Local data persistence
- **Expo Speech** - Text-to-speech functionality
- **Expo AV** - Audio recording (for future voice implementation)
- **React Native Calendars** - Calendar component
- **DateTimePicker** - Date selection

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
npm run web        # Web browser
```

### Running on Web

```bash
npm run web
```

Then open [http://localhost:8081](http://localhost:8081) in your browser.

### Running on Mobile

1. Install Expo Go on your device:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Start the development server:
   ```bash
   npm start
   ```

3. Scan the QR code with Expo Go

## Project Structure

```
todo-voice-app/
├── src/
│   ├── components/
│   │   ├── TodoItem.js       # Individual task component
│   │   └── VoiceInput.js     # Voice recording button
│   ├── screens/
│   │   ├── TodoListScreen.js # Main task list view
│   │   ├── HistoryScreen.js  # Completed tasks view
│   │   └── CalendarScreen.js # Calendar view
│   └── utils/
│       └── TodoContext.js    # Global state management
├── assets/                   # App icons and images
├── App.js                    # Root component
├── app.json                  # Expo configuration
└── package.json             # Dependencies

```

## Voice Input

Currently, the voice input feature uses a placeholder implementation. To add full speech-to-text functionality, integrate one of these services:

- [@react-native-voice/voice](https://github.com/react-native-voice/voice) - React Native plugin
- Google Cloud Speech-to-Text API
- AWS Transcribe
- Azure Speech Services

## Future Enhancements

- [ ] Full voice recognition integration
- [ ] Task editing functionality
- [ ] Categories and tags
- [ ] Push notifications for due tasks
- [ ] Search and advanced filtering
- [ ] Dark mode support
- [ ] Cloud sync across devices
- [ ] Recurring tasks
- [ ] Subtasks and task dependencies

## License

MIT

## Acknowledgments

Built with Claude Code
