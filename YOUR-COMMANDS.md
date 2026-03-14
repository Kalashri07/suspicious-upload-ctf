# Your Personalized GitHub Upload Commands

## Step-by-Step Commands for Kalashri07

### 1. Open PowerShell in your CTF folder
- Go to: `C:\Users\hp\OneDrive\Desktop\CTF`
- Click in the address bar
- Type: `powershell`
- Press Enter

### 2. Configure Git (First Time Only)
Replace with your actual email:
```powershell
git config --global user.email "your-email@example.com"
git config --global user.name "Kalashri07"
```

### 3. Initialize Git Repository
```powershell
git init
```

### 4. Add All Files
```powershell
git add .
```

### 5. Create First Commit
```powershell
git commit -m "Initial commit - CTF challenge ready for deployment"
```

### 6. Set Branch to Main
```powershell
git branch -M main
```

### 7. Connect to Your GitHub Repository
```powershell
git remote add origin https://github.com/Kalashri07/suspicious-upload-ctf.git
```

### 8. Push to GitHub
```powershell
git push -u origin main
```

When prompted, sign in to your GitHub account (a browser window will open).

---

## After Upload

Your repository will be at:
**https://github.com/Kalashri07/suspicious-upload-ctf**

---

## If You Get Errors

### Error: "git: command not found"
Install Git from: https://git-scm.com/download/win

### Error: Authentication failed
Use a Personal Access Token:
1. Go to: https://github.com/settings/tokens
2. Generate new token (classic)
3. Select "repo" scope
4. Copy the token
5. Use it as your password when prompted

---

## All Commands in One Block (Copy & Paste)

```powershell
# Configure Git (replace with your email)
git config --global user.email "your-email@example.com"
git config --global user.name "Kalashri07"

# Initialize and upload
git init
git add .
git commit -m "Initial commit - CTF challenge ready for deployment"
git branch -M main
git remote add origin https://github.com/Kalashri07/suspicious-upload-ctf.git
git push -u origin main
```

---

## Next Steps After Upload

1. Verify files at: https://github.com/Kalashri07/suspicious-upload-ctf
2. Deploy on Render (see RENDER-DEPLOYMENT.md)
3. Use this URL in Render: `https://github.com/Kalashri07/suspicious-upload-ctf`
