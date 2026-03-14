# The Suspicious Upload - CTF Challenge

A web-based Capture The Flag (CTF) challenge designed for university cybersecurity education. This challenge teaches participants three essential security investigation techniques:

1. **Linux Command-Line Investigation** - Analyzing log files to find clues
2. **Steganography Extraction** - Extracting hidden data from images
3. **HTTP Parameter Manipulation** - Using tools like Burp Suite to modify requests

## Prerequisites

- **Node.js** v18 or higher
- **npm** (comes with Node.js)
- **steghide** v0.5.1 or higher (for steganography embedding)

### Installing steghide

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install steghide
```

**macOS:**
```bash
brew install steghide
```

**Windows:**
Download from [steghide.sourceforge.net](http://steghide.sourceforge.net/)

## Installation

### Option 1: Local Installation

1. Clone or download this repository
2. Install dependencies:
```bash
npm install
```

### Option 2: Docker Installation (Recommended)

1. Clone or download this repository
2. Build and run using Docker Compose:
```bash
docker-compose up -d
```

The challenge will be available at `http://localhost:3000`

To stop the challenge:
```bash
docker-compose down
```

To rebuild after changes:
```bash
docker-compose up -d --build
```

## Development

### Build the project:
```bash
npm run build
```

### Run the server:
```bash
npm start
```

The server will automatically:
1. Verify steghide is installed
2. Create required directories
3. Generate challenge log files
4. Create zip archive
5. Embed steganography in the image
6. Start the web server on port 3000

**Note:** If steghide is not installed, the server will fail to start. For testing purposes only, you can skip the steghide check:
```bash
SKIP_STEGHIDE=true npm start
```

### Development mode (build and run):
```bash
npm run dev
```

### Run tests:
```bash
npm test
```

### Run tests in watch mode:
```bash
npm run test:watch
```

## Docker Deployment

### Building the Docker Image

The Dockerfile is configured to:
- Use Node.js 18 Alpine base image
- Install steghide in the container
- Copy application files and dependencies
- Expose port 3000
- Run the challenge server

To build manually:
```bash
docker build -t suspicious-upload-ctf .
```

To run manually:
```bash
docker run -p 3000:3000 suspicious-upload-ctf
```

### Using Docker Compose (Recommended)

Docker Compose simplifies deployment with pre-configured settings:

```bash
# Start the challenge
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the challenge
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

### Verifying Docker Setup

1. Start the container:
```bash
docker-compose up -d
```

2. Check if the server is running:
```bash
curl http://localhost:3000
```

3. You should see the challenge landing page HTML

4. Verify steghide is working:
```bash
docker-compose exec ctf-challenge steghide --version
```

## Server Configuration

The server can be configured using the `ServerConfig` interface in `src/startup.ts`:

- **port**: Server port (default: 3000)
- **challengeFilesDir**: Directory for challenge files (default: `./challenge_files`)
- **uploadsDir**: Directory for uploaded images (default: `./uploads`)
- **clueFilePath**: Path to clue.txt file (default: `./challenge_files/clue.txt`)
- **rateLimitWindowMs**: Rate limit window in milliseconds (default: 15 minutes)
- **rateLimitMaxRequests**: Maximum requests per window (default: 100)

## Startup Process

When the server starts, it performs the following initialization steps:

1. **Verify steghide installation** - Checks if steghide is available on the system
2. **Verify directories** - Creates required directories if they don't exist
3. **Create clue.txt** - Generates the clue file for steganography embedding
4. **Generate log files** - Creates realistic log files with embedded clues and fake clues
5. **Embed steganography** - Embeds clue.txt into dev_backup.png using steghide
6. **Verify challenge files** - Confirms all required files exist and are properly generated

If any step fails, the server will not start and will display an error message.

## Project Structure

```
.
├── src/                    # TypeScript source files
├── tests/                  # Test files
├── challenge_files/        # Generated challenge files (logs, etc.)
├── uploads/                # Image files for the challenge
├── dist/                   # Compiled JavaScript output
├── tsconfig.json           # TypeScript configuration
├── jest.config.js          # Jest testing configuration
└── package.json            # Project dependencies and scripts
```

## Challenge Overview

Participants must complete three sequential steps to obtain the final flag:

1. Download and investigate server log files to find a clue
2. Extract hidden information from an image using steganography
3. Manipulate HTTP parameters to access the admin portal

**Flag:** `flag{developer_upload_compromised}`

## Requirements

This challenge implements the following key requirements:

- Node.js v18+ runtime (Requirement 13.1)
- steghide v0.5.1+ for steganography (Requirement 13.2)
- Express.js v4.18+ for web routing (Requirement 13.3)
- express-rate-limit v6.7+ for rate limiting (Requirement 13.4)
- Isolated containerized environment (Requirement 13.5)
- No external services or databases required (Requirement 13.6)

## Security Features

- Server-side flag generation only
- File access whitelist
- Path traversal protection
- Directory listing disabled
- Rate limiting on admin portal
- Sanitized error messages

## Deployment Checklist

Before deploying the challenge, verify:

- [ ] **Node.js 18+** is installed (for local deployment)
- [ ] **steghide** is installed and accessible (for local deployment)
- [ ] **Docker and Docker Compose** are installed (for Docker deployment)
- [ ] Port 3000 is available and not blocked by firewall
- [ ] All tests pass: `npm test`
- [ ] Server starts successfully: `npm start` or `docker-compose up`
- [ ] Challenge files are generated in `challenge_files/` directory
- [ ] Image file exists at `uploads/dev_backup.png`
- [ ] Landing page is accessible at `http://localhost:3000`
- [ ] Log download works at `http://localhost:3000/downloads/server_logs.zip`
- [ ] Image download works at `http://localhost:3000/uploads/dev_backup.png`
- [ ] Admin portal responds at `http://localhost:3000/admin_portal?access=user`
- [ ] Steganography extraction works: `steghide extract -sf uploads/dev_backup.png` (password: backup123)

### Quick Verification Script

```bash
# Build the project
npm run build

# Run tests
npm test

# Start the server
npm start &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Test endpoints
curl -I http://localhost:3000
curl -I http://localhost:3000/downloads/server_logs.zip
curl -I http://localhost:3000/uploads/dev_backup.png
curl http://localhost:3000/admin_portal?access=user

# Stop the server
kill $SERVER_PID
```

## License

ISC
