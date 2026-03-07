# 🚀 Starting HelloBrick Locally

## Quick Start

### Option 1: Use the Startup Script

```bash
cd /Users/akeemojuko/Downloads/hellobrick
./start-local.sh
```

This script will:
- Check if ports 3001 (backend) and 5173 (frontend) are available
- Start both servers automatically
- Show you the URLs to access the app

### Option 2: Manual Start (Two Terminals)

#### Terminal 1: Backend Detection Server
```bash
cd /Users/akeemojuko/Downloads/hellobrick/server
python3 yolo-detection-server.py
```

You should see:
```
🚀 Starting YOLO Detection Server...
✅ Model loaded successfully
📡 Listening on http://0.0.0.0:3001
```

#### Terminal 2: Frontend Development Server
```bash
cd /Users/akeemojuko/Downloads/hellobrick
npm run dev
```

You should see:
```
VITE v5.4.21  ready
➜  Local:   http://localhost:5173/
```

## Access the App

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api/health

## Check Server Status

Run the status checker:
```bash
./check-servers.sh
```

## Troubleshooting

### Port Already in Use

If port 3001 or 5173 is already in use:

1. Find what's using the port:
   ```bash
   lsof -i :3001
   lsof -i :5173
   ```

2. Kill the process or use different ports

3. For backend, edit `server/yolo-detection-server.py` line 317 and change the port

4. For frontend, edit `vite.config.ts` line 10 and change the port

### Backend Not Starting

1. Check Python dependencies:
   ```bash
   pip3 install flask flask-cors torch pillow ultralytics opencv-python
   ```

2. Check if YOLO model exists:
   ```bash
   ls -la server/models/yolo11*.pt server/yolo11*.pt
   ```

3. Check backend logs:
   ```bash
   tail -f /tmp/hellobrick-backend.log
   ```

### Frontend Not Starting

1. Install dependencies:
   ```bash
   npm install
   ```

2. Check frontend logs:
   ```bash
   tail -f /tmp/hellobrick-frontend.log
   ```

## Current Status

Based on logs, your frontend is currently running on **http://localhost:5173**

Backend status: Check with `./check-servers.sh` or visit http://localhost:3001/api/health




