import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

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
