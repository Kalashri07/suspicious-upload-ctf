#!/bin/bash
# Render build script

echo "Installing dependencies..."
npm install

echo "Building TypeScript..."
npm run build

echo "Build complete!"
