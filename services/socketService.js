const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const redisService = require('../utils/redis');

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map();
    this.rooms = new Map();
    this.eventHandlers = new Map();
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    this.setupRoomManagement();
    
    console.log('Socket.IO service initialized');
    return this.io;
  }

  setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user || !user.isActive) {
          return next(new Error('Invalid or inactive user'));
        }

        socket.userId = user._id.toString();
        socket.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });

    // Rate limiting middleware
    this.io.use(async (socket, next) => {
      const userId = socket.userId;
      const key = `socket_rate_limit:${userId}`;
      
      try {
        const current = await redisService.get(key) || 0;
        if (current > 100) { // 100 events per minute
          return next(new Error('Rate limit exceeded'));
        }
        
        await redisService.set(key, current + 1, 60);
        next();
      } catch (error) {
        next();
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
      
      socket.on('disconnect', () => {
        this.handleDisconnection(socket);
      });

      // Shipment tracking events
      socket.on('track_shipment', (data) => {
        this.handleTrackShipment(socket, data);
      });

      socket.on('stop_tracking', (data) => {
        this.handleStopTracking(socket, data);
      });

      // Real-time location updates
      socket.on('location_update', (data) => {
        this.handleLocationUpdate(socket, data);
      });

      // Status updates
      socket.on('status_update', (data) => {
        this.handleStatusUpdate(socket, data);
      });

      // Chat/messaging
      socket.on('send_message', (data) => {
        this.handleMessage(socket, data);
      });

      // Notifications
      socket.on('mark_notification_read', (data) => {
        this.handleNotificationRead(socket, data);
      });

      // Analytics subscription
      socket.on('subscribe_analytics', (data) => {
        this.handleAnalyticsSubscription(socket, data);
      });

      socket.on('unsubscribe_analytics', (data) => {
        this.handleAnalyticsUnsubscription(socket, data);
      });

      // Error handling
      socket.on('error', (error) => {
        console.error('Socket error:', error);
        this.logActivity(socket.userId, 'socket_error', { error: error.message });
      });
    });
  }

  setupRoomManagement() {
    // Clean up empty rooms periodically
    setInterval(() => {
      this.cleanupEmptyRooms();
    }, 300000); // 5 minutes
  }

  handleConnection(socket) {
    const userId = socket.userId;
    const user = socket.user;
    
    console.log(`User ${user.email} connected (${socket.id})`);
    
    // Store user connection
    this.connectedUsers.set(userId, {
      socketId: socket.id,
      user: user,
      connectedAt: new Date(),
      lastActivity: new Date()
    });

    // Join user-specific room
    socket.join(`user:${userId}`);
    
    // Join role-based room
    socket.join(`role:${user.role}`);

    // Send connection confirmation
    socket.emit('connected', {
      message: 'Connected successfully',
      userId: userId,
      timestamp: new Date().toISOString()
    });

    // Send pending notifications
    this.sendPendingNotifications(socket);

    // Log activity
    this.logActivity(userId, 'socket_connect', { socketId: socket.id });

    // Broadcast user online status to relevant users
    this.broadcastUserStatus(userId, 'online');
  }

  handleDisconnection(socket) {
    const userId = socket.userId;
    
    if (userId) {
      console.log(`User ${userId} disconnected (${socket.id})`);
      
      // Remove from connected users
      this.connectedUsers.delete(userId);
      
      // Log activity
      this.logActivity(userId, 'socket_disconnect', { socketId: socket.id });
      
      // Broadcast user offline status
      this.broadcastUserStatus(userId, 'offline');
    }
  }

  handleTrackShipment(socket, data) {
    const { shipmentId } = data;
    const userId = socket.userId;
    
    if (!shipmentId) {
      return socket.emit('error', { message: 'Shipment ID required' });
    }

    // Join shipment tracking room
    socket.join(`shipment:${shipmentId}`);
    
    // Send current shipment data
    this.sendShipmentUpdate(shipmentId);
    
    // Log activity
    this.logActivity(userId, 'track_shipment', { shipmentId });
    
    socket.emit('tracking_started', { shipmentId });
  }

  handleStopTracking(socket, data) {
    const { shipmentId } = data;
    const userId = socket.userId;
    
    if (!shipmentId) {
      return socket.emit('error', { message: 'Shipment ID required' });
    }

    // Leave shipment tracking room
    socket.leave(`shipment:${shipmentId}`);
    
    // Log activity
    this.logActivity(userId, 'stop_tracking', { shipmentId });
    
    socket.emit('tracking_stopped', { shipmentId });
  }

  handleLocationUpdate(socket, data) {
    const { shipmentId, location, coordinates } = data;
    const userId = socket.userId;
    
    // Validate user permissions
    if (!this.canUpdateShipment(socket.user, shipmentId)) {
      return socket.emit('error', { message: 'Insufficient permissions' });
    }

    // Broadcast location update to all tracking this shipment
    this.io.to(`shipment:${shipmentId}`).emit('location_updated', {
      shipmentId,
      location,
      coordinates,
      timestamp: new Date().toISOString(),
      updatedBy: userId
    });

    // Cache the update
    this.cacheRealtimeUpdate('location', shipmentId, {
      location,
      coordinates,
      timestamp: new Date(),
      updatedBy: userId
    });

    // Log activity
    this.logActivity(userId, 'location_update', { shipmentId, location });
  }

  handleStatusUpdate(socket, data) {
    const { shipmentId, status, notes } = data;
    const userId = socket.userId;
    
    // Validate user permissions
    if (!this.canUpdateShipment(socket.user, shipmentId)) {
      return socket.emit('error', { message: 'Insufficient permissions' });
    }

    // Broadcast status update
    this.io.to(`shipment:${shipmentId}`).emit('status_updated', {
      shipmentId,
      status,
      notes,
      timestamp: new Date().toISOString(),
      updatedBy: userId
    });

    // Cache the update
    this.cacheRealtimeUpdate('status', shipmentId, {
      status,
      notes,
      timestamp: new Date(),
      updatedBy: userId
    });

    // Log activity
    this.logActivity(userId, 'status_update', { shipmentId, status });
  }

  handleMessage(socket, data) {
    const { shipmentId, message, type = 'text' } = data;
    const userId = socket.userId;
    const user = socket.user;

    const messageData = {
      id: Date.now().toString(),
      shipmentId,
      message,
      type,
      sender: {
        id: userId,
        name: user.fullName,
        role: user.role
      },
      timestamp: new Date().toISOString()
    };

    // Broadcast message to shipment room
    this.io.to(`shipment:${shipmentId}`).emit('message_received', messageData);

    // Store message in cache for history
    this.storeMessage(shipmentId, messageData);

    // Log activity
    this.logActivity(userId, 'send_message', { shipmentId, messageType: type });
  }

  handleNotificationRead(socket, data) {
    const { notificationId } = data;
    const userId = socket.userId;

    // Mark notification as read
    this.markNotificationAsRead(userId, notificationId);

    socket.emit('notification_marked_read', { notificationId });
  }

  handleAnalyticsSubscription(socket, data) {
    const { type, filters } = data;
    const userId = socket.userId;

    // Join analytics room
    socket.join(`analytics:${type}`);

    // Send current analytics data
    this.sendAnalyticsUpdate(socket, type, filters);

    // Log activity
    this.logActivity(userId, 'subscribe_analytics', { type });
  }

  handleAnalyticsUnsubscription(socket, data) {
    const { type } = data;
    const userId = socket.userId;

    // Leave analytics room
    socket.leave(`analytics:${type}`);

    // Log activity
    this.logActivity(userId, 'unsubscribe_analytics', { type });
  }

  // Utility methods
  canUpdateShipment(user, shipmentId) {
    // Admin and operators can update any shipment
    if (user.role === 'admin' || user.role === 'operator') {
      return true;
    }
    
    // Viewers cannot update shipments
    return false;
  }

  async sendPendingNotifications(socket) {
    try {
      const userId = socket.userId;
      const notifications = await this.getPendingNotifications(userId);
      
      if (notifications.length > 0) {
        socket.emit('pending_notifications', notifications);
      }
    } catch (error) {
      console.error('Error sending pending notifications:', error);
    }
  }

  broadcastUserStatus(userId, status) {
    // Broadcast to admin users
    this.io.to('role:admin').emit('user_status_changed', {
      userId,
      status,
      timestamp: new Date().toISOString()
    });
  }

  async sendShipmentUpdate(shipmentId) {
    try {
      // Get current shipment data from cache or database
      const shipmentData = await this.getShipmentData(shipmentId);
      
      if (shipmentData) {
        this.io.to(`shipment:${shipmentId}`).emit('shipment_data', shipmentData);
      }
    } catch (error) {
      console.error('Error sending shipment update:', error);
    }
  }

  async cacheRealtimeUpdate(type, shipmentId, data) {
    try {
      const key = `realtime:${type}:${shipmentId}`;
      await redisService.set(key, data, 300); // 5 minutes TTL
    } catch (error) {
      console.error('Error caching realtime update:', error);
    }
  }

  async storeMessage(shipmentId, messageData) {
    try {
      const key = `messages:${shipmentId}`;
      await redisService.lpush(key, messageData);
      
      // Keep only last 100 messages
      const messages = await redisService.lrange(key, 0, 99);
      await redisService.del(key);
      
      for (const message of messages) {
        await redisService.lpush(key, message);
      }
      
      await redisService.expire(key, 86400); // 24 hours
    } catch (error) {
      console.error('Error storing message:', error);
    }
  }

  async logActivity(userId, action, data = {}) {
    try {
      const activity = {
        userId,
        action,
        data,
        timestamp: new Date().toISOString()
      };
      
      await redisService.lpush('socket_activities', activity);
    } catch (error) {
      console.error('Error logging socket activity:', error);
    }
  }

  cleanupEmptyRooms() {
    // This would clean up rooms with no connected clients
    // Implementation depends on your specific needs
  }

  // Public methods for external use
  emitToUser(userId, event, data) {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  emitToRole(role, event, data) {
    this.io.to(`role:${role}`).emit(event, data);
  }

  emitToShipment(shipmentId, event, data) {
    this.io.to(`shipment:${shipmentId}`).emit(event, data);
  }

  broadcastToAll(event, data) {
    this.io.emit(event, data);
  }

  getConnectedUsers() {
    return Array.from(this.connectedUsers.values());
  }

  isUserConnected(userId) {
    return this.connectedUsers.has(userId);
  }
}

// Create singleton instance
const socketService = new SocketService();

module.exports = socketService;
