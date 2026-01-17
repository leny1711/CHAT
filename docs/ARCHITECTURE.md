# Architecture Documentation

## Overview

This application follows **Clean Architecture** principles, ensuring:
- Separation of concerns
- Testability
- Maintainability
- Scalability
- Independence from frameworks and external dependencies

## Layer Hierarchy

```
Presentation Layer (UI)
    ↓ uses
Application Layer (Use Cases)
    ↓ uses
Domain Layer (Business Logic)
    ↑ implements
Data Layer (Repositories, Data Sources)
```

## Domain Layer

The core of the application - **framework independent**.

### Entities (`src/domain/entities/`)

Pure business objects with no dependencies:

- **User.ts**: User profile, photos, reveal progress
- **Message.ts**: Messages, conversations, pagination support
- **Match.ts**: Matches, likes, discovery profiles

### Repository Interfaces (`src/domain/repositories/`)

Define contracts for data access:

- **IUserRepository**: User management operations
- **IMessageRepository**: Chat operations with pagination
- **IMatchRepository**: Discovery and matching operations

### Use Cases (`src/domain/usecases/`)

Application business rules:

- **AuthUseCases**: Authentication flows
- **MessageUseCases**: Chat operations
- **MatchUseCases**: Discovery and matching flows

Each use case:
- Has a single responsibility
- Is independent of UI
- Can be tested in isolation
- Returns domain entities

## Data Flow Example: Sending a Message

1. User types message in **ConversationScreen**
2. Screen calls `onSendMessage` prop
3. Calls **SendMessageUseCase**.execute()
4. Use case validates and calls **IMessageRepository**.sendMessage()
5. **MessageRepository** saves to AsyncStorage
6. Returns new Message entity
7. UI updates with new message

## Benefits of This Architecture

1. **Testability**: Each layer can be tested independently
2. **Flexibility**: Easy to swap implementations
3. **Maintainability**: Clear boundaries and responsibilities
4. **Scalability**: Add features without refactoring core
5. **Team collaboration**: Different developers can work on different layers
