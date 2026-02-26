// Mock messaging service - in real app, this would connect to a backend API
class MessagingService {
  constructor() {
    this.conversations = [
      {
        id: 1,
        name: 'Mr. Cruz',
        role: 'Instructor',
        avatar: 'MC',
        lastMessage: 'Please submit your lab assignment by tomorrow.',
        time: '10:30 AM',
        unread: 2,
        online: true,
        typing: false,
        userId: 'instructor_1'
      },
      {
        id: 2,
        name: 'Student 02',
        role: 'Classmate',
        avatar: 'S2',
        lastMessage: 'Hey, can you help me with the coding exercise?',
        time: '9:45 AM',
        unread: 1,
        online: true,
        typing: false,
        userId: 'student_2'
      },
      {
        id: 3,
        name: 'Student 03',
        role: 'Classmate',
        avatar: 'S3',
        lastMessage: 'Thanks for the notes!',
        time: 'Yesterday',
        unread: 0,
        online: false,
        typing: false,
        userId: 'student_3'
      },
      {
        id: 4,
        name: 'Lab Assistant',
        role: 'Support',
        avatar: 'LA',
        lastMessage: 'The lab will be closed for maintenance on Friday.',
        time: 'Yesterday',
        unread: 0,
        online: false,
        typing: false,
        userId: 'support_1'
      },
      {
        id: 5,
        name: 'Admin',
        role: 'Administrator',
        avatar: 'AD',
        lastMessage: 'System maintenance scheduled for tonight.',
        time: '2 days ago',
        unread: 0,
        online: true,
        typing: false,
        userId: 'admin_1'
      }
    ];

    this.messages = {
      '1_2': [
        { id: 1, senderId: 'current', senderName: 'Me', message: 'Good morning class!', time: '8:00 AM', isMe: true, read: true },
        { id: 2, senderId: 'instructor_1', senderName: 'Mr. Cruz', message: 'Good morning everyone! Today we\'ll be working on the React project.', time: '8:05 AM', isMe: false, read: true },
        { id: 3, senderId: 'current', senderName: 'Me', message: 'Great! I have some questions about the components.', time: '8:10 AM', isMe: true, read: true },
        { id: 4, senderId: 'instructor_1', senderName: 'Mr. Cruz', message: 'Please submit your lab assignment by tomorrow.', time: '10:30 AM', isMe: false, read: false },
      ],
      '1_3': [
        { id: 1, senderId: 'student_2', senderName: 'Student 02', message: 'Hey, can you help me with the coding exercise?', time: '9:45 AM', isMe: false, read: false },
      ]
    };
  }

  // Get conversations for a specific user role
  async getConversations(userRole) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Filter conversations based on role permissions
    let filteredConversations = [...this.conversations];
    
    if (userRole === 'student') {
      // Students can message instructors and other students
      filteredConversations = filteredConversations.filter(conv => 
        conv.role === 'Instructor' || conv.role === 'Classmate' || conv.role === 'Support'
      );
    } else if (userRole === 'instructor') {
      // Instructors can message students and other instructors
      filteredConversations = filteredConversations.filter(conv => 
        conv.role === 'Classmate' || conv.role === 'Administrator' || conv.role === 'Support'
      );
    }
    // Admin can message everyone
    
    return filteredConversations;
  }

  // Get messages between current user and another user
  async getMessages(currentUserId, otherUserId) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const conversationKey = [currentUserId, otherUserId].sort().join('_');
    return this.messages[conversationKey] || [];
  }

  // Send a message
  async sendMessage(currentUserId, recipientId, message) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const newMessage = {
      id: Date.now(),
      senderId: currentUserId,
      senderName: 'Me',
      message: message.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      isMe: true,
      read: false
    };

    const conversationKey = [currentUserId, recipientId].sort().join('_');
    
    if (!this.messages[conversationKey]) {
      this.messages[conversationKey] = [];
    }
    
    this.messages[conversationKey].push(newMessage);
    
    // Update conversation's last message
    const conversation = this.conversations.find(conv => conv.userId === recipientId);
    if (conversation) {
      conversation.lastMessage = message.trim();
      conversation.time = 'Just now';
    }
    
    return newMessage;
  }

  // Mark messages as read
  async markAsRead(currentUserId, otherUserId) {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const conversationKey = [currentUserId, otherUserId].sort().join('_');
    const messages = this.messages[conversationKey] || [];
    
    messages.forEach(message => {
      if (!message.isMe) {
        message.read = true;
      }
    });
    
    // Clear unread count
    const conversation = this.conversations.find(conv => conv.userId === otherUserId);
    if (conversation) {
      conversation.unread = 0;
    }
  }

  // Search conversations
  async searchConversations(query, userRole) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const conversations = await this.getConversations(userRole);
    
    if (!query.trim()) {
      return conversations;
    }
    
    const lowercaseQuery = query.toLowerCase();
    return conversations.filter(conv => 
      conv.name.toLowerCase().includes(lowercaseQuery) ||
      conv.role.toLowerCase().includes(lowercaseQuery) ||
      conv.lastMessage.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Get unread message count
  async getUnreadCount(currentUserId) {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return this.conversations
      .filter(conv => conv.unread > 0)
      .reduce((total, conv) => total + conv.unread, 0);
  }

  // Simulate typing indicator
  setTyping(userId, isTyping) {
    const conversation = this.conversations.find(conv => conv.userId === userId);
    if (conversation) {
      conversation.typing = isTyping;
    }
  }

  // Simulate online status changes
  setOnlineStatus(userId, isOnline) {
    const conversation = this.conversations.find(conv => conv.userId === userId);
    if (conversation) {
      conversation.online = isOnline;
    }
  }
}

// Create singleton instance
const messagingService = new MessagingService();

export default messagingService;
