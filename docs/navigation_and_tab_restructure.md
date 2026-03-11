# Navigation and Tab Restructure

## The Problem
The application had more than 4 items on the bottom navigation, which violated modern iOS HIG practices. Some screens like the Connect/Globe led to a cluttered bottom bar, and the main Feed screen was disconnected from a logical flow. Furthermore, certain game modes would inexplicably trigger onboarding routes for authenticated users.

## The Fix
1. **Nav Consolidation**: Rebuilt the bottom navigation `BottomNav.tsx` to strictly contain 4 primary tabs: Home, Scanner, Sets, and Profile.
2. **Tab Relocation**: Removed the Connect tab from the bottom bar and moved Feed access directly to a highly visible entry point on the Home screen.
3. **Route Guarding**: Updated `App.tsx` routing. `authRequiredScreens` now correctly evaluates if the user is authenticated via `localStorage`. For introductory onboarding, multiplayer specific nodes (`Screen.H2H_MODES`, `Screen.H2H_BATTLE`, etc.) explicitly bypass the `FEATURE_INTRO` redirect so friends sharing links aren't forced through onboarding unnecessarily if they are already authenticated.
4. **Bug Icon Removal**: The debug mode toggle (bug icon) was removed from the scanner's production view and hidden behind a `import.meta.env.MODE === 'development'` check.
