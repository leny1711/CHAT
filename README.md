# Private Chat Dating Application

A dating application focused on emotional connection through private chat conversations. Inspired by a book/novel feeling: slow, intimate, progressive, and calm.

## 🎯 Core Concept

This is NOT a classic dating app. The experience prioritizes:

- **Conversation over images** - Users connect emotionally first, visually later
- **Book-like atmosphere** - Slow, intimate, progressive, calm
- **Private 1-to-1 chat** - The heart of the product
- **Progressive content reveal** - Photos unlock through meaningful interaction
- **Long-term stability** - Designed to handle infinite message history

## 🏗️ Architecture

The application follows **Clean Architecture** principles with clear separation of concerns:

```
src/
├── domain/              # Business logic layer (framework-independent)
│   ├── entities/        # Core business entities
│   ├── repositories/    # Repository interfaces
│   └── usecases/        # Application business rules
├── data/                # Data layer
│   └── repositories/    # Repository implementations
├── presentation/        # UI layer
│   ├── screens/         # Screen components
│   ├── components/      # Reusable UI components
│   ├── navigation/      # Navigation configuration
│   └── theme/           # Design system
└── infrastructure/      # External interfaces
    ├── di/              # Dependency injection
    └── config/          # Configuration files
```

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

# Install dependencies
npm install

# iOS only - Install pods
cd ios && pod install && cd ..

# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Development

```bash
# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
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
- [ ] Real backend API integration
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

Current implementations use AsyncStorage (mock data), but can be easily replaced with real API calls.

## 🤝 Contributing

This is a personal project, but feedback and suggestions are welcome!

## 📄 License

MIT

## 👤 Author

Built with care for meaningful human connections.

---

**Remember**: This app is about creating a space for authentic conversation and emotional connection. Every design decision should support that goal.