#!/bin/bash
# Render build script

# Ensure we're in the project root
cd /opt/render/project || cd "$(dirname "$0")" || exit 1

echo "Current directory: $(pwd)"
echo "Installing dependencies..."
npm install

echo "Building TypeScript..."
npm run build

echo "Verifying build output..."
ls -la dist/ || echo "Warning: dist directory not found"

echo "Build complete!"
