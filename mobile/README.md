# Clean React Native CLI Mobile Application

A **minimal, stable, and clean** React Native CLI project for Android development.

## 🎯 Project Philosophy

This project follows these principles:
- **Stability over features** - Only essential dependencies
- **Minimal setup** - No navigation, no animations, no extra libraries
- **Clean foundation** - Ready for incremental feature additions

## 📦 What's Included

- React Native 0.73.0 (CLI, not Expo)
- Default React Native screen with simple UI
- Android build configuration (Java 17)
- Hermes JavaScript engine enabled

## ❌ What's NOT Included

This project explicitly avoids:
- ❌ React Navigation
- ❌ react-native-reanimated
- ❌ react-native-gesture-handler
- ❌ react-native-screens
- ❌ AsyncStorage or other storage libraries
- ❌ Any animation libraries
- ❌ Any navigation libraries

These can be added later if needed, one at a time, with careful consideration.

## 🚀 Getting Started

### Prerequisites

1. **Node.js 18+** installed
2. **Java 17** (OpenJDK 17 recommended)
3. **Android SDK** properly configured
4. Set `ANDROID_HOME` environment variable
5. A **real Android device** with USB debugging enabled (or Android emulator)

### Installation

```bash
# Install dependencies
npm install
```

### Running the App

#### Option 1: Using React Native CLI (Recommended)

```bash
# Start Metro bundler in one terminal
npm start

# In another terminal, build and run on Android
npm run android
```

#### Option 2: Using Gradle directly

```bash
# Build the APK
cd android
./gradlew assembleDebug

# Install on connected device
adb install app/build/outputs/apk/debug/app-debug.apk
```

#### Option 3: Manual APK installation

If you already built the APK, you can:

1. Connect your Android device via USB
2. Enable USB debugging on your device
3. Copy the APK: `android/app/build/outputs/apk/debug/app-debug.apk`
4. Install it: `adb install android/app/build/outputs/apk/debug/app-debug.apk`

Or transfer the APK to your device and install it manually.

### Development

Once the app is running:

1. Edit `App.tsx` to make changes
2. Shake your device or press <kbd>Ctrl</kbd> + <kbd>M</kbd> to open the Developer Menu
3. Select **"Reload"** to see your changes

## 📂 Project Structure

```
mobile/
├── android/           # Android native code
├── App.tsx            # Main application component (simple, clean)
├── index.js           # React Native entry point
├── package.json       # Dependencies (minimal)
└── babel.config.js    # Babel configuration (no plugins)
```

## ✅ Verification

The app successfully:
- ✅ Builds on Android without errors
- ✅ Creates a working APK (52MB debug build)
- ✅ Runs on real Android devices
- ✅ Displays a clean default screen
- ✅ Uses only React and React Native core dependencies

## 🔨 Building

```bash
# Debug build
cd android && ./gradlew assembleDebug

# The APK will be at:
# android/app/build/outputs/apk/debug/app-debug.apk
```

## 📝 Next Steps

Now that you have a stable foundation, you can:

1. ✅ **Add features incrementally** - One dependency at a time
2. ✅ **Test thoroughly** - Ensure each addition doesn't break the build
3. ✅ **Keep it simple** - Only add what you actually need

### Adding Features Later (Carefully)

When you're ready to add features:

- **Navigation**: Consider React Navigation or simple component switching
- **Storage**: Add AsyncStorage only when needed
- **Animations**: Only if required for UX, test thoroughly
- **Backend**: Add API client libraries when connecting to services

## 🛠️ Troubleshooting

### Metro bundler issues
```bash
# Clear cache
npm start -- --reset-cache
```

### Build issues
```bash
# Clean build
cd android && ./gradlew clean
```

### Device not detected
```bash
# Check connected devices
adb devices
```

## 📚 Learn More

- [React Native Website](https://reactnative.dev) - Official documentation
- [React Native Environment Setup](https://reactnative.dev/docs/environment-setup) - Setup guide
