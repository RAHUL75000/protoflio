#!/usr/bin/env bash
# exit on error
set -o errexit

# Install python dependencies
pip install -r backend/requirements.txt

# Build Frontend
echo "Building Frontend..."
cd frontend
npm install
npm run build
cd ..

# Build Admin
echo "Building Admin..."
cd admin
npm install
npm run build
cd ..
