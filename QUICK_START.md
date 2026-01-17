# Dating App Quick Start Guide

Welcome! This guide will help you get the dating app running on your machine in under 10 minutes.

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ installed ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- For iOS development:
  - macOS
  - Xcode 12+ ([Download](https://developer.apple.com/xcode/))
  - CocoaPods (`sudo gem install cocoapods`)
- For Android development:
  - Android Studio ([Download](https://developer.android.com/studio))
  - Android SDK 29+
  - Android emulator or physical device

## 🚀 Quick Start Steps

### Step 1: Clone the Repository

```bash
git clone https://github.com/leny1711/CHAT.git
cd CHAT
```

### Step 2: Install Mobile App Dependencies

```bash
cd mobile
npm install

# For iOS only
cd ios && pod install && cd ..

cd ..
```

### Step 3: Set Up the Backend

```bash
cd backend
npm install

# Create environment file
cp .env.example .env

# The default configuration works for local development
# PORT=3000
# JWT_SECRET=dating-app-secret-key-change-in-production-123456
# NODE_ENV=development
# DATABASE_PATH=./data/app.db
```

### Step 4: Start the Backend Server

```bash
# In the backend directory
npm run dev
```

You should see:
```
========================================
🚀 Dating App Backend Server Running
========================================
HTTP API: http://localhost:3000
WebSocket: ws://localhost:3000/ws
Environment: development
========================================
```

**Keep this terminal open!** The backend needs to run while using the app.

### Step 5: Configure Mobile App for Your Platform

The mobile app needs to know where to find the backend. The starter screen in
`/mobile` runs offline; when you wire up the existing `/src` infrastructure,
configure the API host below.

#### For iOS Simulator (default)
No changes needed! Uses `http://localhost:3000`

#### For Android Emulator
Edit `src/infrastructure/api/config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? 'http://10.0.2.2:3000' // Changed for Android emulator
    : 'https://your-production-api.com',
  WS_URL: __DEV__
    ? 'ws://10.0.2.2:3000/ws' // Changed for Android emulator
    : 'wss://your-production-api.com/ws',
  TIMEOUT: 10000,
};
```

#### For Physical Device
Find your computer's IP address and update the config:

```bash
# On macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# On Windows
ipconfig
```

Then update `src/infrastructure/api/config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? 'http://192.168.1.100:3000' // Use your IP
    : 'https://your-production-api.com',
  WS_URL: __DEV__
    ? 'ws://192.168.1.100:3000/ws' // Use your IP
    : 'wss://your-production-api.com/ws',
  TIMEOUT: 10000,
};
```

### Step 6: Start the Mobile App

Open a **new terminal** (keep the backend running):

```bash
cd CHAT  # Go back to project root

# Start Metro bundler
cd mobile
npx react-native start
```

In **another new terminal**:

```bash
# For iOS
npx react-native run-ios

# For Android
npx react-native run-android
```

## ✅ Test the Complete Flow

Once the app is running, you can test the entire flow:

### 1. Register Two Users

**User 1 - Alice:**
- Tap "Create Account"
- Email: `alice@test.com`
- Password: `password123`
- Name: `Alice`
- Age: `25`
- Bio: `Love reading and conversations`
- Tap "Register"

**User 2 - Bob:**
- Log out Alice (Settings → Logout)
- Register with:
  - Email: `bob@test.com`
  - Password: `password123`
  - Name: `Bob`
  - Age: `27`
  - Bio: `Coffee enthusiast`

### 2. Create a Match

**As Bob:**
- Go to Discovery screen
- You should see Alice's profile
- Tap "❤️ Like"

**As Alice:**
- Log out Bob, log in as Alice
- Go to Discovery screen
- You should see Bob's profile
- Tap "❤️ Like"
- 🎉 You should see "It's a Match!" notification

### 3. Start a Conversation

**As Alice or Bob:**
- Go to "Matches" tab
- You should see your match
- Tap on the match to open the conversation
- Send messages back and forth

### 4. Test Real-time Messaging

To test WebSocket real-time messaging:
1. Run the app on two devices/simulators simultaneously
2. Log in as Alice on device 1
3. Log in as Bob on device 2
4. Open the conversation on both
5. Send messages from either device
6. Messages should appear instantly on the other device! ⚡

## 🔧 Troubleshooting

### Backend won't start
- Make sure port 3000 is not already in use
- Check that you're in the `backend` directory
- Delete `node_modules` and run `npm install` again

### Mobile app can't connect to backend
- Ensure the backend is running (check terminal)
- Verify the API URL in `src/infrastructure/api/config.ts`
- For Android emulator, use `10.0.2.2` not `localhost`
- For physical devices, use your computer's IP address
- Check that your device and computer are on the same network

### "Network request failed" error
- Backend might not be running
- Wrong API URL configuration
- Firewall might be blocking the connection

### Database errors
- Delete `backend/data/app.db` and restart the backend
- This will create a fresh database

### Can't build iOS app
- Make sure you ran `pod install` in the `ios` directory
- Try cleaning: `cd ios && xcodebuild clean && cd ..`

### Can't build Android app
- Make sure Android SDK is installed
- Check that `ANDROID_HOME` environment variable is set
- Try cleaning: `cd android && ./gradlew clean && cd ..`

## 📱 What's Working

After completing these steps, you have a fully functional dating app with:

✅ User registration and authentication
✅ JWT-based secure sessions
✅ Profile discovery
✅ Like/Pass functionality
✅ Automatic matching
✅ Private 1-to-1 conversations
✅ Real-time messaging via WebSocket
✅ Message persistence in SQLite
✅ Infinite message history with pagination
✅ Offline message queueing
✅ Automatic reconnection

## 🎯 Next Steps

Now that you have the app running, you can:

1. **Customize the design** - Edit `src/presentation/theme/theme.ts`
2. **Add more features** - Check the architecture in `README.md`
3. **Deploy to production** - See backend `README.md` for deployment tips
4. **Add photo uploads** - Implement file upload in backend
5. **Add push notifications** - Integrate Firebase Cloud Messaging

## 📚 Learn More

- [Main README](README.md) - Complete project overview
- [Backend README](backend/README.md) - Backend API documentation
- [Architecture Documentation](docs/ARCHITECTURE.md) - System design
- [Chat System Details](docs/CHAT_SYSTEM.md) - Infinite chat implementation

## 🆘 Need Help?

If you run into issues:

1. Check the troubleshooting section above
2. Look at backend logs for API errors
3. Check Metro bundler output for mobile app errors
4. Open an issue on GitHub

## 🎉 You're All Set!

Congratulations! You now have a fully functional dating app with:
- A real backend API
- Real-time messaging
- Persistent data storage
- Production-ready architecture

Start building your unique features! 🚀
