import express from 'express';
import rateLimit from 'express-rate-limit';
import NetworkScanner from '../utils/network-scanner.js';

const router = express.Router();

// Rate limiting for network scans
const scanLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // limit each IP to 3 scans per windowMs
  message: {
    error: 'Too many network scan requests. Please try again later.',
    retryAfter: '5 minutes'
  }
});

// Create a singleton instance of the scanner
const networkScanner = new NetworkScanner();

// Store active scan connections (for WebSocket updates)
const activeScans = new Map();

// Start network scan
router.post('/scan', scanLimiter, async (req, res) => {
  try {
    const { range } = req.body;
    const userId = req.user.id;

    // Check if user already has an active scan
    if (activeScans.has(userId)) {
      return res.status(400).json({
        error: 'You already have an active scan in progress'
      });
    }

    // Start scan in background
    const scanPromise = networkScanner.scanNetwork(range, (progress, devicesFound) => {
      // Emit progress via WebSocket if available
      const io = req.app.get('io');
      if (io) {
        io.to(`user_${userId}`).emit('scan_progress', {
          progress,
          devicesFound,
          userId
        });
      }
    });

    // Store scan promise for this user
    activeScans.set(userId, scanPromise);

    // Clean up when scan completes
    scanPromise.finally(() => {
      activeScans.delete(userId);
    });

    res.json({
      message: 'Network scan started',
      scanId: userId
    });

  } catch (error) {
    console.error('Error starting network scan:', error);
    res.status(500).json({
      error: 'Failed to start network scan',
      details: error.message
    });
  }
});

// Get scan status
router.get('/status', (req, res) => {
  try {
    const status = networkScanner.getScanStatus();
    const hasActiveScan = activeScans.has(req.user.id);

    res.json({
      ...status,
      hasActiveScan,
      canScan: !hasActiveScan && !status.isScanning
    });

  } catch (error) {
    console.error('Error getting scan status:', error);
    res.status(500).json({
      error: 'Failed to get scan status'
    });
  }
});

// Get discovered devices
router.get('/devices', (req, res) => {
  try {
    const devices = networkScanner.getDiscoveredDevices();
    
    // Add any existing computers from database
    // This would integrate with your existing computer management system
    
    res.json({
      devices,
      count: devices.length,
      lastScan: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting devices:', error);
    res.status(500).json({
      error: 'Failed to get discovered devices'
    });
  }
});

// Cancel active scan
router.post('/cancel', (req, res) => {
  try {
    const userId = req.user.id;
    
    if (activeScans.has(userId)) {
      // Note: The current implementation doesn't support cancellation
      // You would need to modify the NetworkScanner class to support this
      activeScans.delete(userId);
      
      res.json({
        message: 'Scan cancelled'
      });
    } else {
      res.status(400).json({
        error: 'No active scan found'
      });
    }

  } catch (error) {
    console.error('Error cancelling scan:', error);
    res.status(500).json({
      error: 'Failed to cancel scan'
    });
  }
});

// Register discovered device
router.post('/register', async (req, res) => {
  try {
    const { deviceId, name, ip, mac, deviceType, os } = req.body;
    
    // This would integrate with your existing computer/database system
    // For now, just return success
    
    res.json({
      message: 'Device registered successfully',
      device: {
        id: deviceId,
        name,
        ip,
        mac,
        deviceType,
        os,
        registeredAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error registering device:', error);
    res.status(500).json({
      error: 'Failed to register device'
    });
  }
});

export default router;
