# Quick Deployment Summary

## What You Need to Do

### 1. Prepare Your Repository

```bash
# Make sure dev_backup.png is in the right place
ls uploads/dev_backup.png

# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "CTF challenge ready"

# Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Deploy on Render

1. Go to https://render.com and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `chmod +x render-build.sh && ./render-build.sh`
   - **Start Command**: `npm start`
5. Click "Create Web Service"
6. Wait 2-5 minutes for deployment

### 3. Test Your Deployment

Visit: `https://your-app-name.onrender.com`

You should see the landing page with the download link.

## Files Created for Render

- `render-build.sh` - Build script for Render
- `RENDER-DEPLOYMENT.md` - Detailed deployment guide
- `RENDER-CHECKLIST.md` - Step-by-step checklist
- Updated `.gitignore` - Allows dev_backup.png to be committed
- Updated `src/startup.ts` - Uses PORT environment variable

## Important Notes

✅ Your penguin image (`dev_backup.png`) will be deployed with your app
✅ Challenge files (logs) are generated automatically at startup
✅ HTTPS is provided automatically by Render
✅ Free tier available (spins down after 15 minutes of inactivity)

## Need Help?

- Read `RENDER-DEPLOYMENT.md` for detailed instructions
- Use `RENDER-CHECKLIST.md` for step-by-step guidance
- Check Render logs if something goes wrong

## Cost

- **Free**: $0/month (spins down after 15 min)
- **Starter**: $7/month (always-on, recommended for events)
