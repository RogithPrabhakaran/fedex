#!/bin/bash

# Ensure we are in the project root
cd "$(dirname "$0")"

echo "Setup: Checking for Python virtual environment..."

if [ ! -d ".venv" ]; then
    echo "Creating new virtual environment (.venv)..."
    python3 -m venv .venv
fi

echo "Activating virtual environment..."
source .venv/bin/activate

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Starting ML Server..."
echo "Access Docs at: http://localhost:8000/docs"
uvicorn app:app --reload --port 8000
