# Quick Start Guide - Clean React Native CLI App

## 🎯 What This Is

A **minimal, stable React Native CLI** application for Android - no navigation, no animations, no extra dependencies.

## ⚡ Quick Commands

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies (first time only)
npm install

# Start development
npm start                  # Start Metro bundler (in one terminal)
npm run android           # Run on Android device (in another terminal)

# Or build APK directly
cd android
./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

## 📋 Prerequisites

- ✅ Node.js 18+
- ✅ Java 17 (OpenJDK)
- ✅ Android SDK with ANDROID_HOME set
- ✅ Android device with USB debugging OR emulator

## ✅ What's Included

- React Native 0.73.0
- React 18.2.0
- Clean default screen
- Android build support

## ❌ What's NOT Included

- ❌ Navigation libraries
- ❌ react-native-reanimated
- ❌ react-native-gesture-handler
- ❌ react-native-screens
- ❌ AsyncStorage
- ❌ Any animation libraries

## 📖 Full Documentation

- **Setup Details**: See `CLEAN_SETUP_COMPLETE.md`
- **Mobile App**: See `mobile/README.md`

## 🎯 Success!

If you can run `npm run android` and see the app on your device, **you're done!** ✅

The app is now ready for you to add features incrementally, one dependency at a time.
