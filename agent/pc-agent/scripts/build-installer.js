#!/usr/bin/env node
/**
 * Build script to create distributable agent installer
 * Creates a zip file with agent + installer for easy deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, '..', '..', '..');
const AGENT_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(AGENT_DIR, 'dist');
const INSTALLER_DIR = path.join(AGENT_DIR, '..', 'installer');

console.log('========================================');
console.log('DYCI PC Agent - Installer Builder');
console.log('========================================\n');

async function buildInstaller() {
  try {
    // Step 1: Ensure dependencies are installed
    console.log('Step 1: Checking dependencies...');
    if (!fs.existsSync(path.join(AGENT_DIR, 'node_modules'))) {
      console.log('  Installing npm dependencies...');
      execSync('npm install', { cwd: AGENT_DIR, stdio: 'inherit' });
    }
    console.log('  ✓ Dependencies ready\n');

    // Step 2: Build executable with pkg
    console.log('Step 2: Building executable...');
    if (!fs.existsSync(DIST_DIR)) {
      fs.mkdirSync(DIST_DIR, { recursive: true });
    }

    try {
      execSync('npm run build', { cwd: AGENT_DIR, stdio: 'inherit' });
      console.log('  ✓ Executable built\n');
    } catch (e) {
      console.log('  ⚠ pkg build failed, falling back to Node.js execution');
      console.log('      Agent will require Node.js on target PC\n');
    }

    // Step 3: Create installer package
    console.log('Step 3: Creating installer package...');
    const packageDir = path.join(DIST_DIR, 'dyci-agent-installer');
    
    if (!fs.existsSync(packageDir)) {
      fs.mkdirSync(packageDir, { recursive: true });
    }

    // Copy files to package
    const filesToCopy = [
      { src: path.join(AGENT_DIR, 'src'), dest: path.join(packageDir, 'src') },
      { src: path.join(AGENT_DIR, 'package.json'), dest: path.join(packageDir, 'package.json') },
      { src: path.join(INSTALLER_DIR, 'install-agent.bat'), dest: path.join(packageDir, 'install.bat') },
    ];

    // Copy source files
    if (fs.existsSync(path.join(AGENT_DIR, 'src'))) {
      copyDir(path.join(AGENT_DIR, 'src'), path.join(packageDir, 'src'));
    }

    // Copy package.json
    fs.copyFileSync(
      path.join(AGENT_DIR, 'package.json'),
      path.join(packageDir, 'package.json')
    );

    // Copy installer batch file
    if (fs.existsSync(path.join(INSTALLER_DIR, 'install-agent.bat'))) {
      fs.copyFileSync(
        path.join(INSTALLER_DIR, 'install-agent.bat'),
        path.join(packageDir, 'install.bat')
      );
    }

    // Copy built executable if available
    const builtExe = path.join(DIST_DIR, 'dyci-pc-agent.exe');
    if (fs.existsSync(builtExe)) {
      fs.copyFileSync(builtExe, path.join(packageDir, 'agent.exe'));
      console.log('  ✓ Copied built executable');
    }

    // Create README
    const readme = `DYCI PC Agent - Installation Package
====================================

Quick Install:
1. Run install.bat as Administrator
2. Follow prompts to configure server URL and room
3. Agent will auto-start and connect to dashboard

Manual Install:
1. Install Node.js (https://nodejs.org)
2. Run: npm install
3. Set environment variables:
   - AGENT_SERVER=http://your-server:3001
   - AGENT_ROOM=Your-Room-Name
4. Run: npm start

Files:
- agent.exe      - Standalone agent (if built with pkg)
- src/           - Agent source code
- install.bat    - Windows installer script
- package.json   - Node.js dependencies

Support:
See README.md in the main project for detailed documentation.
`;
    fs.writeFileSync(path.join(packageDir, 'README.txt'), readme);

    console.log('  ✓ Installer package created\n');

    // Step 4: Create zip file (if 7z or PowerShell available)
    console.log('Step 4: Creating distribution archive...');
    const zipName = `dyci-agent-${getVersion()}-windows.zip`;
    const zipPath = path.join(DIST_DIR, zipName);

    try {
      // Try PowerShell compression
      execSync(
        `powershell -Command "Compress-Archive -Path '${packageDir}\\*' -DestinationPath '${zipPath}' -Force"`,
        { stdio: 'inherit' }
      );
      console.log(`  ✓ Created: ${zipName}\n`);
    } catch (e) {
      console.log('  ⚠ Could not create zip automatically');
      console.log(`      Package available at: ${packageDir}`);
      console.log('      Manually zip this folder for distribution\n');
    }

    // Summary
    console.log('========================================');
    console.log('Build Complete!');
    console.log('========================================');
    console.log(`\nOutput: ${DIST_DIR}`);
    console.log(`\nTo install on a guest PC:`);
    console.log(`1. Copy the zip file to the guest PC`);
    console.log(`2. Extract to a folder (e.g., C:\\Temp\\dyci-agent)`);
    console.log(`3. Right-click install.bat → Run as Administrator`);
    console.log(`4. Follow prompts to enter server URL and room name`);
    console.log(`5. Agent will start and appear in the dashboard`);
    console.log(`\nFor help, see: agent/README.md`);
    console.log('========================================');

  } catch (error) {
    console.error('\nBuild failed:', error.message);
    process.exit(1);
  }
}

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function getVersion() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(AGENT_DIR, 'package.json'), 'utf8'));
    return pkg.version;
  } catch (e) {
    return '1.0.0';
  }
}

buildInstaller();
