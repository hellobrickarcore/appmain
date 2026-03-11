# XP & Leaderboard System (Phase 15)

## Problem
The app lacked clear goals and a social/competitive layer to drive engagement.

## Solution
1. **XP Helpers**: Created a standardized service (`xpService.ts`) to emit authenticated events.
2. **Event Mapping**: 
   - **Scan Detection**: 10 XP + Bonus for unique bricks.
   - **Puzzle Completion**: 30 XP + Gem rewards.
   - **Battle**: Dynamic based on performance.
3. **Leaderboard**:
   - Monthly "Brick Cup" (30-day rounds).
   - Real-time rankings via `CONFIG.XP_LEADERBOARD`.
   - Rewards: Top 3 win gift cards.
4. **Integration**: Total XP displayed on Profile with a high-impact CTA to the rankings.
