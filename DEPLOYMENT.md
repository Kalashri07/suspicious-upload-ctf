# Deployment Guide

This guide provides detailed instructions for deploying "The Suspicious Upload" CTF challenge in various environments.

## Quick Start (Docker - Recommended)

The fastest way to deploy the challenge:

```bash
# Clone the repository
git clone <repository-url>
cd suspicious-upload-ctf

# Start with Docker Compose
docker-compose up -d

# Verify it's running
curl http://localhost:3000
```

The challenge is now available at `http://localhost:3000`

## Deployment Options

### Option 1: Docker Compose (Recommended for Production)

**Advantages:**
- No need to install Node.js or steghide on host
- Consistent environment across deployments
- Easy to start/stop/restart
- Isolated from host system

**Steps:**

1. Install Docker and Docker Compose on your system
2. Clone the repository
3. Run: `docker-compose up -d`
4. Access at `http://localhost:3000`

**Management Commands:**

```bash
# Start the challenge
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the challenge
docker-compose down

# Restart after code changes
docker-compose up -d --build

# Check container status
docker-compose ps
```

### Option 2: Docker (Manual)

**Steps:**

```bash
# Build the image
docker build -t suspicious-upload-ctf .

# Run the container
docker run -d -p 3000:3000 --name ctf-challenge suspicious-upload-ctf

# View logs
docker logs -f ctf-challenge

# Stop the container
docker stop ctf-challenge

# Remove the container
docker rm ctf-challenge
```

### Option 3: Local Installation

**Advantages:**
- Direct access to files for debugging
- Faster development iteration
- No Docker overhead

**Prerequisites:**
- Node.js v18 or higher
- npm (comes with Node.js)
- steghide v0.5.1 or higher

**Steps:**

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start the server
npm start
```

The server will be available at `http://localhost:3000`

## Production Deployment Considerations

### Security

1. **Firewall Configuration:**
   - Only expose port 3000 to the network where participants will access it
   - Consider using a reverse proxy (nginx/Apache) for SSL/TLS

2. **Rate Limiting:**
   - Default: 100 requests per 15 minutes per IP
   - Adjust in `src/startup.ts` if needed

3. **Monitoring:**
   - Monitor container logs: `docker-compose logs -f`
   - Watch for unusual access patterns

### Performance

1. **Resource Allocation:**
   - Minimum: 512MB RAM, 1 CPU core
   - Recommended: 1GB RAM, 2 CPU cores for 50+ concurrent users

2. **File Caching:**
   - Challenge files are cached in memory automatically
   - No external caching needed

### Networking

1. **Port Configuration:**
   - Default port: 3000
   - To change, modify `docker-compose.yml`:
     ```yaml
     ports:
       - "8080:3000"  # Host:Container
     ```

2. **Reverse Proxy Example (nginx):**
   ```nginx
   server {
       listen 80;
       server_name ctf.example.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

## Verification Checklist

After deployment, verify the following:

- [ ] Server responds at `http://localhost:3000`
- [ ] Landing page displays correctly
- [ ] Log file download works: `http://localhost:3000/downloads/server_logs.zip`
- [ ] Image download works: `http://localhost:3000/uploads/dev_backup.png`
- [ ] Admin portal responds: `http://localhost:3000/admin_portal?access=user`
- [ ] Steganography works (extract with password "backup123")
- [ ] Container logs show no errors: `docker-compose logs`

## Troubleshooting

### Issue: Container fails to start

**Solution:**
```bash
# Check logs
docker-compose logs

# Common causes:
# - Port 3000 already in use
# - Insufficient permissions
# - Docker daemon not running
```

### Issue: steghide not found

**Solution:**
- For Docker: Rebuild the image: `docker-compose up -d --build`
- For local: Install steghide on your system

### Issue: Challenge files not generated

**Solution:**
```bash
# Check if directories exist
docker-compose exec ctf-challenge ls -la /app/challenge_files

# Restart to regenerate
docker-compose restart
```

### Issue: Port 3000 already in use

**Solution:**
```bash
# Option 1: Stop the conflicting service
sudo lsof -i :3000
sudo kill <PID>

# Option 2: Change the port in docker-compose.yml
# Change "3000:3000" to "8080:3000"
```

## Updating the Challenge

To update the challenge after code changes:

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose up -d --build
```

## Backup and Restore

### Backup

The challenge generates files at runtime, so no backup is needed. However, if you've customized files:

```bash
# Backup custom files
docker cp suspicious-upload-ctf:/app/uploads ./backup/uploads
docker cp suspicious-upload-ctf:/app/challenge_files ./backup/challenge_files
```

### Restore

```bash
# Restore custom files
docker cp ./backup/uploads suspicious-upload-ctf:/app/uploads
docker cp ./backup/challenge_files suspicious-upload-ctf:/app/challenge_files

# Restart
docker-compose restart
```

## Scaling for Large Events

For events with 100+ concurrent participants:

1. **Use multiple instances behind a load balancer:**
   ```bash
   docker-compose up -d --scale ctf-challenge=3
   ```

2. **Configure nginx load balancer:**
   ```nginx
   upstream ctf_backend {
       server localhost:3000;
       server localhost:3001;
       server localhost:3002;
   }
   
   server {
       listen 80;
       location / {
           proxy_pass http://ctf_backend;
       }
   }
   ```

3. **Monitor resource usage:**
   ```bash
   docker stats suspicious-upload-ctf
   ```

## Support

For issues or questions:
1. Check the logs: `docker-compose logs -f`
2. Review the README.md for configuration options
3. Verify all prerequisites are met
4. Check the troubleshooting section above
