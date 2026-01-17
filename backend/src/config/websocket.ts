import { WebSocket, WebSocketServer as WSServer } from 'ws';
import { Server } from 'http';
import jwt from 'jsonwebtoken';
import { parse } from 'url';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  isAlive?: boolean;
}

export class WebSocketServer {
  private wss: WSServer;
  private clients: Map<string, AuthenticatedWebSocket> = new Map();

  constructor(server: Server) {
    this.wss = new WSServer({ server, path: '/ws' });
    this.setupWebSocketServer();
  }

  private setupWebSocketServer(): void {
    this.wss.on('connection', (ws: AuthenticatedWebSocket, req) => {
      // Authenticate via query param token
      const { query } = parse(req.url || '', true);
      const token = query.token as string;

      if (!token) {
        ws.close(4001, 'Authentication required');
        return;
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        ws.userId = decoded.userId;
        ws.isAlive = true;

        // Store connection
        this.clients.set(decoded.userId, ws);

        console.log(`WebSocket client connected: ${decoded.userId}`);

        // Setup ping/pong for connection health
        ws.on('pong', () => {
          ws.isAlive = true;
        });

        // Handle messages
        ws.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString());
            this.handleMessage(ws, message);
          } catch (error) {
            console.error('WebSocket message error:', error);
          }
        });

        // Handle disconnect
        ws.on('close', () => {
          if (ws.userId) {
            this.clients.delete(ws.userId);
            console.log(`WebSocket client disconnected: ${ws.userId}`);
          }
        });

        // Send welcome message
        ws.send(JSON.stringify({
          type: 'connected',
          payload: { userId: decoded.userId },
        }));
      } catch (error) {
        ws.close(4001, 'Invalid token');
      }
    });

    // Setup ping interval for health checks
    const interval = setInterval(() => {
      this.wss.clients.forEach((ws: AuthenticatedWebSocket) => {
        if (ws.isAlive === false) {
          return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);

    this.wss.on('close', () => {
      clearInterval(interval);
    });
  }

  private handleMessage(ws: AuthenticatedWebSocket, message: any): void {
    // Handle client messages if needed (e.g., typing indicators)
    console.log('Received message from client:', message);
  }

  sendToUser(userId: string, data: any): void {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  }

  broadcast(data: any): void {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }
}
