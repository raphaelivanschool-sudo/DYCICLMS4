# DYCI PC Agent

Windows PC Agent for the DYCI Lab Management System. Allows remote control of lab computers including screen viewing, locking, and power management.

## Features

- **Real-time Connection**: WebSocket connection to host server with auto-reconnect
- **Screen Viewing**: Integrated VNC server for remote viewing
- **PC Lock**: Lock workstation instantly
- **Power Control**: Shutdown and restart computers
- **System Info**: Reports CPU, RAM, user, IP, and status
- **Firewall Bypass**: Multiple strategies including Windows Firewall rules and HTTP polling fallback
- **Windows Service**: Runs as a system service for automatic startup

## Quick Start

### 1. Install on Guest PC (Run as Administrator)

```powershell
# Download and run the installer
DYCI-Agent-Setup.exe /S /SERVER=http://192.168.1.100:3001 /ROOM=Lab-A
```

Or manually:

```powershell
# Install Node.js dependencies
cd agent/pc-agent
npm install

# Create Windows Firewall rule
New-NetFirewallRule -DisplayName "DYCI PC Agent" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 3001,5900-5905

# Start the agent
npm start
```

### 2. Register Agent

The agent will automatically connect to the server and register itself. It appears in the dashboard under the specified room.

### 3. Control from Dashboard

1. Open Agent Control Panel in the web interface
2. Select the PC from the grid
3. Click actions: View Screen, Lock, Shutdown, Restart

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `AGENT_SERVER` | Server URL | `http://localhost:3001` |
| `AGENT_TOKEN` | Authentication token | `agent-token-placeholder` |
| `AGENT_ROOM` | Room/Location label | `Default` |
| `DEBUG` | Enable debug logging | `false` |

## Commands

The agent responds to these commands from the server:

- `lock` - Lock the Windows workstation
- `shutdown` - Power off the PC (params: `{ delay: seconds }`)
- `restart` - Restart the PC (params: `{ delay: seconds }`)
- `vnc-start` - Start VNC server for screen viewing
- `vnc-stop` - Stop VNC server
- `screenshot` - Take a screenshot
- `get-info` - Return system information

## Firewall Configuration

The agent attempts to auto-configure Windows Firewall. If that fails:

```powershell
# Manual firewall rule (run as admin)
New-NetFirewallRule -DisplayName "DYCI PC Agent" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 3001,5900-5905 -Program "C:\Program Files\DYCI-Agent\agent.exe"
```

## Building from Source

```bash
cd agent/pc-agent

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build executable
npm run build

# Build installer
npm run build:installer
```

## Troubleshooting

**Agent not connecting:**
- Check Windows Firewall allows outbound connections to port 3001
- Verify server URL is correct
- Check agent logs: `%PROGRAMDATA%\DYCI-Agent\agent.log`

**VNC not starting:**
- Ensure TightVNC is bundled in `agent/vnc/`
- Check port 5900 is not blocked
- Try running agent as Administrator

**Screen view not working:**
- Verify VNC server started successfully
- Check VNC password in command response
- Ensure no other VNC server is running

## Architecture

```
Host PC (Web Dashboard)
    |
    | WebSocket (Socket.io)
    v
Guest PC (Agent)
    |-- System Tray Icon
    |-- Windows Service
    |-- VNC Server (TightVNC)
    |-- Windows APIs (Lock, Shutdown)
```

## License

MIT - Part of DYCI Lab Management System
