# Dating App Backend

A production-ready backend service for a private chat dating application, designed for speed, clarity, and stability.

## 🎯 Features

### Core Functionality
- **User Authentication** - JWT-based secure authentication
- **Matching System** - Like/Pass mechanism with mutual match detection
- **Real-time Messaging** - WebSocket-based instant messaging
- **Message Persistence** - PostgreSQL database with infinite message history
- **Pagination** - Cursor-based pagination for efficient message loading

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info (protected)

#### Matching
- `GET /api/matches/discovery` - Get discovery profiles
- `POST /api/matches/like` - Like a user
- `POST /api/matches/pass` - Pass on a user
- `GET /api/matches` - Get all matches

#### Conversations & Messages
- `GET /api/conversations` - Get all conversations
- `GET /api/conversations/:id/messages` - Get messages (with pagination)
- `POST /api/conversations/:id/messages` - Send a message
- `POST /api/conversations/:id/read` - Mark messages as read

#### WebSocket
- `ws://localhost:3000/ws?token=YOUR_JWT_TOKEN` - Real-time messaging

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (running locally or accessible via connection string)
- npm or yarn

### Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your PostgreSQL connection details
nano .env
```

### Database Setup

Make sure PostgreSQL is running and create a database:

```bash
# Create database (using psql)
createdb dating_app

# Or using SQL
psql -U postgres -c "CREATE DATABASE dating_app;"
```

Update your `.env` file with the correct PostgreSQL connection string:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/dating_app
```

### Running the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Build for production
npm run build

# Production mode
npm start
```

The server will start on http://localhost:3000

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Database & WebSocket configuration
│   │   ├── database.ts
│   │   └── websocket.ts
│   ├── controllers/     # Request handlers
│   │   ├── AuthController.ts
│   │   ├── MatchController.ts
│   │   └── MessageController.ts
│   ├── middleware/      # Express middleware
│   │   └── auth.ts
│   ├── models/          # (Future) Database models
│   ├── routes/          # API route definitions
│   │   ├── auth.ts
│   │   ├── matches.ts
│   │   └── conversations.ts
│   ├── services/        # Business logic
│   │   ├── AuthService.ts
│   │   ├── MatchService.ts
│   │   └── MessageService.ts
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/           # Utility functions
│   │   └── crypto.ts
│   └── index.ts         # Application entry point
├── dist/                # Compiled JavaScript (auto-generated)
├── .env                 # Environment variables
├── .env.example         # Example environment file
├── package.json
└── tsconfig.json
```

## 🗄️ Database Schema

PostgreSQL tables:

### Users
- id, email, password_hash, name, age, bio
- created_at, last_active

### Matches
- id, user_id_1, user_id_2, status
- created_at

### Conversations
- id, match_id
- created_at, last_message_at

### Messages
- id, conversation_id, sender_id, content
- type, status, created_at

### Likes
- id, from_user_id, to_user_id
- created_at

## 🔒 Authentication

All protected endpoints require a JWT token in the Authorization header:

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

Get a token by registering or logging in.

## 📡 WebSocket Usage

Connect to the WebSocket server for real-time messaging:

```javascript
const ws = new WebSocket('ws://localhost:3000/ws?token=YOUR_JWT_TOKEN');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'new_message') {
    console.log('New message:', data.payload);
  }
};
```

## 🧪 Testing the API

### Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "password123",
    "name": "Alice",
    "age": 25,
    "bio": "Hello!"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "password123"
  }'
```

### Get Discovery Profiles
```bash
curl -X GET http://localhost:3000/api/matches/discovery \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Like a User
```bash
curl -X POST http://localhost:3000/api/matches/like \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"targetUserId": "user_123"}'
```

### Send a Message
```bash
curl -X POST http://localhost:3000/api/conversations/conv_123/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello!"}'
```

### Get Messages (with pagination)
```bash
curl -X GET "http://localhost:3000/api/conversations/conv_123/messages?limit=50" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Load more with cursor
curl -X GET "http://localhost:3000/api/conversations/conv_123/messages?limit=50&cursor=msg_123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## ⚙️ Environment Variables

```env
PORT=3000
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/dating_app
```

## 🏗️ Architecture Decisions

### Why PostgreSQL?
- **Production-ready** - Industry standard for web applications
- **Scalability** - Handles millions of records efficiently
- **ACID compliance** - Ensures data integrity for critical operations
- **Rich feature set** - Advanced indexing, full-text search, JSON support
- **Concurrent connections** - Connection pooling for high performance
- **Data integrity** - Foreign keys, constraints, transactions
- **Long-term support** - Widely adopted with excellent tooling

### Why JWT?
- **Stateless authentication** - Scales horizontally
- **Mobile-friendly** - Easy to store on device
- **Standard** - Well-supported across platforms

### Why WebSockets?
- **Real-time** - Instant message delivery
- **Efficient** - Persistent connection, no polling
- **Bi-directional** - Server can push messages to clients

## 🚦 Production Considerations

Before deploying to production:

1. **Change JWT_SECRET** to a strong, random value
2. **Use HTTPS** for API endpoints
3. **Use WSS** for WebSocket connections
4. **Set up proper CORS** for your frontend domain
5. **Add rate limiting** to prevent abuse (e.g., using express-rate-limit)
6. **Set up logging** and monitoring
7. **Configure PostgreSQL connection pool** for optimal performance
8. **Add input validation** middleware (e.g., using joi or express-validator)
9. **Implement proper error logging**
10. **Set up automated database backups**
11. **Use environment-specific connection strings** (dev, staging, prod)
12. **Enable SSL for PostgreSQL connections** in production

### ⚠️ Security Note

The current quick start implementation includes basic security measures (JWT authentication, password hashing, WebSocket authentication) but intentionally omits some features for simplicity:

- **Rate limiting** - Should be added to prevent abuse/DoS
- **Input validation** - Should validate all user inputs
- **Request size limits** - Should limit payload sizes
- **CSRF protection** - May be needed depending on clients

These should be added before production deployment. See the "Future Enhancements" section for more details.

## 📊 Performance

- **Message pagination** - Loads 50 messages at a time by default
- **Cursor-based pagination** - Efficient for large datasets
- **Indexed queries** - Fast lookups on messages and matches
- **WebSocket keepalive** - Automatic connection health checks

## 🔄 Future Enhancements

- [ ] User profile photos upload
- [ ] Push notifications
- [ ] Message read receipts
- [ ] Typing indicators
- [ ] User blocking and reporting
- [ ] Content moderation
- [ ] Email verification
- [ ] Password reset
- [ ] Rate limiting per user
- [ ] Redis for caching and sessions

## 📝 License

MIT
