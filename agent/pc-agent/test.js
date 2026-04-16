#!/usr/bin/env node
/**
 * Quick test script for the PC Agent
 * Run this to verify agent functionality before deploying
 */

import si from 'systeminformation';
import os from 'os';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('========================================');
console.log('DYCI PC Agent - System Test');
console.log('========================================\n');

async function runTests() {
  const results = {
    passed: [],
    failed: []
  };

  // Test 1: System Information
  console.log('Test 1: System Information...');
  try {
    const [system, osInfo, cpu, mem] = await Promise.all([
      si.system(),
      si.osInfo(),
      si.cpu(),
      si.mem()
    ]);
    
    console.log(`  ✓ Hostname: ${os.hostname()}`);
    console.log(`  ✓ OS: ${osInfo.platform} ${osInfo.release}`);
    console.log(`  ✓ CPU: ${cpu.manufacturer} ${cpu.brand}`);
    console.log(`  ✓ RAM: ${Math.round(mem.total / 1024 / 1024 / 1024)} GB`);
    results.passed.push('System Information');
  } catch (error) {
    console.log(`  ✗ Failed: ${error.message}`);
    results.failed.push('System Information');
  }

  // Test 2: Network
  console.log('\nTest 2: Network Information...');
  try {
    const network = await si.networkInterfaces();
    const activeInterface = network.find(ni => 
      ni.ip4 && !ni.internal && ni.ip4.startsWith('192.168.')
    ) || network.find(ni => ni.ip4 && !ni.internal);

    if (activeInterface) {
      console.log(`  ✓ IP Address: ${activeInterface.ip4}`);
      console.log(`  ✓ MAC Address: ${activeInterface.mac}`);
      results.passed.push('Network Information');
    } else {
      console.log('  ✗ No active network interface found');
      results.failed.push('Network Information');
    }
  } catch (error) {
    console.log(`  ✗ Failed: ${error.message}`);
    results.failed.push('Network Information');
  }

  // Test 3: Lock Command (Dry Run)
  console.log('\nTest 3: Lock Command (checking rundll32)...');
  try {
    const { stdout } = await execAsync('where rundll32');
    console.log(`  ✓ rundll32 found: ${stdout.trim()}`);
    results.passed.push('Lock Command Check');
  } catch (error) {
    console.log(`  ✗ rundll32 not found: ${error.message}`);
    results.failed.push('Lock Command Check');
  }

  // Test 4: Shutdown Command (Dry Run)
  console.log('\nTest 4: Shutdown Command (checking shutdown.exe)...');
  try {
    const { stdout } = await execAsync('where shutdown');
    console.log(`  ✓ shutdown.exe found: ${stdout.trim()}`);
    results.passed.push('Shutdown Command Check');
  } catch (error) {
    console.log(`  ✗ shutdown.exe not found: ${error.message}`);
    results.failed.push('Shutdown Command Check');
  }

  // Test 5: VNC Check
  console.log('\nTest 5: VNC Server Check...');
  const fs = await import('fs');
  const path = await import('path');
  const { fileURLToPath } = await import('url');
  
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const vncPath = path.join(__dirname, '..', 'vnc', 'tvnserver.exe');
  
  if (fs.existsSync(vncPath)) {
    console.log(`  ✓ TightVNC found: ${vncPath}`);
    results.passed.push('VNC Server');
  } else {
    console.log(`  ⚠ TightVNC NOT found at: ${vncPath}`);
    console.log(`      Download from: https://tightvnc.com/download.html`);
    console.log(`      Place tvnserver.exe in: ${path.dirname(vncPath)}`);
    results.failed.push('VNC Server (optional)');
  }

  // Test 6: Permissions (Admin check)
  console.log('\nTest 6: Administrator Privileges...');
  try {
    await execAsync('net session');
    console.log('  ✓ Running as Administrator');
    results.passed.push('Administrator Privileges');
  } catch (error) {
    console.log('  ⚠ Not running as Administrator');
    console.log('      Some features (firewall rules) may not work');
    results.failed.push('Administrator Privileges (optional)');
  }

  // Summary
  console.log('\n========================================');
  console.log('Test Summary');
  console.log('========================================');
  console.log(`Passed: ${results.passed.length}/${results.passed.length + results.failed.length}`);
  
  if (results.failed.length > 0) {
    console.log(`Failed/Optional: ${results.failed.length}`);
    console.log('\nFailed tests:');
    results.failed.forEach(test => console.log(`  - ${test}`));
  }

  // Recommendations
  console.log('\n========================================');
  console.log('Recommendations');
  console.log('========================================');
  
  if (!results.passed.includes('VNC Server')) {
    console.log('1. Download TightVNC from https://tightvnc.com/');
    console.log('2. Extract tvnserver.exe to agent/vnc/ folder');
  }
  
  if (!results.passed.includes('Administrator Privileges')) {
    console.log('3. Run agent as Administrator for full functionality');
  }

  console.log('4. Set environment variables:');
  console.log('   $env:AGENT_SERVER="http://HOST-IP:3001"');
  console.log('   $env:AGENT_ROOM="Lab-A"');

  console.log('\n5. Start the agent:');
  console.log('   npm start');

  console.log('\n========================================');
  console.log(results.failed.filter(f => !f.includes('optional')).length === 0 
    ? '✓ System is ready for agent deployment!' 
    : '⚠ Fix required issues before deployment');
  console.log('========================================');
}

runTests().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
