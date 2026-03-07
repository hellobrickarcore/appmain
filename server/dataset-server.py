#!/usr/bin/env python3
"""
Dataset Collection Server for HelloBrick
Handles saving verified detection data for model training
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import json
import os
from pathlib import Path
from datetime import datetime
import cv2
import numpy as np
from PIL import Image
import io
import heapq

app = Flask(__name__)
CORS(app)

# Dataset storage directory
DATASET_DIR = Path("models/user-contributed-dataset")
DATASET_DIR.mkdir(parents=True, exist_ok=True)
TRAIN_IMAGES_DIR = DATASET_DIR / "train" / "images"
TRAIN_LABELS_DIR = DATASET_DIR / "train" / "labels"
VAL_IMAGES_DIR = DATASET_DIR / "val" / "images"
VAL_LABELS_DIR = DATASET_DIR / "val" / "labels"
TRAINING_QUEUE_DIR = DATASET_DIR / "training-queue"
COLLECTION_DIR = DATASET_DIR / "collections"

# Create directories
for dir_path in [TRAIN_IMAGES_DIR, TRAIN_LABELS_DIR, VAL_IMAGES_DIR, VAL_LABELS_DIR, TRAINING_QUEUE_DIR, COLLECTION_DIR]:
    dir_path.mkdir(parents=True, exist_ok=True)

# Training queue file (priority queue: lower confidence = higher priority)
TRAINING_QUEUE_FILE = DATASET_DIR / "training_queue.json"
MAX_QUEUE_SIZE = 1000  # Keep top 1000 weakest items

# Class mapping for YOLO format
CLASS_MAPPING = {
    # Map from part numbers to class indices
    '3001': 0,  # 2x4 Brick
    '3002': 1,  # 2x2 Brick
    '3003': 2,  # 2x3 Brick
    '3004': 3,  # 1x2 Brick
    '3005': 4,  # 1x1 Brick
    '3020': 5,  # 2x4 Plate
    '3021': 6,  # 2x3 Plate
    '3022': 7,  # 2x2 Plate
    '3023': 8,  # 1x2 Plate
    '3024': 9,  # 1x1 Plate
}

def load_training_queue():
    """Load training queue from file"""
    if TRAINING_QUEUE_FILE.exists():
        try:
            with open(TRAINING_QUEUE_FILE, 'r') as f:
                data = json.load(f)
                return data.get('items', [])
        except:
            return []
    return []

def save_training_queue(queue):
    """Save training queue to file, keeping only weakest items"""
    # Sort by confidence (ascending - lower confidence first)
    queue.sort(key=lambda x: x.get('confidence', 1.0))
    # Keep only top MAX_QUEUE_SIZE weakest items
    queue = queue[:MAX_QUEUE_SIZE]
    
    with open(TRAINING_QUEUE_FILE, 'w') as f:
        json.dump({'items': queue}, f, indent=2)
    return queue

def add_to_training_queue(image_base64, detection, user_id='anonymous'):
    """Add detection to training queue (priority: lower confidence = higher priority)"""
    queue = load_training_queue()
    
    # Calculate average confidence for this image
    confidence = detection.get('confidence', 0.5)
    
    # Create training item
    item = {
        'id': f"train_{datetime.now().timestamp()}_{len(queue)}",
        'image': image_base64,
        'detection': detection,
        'predictedLabel': detection.get('label', 'Unknown'),
        'confidence': confidence,
        'partNumber': detection.get('partNumber', 'Unknown'),
        'color': detection.get('color', 'Unknown'),
        'box_2d': detection.get('box_2d', [0, 0, 1, 1]),
        'user_id': user_id,
        'timestamp': datetime.now().timestamp(),
        'votes': [],
        'currentVotes': 0,
        'required': 5
    }
    
    queue.append(item)
    
    # Save queue (automatically keeps only weakest items)
    queue = save_training_queue(queue)
    
    return item

def base64_to_image(base64_string):
    """Convert base64 string to PIL Image"""
    if ',' in base64_string:
        base64_string = base64_string.split(',')[1]
    image_data = base64.b64decode(base64_string)
    return Image.open(io.BytesIO(image_data))

def convert_to_yolo_format(detections, image_width, image_height):
    """Convert detections to YOLO format labels"""
    yolo_labels = []
    for det in detections:
        if not det.get('box_2d') or len(det['box_2d']) != 4:
            continue
        
        # box_2d is [ymin, xmin, ymax, xmax] in normalized (0-1) format
        ymin, xmin, ymax, xmax = det['box_2d']
        
        # Convert to YOLO format: class_id center_x center_y width height (all normalized)
        center_x = (xmin + xmax) / 2.0
        center_y = (ymin + ymax) / 2.0
        width = xmax - xmin
        height = ymax - ymin
        
        # Get class ID from part number
        part_number = det.get('partNumber', 'Unknown')
        class_id = CLASS_MAPPING.get(part_number, 0)  # Default to 0 if unknown
        
        yolo_labels.append(f"{class_id} {center_x:.6f} {center_y:.6f} {width:.6f} {height:.6f}\n")
    
    return ''.join(yolo_labels)

@app.route('/api/dataset/save', methods=['POST'])
def save_dataset():
    """Save verified detection data to dataset AND add to training queue"""
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        image_base64 = data.get('image')
        detections = data.get('detections', [])
        verified_results = data.get('verifiedResults', {})
        user_id = data.get('userId', 'anonymous')
        timestamp = data.get('timestamp', int(datetime.now().timestamp()))
        
        if not image_base64:
            return jsonify({'error': 'No image provided'}), 400
        
        if not detections:
            return jsonify({'error': 'No detections provided'}), 400
        
        # Convert base64 to image
        try:
            image = base64_to_image(image_base64)
            image_width, image_height = image.size
        except Exception as e:
            return jsonify({'error': f'Invalid image: {str(e)}'}), 400
        
        # Generate unique filename
        filename = f"user_{timestamp}_{len(detections)}bricks"
        
        # Determine train/val split (80/20)
        import random
        is_train = random.random() < 0.8
        images_dir = TRAIN_IMAGES_DIR if is_train else VAL_IMAGES_DIR
        labels_dir = TRAIN_LABELS_DIR if is_train else VAL_LABELS_DIR
        
        # Save image
        image_path = images_dir / f"{filename}.jpg"
        image.save(image_path, 'JPEG', quality=95)
        
        # Convert detections to YOLO format and save label
        yolo_labels = convert_to_yolo_format(detections, image_width, image_height)
        label_path = labels_dir / f"{filename}.txt"
        with open(label_path, 'w') as f:
            f.write(yolo_labels)
        
        # Save metadata
        metadata = {
            'filename': filename,
            'timestamp': timestamp,
            'detections_count': len(detections),
            'image_size': [image_width, image_height],
            'split': 'train' if is_train else 'val',
            'detections': detections,
            'user_id': user_id
        }
        metadata_path = (images_dir if is_train else VAL_IMAGES_DIR).parent / f"{filename}_meta.json"
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        # ADD ALL DETECTIONS TO TRAINING QUEUE (even high confidence)
        training_items_added = []
        for detection in detections:
            item = add_to_training_queue(image_base64, detection, user_id)
            training_items_added.append(item['id'])
        
        print(f"✅ Saved dataset entry: {filename} ({len(detections)} bricks) -> {'train' if is_train else 'val'}")
        print(f"✅ Added {len(training_items_added)} items to training queue")
        
        return jsonify({
            'success': True,
            'filename': filename,
            'split': 'train' if is_train else 'val',
            'detections_count': len(detections),
            'training_items_added': len(training_items_added),
            'message': f'Saved {len(detections)} detections to dataset and training queue'
        }), 200
        
    except Exception as e:
        print(f"❌ Error saving dataset: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/dataset/training/next', methods=['GET'])
def get_next_training_item():
    """Get next training item from queue (lowest confidence first)"""
    try:
        queue = load_training_queue()
        
        if not queue:
            return jsonify({
                'success': False,
                'message': 'No training items available'
            }), 404
        
        # Sort by confidence (ascending - lowest first)
        queue.sort(key=lambda x: x.get('confidence', 1.0))
        
        # Get first item (lowest confidence)
        item = queue[0]
        
        # Return item data
        return jsonify({
            'success': True,
            'item': {
                'id': item['id'],
                'image': item['image'],
                'predictedLabel': item['predictedLabel'],
                'confidence': f"{item['confidence']*100:.0f}%",
                'partNumber': item.get('partNumber', 'Unknown'),
                'color': item.get('color', 'Unknown'),
                'currentVotes': len(item.get('votes', [])),
                'required': item.get('required', 5)
            }
        }), 200
        
    except Exception as e:
        print(f"❌ Error getting training item: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/dataset/stats', methods=['GET'])
def get_dataset_stats():
    """Get statistics about the collected dataset"""
    try:
        train_images = len(list(TRAIN_IMAGES_DIR.glob('*.jpg')))
        val_images = len(list(VAL_IMAGES_DIR.glob('*.jpg')))
        train_labels = len(list(TRAIN_LABELS_DIR.glob('*.txt')))
        val_labels = len(list(VAL_LABELS_DIR.glob('*.txt')))
        queue_size = len(load_training_queue())
        
        return jsonify({
            'train': {
                'images': train_images,
                'labels': train_labels
            },
            'val': {
                'images': val_images,
                'labels': val_labels
            },
            'total': {
                'images': train_images + val_images,
                'labels': train_labels + val_labels
            },
            'trainingQueue': {
                'size': queue_size,
                'maxSize': MAX_QUEUE_SIZE
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/dataset/training/vote', methods=['POST'])
def save_training_vote():
    """Save a training vote and check for consensus"""
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        item_id = data.get('itemId')
        confirmed = data.get('confirmed', False)
        user_id = data.get('userId', 'anonymous')
        timestamp = data.get('timestamp', int(datetime.now().timestamp()))
        
        if not item_id:
            return jsonify({'error': 'No item ID provided'}), 400
        
        # Load queue
        queue = load_training_queue()
        
        # Find item
        item = None
        item_index = None
        for i, q_item in enumerate(queue):
            if q_item['id'] == item_id:
                item = q_item
                item_index = i
                break
        
        if not item:
            return jsonify({'error': 'Item not found'}), 404
        
        # Add vote
        if 'votes' not in item:
            item['votes'] = []
        
        vote = {
            'user_id': user_id,
            'confirmed': confirmed,
            'timestamp': timestamp
        }
        item['votes'].append(vote)
        
        # Check for consensus (5 votes, all confirmed)
        confirmed_votes = [v for v in item['votes'] if v['confirmed']]
        consensus_reached = len(confirmed_votes) >= 5
        
        # Update queue
        queue[item_index] = item
        save_training_queue(queue)
        
        # If consensus reached, convert to training data
        if consensus_reached:
            # Convert to YOLO format and save to dataset
            detection = item['detection']
            image = base64_to_image(item['image'])
            image_width, image_height = image.size
            
            # Save to dataset
            filename = f"consensus_{item_id}"
            is_train = True  # Consensus items go to training
            
            image_path = TRAIN_IMAGES_DIR / f"{filename}.jpg"
            image.save(image_path, 'JPEG', quality=95)
            
            yolo_labels = convert_to_yolo_format([detection], image_width, image_height)
            label_path = TRAIN_LABELS_DIR / f"{filename}.txt"
            with open(label_path, 'w') as f:
                f.write(yolo_labels)
            
            # Remove from queue
            queue.pop(item_index)
            save_training_queue(queue)
            
            print(f"✅ Consensus reached for {item_id}, saved to dataset")
        
        return jsonify({
            'success': True,
            'currentVotes': len(item['votes']),
            'required': 5,
            'consensusReached': consensus_reached,
            'message': 'Vote saved successfully'
        }), 200
        
    except Exception as e:
        print(f"❌ Error saving vote: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/dataset/collection/get', methods=['GET'])
def get_user_collection():
    """Get user's brick collection"""
    try:
        user_id = request.args.get('userId', 'anonymous')
        collection_file = COLLECTION_DIR / f"{user_id}_collection.json"
        
        if collection_file.exists():
            with open(collection_file, 'r') as f:
                return jsonify(json.load(f)), 200
        else:
            return jsonify({
                'bricks': [],
                'totalCount': 0,
                'uniqueCount': 0
            }), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/dataset/collection/save', methods=['POST'])
def save_user_collection():
    """Save user's brick collection"""
    try:
        data = request.json
        user_id = data.get('userId', 'anonymous')
        bricks = data.get('bricks', [])
        
        collection = {
            'userId': user_id,
            'bricks': bricks,
            'totalCount': sum(b.get('count', 0) for b in bricks),
            'uniqueCount': len(bricks),
            'lastUpdated': datetime.now().timestamp()
        }
        
        collection_file = COLLECTION_DIR / f"{user_id}_collection.json"
        with open(collection_file, 'w') as f:
            json.dump(collection, f, indent=2)
        
        # Automatically add collection items to training queue
        training_items_added = []
        for brick in bricks:
            # Create detection object from brick
            detection = {
                'label': brick.get('name', 'Unknown'),
                'partNumber': brick.get('partNumber', brick.get('id', 'Unknown')),
                'color': brick.get('color', 'Unknown'),
                'confidence': 0.7,  # Medium confidence - needs verification
                'box_2d': brick.get('box_2d', [0.1, 0.1, 0.9, 0.9])
            }
            
            # Use brick image if available
            image_base64 = brick.get('image', '')
            if image_base64 and image_base64.startswith('data:image'):
                item = add_to_training_queue(image_base64, detection, user_id)
                training_items_added.append(item['id'])
        
        # Save updated queue
        if training_items_added:
            queue = load_training_queue()
            save_training_queue(queue)
        
        return jsonify({
            'success': True,
            'message': 'Collection saved',
            'trainingItemsAdded': len(training_items_added)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting Dataset Collection Server...")
    print(f"📁 Dataset directory: {DATASET_DIR.absolute()}")
    print(f"   Train images: {TRAIN_IMAGES_DIR}")
    print(f"   Val images: {VAL_IMAGES_DIR}")
    print(f"   Training queue: {TRAINING_QUEUE_FILE}")
    app.run(host='0.0.0.0', port=3004, debug=True)

