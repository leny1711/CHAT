# Clean React Native CLI Mobile Application

A **minimal, stable, and frozen** React Native CLI project for Android development.

## 🎯 Project Philosophy

This project follows these principles:
- **Stability over features** - All dependencies are FROZEN at exact versions
- **No casual upgrades** - Version changes require compatibility verification
- **Minimal setup** - Essential dependencies only
- **Clean foundation** - Ready for incremental feature additions

## 📦 What's Included

- React Native 0.73.0 (CLI, not Expo) - **FROZEN**
- React Navigation for screen navigation
- AsyncStorage for local data persistence
- React Native Screens and Safe Area Context
- Android build configuration (Java 17, Gradle 8.3, Kotlin 1.8.0)
- Hermes JavaScript engine enabled

## ⚠️  CRITICAL STABILITY WARNINGS

### Dependency Management
- **DO NOT upgrade React Native or native dependencies** without thorough compatibility testing
- **DO NOT use `npm update` or `npm upgrade`** - versions are intentionally frozen
- **DO NOT delete package-lock.json** - it ensures reproducible builds
- **DO NOT change versions using `^` or `~`** - only exact versions are allowed

### Android Configuration
- **DO NOT enable new architecture** (newArchEnabled must stay false)
- **DO NOT enable Fabric or TurboModules**
- **DO NOT modify Kotlin, Gradle, or Android Gradle Plugin versions** without review
- **DO NOT add experimental flags**

### Why These Restrictions?
This project prioritizes **build stability and reliability** over new features. Casual dependency upgrades can introduce:
- Native module incompatibilities
- Kotlin compilation errors
- Build failures
- Runtime crashes on devices

All versions have been tested and verified to work together on real Android devices.

## 🚀 Getting Started

### Prerequisites

1. **Node.js 18+** installed
2. **Java 17** (OpenJDK 17 recommended)
3. **Android SDK** properly configured
4. Set `ANDROID_HOME` environment variable
5. A **real Android device** with USB debugging enabled (or Android emulator)

### Installation

```bash
# Install ALL dependencies from the lockfile (recommended for production)
npm ci

# OR for development (installs from lockfile but allows flexibility)
npm install
```

**⚠️  IMPORTANT NOTES:**
- Use `npm ci` for reproducible builds (installs directly from package-lock.json)
- Never delete `package-lock.json` - it guarantees consistent builds
- All dependency versions are frozen - do not upgrade without testing
- Native linking happens automatically during the Android build process

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
├── android/           # Android native code (FROZEN configuration)
├── App.tsx            # Main application component
├── index.js           # React Native entry point
├── package.json       # Dependencies (ALL FROZEN at exact versions)
├── package-lock.json  # Lockfile (NEVER delete this)
└── babel.config.js    # Babel configuration
```

## 🔒 Frozen Dependencies

All dependencies are locked at exact versions for maximum stability:

### Core
- **react**: 18.2.0
- **react-native**: 0.73.0

### Navigation (Native Dependencies)
- **@react-navigation/native**: 6.1.9
- **@react-navigation/native-stack**: 6.9.17
- **@react-navigation/bottom-tabs**: 6.5.11
- **react-native-screens**: 3.29.0 ⚠️  Native module
- **react-native-safe-area-context**: 4.8.2 ⚠️  Native module

### Storage
- **@react-native-async-storage/async-storage**: 1.21.0 ⚠️  Native module

### Android Build Environment
- **Gradle**: 8.3
- **Android Gradle Plugin**: 8.1.1
- **Kotlin**: 1.8.0
- **Java**: 17

**These versions are verified compatible with React Native 0.73.0 on real Android devices.**

## ✅ Verification

The app successfully:
- ✅ Builds on Android without errors
- ✅ Creates a working APK (debug build)
- ✅ Runs on real Android devices
- ✅ Uses Hermes JavaScript engine
- ✅ All dependencies frozen at exact compatible versions
- ✅ No Kotlin compilation errors
- ✅ No native module conflicts

## 🔨 Building

```bash
# Debug build
cd android && ./gradlew assembleDebug

# The APK will be at:
# android/app/build/outputs/apk/debug/app-debug.apk
```

## 📝 Next Steps

Now that you have a stable, frozen foundation:

1. ✅ **Build features with existing dependencies** - Use what's already installed
2. ✅ **Test thoroughly on real devices** - Every change must be validated
3. ✅ **Avoid adding new dependencies** - Use built-in capabilities first
4. ⚠️  **Never upgrade casually** - Stability over new features

### If You MUST Add/Upgrade Dependencies (Not Recommended)

**Only proceed if absolutely necessary:**

1. Research React Native 0.73.0 compatibility thoroughly
2. Check native module requirements (Kotlin, Gradle versions)
3. Test on multiple real Android devices
4. Verify no Kotlin compilation errors
5. Update package.json with exact version (no `^` or `~`)
6. Regenerate package-lock.json
7. Document the change and reason
8. **Be prepared to rollback if issues occur**

### Priority Order for Changes

1. **Highest**: Bug fixes using existing dependencies
2. **Medium**: UI/UX improvements with current libraries
3. **Low**: Adding new dependencies (requires thorough review)
4. **Avoid**: Upgrading React Native or core native modules

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
