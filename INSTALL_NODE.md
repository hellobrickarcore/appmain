# Install Node.js for HelloBrick

## Quick Install (macOS)

### Option 1: Homebrew (Recommended)

```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node
```

### Option 2: Official Installer

1. Go to: https://nodejs.org/
2. Download the LTS version for macOS
3. Run the installer
4. Restart terminal

### Option 3: NVM (Node Version Manager)

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal or run:
source ~/.zshrc

# Install Node.js LTS
nvm install --lts
nvm use --lts
```

---

## Verify Installation

After installing, verify it works:

```bash
node --version
npm --version
```

You should see version numbers like:
```
v20.11.0
10.2.4
```

---

## Then Run HelloBrick

Once Node.js is installed:

```bash
cd /Users/akeemojuko/Downloads/hellobrick
./test-on-iphone.sh
```

---

## Need Help?

If you're still having issues:
1. Make sure you restarted your terminal after installing
2. Check PATH: `echo $PATH`
3. Try: `which node` and `which npm`

