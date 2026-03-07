# Security Guide - API Keys

## ⚠️ CRITICAL: Never Commit API Keys

Your `.env.local` file contains your Gemini API key and **MUST NEVER** be committed to GitHub or any version control system.

## Protection Measures

### 1. `.gitignore` Protection
The `.env.local` file is already in `.gitignore` with multiple patterns:
- `.env.local`
- `.env*.local`
- `**/.env`
- `**/.env.local`

### 2. If You Accidentally Committed It

If `.env.local` was already tracked before being added to `.gitignore`, remove it from Git (but keep the file locally):

```bash
# Remove from Git tracking (keeps local file)
git rm --cached .env.local

# Commit the removal
git commit -m "Remove .env.local from tracking"

# If already pushed, rotate your API key immediately!
```

### 3. Verify It's Ignored

Check if `.env.local` is properly ignored:
```bash
git check-ignore .env.local
# Should output: .env.local
```

### 4. Pre-Commit Safety Check

Before committing, always verify:
```bash
# Check what files will be committed
git status

# Make sure .env.local is NOT listed
```

### 5. If Key Was Exposed

If your API key was accidentally committed and pushed:
1. **Immediately rotate your API key** in Google AI Studio
2. Remove the file from Git history (if possible)
3. Update `.env.local` with the new key
4. Never use the old key again

## Setup Instructions

1. Copy the example file (if it exists):
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your actual API key:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

3. Verify `.env.local` is in `.gitignore`:
   ```bash
   grep "\.env.local" .gitignore
   ```

4. **Never** add `.env.local` to git:
   ```bash
   # ❌ NEVER DO THIS:
   git add .env.local
   git commit .env.local
   ```

## Best Practices

- ✅ Use `.env.local` for local development
- ✅ Add `.env.local` to `.gitignore` (already done)
- ✅ Use `.env.example` as a template (without real keys)
- ✅ Rotate keys if exposed
- ❌ Never commit `.env.local`
- ❌ Never hardcode API keys in source code
- ❌ Never share `.env.local` files




