import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import dgram from 'dgram';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Helper to create WoL magic packet
function createMagicPacket(mac) {
  const macBytes = mac.replace(/:/g, '').match(/.{1,2}/g).map(b => parseInt(b, 16));
  const packet = Buffer.alloc(102);
  // 6 bytes of 0xFF
  for (let i = 0; i < 6; i++) packet[i] = 0xFF;
  // 16 repetitions of MAC address
  for (let i = 1; i <= 16; i++) {
    macBytes.forEach((byte, j) => {
      packet[i * 6 + j] = byte;
    });
  }
  return packet;
}

// GET /api/agents - Get all registered agents from database
router.get('/', authenticateToken, async (req, res) => {
  try {
    const agents = await prisma.agent.findMany({
      orderBy: { lastSeen: 'desc' }
    });
    res.json(agents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// GET /api/agents/stats - Get stats with alerts
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const [total, online, offline, staleAgents] = await Promise.all([
      prisma.agent.count(),
      prisma.agent.count({ where: { status: 'ONLINE' } }),
      prisma.agent.count({ where: { status: 'OFFLINE' } }),
      prisma.agent.findMany({
        where: {
          status: 'ONLINE',
          lastSeen: { lt: fiveMinutesAgo }
        },
        select: { id: true, hostname: true, lastSeen: true }
      })
    ]);

    const alerts = staleAgents.map(agent => ({
      id: agent.id,
      hostname: agent.hostname,
      reason: `No heartbeat for ${Math.floor((Date.now() - new Date(agent.lastSeen)) / 60000)} minutes`
    }));

    res.json({ total, online, offline, alerts });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// POST /api/agents/wake - Wake on LAN
router.post('/wake', authenticateToken, async (req, res) => {
  try {
    const { mac } = req.body;
    if (!mac) {
      return res.status(400).json({ error: 'MAC address is required' });
    }

    // Create and send magic packet
    const packet = createMagicPacket(mac);
    const socket = dgram.createSocket('udp4');
    
    socket.send(packet, 9, '255.255.255.255', (err) => {
      socket.close();
      if (err) {
        console.error('WoL error:', err);
        return res.status(500).json({ error: 'Failed to send wake packet' });
      }
      res.json({ ok: true, message: `Wake packet sent to ${mac}` });
    });

    // Log the wake attempt
    const agent = await prisma.agent.findUnique({ where: { mac } });
    if (agent) {
      await prisma.agentActivityLog.create({
        data: {
          agentId: agent.id,
          command: 'wake',
          issuedBy: req.user.id,
          status: 'SENT'
        }
      });
    }
  } catch (error) {
    console.error('Error sending WoL:', error);
    res.status(500).json({ error: 'Failed to send wake packet' });
  }
});

// GET /api/agents/:id/logs - Get agent logs
router.get('/:id/logs', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.agentActivityLog.findMany({
        where: { agentId: parseInt(id) },
        include: { agent: true, user: { select: { username: true } } },
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit
      }),
      prisma.agentActivityLog.count({ where: { agentId: parseInt(id) } })
    ]);

    res.json({
      logs,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching agent logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// GET /api/agents/logs - Get all logs
router.get('/logs', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.agentActivityLog.findMany({
        include: { agent: true, user: { select: { username: true } } },
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit
      }),
      prisma.agentActivityLog.count()
    ]);

    res.json({
      logs,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Get all connected agent PCs
router.get('/connected', authenticateToken, (req, res) => {
  try {
    const io = req.app.get('io');
    const connectedComputers = req.app.get('connectedComputers');
    
    if (!connectedComputers) {
      return res.json({
        success: true,
        devices: [],
        count: 0
      });
    }

    // Convert Map to array of computer data
    const devices = Array.from(connectedComputers.values()).map(computerData => ({
      id: computerData.computer.id,
      name: computerData.computer.name,
      ip: computerData.computer.ip,
      mac: computerData.computer.mac,
      user: computerData.user || computerData.computer.user,
      status: computerData.status || 'online',
      os: computerData.computer.platform || computerData.computer.distro || 'Windows',
      lastSeen: computerData.lastSeen,
      specs: computerData.computer.specs || {},
      socketId: computerData.socketId
    }));

    res.json({
      success: true,
      devices,
      count: devices.length,
      lastScan: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting connected agents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get connected agents'
    });
  }
});

// Get specific agent PC details
router.get('/connected/:computerId', authenticateToken, (req, res) => {
  try {
    const connectedComputers = req.app.get('connectedComputers');
    const computerData = connectedComputers?.get(req.params.computerId);
    
    if (!computerData) {
      return res.status(404).json({
        success: false,
        error: 'Computer not found'
      });
    }

    res.json({
      success: true,
      device: {
        id: computerData.computer.id,
        name: computerData.computer.name,
        ip: computerData.computer.ip,
        mac: computerData.computer.mac,
        user: computerData.user || computerData.computer.user,
        status: computerData.status || 'online',
        os: computerData.computer.platform || computerData.computer.distro || 'Windows',
        lastSeen: computerData.lastSeen,
        specs: computerData.computer.specs || {}
      }
    });
  } catch (error) {
    console.error('Error getting agent details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get agent details'
    });
  }
});

// Send command to agent PC
router.post('/command', authenticateToken, (req, res) => {
  try {
    const io = req.app.get('io');
    const { computerId, action, params } = req.body;
    
    if (!computerId || !action) {
      return res.status(400).json({
        success: false,
        error: 'computerId and action are required'
      });
    }

    // Emit command to the specific computer room
    io.to(`computer_${computerId}`).emit('execute_command', {
      action,
      params,
      from: req.user.id,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: `Command ${action} sent to computer ${computerId}`
    });
  } catch (error) {
    console.error('Error sending command to agent:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send command'
    });
  }
});

export default router;
