# How to Start the Servers

## ⚠️ Important: Run commands separately, one at a time

## Option 1: Use the helper script

Start the backend:
```bash
./start-backend.sh
```

Then in a **new terminal**, start the frontend:
```bash
npm run dev
```

## Option 2: Manual commands (run separately!)

### Terminal 1 - Backend Server:
```bash
cd server
python3 yolo-detection-server.py
```

### Terminal 2 - Frontend (open a NEW terminal):
```bash
npm run dev
```

## What to expect:

- Backend server runs on `http://0.0.0.0:3002`
- Frontend runs on `http://localhost:5173`
- Open browser to `http://localhost:5173` to use the app

## Common Issues:

**"no such file or directory: server"**
- Make sure you're in `/Users/akeemojuko/Downloads/hellobrick` directory
- Run `pwd` to check your current directory

**Multiple commands on one line don't work**
- Each command must be on its own line
- Or use `&&` between them: `cd server && python3 yolo-detection-server.py`




