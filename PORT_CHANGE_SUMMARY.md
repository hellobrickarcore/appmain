# Port Change: 3001 → 3002

## Updated Files

All references to port 3001 have been changed to port 3002:

1. **`server/yolo-detection-server.py`**
   - Server now runs on port 3002
   - Updated startup messages

2. **`vite.config.ts`**
   - Proxy target updated to `http://localhost:3002`

3. **`src/services/brickDetectionService.ts`**
   - Updated all API URL references to use port 3002
   - Updated fallback URLs
   - Updated warning messages

4. **`setup-api-connection.sh`**
   - Updated API URL generation to use port 3002

## Start the Server

The server will now run on port 3002:

```bash
cd server
python3 yolo-detection-server.py
```

Server will be available at: `http://0.0.0.0:3002`

## Frontend Connection

- Local development: Uses Vite proxy (automatically forwards `/api` to `localhost:3002`)
- Mobile/Network: Use `http://YOUR_MAC_IP:3002/api` or set `VITE_DETECTION_API_URL=http://YOUR_MAC_IP:3002/api` in `.env`




