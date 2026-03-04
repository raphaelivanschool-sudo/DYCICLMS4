import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all conversations for the current user
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all users the current user has messaged or received messages from
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ],
        groupId: null // Only direct messages for now
      },
      include: {
        sender: {
          select: { id: true, fullName: true, username: true, role: true }
        },
        receiver: {
          select: { id: true, fullName: true, username: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Build conversations from messages
    const conversationMap = new Map();

    messages.forEach(msg => {
      const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
      if (!otherUser) return;

      const key = otherUser.id;
      if (!conversationMap.has(key)) {
        conversationMap.set(key, {
          id: otherUser.id,
          userId: otherUser.id,
          name: otherUser.fullName,
          username: otherUser.username,
          role: otherUser.role,
          avatar: otherUser.fullName.split(' ').map(n => n[0]).join('').toUpperCase(),
          lastMessage: msg.content,
          time: msg.createdAt,
          unread: 0,
          online: false,
          typing: false
        });
      }

      // Count unread messages
      if (msg.receiverId === userId && msg.status !== 'READ') {
        const conv = conversationMap.get(key);
        conv.unread++;
      }
    });

    // Get user's groups
    const groupMemberships = await prisma.groupMember.findMany({
      where: { userId },
      include: {
        group: {
          include: {
            _count: { select: { members: true } }
          }
        }
      }
    });

    const groups = groupMemberships.map(membership => ({
      id: `group_${membership.group.id}`,
      groupId: membership.group.id,
      name: membership.group.name,
      role: 'Group',
      avatar: 'G',
      memberCount: membership.group._count.members,
      lastMessage: '',
      time: membership.group.createdAt,
      unread: 0,
      online: false,
      typing: false,
      isGroup: true
    }));

    // Combine users and groups
    const conversations = [...conversationMap.values(), ...groups];

    // Sort by last message time
    conversations.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get messages between two users
router.get('/messages/:userId', authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = parseInt(req.params.userId);

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: currentUserId }
        ],
        groupId: null
      },
      include: {
        sender: {
          select: { id: true, fullName: true, username: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      senderId: msg.senderId,
      senderName: msg.sender.fullName,
      message: msg.content,
      time: msg.createdAt,
      isMe: msg.senderId === currentUserId,
      read: msg.status === 'READ',
      status: msg.status,
      attachments: msg.attachments ? JSON.parse(msg.attachments) : null
    }));

    res.json(formattedMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get group messages
router.get('/group-messages/:groupId', authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const groupId = parseInt(req.params.groupId);

    // Verify user is a member of the group
    const membership = await prisma.groupMember.findFirst({
      where: { groupId, userId: currentUserId }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this group' });
    }

    const messages = await prisma.message.findMany({
      where: { groupId },
      include: {
        sender: {
          select: { id: true, fullName: true, username: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      senderId: msg.senderId,
      senderName: msg.sender.fullName,
      message: msg.content,
      time: msg.createdAt,
      isMe: msg.senderId === currentUserId,
      read: msg.status === 'READ',
      attachments: msg.attachments ? JSON.parse(msg.attachments) : null
    }));

    res.json(formattedMessages);
  } catch (error) {
    console.error('Error fetching group messages:', error);
    res.status(500).json({ error: 'Failed to fetch group messages' });
  }
});

// Send a message
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, content, groupId, attachments } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        senderId,
        receiverId: groupId ? null : parseInt(receiverId),
        groupId: groupId ? parseInt(groupId) : null,
        status: 'SENT',
        attachments: attachments ? JSON.stringify(attachments) : null
      },
      include: {
        sender: {
          select: { id: true, fullName: true, username: true }
        },
        receiver: {
          select: { id: true, fullName: true, username: true }
        }
      }
    });

    const io = req.app.get('io');
    
    // Log room membership for debugging
    const receiverRoom = io.sockets.adapter.rooms.get(`user_${receiverId}`);
    const senderRoom = io.sockets.adapter.rooms.get(`user_${senderId}`);
    console.log(`Message from ${senderId} to ${receiverId}:`);
    console.log(`  Receiver room user_${receiverId} has ${receiverRoom ? receiverRoom.size : 0} clients`);
    console.log(`  Sender room user_${senderId} has ${senderRoom ? senderRoom.size : 0} clients`);

    if (groupId) {
      // Emit to group room
      io.to(`group_${groupId}`).emit('new_message', {
        id: message.id,
        senderId: message.senderId,
        senderName: message.sender.fullName,
        message: message.content,
        time: message.createdAt,
        groupId: parseInt(groupId),
        attachments: message.attachments ? JSON.parse(message.attachments) : null
      });
    } else {
      // Emit to specific user
      io.to(`user_${receiverId}`).emit('new_message', {
        id: message.id,
        senderId: message.senderId,
        senderName: message.sender.fullName,
        message: message.content,
        time: message.createdAt,
        receiverId: parseInt(receiverId),
        attachments: message.attachments ? JSON.parse(message.attachments) : null
      });

      // Also emit to sender for multi-device sync
      io.to(`user_${senderId}`).emit('message_sent', {
        id: message.id,
        receiverId: parseInt(receiverId),
        message: message.content,
        time: message.createdAt
      });
    }

    res.json({
      id: message.id,
      senderId: message.senderId,
      senderName: message.sender.fullName,
      message: message.content,
      time: message.createdAt,
      status: message.status
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark messages as read
router.post('/mark-read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { senderId, groupId } = req.body;

    let updateQuery;
    if (groupId) {
      updateQuery = {
        where: {
          groupId: parseInt(groupId),
          senderId: { not: userId },
          status: { not: 'READ' }
        },
        data: { status: 'READ' }
      };
    } else {
      updateQuery = {
        where: {
          senderId: parseInt(senderId),
          receiverId: userId,
          status: { not: 'READ' }
        },
        data: { status: 'READ' }
      };
    }

    await prisma.message.updateMany(updateQuery);

    // Notify sender that messages were read
    const io = req.app.get('io');
    if (senderId) {
      io.to(`user_${senderId}`).emit('messages_read', {
        by: userId,
        timestamp: new Date()
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Get all users (for starting new conversations)
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Build where clause based on role
    let whereClause = {
      id: { not: userId },
      NOT: { role: 'ADMIN' } // Exclude other admins by default
    };

    if (userRole === 'STUDENT') {
      // Students can message instructors and other students
      whereClause = {
        id: { not: userId },
        OR: [
          { role: 'INSTRUCTOR' },
          { role: 'STUDENT' }
        ]
      };
    } else if (userRole === 'INSTRUCTOR') {
      // Instructors can message students and other instructors
      whereClause = {
        id: { not: userId },
        OR: [
          { role: 'INSTRUCTOR' },
          { role: 'STUDENT' }
        ]
      };
    } else if (userRole === 'ADMIN') {
      // Admins can message everyone
      whereClause = { id: { not: userId } };
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        fullName: true,
        username: true,
        role: true,
        email: true
      },
      orderBy: { fullName: 'asc' }
    });

    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.fullName,
      username: user.username,
      role: user.role,
      avatar: user.fullName.split(' ').map(n => n[0]).join('').toUpperCase(),
      email: user.email
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Search conversations
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { query } = req.query;

    if (!query || query.trim() === '') {
      return res.json([]);
    }

    const searchTerm = query.toLowerCase();

    // Search in messages
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ],
        content: { contains: searchTerm, mode: 'insensitive' }
      },
      include: {
        sender: { select: { id: true, fullName: true, role: true } },
        receiver: { select: { id: true, fullName: true, role: true } }
      },
      take: 20
    });

    // Group by conversation
    const results = messages.map(msg => {
      const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
      return {
        messageId: msg.id,
        content: msg.content,
        time: msg.createdAt,
        user: {
          id: otherUser.id,
          name: otherUser.fullName,
          role: otherUser.role,
          avatar: otherUser.fullName.split(' ').map(n => n[0]).join('').toUpperCase()
        }
      };
    });

    res.json(results);
  } catch (error) {
    console.error('Error searching messages:', error);
    res.status(500).json({ error: 'Failed to search messages' });
  }
});

// Create a new group
router.post('/groups', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, memberIds } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Group name is required' });
    }

    const group = await prisma.group.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
        createdBy: userId,
        members: {
          create: [
            { userId, role: 'ADMIN' },
            ...memberIds.map(id => ({ userId: parseInt(id), role: 'MEMBER' }))
          ]
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, fullName: true, username: true }
            }
          }
        }
      }
    });

    // Notify all members
    const io = req.app.get('io');
    group.members.forEach(member => {
      io.to(`user_${member.userId}`).emit('group_created', {
        groupId: group.id,
        name: group.name,
        addedBy: userId
      });
    });

    res.json({
      id: group.id,
      name: group.name,
      description: group.description,
      members: group.members.length
    });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// Get group details
router.get('/groups/:groupId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const groupId = parseInt(req.params.groupId);

    // Verify membership
    const membership = await prisma.groupMember.findFirst({
      where: { groupId, userId }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this group' });
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, fullName: true, username: true, role: true }
            }
          }
        },
        creator: {
          select: { id: true, fullName: true }
        }
      }
    });

    res.json({
      id: group.id,
      name: group.name,
      description: group.description,
      createdBy: group.creator,
      members: group.members.map(m => ({
        id: m.user.id,
        name: m.user.fullName,
        role: m.user.role,
        groupRole: m.role
      }))
    });
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({ error: 'Failed to fetch group details' });
  }
});

// DEBUG: Get all users with their IDs (admin only for debugging)
router.get('/debug/users', authenticateToken, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, fullName: true, role: true },
      orderBy: { id: 'asc' }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// DEBUG: Delete all messages between two users (admin only)
router.delete('/debug/messages/:userId1/:userId2', authenticateToken, async (req, res) => {
  try {
    const userId1 = parseInt(req.params.userId1);
    const userId2 = parseInt(req.params.userId2);
    
    const result = await prisma.message.deleteMany({
      where: {
        OR: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 }
        ]
      }
    });
    
    res.json({ 
      success: true, 
      message: `Deleted ${result.count} messages between users ${userId1} and ${userId2}` 
    });
  } catch (error) {
    console.error('Error deleting messages:', error);
    res.status(500).json({ error: 'Failed to delete messages' });
  }
});

// DEBUG: Delete all messages for a user (admin only)
router.delete('/debug/messages/all/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    const result = await prisma.message.deleteMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      }
    });
    
    res.json({ 
      success: true, 
      message: `Deleted ${result.count} messages for user ${userId}` 
    });
  } catch (error) {
    console.error('Error deleting messages:', error);
    res.status(500).json({ error: 'Failed to delete messages' });
  }
});

export default router;
