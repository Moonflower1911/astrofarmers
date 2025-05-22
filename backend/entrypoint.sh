#!/bin/bash

# Create virtual environment if not exists
if [ ! -d "/app/script_python/venv" ]; then
  echo "🛠 Creating Python virtual environment..."
  python3 -m venv /app/script_python/venv
  /app/script_python/venv/bin/pip install -r /app/script_python/requirements.txt
else
  echo "✅ Python virtual environment already exists. Skipping creation."
fi

# Start the Java backend
exec java -jar app.jar
