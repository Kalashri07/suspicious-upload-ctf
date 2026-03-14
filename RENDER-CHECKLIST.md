# Render Deployment Checklist

Use this checklist to ensure smooth deployment to Render.

## Pre-Deployment

- [ ] Your penguin image is saved as `uploads/dev_backup.png`
- [ ] You've embedded steganography in the image using online tools
- [ ] The clue embedded is: "Admin portal: /admin_portal, Parameter hint: access=user"
- [ ] Code is committed to git
- [ ] Code is pushed to GitHub

### Verify Files

```bash
# Check that dev_backup.png exists
ls -la uploads/dev_backup.png

# Check that it's tracked by git
git ls-files uploads/

# Should show: uploads/dev_backup.png
```

## GitHub Setup

- [ ] Created a GitHub repository
- [ ] Pushed your code to GitHub
- [ ] Repository is public or you've granted Render access

```bash
git init
git add .
git commit -m "CTF challenge ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## Render Configuration

- [ ] Signed up for Render account
- [ ] Connected GitHub account to Render
- [ ] Created new Web Service
- [ ] Selected your repository

### Service Settings

- [ ] **Name**: suspicious-upload-ctf
- [ ] **Runtime**: Node
- [ ] **Build Command**: `chmod +x render-build.sh && ./render-build.sh`
- [ ] **Start Command**: `npm start`
- [ ] **Environment Variable**: NODE_ENV = production

## Post-Deployment

- [ ] Deployment completed successfully
- [ ] Service is running (green status)
- [ ] Copied your Render URL

### Test Endpoints

Test each of these URLs (replace YOUR_APP with your actual Render URL):

- [ ] Landing page: `https://YOUR_APP.onrender.com/`
- [ ] Download logs: `https://YOUR_APP.onrender.com/downloads/server_logs.zip`
- [ ] Image page: `https://YOUR_APP.onrender.com/uploads/dev_backup.png`
- [ ] Image download: `https://YOUR_APP.onrender.com/uploads/download/dev_backup.png`
- [ ] Admin portal (should fail): `https://YOUR_APP.onrender.com/admin_portal`
- [ ] Admin portal (should work): `https://YOUR_APP.onrender.com/admin_portal?access=user`

### Verify Challenge Flow

- [ ] Download server_logs.zip
- [ ] Extract and find the clue at line 47 of logs.txt
- [ ] Access the image URL from the clue
- [ ] Download the image file
- [ ] Extract steganography using online tool (https://stylesuxx.github.io/steganography/)
- [ ] Find admin portal URL and parameter
- [ ] Access admin portal with correct parameter
- [ ] Receive the flag

## Troubleshooting

If deployment fails:

1. **Check build logs** in Render dashboard
2. **Verify render-build.sh** has execute permissions
3. **Ensure dev_backup.png** is committed to git
4. **Check package.json** has all dependencies

If server won't start:

1. **Check runtime logs** in Render dashboard
2. **Verify PORT** environment variable is used (already configured)
3. **Check for errors** in initialization

## Free Tier Notes

If using free tier:
- [ ] Understand service spins down after 15 minutes
- [ ] First request after spin-down takes 30-60 seconds
- [ ] Consider upgrading to Starter ($7/month) for always-on

## Share with Participants

Once verified:
- [ ] Share your Render URL with participants
- [ ] Provide any additional instructions
- [ ] Monitor logs during the event

Your Render URL: `https://_____________________.onrender.com`

## Quick Commands

```bash
# Add files to git
git add .

# Commit changes
git commit -m "Update challenge"

# Push to GitHub (triggers auto-deploy on Render)
git push origin main

# Check git status
git status

# View tracked files
git ls-files
```
