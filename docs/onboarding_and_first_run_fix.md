# Documentation: Onboarding and First Run Fix

## Problem
The app was skipping onboarding and jumping straight to the Home screen on fresh installs. This was caused by several issues in `App.tsx`:
1. `getInitialScreen` prioritized authentication status over onboarding status.
2. The logic for checking `hellobrick_onboarding_finished` was using truthy checks on a potentially null/undefined string from `localStorage`, which could be unreliable.
3. Navigation redirects after authentication were not strictly enforcing the onboarding sequence.

## Fix
I have refactored the routing logic in `App.tsx` to follow these rules:

1.  **Strict Order**: `FEATURE_INTRO` is now the absolute first screen shown if `hellobrick_onboarding_finished` is not explicitly `'true'`.
2.  **Auth Integration**: After successful authentication (Google/Apple/Email), if onboarding is not finished, the user is redirected to the `FEATURE_INTRO` phase instead of `HOME`.
3.  **Navigation Guard**: Added a global protection check in `handleNavigate`. Any attempt to navigate to `Screen.HOME` will be intercepted and redirected to `FEATURE_INTRO` if the onboarding-finished flag is missing.
4.  **Completion**: The flag `hellobrick_onboarding_finished` is only set to `'true'` once the user finishes the `SUBSCRIPTION` (paywall) screen, which is the final step of the intro flow.

## Verification
- Resetting local storage should now trigger the full flow: Intro Screens -> Auth -> Paywall -> Home.
- Authenticating should not bypass the intro screens.
