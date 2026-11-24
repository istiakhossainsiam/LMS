@echo off
echo ====================================================================
echo   Learn With Maruf Ahmed — Cloud LMS 2.0 (FastAPI + React 19)
echo ====================================================================
start "LWMA 2.0 FastAPI Backend (Port 8000)" cmd /k "cd /d "%~dp0backend" && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
start "LWMA 2.0 React 19 Frontend (Port 5173)" cmd /k "cd /d "%~dp0frontend" && npm.cmd run dev"
echo Both servers are launching...
echo Frontend: http://localhost:5173
echo Backend API Docs: http://127.0.0.1:8000/docs
