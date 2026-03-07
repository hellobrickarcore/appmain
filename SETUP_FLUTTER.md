# 🚀 Flutter Setup Guide

## Issue 1: Wrong Directory ✅
You were in `~` (home directory). The Flutter app is at:
```
/Users/akeemojuko/Downloads/hellobrick/flutter_app
```

## Issue 2: Flutter Not Installed

### Option A: Install Flutter (Recommended)

1. **Download Flutter:**
   ```bash
   cd ~
   git clone https://github.com/flutter/flutter.git -b stable
   ```

2. **Add to PATH:**
   ```bash
   echo 'export PATH="$HOME/flutter/bin:$PATH"' >> ~/.zshrc
   source ~/.zshrc
   ```

3. **Verify:**
   ```bash
   flutter doctor
   ```

### Option B: Use Homebrew (Easier)

```bash
brew install --cask flutter
```

Then verify:
```bash
flutter doctor
```

## After Flutter is Installed:

```bash
cd /Users/akeemojuko/Downloads/hellobrick/flutter_app
flutter pub get
flutter run
```

## Quick Check Script:

Run this to check everything:
```bash
cd /Users/akeemojuko/Downloads/hellobrick/flutter_app && \
flutter --version && \
flutter pub get && \
flutter doctor
```

