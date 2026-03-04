import api from './api';
import socketService from './socketService';

class MessagingService {
  constructor() {
    this.conversations = [];
    this.messageListeners = [];
    this.typingListeners = [];
    this.statusListeners = [];
    this.connectionListeners = [];
    this.initialized = false;
  }

  // Initialize socket connection
  initialize() {
    console.log('MessagingService initialize() called, current state:', { initialized: this.initialized });
    if (!this.initialized) {
      console.log('Initializing messaging service...');
      try {
        console.log('About to call socketService.connect()...');
        socketService.connect();
        console.log('socketService.connect() returned');
      } catch (e) {
        console.error('Error calling socketService.connect():', e);
      }
      
      // Subscribe to socket events
      socketService.on('new_message', (data) => {
        console.log('New message received:', data);
        this.notifyMessageListeners(data);
      });

      socketService.on('message_sent', (data) => {
        console.log('Message sent confirmation:', data);
        this.notifyMessageListeners({ ...data, isMe: true });
      });

      socketService.on('user_typing', (data) => {
        this.notifyTypingListeners(data);
      });

      socketService.on('message_status_update', (data) => {
        this.notifyStatusListeners(data);
      });

      socketService.on('user_offline', (data) => {
        this.notifyStatusListeners({ type: 'offline', ...data });
      });

      socketService.on('connection_status', (data) => {
        console.log('Connection status changed:', data);
        this.notifyConnectionListeners(data);
      });

      socketService.on('connection_error', (error) => {
        console.error('Socket connection error:', error);
        this.notifyConnectionListeners({ connected: false, error: error.message });
      });

      this.initialized = true;
    }
  }

  // Subscribe to new messages
  onNewMessage(callback) {
    this.messageListeners.push(callback);
    return () => {
      this.messageListeners = this.messageListeners.filter(cb => cb !== callback);
    };
  }

  notifyMessageListeners(data) {
    this.messageListeners.forEach(cb => {
      try {
        cb(data);
      } catch (error) {
        console.error('Error in message listener:', error);
      }
    });
  }

  // Subscribe to typing indicators
  onTyping(callback) {
    this.typingListeners.push(callback);
    return () => {
      this.typingListeners = this.typingListeners.filter(cb => cb !== callback);
    };
  }

  notifyTypingListeners(data) {
    this.typingListeners.forEach(cb => {
      try {
        cb(data);
      } catch (error) {
        console.error('Error in typing listener:', error);
      }
    });
  }

  // Subscribe to status updates
  onStatusUpdate(callback) {
    this.statusListeners.push(callback);
    return () => {
      this.statusListeners = this.statusListeners.filter(cb => cb !== callback);
    };
  }

  notifyStatusListeners(data) {
    this.statusListeners.forEach(cb => {
      try {
        cb(data);
      } catch (error) {
        console.error('Error in status listener:', error);
      }
    });
  }

  // Subscribe to connection status
  onConnectionStatus(callback) {
    this.connectionListeners.push(callback);
    return () => {
      this.connectionListeners = this.connectionListeners.filter(cb => cb !== callback);
    };
  }

  notifyConnectionListeners(data) {
    this.connectionListeners.forEach(cb => {
      try {
        cb(data);
      } catch (error) {
        console.error('Error in connection listener:', error);
      }
    });
  }

  // Get all conversations
  async getConversations() {
    try {
      const response = await api.get('/api/messaging/conversations');
      this.conversations = response.data;
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  // Get messages with a specific user
  async getMessages(userId) {
    try {
      const response = await api.get(`/api/messaging/messages/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  // Get group messages
  async getGroupMessages(groupId) {
    try {
      const response = await api.get(`/api/messaging/group-messages/${groupId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching group messages:', error);
      throw error;
    }
  }

  // Send a message
  async sendMessage(receiverId, content, attachments = null) {
    try {
      const response = await api.post('/api/messaging/send', {
        receiverId,
        content,
        attachments
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Send group message
  async sendGroupMessage(groupId, content, attachments = null) {
    try {
      const response = await api.post('/api/messaging/send', {
        groupId,
        content,
        attachments
      });
      return response.data;
    } catch (error) {
      console.error('Error sending group message:', error);
      throw error;
    }
  }

  // Mark messages as read
  async markAsRead(senderId) {
    try {
      await api.post('/api/messaging/mark-read', { senderId });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  // Mark group messages as read
  async markGroupAsRead(groupId) {
    try {
      await api.post('/api/messaging/mark-read', { groupId });
    } catch (error) {
      console.error('Error marking group messages as read:', error);
      throw error;
    }
  }

  // Get all users for starting conversations
  async getUsers() {
    try {
      const response = await api.get('/api/messaging/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Search conversations
  async searchConversations(query) {
    try {
      const response = await api.get('/api/messaging/search', {
        params: { query }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching conversations:', error);
      throw error;
    }
  }

  // Get unread count
  async getUnreadCount() {
    try {
      const conversations = await this.getConversations();
      return conversations.reduce((total, conv) => total + (conv.unread || 0), 0);
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Create a new group
  async createGroup(name, description, memberIds) {
    try {
      const response = await api.post('/api/messaging/groups', {
        name,
        description,
        memberIds
      });
      return response.data;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  // Get group details
  async getGroupDetails(groupId) {
    try {
      const response = await api.get(`/api/messaging/groups/${groupId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching group details:', error);
      throw error;
    }
  }

  // Send typing indicator
  sendTyping(receiverId, isTyping = true) {
    socketService.sendTyping(receiverId, isTyping);
  }

  // Send group typing indicator
  sendGroupTyping(groupId, isTyping = true) {
    socketService.sendGroupTyping(groupId, isTyping);
  }

  // Get user online status
  async getUserStatus(userId) {
    return new Promise((resolve) => {
      socketService.getUserStatus(userId, (status) => {
        resolve(status);
      });
    });
  }

  // Disconnect socket
  disconnect() {
    socketService.disconnect();
    this.initialized = false;
  }
}

// Create singleton instance
const messagingService = new MessagingService();

export default messagingService;
