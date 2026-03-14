# Deploying to Render

This guide walks you through deploying "The Suspicious Upload" CTF challenge on Render.

## Prerequisites

1. A GitHub account
2. A Render account (sign up at https://render.com - free tier available)
3. Your code pushed to a GitHub repository

## Step 1: Push Your Code to GitHub

If you haven't already:

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - CTF challenge"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## Step 2: Create a Web Service on Render

1. Go to https://dashboard.render.com
2. Click "New +" button
3. Select "Web Service"
4. Connect your GitHub repository:
   - Click "Connect account" if first time
   - Select your repository from the list
   - Click "Connect"

## Step 3: Configure the Web Service

Fill in the following settings:

### Basic Settings
- **Name**: `suspicious-upload-ctf` (or your preferred name)
- **Region**: Choose closest to your participants
- **Branch**: `main` (or your default branch)
- **Root Directory**: Leave empty (unless your code is in a subdirectory)

### Build & Deploy Settings
- **Runtime**: `Node`
- **Build Command**: `chmod +x render-build.sh && ./render-build.sh`
- **Start Command**: `npm start`

### Instance Type
- **Free** (for testing/small groups)
- **Starter** or higher (for production/larger groups)

### Environment Variables
Click "Add Environment Variable" and add:
- **Key**: `NODE_ENV`
- **Value**: `production`

## Step 4: Deploy

1. Click "Create Web Service"
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Build the TypeScript code
   - Start the server
3. Wait for deployment to complete (usually 2-5 minutes)

## Step 5: Verify Deployment

Once deployed, Render will provide a URL like: `https://suspicious-upload-ctf.onrender.com`

Test the following endpoints:
- Landing page: `https://your-app.onrender.com/`
- Download logs: `https://your-app.onrender.com/downloads/server_logs.zip`
- Image page: `https://your-app.onrender.com/uploads/dev_backup.png`
- Admin portal: `https://your-app.onrender.com/admin_portal?access=user`

## Important Notes

### Free Tier Limitations

If using Render's free tier:
- **Spins down after 15 minutes of inactivity**
- First request after spin-down takes 30-60 seconds to wake up
- 750 hours/month free (enough for most CTF events)
- Consider upgrading to Starter ($7/month) for always-on service

### File Persistence

Render's filesystem is **ephemeral** - files are regenerated on each deploy. This is fine for this challenge since:
- Log files are generated at startup
- The `dev_backup.png` image is committed to your repository
- No user data needs to persist

### Custom Domain (Optional)

To use your own domain:
1. Go to your service settings
2. Click "Custom Domains"
3. Add your domain
4. Update your DNS records as instructed

## Troubleshooting

### Build Fails

**Check build logs:**
1. Go to your service dashboard
2. Click on the failed deploy
3. Review the logs

**Common issues:**
- Missing `render-build.sh` file - make sure it's committed
- Permission denied - the build script adds execute permissions automatically
- TypeScript errors - run `npm run build` locally first

### Server Won't Start

**Check runtime logs:**
1. Go to "Logs" tab in your service dashboard
2. Look for error messages

**Common issues:**
- Missing `dev_backup.png` - make sure it's committed to git
- Port binding - Render automatically sets PORT environment variable
- Missing dependencies - check package.json

### Image Not Loading

Make sure `uploads/dev_backup.png` is:
1. Committed to your git repository
2. In the correct location
3. A valid PNG file

```bash
# Verify file is tracked by git
git ls-files uploads/

# Should show: uploads/dev_backup.png
```

### Challenge Files Not Generated

The server generates challenge files at startup. Check logs:
1. Go to "Logs" tab
2. Look for initialization messages
3. Verify all 6 initialization steps completed

## Updating Your Deployment

To deploy updates:

```bash
# Make your changes
git add .
git commit -m "Update challenge"
git push origin main
```

Render will automatically detect the push and redeploy.

### Manual Redeploy

To redeploy without code changes:
1. Go to your service dashboard
2. Click "Manual Deploy"
3. Select "Clear build cache & deploy"

## Monitoring

### View Logs

Real-time logs:
1. Go to your service dashboard
2. Click "Logs" tab
3. Logs auto-refresh

### Metrics

On paid plans, you can view:
- CPU usage
- Memory usage
- Request count
- Response times

## Security Considerations

### HTTPS

Render provides free HTTPS automatically - all traffic is encrypted.

### Rate Limiting

The challenge includes rate limiting (100 requests per 15 minutes per IP). This is configured in the code and works automatically.

### Environment Variables

Never commit sensitive data. Use Render's environment variables for:
- API keys
- Passwords
- Configuration secrets

## Cost Estimation

### Free Tier
- **Cost**: $0/month
- **Limitations**: Spins down after 15 minutes
- **Best for**: Testing, small events (< 20 participants)

### Starter Plan
- **Cost**: $7/month
- **Benefits**: Always-on, faster, more resources
- **Best for**: Production, events with 20-100 participants

### Standard Plan
- **Cost**: $25/month
- **Benefits**: More CPU/RAM, better performance
- **Best for**: Large events (100+ participants)

## Alternative: Docker Deployment on Render

If you prefer Docker:

1. Create a `Dockerfile` (already exists in your project)
2. In Render settings:
   - **Runtime**: `Docker`
   - **Build Command**: Leave empty
   - **Start Command**: Leave empty (uses Dockerfile CMD)

## Support

If you encounter issues:
1. Check Render's status page: https://status.render.com
2. Review Render docs: https://render.com/docs
3. Check your service logs in the dashboard
4. Contact Render support (available on paid plans)

## Quick Reference

### Service URLs
- Dashboard: https://dashboard.render.com
- Your service: https://dashboard.render.com/web/YOUR_SERVICE_ID
- Live URL: https://YOUR_SERVICE_NAME.onrender.com

### Useful Commands
```bash
# View recent logs (using Render CLI)
render logs -s YOUR_SERVICE_NAME

# Trigger manual deploy
render deploy -s YOUR_SERVICE_NAME
```

### Important Files
- `package.json` - Dependencies and scripts
- `render-build.sh` - Build script for Render
- `src/startup.ts` - Server configuration (PORT environment variable)
- `uploads/dev_backup.png` - Challenge image (must be committed)

## Next Steps

After successful deployment:
1. Test all challenge endpoints
2. Share the URL with participants
3. Monitor logs during the event
4. Consider upgrading to paid plan for better performance
