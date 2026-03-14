import numpy as np

def get_iou(bb1, bb2):
    """
    Calculate the Intersection over Union (IoU) of two bounding boxes.
    bb1, bb2: [x1, y1, x2, y2]
    """
    x_left = max(bb1[0], bb2[0])
    y_top = max(bb1[1], bb2[1])
    x_right = min(bb1[2], bb2[2])
    y_bottom = min(bb1[3], bb2[3])

    if x_right < x_left or y_bottom < y_top:
        return 0.0

    intersection_area = (x_right - x_left) * (y_bottom - y_top)
    bb1_area = (bb1[2] - bb1[0]) * (bb1[3] - bb1[1])
    bb2_area = (bb2[2] - bb2[0]) * (bb2[3] - bb2[1])
    
    union_area = float(bb1_area + bb2_area - intersection_area)
    if union_area <= 0:
        return 0.0
        
    return intersection_area / union_area

class BrickTrack:
    """
    Represents a single tracked brick in the frame.
    """
    def __init__(self, bbox, track_id):
        self.bbox = bbox  # [x1, y1, x2, y2]
        self.track_id = track_id
        self.hits = 1
        self.disappeared = 0
        self.smoothed_bbox = bbox
        
        # Velocity for simple linear prediction
        self.velocity = np.zeros(4) 
        self.last_bbox = bbox

    def predict(self):
        """Simple linear motion prediction"""
        if self.disappeared > 0:
            # If search is on-going, move slightly by velocity
            self.smoothed_bbox = [
                self.smoothed_bbox[0] + self.velocity[0],
                self.smoothed_bbox[1] + self.velocity[1],
                self.smoothed_bbox[2] + self.velocity[2],
                self.smoothed_bbox[3] + self.velocity[3]
            ]
        return self.smoothed_bbox

    def update(self, new_bbox):
        """Update track with new detection and refine smoothed box"""
        # Calculate velocity
        self.velocity = np.array(new_bbox) - np.array(self.last_bbox)
        self.last_bbox = new_bbox
        
        # EMA (Exponential Moving Average) smoothing for stability
        # Lower alpha = more stable/locked, higher alpha = more responsive
        alpha = 0.6 
        self.smoothed_bbox = [
            alpha * new_bbox[0] + (1 - alpha) * self.smoothed_bbox[0],
            alpha * new_bbox[1] + (1 - alpha) * self.smoothed_bbox[1],
            alpha * new_bbox[2] + (1 - alpha) * self.smoothed_bbox[2],
            alpha * new_bbox[3] + (1 - alpha) * self.smoothed_bbox[3]
        ]
        
        self.bbox = new_bbox
        self.hits += 1
        self.disappeared = 0

class SortTracker:
    """
    Lightweight IoU-based tracker with smoothing.
    Inspired by SORT and ByteTrack logic.
    """
    def __init__(self, max_disappeared=10, min_iou=0.3):
        self.tracks = []
        self.next_id = 1
        self.max_disappeared = max_disappeared
        self.min_iou = min_iou

    def update(self, detections):
        """
        detections: list of [x1, y1, x2, y2] bounding boxes
        Returns a dict of {track_id: [x1, y1, x2, y2]}
        """
        # 1. Predict locations of existing tracks
        for track in self.tracks:
            track.predict()

        if len(self.tracks) == 0:
            for det in detections:
                self.tracks.append(BrickTrack(det, self.next_id))
                self.next_id += 1
            return self.get_active_tracks()

        if len(detections) == 0:
            for track in self.tracks:
                track.disappeared += 1
            self._cleanup()
            return self.get_active_tracks()

        # 2. Match detections to tracks using IoU
        iou_matrix = np.zeros((len(self.tracks), len(detections)), dtype=np.float32)
        for t, track in enumerate(self.tracks):
            for d, det in enumerate(detections):
                iou_matrix[t, d] = get_iou(track.smoothed_bbox, det)

        matched_tracks = set()
        matched_detections = set()

        # Greedy matching for speed (fine for bricks which don't overlap wildly)
        while True:
            if iou_matrix.size == 0 or np.max(iou_matrix) < self.min_iou:
                break
            
            t, d = np.unravel_index(np.argmax(iou_matrix), iou_matrix.shape)
            
            self.tracks[t].update(detections[d])
            matched_tracks.add(t)
            matched_detections.add(d)
            
            # Mask out
            iou_matrix[t, :] = -1
            iou_matrix[:, d] = -1

        # 3. Handle unmatched detections (New Tracks)
        for d in range(len(detections)):
            if d not in matched_detections:
                self.tracks.append(BrickTrack(detections[d], self.next_id))
                self.next_id += 1

        # 4. Handle unmatched tracks (Mark Disappeared)
        for t in range(len(self.tracks)):
            if t not in matched_tracks:
                self.tracks[t].disappeared += 1

        # 5. Cleanup tracks that have been gone too long
        self._cleanup()

        return self.get_active_tracks()

    def _cleanup(self):
        self.tracks = [t for t in self.tracks if t.disappeared <= self.max_disappeared]

    def get_active_tracks(self):
        """Return all tracks including those with grace period persistence"""
        # Return dict: {id: [x1, y1, x2, y2]}
        return {str(t.track_id): t.smoothed_bbox for t in self.tracks}
