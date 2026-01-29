import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { db } from './config/database';
import path from 'path';
import { WebSocketServer } from './config/websocket';
import { messageService } from './controllers/MessageController';

// Import routes
import authRoutes from './routes/auth';
import matchRoutes from './routes/matches';
import conversationRoutes from './routes/conversations';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/dating_app';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/conversations', conversationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize server
async function start() {
  try {
    // Connect to database
    console.log('Connecting to PostgreSQL database...');
    await db.connect(DATABASE_URL);
    await db.initialize();
    console.log('PostgreSQL database connected and initialized');

    // Create HTTP server
    const server = createServer(app);

    // Setup WebSocket server
    const wsServer = new WebSocketServer(server);
    messageService.setWebSocketServer(wsServer);
    console.log('WebSocket server initialized');

    // Start server
    server.listen(PORT, () => {
      console.log(`
========================================
🚀 Dating App Backend Server Running
========================================
HTTP API: http://localhost:${PORT}
WebSocket: ws://localhost:${PORT}/ws
Environment: ${process.env.NODE_ENV || 'development'}
========================================
      `);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, shutting down gracefully...');
      await db.close();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('SIGINT received, shutting down gracefully...');
      await db.close();
      process.exit(0);
    });
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error);
    console.error('Failed to start server:', details);
    console.error('Database will not be created or reset automatically.');
    process.exit(1);
  }
}

start();
