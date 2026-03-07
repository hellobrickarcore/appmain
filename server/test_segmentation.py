from ultralytics import YOLO
import cv2

print("Loading model...")
model = YOLO('yolov8n-seg.pt')

print("Running inference on dog...")
img = cv2.imread('test-dog.jpg')
results = model(img)

print("Plotting results...")
for r in results:
    # plot() returns a numpy array with drawn boxes & masks
    # We can control what is drawn. By default it draws both boxes and masks.
    im_bgr = r.plot(labels=True, boxes=True, masks=True)
    cv2.imwrite('/Users/akeemojuko/.gemini/antigravity/brain/28374812-ce52-4c34-9f29-10872a8c51b4/segmentation_proof.jpg', im_bgr)

print("Visualization saved! Check the artifact folder.")
