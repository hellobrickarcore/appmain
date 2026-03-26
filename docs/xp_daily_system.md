# Documentation: XP Daily System

## Overview
The XP system has been refactored to focus on **daily engagement** and persistent server-side tracking.

## Core Rule: "Earn XP daily"
- **UTC Timezone**: All daily calculations are based on UTC (00:00 to 23:59).
- **Daily Persistence**: XP events are sent to the server and aggregated into a `user_xp_events` table.
- **Aggregates**: A daily total is maintained for each user to track "Today's XP".

## User Interface Updates
1.  **Profile Screen**:
    - Clearly displays "Earn XP daily" under the username.
    - Shows both **Total XP** and **Today's XP**.
2.  **Help Text**: The "How to earn XP" documentation (in Progress/Help screens) now explicitly mentions the daily earning potential.

## Data Model (Supabase Integration)
- **user_xp_events**: Records every action (verify, scan, puzzle) with its UTC day.
- **user_xp_totals**: Real-time aggregation of total and today's XP.
- **Leaderboards**: Updated based on daily and total XP totals.

## Error Handling
Fixed previous issues where XP queries would fail silently with empty `{}` logs. All failures now include full error context and response bodies.
