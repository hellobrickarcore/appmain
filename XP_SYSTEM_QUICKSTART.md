# XP System Quick Start

## 🚀 Start the XP Service

```bash
cd server
python3 xp-service.py
```

Service runs on port **3005** (separate from dataset-server on 3004).

## 🧪 Run Tests

```bash
cd server
python3 test-xp-system.py
```

This will test:
- Idempotency (no double-awarding)
- Diminishing returns
- Streak logic
- Battle fairness
- Daily soft caps
- Scale performance

## 📱 Frontend Integration

The XP system is already integrated! Just use the helper functions:

```typescript
import { xpHelpers } from '../services/xpService';

// Scan detection
await xpHelpers.scanDetection(5, 3); // 5 detections, 3 unique

// Annotation
await xpHelpers.annotationSubmitted(1);

// Battle
await xpHelpers.battleCompleted('target', 'win', 10, 5, {
  scan_attempts: 5
});
```

## 🔍 Check User XP

```typescript
import { getUserXP } from '../services/xpService';

const userId = localStorage.getItem('hellobrick_userId');
const xp = await getUserXP(userId);
console.log(xp); // { xp_total: 1234, level: 13, streak_count: 5 }
```

## 📊 View Ledger (Debug)

```bash
curl "http://localhost:3005/api/xp/ledger?user_id=YOUR_USER_ID&limit=50"
```

## ⚙️ Update XP Rules

Edit `XP_CONFIG` in `server/xp-service.py` - no redeploy needed, just restart service.

## ✅ Verification Checklist

- [ ] XP service running on port 3005
- [ ] Tests pass (`test-xp-system.py`)
- [ ] Frontend can connect to service
- [ ] Events are being emitted from screens
- [ ] XP is being awarded correctly
- [ ] Ledger shows entries

## 🐛 Troubleshooting

**Service won't start:**
- Check port 3005 is free: `lsof -ti:3005`
- Kill existing process: `kill -9 $(lsof -ti:3005)`

**Frontend can't connect:**
- Check service is running
- Verify API URL in `xpService.ts` matches your setup
- Check CORS is enabled (already configured)

**XP not updating:**
- Check browser console for errors
- Verify events are being emitted
- Check server logs for errors
- Verify user_id is consistent




