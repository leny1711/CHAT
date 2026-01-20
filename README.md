# Private Chat Dating Application

A dating application focused on emotional connection through private chat conversations. Inspired by a book/novel feeling: slow, intimate, progressive, and calm.

## 🎯 Core Concept

This is NOT a classic dating app. The experience prioritizes:

- **Conversation over images** - Users connect emotionally first, visually later
- **Book-like atmosphere** - Slow, intimate, progressive, calm
- **Private 1-to-1 chat** - The heart of the product
- **Progressive content reveal** - Photos unlock through meaningful interaction
- **Long-term stability** - Designed to handle infinite message history

## 🏗️ Project Structure

This is a monorepo containing:
- `mobile/` - React Native CLI application (Android + iOS)
- `backend/` - Node.js/Express backend with PostgreSQL
- `docs/` - Additional documentation

The application follows **Clean Architecture** principles with clear separation of concerns.

### Mobile App (React Native CLI)

The React Native application lives in the `mobile/` directory with all its code properly organized:

```
mobile/
├── android/             # Android native code
├── ios/                 # iOS native code
├── src/                 # Application source code
│   ├── domain/          # Business logic layer (framework-independent)
│   │   ├── entities/    # Core business entities
│   │   ├── repositories/# Repository interfaces
│   │   └── usecases/    # Application business rules
│   ├── data/            # Data layer
│   │   └── repositories/# Repository implementations (API integration)
│   ├── presentation/    # UI layer
│   │   ├── screens/     # Screen components
│   │   ├── navigation/  # Navigation configuration
│   │   └── theme/       # Design system
│   └── infrastructure/  # External interfaces
│       └── api/         # API client & WebSocket
├── App.tsx              # Application entry point
├── index.js             # React Native entry
└── package.json         # Mobile dependencies
```

### Backend Structure

```
backend/
├── src/
│   ├── config/          # Database & WebSocket configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── .env                 # Environment configuration (PostgreSQL connection)
└── .env.example         # Example environment file
```

See [backend/README.md](backend/README.md) for detailed backend documentation.

### Architecture Layers

1. **Domain Layer** - Pure business logic
   - Entities: User, Message, Conversation, Match
   - Repository interfaces
   - Use cases for each feature

2. **Data Layer** - Data management
   - Repository implementations
   - Local storage (AsyncStorage)
   - API clients (for future backend integration)

3. **Presentation Layer** - UI components
   - Screens with minimal logic
   - Theme configuration
   - Navigation setup

4. **Infrastructure Layer** - External dependencies
   - Dependency injection container
   - Configuration management

## 📱 Features

### Authentication
- User registration with profile creation
- Login/logout functionality
- Secure session management

### Discovery
- Profile browsing with Like/Pass actions
- No fast swiping - deliberate, slow interactions
- Progressive photo reveal concept

### Matching
- Mutual like creates a match
- Match list view
- Direct access to conversations

### Chat System (Critical Feature)
- **Infinite message history** with pagination
- Real-time message updates
- Message persistence
- Offline support ready
- Designed to scale with thousands of messages
- No message loss or sudden resets

### Progressive Content Reveal
- Photos unlock through conversation
- Interaction-based reveal mechanics
- Emotional journey design

### Settings & Privacy
- Profile management
- Privacy controls
- Account settings

## 🎨 Design Philosophy

The UI follows a **book-like, intimate aesthetic**:

- **Colors**: Soft, warm tones (cream, brown, muted gold)
- **Typography**: Gentle, readable fonts with relaxed line height
- **Interactions**: Slow, deliberate, no aggressive animations
- **Layout**: Minimalist, clean, focused
- **Atmosphere**: Calm, safe, trustworthy

### Design Principles

1. **No information overload** - One thing at a time
2. **Soft contrasts** - No bright or violent colors
3. **Gentle interactions** - Smooth, calm transitions
4. **Breathing room** - Generous spacing
5. **Human-centered** - Every element serves connection

## 🚀 Getting Started

**👉 [See QUICK_START.md for a step-by-step guide](QUICK_START.md)**

### Prerequisites

- Node.js 18+
- React Native development environment
- iOS: Xcode 12+
- Android: Android Studio with SDK 29+

### Installation

```bash
# Clone the repository
git clone https://github.com/leny1711/CHAT.git
cd CHAT

# Install backend dependencies
cd backend
npm install
cd ..

# Install mobile app dependencies
cd mobile
npm install

# iOS only - Install pods
cd ios && pod install && cd ../..
```

### Running the Application

#### Start the Backend Server

```bash
# Navigate to backend directory
cd backend

# Create .env file (first time only)
cp .env.example .env

# Start the backend in development mode
npm run dev
```

The backend will start on http://localhost:3000

#### Start the Mobile App

```bash
# In a new terminal, navigate to mobile directory
cd mobile

# Start Metro bundler
npx react-native start

# In another terminal, run on Android
cd mobile
npx react-native run-android
```

**Important**: For Android emulator, update `mobile/src/infrastructure/api/config.ts` to use `http://10.0.2.2:3000` instead of `localhost`.

For physical devices, use your computer's IP address (e.g., `http://192.168.1.100:3000`).

### Development

```bash
# Run tests (from mobile directory)
cd mobile
npm test

# Lint code
npm run lint
```

## 📐 Technical Decisions

### Why Clean Architecture?

- **Maintainability**: Clear boundaries between layers
- **Testability**: Business logic isolated from UI
- **Scalability**: Easy to add features without refactoring
- **Flexibility**: Can swap implementations (e.g., mock → real API)

### Chat System Design

The chat is designed as a **first-class domain** with:

1. **Pagination**: Load messages in chunks (50 at a time)
2. **Cursor-based navigation**: Efficient scrolling through history
3. **Real-time updates**: Subscribe to new messages
4. **Persistence**: All messages saved locally
5. **Scalability**: Can handle thousands of messages per conversation

### Why React Native?

- Cross-platform (iOS & Android)
- Native performance
- Large ecosystem
- Mature navigation and UI libraries

## 🔒 Privacy & Security

- All conversations are private
- No data sharing with third parties
- Secure local storage
- Progressive reveal protects user privacy
- User control over profile visibility

## 🗺️ Roadmap

- [x] Core architecture setup
- [x] Authentication screens
- [x] Discovery flow
- [x] Matching system
- [x] Chat with infinite history
- [x] Settings screen
- [x] **Real backend API integration** ✨
- [x] **WebSocket real-time messaging** ✨
- [ ] Push notifications
- [ ] Photo upload and reveal mechanics
- [ ] User blocking and reporting
- [ ] Message read receipts
- [ ] Typing indicators
- [ ] Profile photo blur effect
- [ ] In-app content moderation

## 📚 Code Structure

### Domain Entities

- **User**: User profile and authentication
- **Message**: Chat messages with status tracking
- **Conversation**: 1-to-1 chat container with pagination support
- **Match**: Mutual like between two users
- **DiscoveryProfile**: Lightweight profile for discovery

### Key Use Cases

- **AuthUseCases**: Login, register, logout
- **MessageUseCases**: Send, load, subscribe to messages
- **MatchUseCases**: Like, pass, get matches

### Repository Pattern

All data access goes through repository interfaces:
- `IUserRepository`
- `IMessageRepository`
- `IMatchRepository`

**NEW**: Repository implementations now connect to the real backend API with:
- JWT authentication
- WebSocket for real-time messaging
- Cursor-based pagination for infinite message history
- Automatic reconnection handling

## 🤝 Contributing

This is a personal project, but feedback and suggestions are welcome!

## 📄 License

MIT

## 👤 Author

Built with care for meaningful human connections.

---

**Remember**: This app is about creating a space for authentic conversation and emotional connection. Every design decision should support that goal.
