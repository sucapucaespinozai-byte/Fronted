@echo off
cd /d "%~dp0"
powershell.exe -NoProfile -Command "try { $r=Invoke-WebRequest 'http://localhost:4200/login' -UseBasicParsing -TimeoutSec 3; if ($r.StatusCode -eq 200) { exit 0 } } catch {}; exit 1"
if not errorlevel 1 (
  echo El frontend ya esta encendido. Abre http://localhost:4200/login
  pause
  exit /b 0
)
call npm start
pause
