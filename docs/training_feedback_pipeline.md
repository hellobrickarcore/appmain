# Documentation: Training Feedback Pipeline

## Overview
The **Verify Bricks** feature is now a core part of the HelloBrick training loop. It allows users to confirm or correct AI predictions, directly improving our model's accuracy.

## Real Data Integration
- **Crop Images**: The training screen now displays actual brick crop images generated from detection bounding boxes. 
- **Metadata**: Each card shows the predicted label, color, dimensions, and identity confidence.

## The Feedback Loop
When a user votes (Yes/No):
1.  **Persistence**: The response is saved to the `training_feedback` table in Supabase.
2.  **Correction Mapping**:
    - **Yes (Confirm)**: Validates the current prediction.
    - **No (Reject/Correct)**: Marks the prediction as incorrect and queues it for manual re-labeling or retraining.
3.  **Aggregation**: Once an item receives a threshold of matching votes (e.g., 5), it is promoted to the "verified" dataset.

## XP Rewards
Each verification action awards **5 XP** to the user (subject to daily caps). This XP is persisted and reflected immediately in the user's profile.

## Technical Implementation
- **Service**: `src/services/trainingFeedbackService.ts` handles the multi-step process of persisting feedback and emitting XP events.
- **Screen**: `src/screens/TrainingScreen.tsx` provides the interactive UI for the verification sequence.
