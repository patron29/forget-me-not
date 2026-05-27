# Google Play Store Assets Guide

This guide helps you create all the required assets for your Google Play Store listing.

---

## Required Assets Checklist

| Asset | Size | Status | Location |
|-------|------|--------|----------|
| App Icon | 512 x 512 px | ✅ Ready | `assets/store/icon-512.png` |
| Feature Graphic | 1024 x 500 px | ❌ Need to create | - |
| Phone Screenshots | 1080 x 1920 px (or 9:16) | ❌ Need to capture | - |

---

## 1. App Icon (✅ Complete)

Your 512x512 icon has been created at:
```
assets/store/icon-512.png
```

---

## 2. Feature Graphic (1024 x 500 px)

This is the banner that appears at the top of your Play Store listing.

### Design Tips:
- Include your app name "Forget Me Not"
- Use your brand colors (primary: #4A7BFF)
- Add a tagline like "Never forget errands again"
- Optionally include a phone mockup showing the app

### Free Tools to Create:
1. **Canva** (easiest): https://www.canva.com
   - Search for "Google Play Feature Graphic" template
   - Customize with your colors and text

2. **Figma** (free): https://www.figma.com
   - Create a 1024x500 frame
   - Design your banner

### Suggested Design:
```
┌──────────────────────────────────────────────────────────┐
│  [Background: Gradient #4A7BFF to #6B93FF]               │
│                                                          │
│   🔔 Forget Me Not                                       │
│                                                          │
│   Location-based reminders                               │
│   that actually work                                     │
│                                                          │
│                          [Phone mockup with app screen]  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 3. Screenshots (Phone)

You need **minimum 2, maximum 8** screenshots.

### Recommended Screenshots (in order):

1. **Main Reminders Screen** - Show the reminder list with a few example reminders
2. **Add Reminder Flow** - Show the location picker modal
3. **Location Search** - Show searching for a location
4. **Chain Mode** - Show the chain/franchise mode feature (PRO badge visible)
5. **History Screen** - Show completed reminders
6. **Locations Screen** - Show reminders grouped by location
7. **Settings Screen** - Show dark mode toggle and premium card
8. **Dark Mode** - Show the app in dark mode

### Screenshot Specifications:
- **Size:** Minimum 320px, maximum 3840px on any side
- **Recommended:** 1080 x 1920 px (9:16 ratio) for phones
- **Format:** PNG or JPEG
- **No transparency:** Must have a solid background

### How to Capture Screenshots:

#### Option A: Using Android Emulator (Recommended)
```bash
# Start your app
npx expo start

# Press 'a' to open Android emulator
# Navigate to each screen and take screenshots

# Screenshots will be saved to your Desktop (Cmd+S in emulator)
```

#### Option B: Using a Physical Device
1. Connect your Android device
2. Run the app: `npx expo start --android`
3. Navigate to each screen
4. Take screenshot: Power + Volume Down

#### Option C: Using Expo Go
1. Open your app in Expo Go
2. Use device screenshot function
3. Transfer to computer

### Screenshot Best Practices:

1. **Use realistic data** - Don't leave screens empty
2. **Show the value** - Each screenshot should demonstrate a feature
3. **Consistent style** - Use same theme (light or dark) across most shots
4. **Add captions** - Consider adding text overlays explaining features

### Adding Device Frames (Optional but Professional):

Use these free tools to add phone frames:
- **MockUPhone**: https://mockuphone.com
- **Previewed**: https://previewed.app
- **Device Frames** (Figma plugin)

---

## 4. Store Listing Text

### App Name (30 chars max):
```
Forget Me Not
```

### Short Description (80 chars max):
```
Location-based reminders that notify you when you arrive at places.
```

### Full Description (4000 chars max):
```
Never forget errands again! Forget Me Not reminds you of tasks when you arrive at specific locations.

🎯 HOW IT WORKS
Simply create a reminder, pick a location, and we'll notify you when you arrive. It's that simple!

✨ KEY FEATURES

📍 Location-Based Reminders
Create reminders tied to specific places. Get notified automatically when you arrive at the grocery store, pharmacy, or any location you choose.

🏪 Chain/Franchise Mode (Premium)
Set a reminder for "any CVS" or "any Starbucks" - we'll notify you when you arrive at ANY location of that business, not just one specific store.

📌 Multiple Locations (Premium)
Add multiple locations to a single reminder. Perfect for errands that can be done at different places.

🌙 Dark Mode
Easy on the eyes with full dark mode support.

🔔 Smart Notifications
Background location tracking ensures you never miss a reminder, even when the app is closed.

💎 PREMIUM FEATURES
• Unlimited reminders (free version: 5)
• Chain/franchise mode
• Multiple locations per reminder

🔒 PRIVACY FIRST
Your data stays on your device. We don't upload your locations or reminders to any server.

Stop forgetting. Start remembering.
Download Forget Me Not today!
```

---

## 5. Tablet Screenshots (Optional)

If you want to support tablets:
- **7-inch tablet:** 1024 x 600 px minimum
- **10-inch tablet:** 1280 x 800 px minimum

---

## 6. Content Rating

When filling out the content rating questionnaire:
- **Violence:** None
- **Sexual Content:** None
- **Language:** None
- **Controlled Substance:** None
- **User Interaction:** None (no user-to-user communication)
- **Location Sharing:** Yes (app uses location)
- **Personal Information:** Collects location data (stored locally only)

**Expected Rating:** Everyone (E)

---

## 7. Data Safety Form

Google requires you to declare what data your app collects:

### Data Collected:
| Data Type | Collected | Shared | Purpose |
|-----------|-----------|--------|---------|
| Approximate location | Yes | No | App functionality |
| Precise location | Yes | No | App functionality |

### Data NOT Collected:
- Personal info (name, email, etc.)
- Financial info
- Health info
- Messages
- Photos/videos
- Audio
- Files
- Calendar
- Contacts
- App activity
- Web browsing
- Device identifiers

### Security Practices:
- ✅ Data is encrypted in transit
- ✅ Data can be deleted (by uninstalling app)
- ❌ Data is NOT shared with third parties

---

## Quick Checklist Before Submission

- [ ] App icon (512x512) uploaded
- [ ] Feature graphic (1024x500) uploaded
- [ ] At least 2 phone screenshots uploaded
- [ ] Short description filled in
- [ ] Full description filled in
- [ ] Privacy policy URL added
- [ ] Content rating questionnaire completed
- [ ] Data safety form completed
- [ ] App category selected (Productivity)
- [ ] Contact email provided
- [ ] AAB file uploaded

---

## Need Help?

For the feature graphic and screenshots, you can use:
- **Canva** (free): Great templates for app store graphics
- **Figma** (free): Professional design tool
- **App Mockup** (free): https://app-mockup.com

Good luck with your launch! 🚀
