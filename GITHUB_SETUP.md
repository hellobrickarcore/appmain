# GitHub Setup Instructions

## Step 1: Verify Your GitHub Repository

Before connecting, make sure you have:
1. Created a GitHub repository (or have the URL of the existing one)
2. The repository URL should look like: `https://github.com/username/repo-name.git`

## Step 2: Set Up GitHub Authentication

You have two options:

### Option A: Personal Access Token (Recommended)
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate a new token with `repo` scope
3. Copy the token (you'll use it as password)

### Option B: SSH Key
1. Generate SSH key: `ssh-keygen -t ed25519 -C "your_email@example.com"`
2. Add to GitHub: Settings → SSH and GPG keys → New SSH key
3. Use SSH URL: `git@github.com:username/repo-name.git`

## Step 3: Add Remote (DO NOT PUSH YET)

Once you have your repository URL, run:
```bash
git remote add origin <YOUR_REPO_URL>
git remote -v  # Verify the URL is correct
```

## Step 4: Stage Files (Review First)

```bash
git add .
git status  # Review what will be committed
```

## Step 5: Initial Commit (Local Only)

```bash
git commit -m "Initial commit: HelloBrick app with training queue system"
```

## Step 6: Verify Everything Before Pushing

- ✅ Check `.gitignore` includes `.env.local` and other sensitive files
- ✅ Verify no API keys are in the code
- ✅ Review `git status` to see what will be pushed
- ✅ Check `git remote -v` to confirm correct repository

## Step 7: Push to GitHub (Only After Verification)

```bash
git push -u origin main
# or
git push -u origin master
```

## Current Status

- ✅ Git repository initialized
- ✅ `.gitignore` configured (protects `.env.local`)
- ⏳ Waiting for repository URL to add remote
- ⏳ Waiting for authentication setup

## Important Notes

- **NEVER commit `.env.local`** - It's in `.gitignore`
- **NEVER commit API keys** - Always use environment variables
- **Review before pushing** - Check `git status` and `git diff`




