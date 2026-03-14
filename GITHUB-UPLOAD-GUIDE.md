# Upload Project to GitHub - Complete Guide

This guide will help you upload your CTF challenge to GitHub from scratch.

## Prerequisites

Before starting, you need:
1. ✅ Git installed on your computer
2. ✅ A GitHub account

---

## Step 1: Install Git (If Not Already Installed)

### Check if Git is installed:

Open PowerShell and run:
```powershell
git --version
```

If you see a version number (like `git version 2.x.x`), Git is installed. **Skip to Step 2**.

If you get an error, install Git:

1. Go to: https://git-scm.com/download/win
2. Download the installer
3. Run the installer (use all default settings)
4. **Close and reopen PowerShell** after installation
5. Verify: `git --version`

---

## Step 2: Create a GitHub Account (If You Don't Have One)

1. Go to: https://github.com/signup
2. Enter your email, create a password, choose a username
3. Verify your email
4. Complete the setup

---

## Step 3: Create a New Repository on GitHub

1. Go to: https://github.com/new
2. Fill in the details:
   - **Repository name**: `suspicious-upload-ctf` (or any name you prefer)
   - **Description**: "The Suspicious Upload - CTF Challenge"
   - **Visibility**: Choose "Public" or "Private"
   - **DO NOT** check "Add a README file"
   - **DO NOT** add .gitignore or license (we already have them)
3. Click "Create repository"
4. **Keep this page open** - you'll need the commands shown

---

## Step 4: Configure Git (First Time Only)

Open PowerShell in your project folder:
```powershell
cd C:\Users\hp\OneDrive\Desktop\CTF
```

Set your Git identity (use your GitHub email and username):
```powershell
git config --global user.email "your-email@example.com"
git config --global user.name "Your Name"
```

---

## Step 5: Initialize Git Repository

In PowerShell (in your CTF folder):

```powershell
# Initialize git repository
git init

# Check status
git status
```

You should see a list of untracked files.

---

## Step 6: Add Files to Git

```powershell
# Add all files
git add .

# Verify files are staged
git status
```

You should see files in green (staged for commit).

---

## Step 7: Create First Commit

```powershell
git commit -m "Initial commit - CTF challenge ready for deployment"
```

---

## Step 8: Connect to GitHub Repository

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

Example:
```powershell
git remote add origin https://github.com/john-doe/suspicious-upload-ctf.git
```

Verify the remote:
```powershell
git remote -v
```

---

## Step 9: Push to GitHub

### Option A: Using HTTPS (Recommended for beginners)

```powershell
# Set the default branch name to main
git branch -M main

# Push to GitHub
git push -u origin main
```

You'll be prompted to sign in to GitHub:
- A browser window will open
- Sign in to your GitHub account
- Authorize Git Credential Manager
- Return to PowerShell - the push will complete

### Option B: If you get authentication errors

GitHub no longer accepts passwords. You need to use a Personal Access Token:

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name: "CTF Deployment"
4. Select scopes: Check "repo" (full control of private repositories)
5. Click "Generate token"
6. **COPY THE TOKEN** (you won't see it again!)
7. When prompted for password in PowerShell, paste the token

---

## Step 10: Verify Upload

1. Go to your GitHub repository page: `https://github.com/YOUR_USERNAME/YOUR_REPO_NAME`
2. You should see all your files
3. Verify these important files are present:
   - ✅ `package.json`
   - ✅ `src/` folder
   - ✅ `uploads/dev_backup.png`
   - ✅ `render-build.sh`
   - ✅ `.gitignore`

---

## Troubleshooting

### Problem: "git: command not found"
**Solution**: Install Git (see Step 1)

### Problem: "Permission denied"
**Solution**: 
1. Make sure you're signed in to GitHub
2. Use a Personal Access Token instead of password
3. Or use GitHub Desktop (see Alternative Method below)

### Problem: "Repository not found"
**Solution**: 
- Check the repository URL is correct
- Make sure the repository exists on GitHub
- Verify you have access to the repository

### Problem: Files not showing on GitHub
**Solution**:
```powershell
# Check what files are tracked
git ls-files

# If dev_backup.png is missing, force add it:
git add -f uploads/dev_backup.png
git commit -m "Add penguin image"
git push
```

---

## Alternative Method: Using GitHub Desktop

If you prefer a GUI instead of command line:

1. Download GitHub Desktop: https://desktop.github.com/
2. Install and sign in to your GitHub account
3. Click "File" → "Add local repository"
4. Browse to: `C:\Users\hp\OneDrive\Desktop\CTF`
5. Click "Add repository"
6. Click "Publish repository"
7. Choose repository name and visibility
8. Click "Publish repository"

Done! Your code is now on GitHub.

---

## Next Steps

After uploading to GitHub:

1. ✅ Verify all files are on GitHub
2. ✅ Proceed to Render deployment (see `RENDER-DEPLOYMENT.md`)
3. ✅ Test your deployed application

---

## Quick Reference Commands

```powershell
# Navigate to project
cd C:\Users\hp\OneDrive\Desktop\CTF

# Check status
git status

# Add files
git add .

# Commit changes
git commit -m "Your message here"

# Push to GitHub
git push

# View remote URL
git remote -v

# View commit history
git log --oneline
```

---

## Making Updates Later

After making changes to your code:

```powershell
# Add changed files
git add .

# Commit with a message
git commit -m "Description of changes"

# Push to GitHub
git push
```

Render will automatically detect the push and redeploy your application!

---

## Need Help?

- Git documentation: https://git-scm.com/doc
- GitHub guides: https://guides.github.com/
- GitHub Desktop: https://docs.github.com/en/desktop

---

## Summary Checklist

- [ ] Git installed and configured
- [ ] GitHub account created
- [ ] New repository created on GitHub
- [ ] Git initialized in project folder
- [ ] Files added and committed
- [ ] Remote repository connected
- [ ] Code pushed to GitHub
- [ ] Files verified on GitHub website
- [ ] Ready to deploy on Render!
