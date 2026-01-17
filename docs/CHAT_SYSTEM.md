# Chat System Design

## Overview

The chat system is the **most critical feature** of this application. It must:

- Handle **infinite message history** without performance degradation
- Never lose messages
- Remain stable over months/years
- Support thousands of messages per conversation
- Feel calm, continuous, and trustworthy

## Core Requirements

### Functional Requirements

1. **Message Persistence**: All messages saved forever
2. **Pagination**: Efficient loading of message history
3. **Real-time Updates**: Instant message delivery
4. **Offline Support**: Queue messages when offline
5. **Read Receipts**: Track message read status

## Pagination Strategy

### Why Cursor-Based Pagination?

- **Efficient**: Direct database queries
- **Consistent**: No duplicate or missing messages
- **Scalable**: Works with millions of messages

### How It Works

1. Initial load: `getMessages(conversationId, limit: 50)`
   - Returns newest 50 messages
   - Returns cursor to oldest message

2. Load more: `getMessages(conversationId, limit: 50, cursor: lastMessageId)`
   - Returns next 50 older messages
   - Returns new cursor

3. Continue until `hasMore: false`

## UI Implementation

### React Native FlatList

Using **inverted** FlatList for optimal chat UX:

```tsx
<FlatList
  data={messages}
  renderItem={renderMessage}
  inverted              // Newest messages at bottom
  onEndReached={loadMoreMessages}
  onEndReachedThreshold={0.5}
/>
```

## Message Sending Flow

1. User types and presses send
2. UI immediately adds optimistic message (status: SENDING)
3. Call SendMessageUseCase.execute()
4. Repository saves to local storage
5. Repository sends to backend API (in production)
6. Backend confirms → update status to SENT
7. Other user receives → status DELIVERED
8. Other user reads → status READ

## Performance Optimizations

1. **Virtualization**: FlatList only renders visible messages
2. **Memoization**: Prevent unnecessary re-renders
3. **Message Batching**: Load in chunks of 50
4. **Database Indexing**: Fast pagination queries

## Conclusion

This chat system is designed to be:
- **Stable**: Never loses messages
- **Scalable**: Handles infinite history
- **Fast**: Efficient pagination
- **Reliable**: Works offline
- **Trustworthy**: Users can depend on it
