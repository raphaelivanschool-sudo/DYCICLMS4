const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let backendProcess = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function startBackend() {
  console.log('Starting backend server...');
  backendProcess = spawn('node', ['server/index.js'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });
  
  backendProcess.on('error', (err) => {
    console.error('Failed to start backend:', err);
  });
  
  backendProcess.on('exit', (code) => {
    console.log(`Backend exited with code ${code}`);
  });
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    // In development, load from the Vite dev server
    mainWindow.loadURL('http://localhost:5173');
  } else {
    // In production, load from the built files
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Open DevTools for debugging (remove this in production later)
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  // Start backend server first
  startBackend();
  
  // Wait a moment for backend to start, then create window
  setTimeout(() => {
    createWindow();
  }, 2000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Kill backend process when app closes
  if (backendProcess) {
    backendProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});
