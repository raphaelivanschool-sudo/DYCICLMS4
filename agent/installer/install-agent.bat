@echo off
setlocal EnableDelayedExpansion

echo ============================================
echo    DYCI PC Agent Installer
echo ============================================
echo.

:: Check for admin privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This installer requires Administrator privileges.
    echo Please right-click and select "Run as Administrator"
    pause
    exit /b 1
)

:: Parse command line arguments
set "SERVER_URL=http://localhost:3001"
set "ROOM=Default"
set "COMPUTER_NAME="

:parse_args
if "%~1"=="" goto :done_parsing
if /I "%~1"=="/SERVER" set "SERVER_URL=%~2" & shift & shift & goto :parse_args
if /I "%~1"=="/ROOM" set "ROOM=%~2" & shift & shift & goto :parse_args
if /I "%~1"=="/NAME" set "COMPUTER_NAME=%~2" & shift & shift & goto :parse_args
if /I "%~1"=="/S" set "SILENT_MODE=1" & shift & goto :parse_args
shift
goto :parse_args
:done_parsing

:: Set paths
set "AGENT_DIR=%ProgramFiles%\DYCI-Agent"
set "CONFIG_DIR=%ProgramData%\DYCI-Agent"
set "AGENT_EXE=%AGENT_DIR%\agent.exe"

:: Display configuration
if not defined SILENT_MODE (
    echo Configuration:
    echo   Server URL: %SERVER_URL%
    echo   Room: %ROOM%
    echo   Computer Name: %COMPUTER_NAME%
    echo   Install Dir: %AGENT_DIR%
    echo.
    echo Press any key to continue or Ctrl+C to cancel...
    pause >nul
)

echo.
echo [1/5] Creating directories...
if not exist "%AGENT_DIR%" mkdir "%AGENT_DIR%"
if not exist "%CONFIG_DIR%" mkdir "%CONFIG_DIR%"
echo       Done.

echo.
echo [2/5] Generating configuration...
:: Generate unique IDs
set "COMPUTER_ID=pc-%RANDOM%%RANDOM%"
set "AGENT_TOKEN=agent-%RANDOM%%RANDOM%%RANDOM%"

:: Create config JSON using PowerShell
powershell -Command "$config = @{serverUrl='%SERVER_URL%'; agentToken='%AGENT_TOKEN%'; room='%ROOM%'; computerId='%COMPUTER_ID%'; computerName='%COMPUTER_NAME%'; autoStartVNC=$false; heartbeatInterval=30000}; $config | ConvertTo-Json | Out-File -FilePath '%CONFIG_DIR%\config.json' -Encoding utf8"
echo       Done.
echo       Computer ID: %COMPUTER_ID%
echo       Token: %AGENT_TOKEN:~0,20%...

echo.
echo [3/5] Creating firewall rule...
netsh advfirewall firewall show rule name="DYCI PC Agent" >nul 2>&1
if %errorLevel% equ 0 (
    echo       Rule already exists.
) else (
    netsh advfirewall firewall add rule name="DYCI PC Agent" dir=in action=allow protocol=tcp localport=3001,5900-5905 program="%AGENT_EXE%" description="Allows DYCI Lab Management Agent to communicate" >nul 2>&1
    if %errorLevel% equ 0 (
        echo       Rule created successfully.
    ) else (
        echo       WARNING: Failed to create firewall rule.
        echo       You may need to manually allow the agent in Windows Firewall.
    )
)

echo.
echo [4/5] Installing Windows Service...
echo       NOTE: Please ensure the agent executable is copied to:
echo       %AGENT_EXE%
echo.
echo       To install manually after copying the agent:
echo       1. Open Command Prompt as Administrator
echo       2. Run: cd /d "%AGENT_DIR%"
echo       3. Run: agent.exe --install-service
echo       4. Run: net start "DYCI PC Agent"

echo.
echo [5/5] Creating startup shortcut...
if exist "%AGENT_EXE%" (
    copy /Y "%AGENT_EXE%" "%AGENT_DIR%\" >nul 2>&1
)
echo       Done.

echo.
echo ============================================
echo    Installation Complete!
echo ============================================
echo.
echo Configuration saved to:
echo   %CONFIG_DIR%\config.json
echo.
echo Next steps:
echo   1. Copy agent.exe to: %AGENT_DIR%\
echo   2. Install the service: agent.exe --install-service
echo   3. Or run manually: agent.exe
echo   4. The agent will connect to: %SERVER_URL%
echo   5. Agent will appear in dashboard under room: %ROOM%
echo.
echo To uninstall:
echo   Run: agent.exe --uninstall-service
echo   Or delete: %AGENT_DIR% and %CONFIG_DIR%
echo.

if not defined SILENT_MODE (
    pause
)

endlocal
