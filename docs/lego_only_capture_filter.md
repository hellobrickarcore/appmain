# LEGO-Only Capture Filter

The capture pipeline prioritizes official LEGO bricks and aggressively rejects non-LEGO geometry (e.g., Mega Bloks).

## Two-Stage Verification

### 1. Proposal Detection
The primary detector proposes "brick-like" candidates. These are high-recall, low-precision proposals to ensure no valid bricks are missed.

### 2. LEGO-Only Classification
Each proposal is passed through a verifier that classifies it into:
- **`official_lego`**: High confidence matches to official LEGO geometry and branding.
- **`non_lego`**: Clearly different systems (oversized studs, toddler blocks, incompatible locking profiles).
- **`uncertain_lego_like`**: Visually near-identical clones.

## Rejection Rules
- **Non-LEGO**: Discarded and logged in the rejected bucket.
- **Uncertain**: Kept in an internal diagnostic bucket but **EXCLUDED** from the official LEGO count shown to the user.

## Geometry Heuristics
- **Stud Spacing**: Rejection of toddler-scale bricks.
- **Proportion Constraints**: Rejection of impossible elongated "pseudo-bricks".
- **Brand Cues**: Identification of "LEGO" stamps vs blank or non-compliant studs.
