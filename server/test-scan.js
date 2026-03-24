import NetworkScanner from './utils/network-scanner.js';

// Test the network scanner
async function testNetworkScan() {
  const scanner = new NetworkScanner();
  
  console.log('Testing network scanner...\n');
  
  // Test specific IP ping
  console.log('Testing ping to 192.168.100.241...');
  const result = await scanner.pingHost('192.168.100.241');
  console.log('Ping result:', result);
  
  if (result) {
    console.log('✅ Successfully pinged 192.168.100.241');
    
    // Test hostname resolution
    const hostname = await scanner.getHostname('192.168.100.241');
    console.log(`Hostname: ${hostname}`);
    
    // Test port scanning
    const openPorts = await scanner.checkPorts('192.168.100.241');
    console.log(`Open ports: ${openPorts.join(', ')}`);
    
    // Test device identification
    const deviceType = scanner.identifyDeviceType(openPorts, '192.168.100.241');
    const os = scanner.detectOS(openPorts);
    console.log(`Device type: ${deviceType}`);
    console.log(`OS: ${os}`);
    
  } else {
    console.log('❌ Failed to ping 192.168.100.241');
  }
  
  console.log('\nTesting full network scan...');
  
  // Test full network scan
  try {
    const devices = await scanner.scanNetwork();
    console.log(`\n✅ Scan completed. Found ${devices.length} devices:`);
    
    for (const device of devices) {
      console.log(`- ${device.name} (${device.ip}) - ${device.hostname} - ${device.os}`);
    }
    
  } catch (error) {
    console.error('❌ Scan failed:', error.message);
  }
}

// Run the test
testNetworkScan().catch(console.error);
