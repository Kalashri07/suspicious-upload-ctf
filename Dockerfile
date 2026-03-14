# Base image with Node.js 18+
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source files
COPY src/ ./src/
COPY uploads/ ./uploads/

# Build TypeScript to JavaScript
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Create necessary directories
RUN mkdir -p /app/challenge_files

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]
