# Getting Started Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18 or higher
- **npm** or **yarn**: Package manager
- **React Native CLI**: For building and running the app
- **iOS Development** (Mac only):
  - Xcode 12 or higher
  - CocoaPods
- **Android Development**:
  - Android Studio
  - Android SDK (API level 29 or higher)
  - Java Development Kit (JDK) 11

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/leny1711/CHAT.git
cd CHAT
```

### 2. Install Dependencies

```bash
npm install
```

### 3. iOS Setup (Mac only)

```bash
cd ios
pod install
cd ..
```

## Running the Application

### Start Metro Bundler

In the project root directory:

```bash
npm start
```

### Run on iOS

In a new terminal:

```bash
npm run ios
```

Or specify a simulator:

```bash
npm run ios -- --simulator="iPhone 15 Pro"
```

### Run on Android

Make sure you have an Android emulator running or a device connected:

```bash
npm run android
```

## Development

### Project Structure

```
CHAT/
├── src/
│   ├── domain/           # Business logic (entities, use cases)
│   ├── data/             # Data layer (repositories)
│   ├── presentation/     # UI components and screens
│   └── infrastructure/   # Config and DI
├── docs/                 # Documentation
├── App.tsx               # App entry point
└── package.json          # Dependencies
```

### Available Scripts

- `npm start` - Start Metro bundler
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm test` - Run tests
- `npm run lint` - Run ESLint

## First Steps

### 1. Register a New Account

1. Launch the app
2. Tap "Don't have an account? Create one"
3. Fill in:
   - Name
   - Age (18+)
   - Email
   - Password
   - Bio (optional)
4. Tap "Create Account"

### 2. Discover Profiles

1. You'll be taken to the Discovery screen
2. Review profiles one at a time
3. Tap "Like" if interested or "Pass" to continue
4. Take your time - this is intentionally slow and deliberate

### 3. When You Match

1. When both users like each other, a match is created
2. Navigate to the "Matches" tab to see your matches
3. Tap a match to open the private conversation

### 4. Start Chatting

1. The conversation screen is the heart of the app
2. Type your message and tap "Send"
3. Messages are saved locally
4. Scroll up to load older messages (infinite history)
5. The conversation persists across app restarts

## Understanding the Application

### Key Concepts

**Emotional Connection First**
- This app prioritizes conversation over images
- Photos are revealed progressively through interaction
- Focus on getting to know someone through text

**Book-Like Experience**
- Slow, intimate, progressive
- Calm color palette and gentle typography
- No aggressive UX or addictive mechanics

**Private 1-to-1 Chat**
- Each match has its own private conversation
- Messages are never deleted
- Infinite message history supported
- No group chats or public feeds

### Features

✅ **Implemented:**
- User authentication (register/login)
- Profile management
- Discovery with Like/Pass
- Matching system
- Infinite chat with pagination
- Message persistence
- Settings

🔜 **Coming Soon:**
- Backend API integration
- Push notifications
- Photo upload and progressive reveal
- Real-time WebSocket messaging
- Offline message queue
- User blocking and reporting

## Troubleshooting

### iOS Issues

**Problem:** `pod install` fails
**Solution:**
```bash
cd ios
pod deintegrate
pod install
cd ..
```

**Problem:** Build fails in Xcode
**Solution:** Clean build folder (Cmd+Shift+K) and rebuild

### Android Issues

**Problem:** Build fails
**Solution:**
```bash
cd android
./gradlew clean
cd ..
```

**Problem:** Metro bundler connection issues
**Solution:**
```bash
adb reverse tcp:8081 tcp:8081
```

### Common Issues

**Problem:** Dependencies not found
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Problem:** Metro bundler cache issues
**Solution:**
```bash
npm start -- --reset-cache
```

## Testing

### Run Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm test -- --watch
```

### Run Tests with Coverage

```bash
npm test -- --coverage
```

## Code Style

The project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety

### Lint Code

```bash
npm run lint
```

### Fix Linting Issues

```bash
npm run lint -- --fix
```

## Architecture Overview

This app follows **Clean Architecture**:

1. **Domain Layer**: Business entities and rules (User, Message, Match)
2. **Data Layer**: Repository implementations (currently mock data)
3. **Presentation Layer**: React Native UI components
4. **Infrastructure Layer**: Configuration and dependency injection

See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed documentation.

## Key Features

### Infinite Chat System

The chat is designed to handle unlimited message history:

- **Cursor-based pagination**: Load messages in chunks of 50
- **Efficient rendering**: React Native FlatList virtualization
- **Local persistence**: All messages saved with AsyncStorage
- **Real-time updates**: Subscribe to new messages
- **Scalability**: Can handle 10,000+ messages per conversation

See [CHAT_SYSTEM.md](docs/CHAT_SYSTEM.md) for technical details.

### Progressive Content Reveal

Photos are not immediately visible:

- Content unlocks through conversation
- Interaction-based reveal mechanics
- Emotional connection before visual connection

## Contributing

This is a personal project, but suggestions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Need Help?

- Check the [README.md](README.md) for an overview
- Read [ARCHITECTURE.md](docs/ARCHITECTURE.md) for architecture details
- Review [CHAT_SYSTEM.md](docs/CHAT_SYSTEM.md) for chat system design
- Open an issue on GitHub for bugs or questions

## Next Steps

1. **Explore the code**: Start with `src/presentation/screens/`
2. **Read the docs**: Check the `docs/` folder
3. **Run the tests**: `npm test`
4. **Make it yours**: Customize colors in `src/presentation/theme/theme.ts`

---

**Remember**: This app is about creating meaningful connections. Every feature should support authentic conversation and emotional bonding.

Happy coding! 📱💬
