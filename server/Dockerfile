FROM python:3.10-slim

# Install system dependencies for OpenCV and YOLO
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir ultralytics opencv-python-headless pillow gunicorn flask_cors numpy

# Copy the server code and models
COPY yolo_detection_server.py .
COPY config.py .
COPY tracker.py .
COPY models/ ./models/

# Expose port
EXPOSE 3003

# Run the server with Gunicorn for production
CMD ["gunicorn", "--bind", "0.0.0.0:3003", "--workers", "1", "--timeout", "120", "--threads", "4", "yolo_detection_server:app"]
