#!/usr/bin/env node
import Service from 'node-windows';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svc = new Service.Service({
  name: 'DYCI PC Agent',
  description: 'Agent for DYCI Lab Management System - allows remote PC control',
  script: path.join(__dirname, '..', 'src', 'index.js'),
  nodeOptions: ['--experimental-modules'],
  env: [
    {
      name: 'NODE_ENV',
      value: 'production'
    }
  ]
});

// Listen for service events
svc.on('install', () => {
  console.log('Service installed successfully');
  svc.start();
});

svc.on('alreadyinstalled', () => {
  console.log('Service is already installed');
});

svc.on('invalidinstallation', () => {
  console.log('Invalid installation');
});

svc.on('start', () => {
  console.log('Service started successfully');
});

svc.on('stop', () => {
  console.log('Service stopped');
});

svc.on('error', (error) => {
  console.error('Service error:', error);
});

// Handle command line arguments
const command = process.argv[2];

switch (command) {
  case 'install':
    console.log('Installing DYCI PC Agent service...');
    svc.install();
    break;
  case 'uninstall':
    console.log('Uninstalling DYCI PC Agent service...');
    svc.uninstall();
    break;
  case 'start':
    console.log('Starting DYCI PC Agent service...');
    svc.start();
    break;
  case 'stop':
    console.log('Stopping DYCI PC Agent service...');
    svc.stop();
    break;
  case 'restart':
    console.log('Restarting DYCI PC Agent service...');
    svc.stop();
    setTimeout(() => svc.start(), 2000);
    break;
  default:
    console.log(
      'DYCI PC Agent Service Manager\n' +
      'Usage: node service-install.js [command]\n\n' +
      'Commands:\n' +
      '  install     - Install and start the service\n' +
      '  uninstall   - Stop and remove the service\n' +
      '  start       - Start the service\n' +
      '  stop        - Stop the service\n' +
      '  restart     - Restart the service\n\n' +
      'Examples:\n' +
      '  node scripts/service-install.js install\n' +
      '  node scripts/service-install.js uninstall\n'
    );
}
