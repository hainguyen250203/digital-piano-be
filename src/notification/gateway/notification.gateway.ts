import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ResNotificationDto } from '../api/dto/res-notification.dto';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private userSockets: Map<string, string[]> = new Map();
  private logger = new Logger(NotificationGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token?.split(' ')[1];
      
      if (!token) {
        this.logger.warn(`Client disconnected: No token provided`);
        client.disconnect();
        return;
      }

      try {
        const payload = this.jwtService.verify(token);
        const userId = payload.sub;
        
        // Store socket connection
        const userConnections = this.userSockets.get(userId) || [];
        userConnections.push(client.id);
        this.userSockets.set(userId, userConnections);

        // Join user's room
        client.join(`user_${userId}`);
        
        // Send acknowledgment to client
        client.emit('connection_established', { status: 'connected', userId });
      } catch (jwtError) {
        this.logger.error(`JWT verification failed: ${jwtError.message}`);
        client.disconnect();
      }
    } catch (error) {
      this.logger.error(`Authentication error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Remove socket connection from userSockets map
    this.userSockets.forEach((sockets, userId) => {
      const index = sockets.indexOf(client.id);
      if (index !== -1) {
        sockets.splice(index, 1);
        if (sockets.length === 0) {
          this.userSockets.delete(userId);
        } else {
          this.userSockets.set(userId, sockets);
        }
      }
    });
  }

  sendNotificationToUser(userId: string, notification: ResNotificationDto) {
    const connections = this.userSockets.get(userId) || [];
    if (connections.length === 0) {
      this.logger.warn(`No active connections for user ${userId}`);
    }
    
    this.server.to(`user_${userId}`).emit('notification', notification);
  }

  broadcastNotification(notification: ResNotificationDto) {
    this.server.emit('notification', notification);
  }

  private getUserIdFromSocket(client: Socket): string | null {
    try {
      const token = client.handshake.auth.token?.split(' ')[1];
      if (!token) return null;
      
      const payload = this.jwtService.verify(token);
      return payload.sub;
    } catch (error) {
      return null;
    }
  }
} 