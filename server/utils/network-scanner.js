import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import net from 'net';
import os from 'os';
import dns from 'dns';

const execAsync = promisify(exec);

class NetworkScanner {
  constructor() {
    this.isScanning = false;
    this.scanProgress = 0;
    this.discoveredDevices = [];
  }

  // Get local IP and subnet
  async getLocalNetworkRange() {
    try {
      const interfaces = os.networkInterfaces();
      let localIP = null;
      let targetSubnet = null;

      // First, look for the 192.168.0.x subnet (where test PC is located)
      for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
          if (iface.family === 'IPv4' && !iface.internal) {
            const ip = iface.address;
            if (ip.startsWith('192.168.0.')) {
              localIP = ip;
              targetSubnet = '192.168.0';
              console.log(`Found target subnet: ${targetSubnet}.x`);
              break;
            }
          }
        }
        if (targetSubnet) break;
      }

      // Second priority: look for any 192.168.x.x subnet (common LAN)
      if (!targetSubnet) {
        for (const name of Object.keys(interfaces)) {
          for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
              const ip = iface.address;
              if (ip.startsWith('192.168.')) {
                localIP = ip;
                targetSubnet = '192.168';
                const parts = ip.split('.');
                targetSubnet = `${parts[0]}.${parts[1]}.${parts[2]}`;
                console.log(`Found 192.168 subnet: ${targetSubnet}.x`);
                break;
              }
            }
          }
          if (targetSubnet) break;
        }
      }

      // If target subnet not found, use any non-internal IPv4 interface
      if (!targetSubnet) {
        for (const name of Object.keys(interfaces)) {
          for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
              localIP = iface.address;
              const parts = localIP.split('.');
              targetSubnet = `${parts[0]}.${parts[1]}.${parts[2]}`;
              break;
            }
          }
          if (targetSubnet) break;
        }
      }

      if (!localIP || !targetSubnet) {
        throw new Error('Could not determine local IP address');
      }
      
      console.log(`Your IP     : ${localIP}`);
      console.log(`Scanning    : ${targetSubnet}.1 - ${targetSubnet}.254`);
      
      return { subnet: targetSubnet, localIP };
    } catch (error) {
      console.error('Error getting network range:', error);
      return { subnet: '192.168.100', localIP: '192.168.100.3' }; // fallback to target subnet
    }
  }

  // Ping a specific IP (optimized version)
  async pingHost(ip) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      // Use Windows ping command with optimized parameters
      const ping = spawn('ping', ['-n', '1', '-w', '500', ip]);
      
      let responded = false;
      
      ping.on('close', (code) => {
        const duration = Date.now() - startTime;
        if (code === 0 && responded) {
          resolve({ 
            ip, 
            online: true, 
            responseTime: duration,
            hostname: null // Will be resolved separately
          });
        } else {
          resolve(null);
        }
      });
      
      ping.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Reply from')) {
          responded = true;
        }
      });
      
      ping.on('error', () => {
        resolve(null);
      });
      
      // Force timeout after 1 second
      setTimeout(() => {
        if (!responded) {
          ping.kill();
          resolve(null);
        }
      }, 1000);
    });
  }

  // Get hostname for IP
  async getHostname(ip) {
    return new Promise((resolve) => {
      dns.reverse(ip, (err, hostnames) => {
        if (err || !hostnames || hostnames.length === 0) {
          resolve('Unknown');
        } else {
          resolve(hostnames[0]);
        }
      });
    });
  }

  // Batch ping with concurrency control (like ThreadPoolExecutor)
  async pingBatch(ips, maxWorkers = 50) {
    const results = [];
    const batches = [];
    
    // Split IPs into batches
    for (let i = 0; i < ips.length; i += maxWorkers) {
      batches.push(ips.slice(i, i + maxWorkers));
    }

    for (const batch of batches) {
      const batchPromises = batch.map(ip => this.pingHost(ip));
      const batchResults = await Promise.all(batchPromises);
      
      // Filter out null results and add hostnames
      const validResults = [];
      for (const result of batchResults) {
        if (result) {
          const hostname = await this.getHostname(result.ip);
          validResults.push({
            ...result,
            hostname
          });
        }
      }
      
      results.push(...validResults);
      
      // Update progress
      this.scanProgress = Math.round((results.length / 254) * 100);
      
      // Small delay between batches to prevent network overload
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return results;
  }

  // Check if common computer ports are open
  async checkPorts(ip) {
    const commonPorts = [22, 80, 443, 3389, 5900, 135, 139, 445];
    const openPorts = [];

    // Check ports in parallel with timeout
    const portPromises = commonPorts.map(port => 
      this.checkPort(ip, port).then(isOpen => ({ port, isOpen }))
    );

    const portResults = await Promise.all(portPromises);
    
    for (const { port, isOpen } of portResults) {
      if (isOpen) {
        openPorts.push(port);
      }
    }

    return openPorts;
  }

  // Check individual port
  checkPort(ip, port) {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      
      socket.setTimeout(500); // Reduced timeout for faster scanning
      
      socket.on('connect', () => {
        socket.destroy();
        resolve(true);
      });
      
      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });
      
      socket.on('error', () => {
        resolve(false);
      });
      
      socket.connect(port, ip);
    });
  }

  // Get MAC address for IP (ARP table lookup)
  async getMacAddress(ip) {
    try {
      const { stdout } = await execAsync(`arp -a ${ip}`);
      const match = stdout.match(/([0-9a-fA-F]{2}[:-]){5}([0-9a-fA-F]{2})/);
      return match ? match[0] : null;
    } catch (error) {
      return null;
    }
  }

  // Identify device type based on open ports and patterns
  identifyDeviceType(openPorts, ip) {
    // If RDP or VNC ports are open, likely a computer
    if (openPorts.includes(3389) || openPorts.includes(5900)) {
      return 'computer';
    }
    
    // If web server ports are open
    if (openPorts.includes(80) || openPorts.includes(443)) {
      return 'server';
    }
    
    // If Windows file sharing ports are open
    if (openPorts.includes(135) || openPorts.includes(139) || openPorts.includes(445)) {
      return 'computer';
    }
    
    // If SSH is open
    if (openPorts.includes(22)) {
      return 'computer';
    }
    
    return 'unknown';
  }

  // Detect OS based on open ports and patterns
  detectOS(openPorts) {
    // Windows-specific ports
    const windowsPorts = [135, 139, 445, 3389];
    const hasWindowsPorts = windowsPorts.some(port => openPorts.includes(port));
    
    if (hasWindowsPorts) {
      return 'Windows';
    }
    
    // Linux/Unix typically has SSH open
    if (openPorts.includes(22)) {
      return 'Linux/Unix';
    }
    
    return 'Unknown';
  }

  // Main network scan function (optimized like Python version)
  async scanNetwork(range = null, onProgress = null, onDeviceFound = null) {
    if (this.isScanning) {
      throw new Error('Scan already in progress');
    }

    this.isScanning = true;
    this.discoveredDevices = [];
    this.scanProgress = 0;

    try {
      const { subnet, localIP } = await this.getLocalNetworkRange();
      
      // Generate IP range (1-254 like Python version)
      const ips = [];
      for (let i = 1; i <= 254; i++) {
        ips.push(`${subnet}.${i}`);
      }

      console.log(`Please wait...\n`);

      // Scan with concurrent workers (like ThreadPoolExecutor)
      const onlineDevices = await this.pingBatch(ips, 100); // 100 concurrent workers

      console.log(`${'IP Address'.padEnd(20)} ${'Hostname'}`);
      console.log("-".repeat(50));
      
      for (const device of onlineDevices) {
        console.log(`${device.ip.padEnd(20)} ${device.hostname}`);
      }

      console.log(`\n✅ Total devices found: ${onlineDevices.length}`);

      // For each online device, get more detailed info
      const detailedDevices = [];
      for (let i = 0; i < onlineDevices.length; i++) {
        const device = onlineDevices[i];
        
        // Skip the server's own IP (prevents self-detection as PC-XXX)
        if (device.ip === localIP) {
          console.log(`Skipping server's own IP: ${device.ip}`);
          continue;
        }
        
        try {
          const [openPorts, macAddress] = await Promise.all([
            this.checkPorts(device.ip),
            this.getMacAddress(device.ip)
          ]);

          const deviceType = this.identifyDeviceType(openPorts, device.ip);
          const os = this.detectOS(openPorts);

          // Include all online devices that respond to ping
          // (relaxed requirement - don't filter by ports)
          if (deviceType === 'computer' || deviceType === 'server' || deviceType === 'unknown') {
            const pcData = {
              id: device.ip.replace(/\./g, '-'),
              name: device.hostname !== 'Unknown' ? device.hostname : `PC-${device.ip.split('.').pop().padStart(3, '0')}`,
              ip: device.ip,
              hostname: device.hostname,
              mac: macAddress,
              status: 'online',
              deviceType,
              os,
              openPorts,
              lastSeen: new Date(),
              user: 'Unknown',
              cpu: 'Unknown',
              ram: 'Unknown',
              storage: 'Unknown',
              responseTime: device.responseTime
            };
            
            detailedDevices.push(pcData);
            
            // Emit device in real-time as it's discovered
            if (onDeviceFound) {
              onDeviceFound(pcData);
            }
          }
        } catch (error) {
          console.error(`Error getting details for ${device.ip}:`, error);
        }

        // Update progress for detailed scanning
        if (onProgress) {
          const progress = Math.round(((i + 1) / onlineDevices.length) * 100);
          onProgress(progress, detailedDevices.length);
        }
      }

      this.discoveredDevices = detailedDevices;
      console.log(`\n✅ Total computers found: ${detailedDevices.length}`);
      
      return this.discoveredDevices;

    } finally {
      this.isScanning = false;
      this.scanProgress = 0;
    }
  }

  // Get scan status
  getScanStatus() {
    return {
      isScanning: this.isScanning,
      progress: this.scanProgress,
      devicesFound: this.discoveredDevices.length
    };
  }

  // Get discovered devices
  getDiscoveredDevices() {
    return this.discoveredDevices;
  }
}

export default NetworkScanner;
