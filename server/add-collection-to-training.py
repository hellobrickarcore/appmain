#!/usr/bin/env python3
"""
Script to add collection items to training queue
Run this after user adds bricks to collection
"""
import json
import sys
from pathlib import Path
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from dataset_server import add_to_training_queue, save_training_queue, load_training_queue, COLLECTION_DIR

def add_collection_to_training(user_id='anonymous'):
    """Add all items from user's collection to training queue"""
    collection_file = COLLECTION_DIR / f"{user_id}_collection.json"
    
    if not collection_file.exists():
        print(f"❌ Collection file not found: {collection_file}")
        return False
    
    # Load collection
    with open(collection_file, 'r') as f:
        collection = json.load(f)
    
    bricks = collection.get('bricks', [])
    if not bricks:
        print("⚠️ No bricks in collection")
        return False
    
    print(f"📦 Found {len(bricks)} bricks in collection")
    
    # Load existing queue
    queue = load_training_queue()
    initial_size = len(queue)
    
    # Add each brick to training queue
    added_count = 0
    for brick in bricks:
        # Create detection object from brick
        detection = {
            'label': brick.get('name', 'Unknown'),
            'partNumber': brick.get('partNumber', brick.get('id', 'Unknown')),
            'color': brick.get('color', 'Unknown'),
            'confidence': 0.7,  # Medium confidence - needs verification
            'box_2d': brick.get('box_2d', [0.1, 0.1, 0.9, 0.9])  # Default box
        }
        
        # Use brick image if available, otherwise use placeholder
        image_base64 = brick.get('image', '')
        if not image_base64 or not image_base64.startswith('data:image'):
            # Skip if no valid image
            print(f"⚠️ Skipping brick {brick.get('id')} - no image")
            continue
        
        # Add to training queue
        item = add_to_training_queue(image_base64, detection, user_id)
        added_count += 1
        print(f"✅ Added {brick.get('name', 'Unknown')} to training queue (confidence: {detection['confidence']*100:.0f}%)")
    
    # Save updated queue
    queue = load_training_queue()  # Reload to get all items
    save_training_queue(queue)
    
    print(f"\n✅ Added {added_count} items to training queue")
    print(f"📊 Queue size: {initial_size} -> {len(queue)}")
    
    return True

if __name__ == '__main__':
    user_id = sys.argv[1] if len(sys.argv) > 1 else 'anonymous'
    add_collection_to_training(user_id)

