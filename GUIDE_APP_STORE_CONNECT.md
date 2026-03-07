# Guide: Create App in App Store Connect

## Prerequisites

- ✅ Active Apple Developer Program membership ($99/year)
- ✅ Bundle ID ready: `com.hellobrick.app`
- ✅ App name decided: "HelloBrick"

## Step-by-Step Instructions

### 1. Log Into App Store Connect

1. Go to: https://appstoreconnect.apple.com
2. Sign in with your Apple Developer account
3. You'll see the App Store Connect dashboard

### 2. Create New App

1. Click the **"+"** button (top left)
2. Select **"New App"**

### 3. Fill in App Information

**Required Fields:**

- **Platform**: iOS
- **Name**: HelloBrick
  - Must be unique (not already taken)
  - Max 30 characters
  - Can be changed later (with new submission)
  
- **Primary Language**: English (or your primary language)
  - Determines default language for listing
  
- **Bundle ID**: com.hellobrick.app
  - Must match Xcode project
  - Cannot be changed after creation
  - Must be registered in Apple Developer account
  
- **SKU**: hellobrick-001 (or unique identifier)
  - Internal identifier (not visible to users)
  - Must be unique
  - Cannot be changed
  - Format: lowercase, numbers, hyphens

- **User Access**: Full Access (recommended)
  - Allows full control
  - Can add team members later

### 4. Click "Create"

App is created and appears in your app list.

### 5. Complete App Information

**In App Information Tab:**

1. **Category**
   - Primary: Utilities or Productivity
   - Secondary: (Optional) Games, Education, etc.

2. **Content Rights**
   - ✅ Confirm you have rights to all content
   - ✅ Confirm age rating is accurate

3. **Age Rating**
   - Complete questionnaire
   - Questions about content:
     - Violence, horror, profanity
     - Gambling, contests
     - Unrestricted web access
     - User-generated content
   - Likely rating: **4+** or **9+** for HelloBrick

### 6. Set Pricing and Availability

**Pricing:**
- Select **Free** (or set price)
- Can change later

**Availability:**
- **All countries** (recommended)
- Or select specific countries
- Can change later

**Availability Date:**
- Set to today or future date
- App goes live on this date (after approval)

### 7. App Privacy (Required)

1. Go to **App Privacy** tab
2. Click **"Get Started"**
3. Answer questions about data collection:
   - **Camera**: Yes (for scanning)
   - **Photos**: Yes (if saving images)
   - **User Content**: Yes (collection data)
   - **Analytics**: Optional
4. Complete privacy nutrition labels
5. Link to your privacy policy URL

### 8. App Store Listing (Prepare Content)

**You'll complete this after uploading build:**

- **Subtitle**: "AI Building Brick Scanner" (30 chars max)
- **Description**: Copy from `APP_STORE_DESCRIPTION.md`
- **Keywords**: building bricks,scanner,AI,detection,collection
- **Support URL**: Your support page
- **Privacy Policy URL**: Your hosted privacy policy
- **Marketing URL**: (Optional) Your website
- **Screenshots**: Upload after capturing
- **App Preview**: (Optional) Video demo

## Important Notes

- **Bundle ID** cannot be changed after creation
- **SKU** cannot be changed after creation
- **App Name** can be changed (requires new submission)
- App won't appear in App Store until:
  1. Build is uploaded and approved
  2. App Store listing is complete
  3. App is submitted and approved for review

## Next Steps

After creating app:
1. Configure code signing in Xcode (see GUIDE_CODE_SIGNING.md)
2. Build and archive app (see GUIDE_BUILD_ARCHIVE.md)
3. Upload build to App Store Connect
4. Complete App Store listing
5. Submit for review

## Troubleshooting

**"Bundle ID not found"**
- Register Bundle ID in Apple Developer account first
- Go to: Certificates, Identifiers & Profiles > Identifiers
- Click "+" to register new App ID
- Use: com.hellobrick.app

**"App name already taken"**
- Try variations: "HelloBrick AI", "HelloBrick Scanner", etc.
- Or add subtitle to differentiate

**"SKU already in use"**
- Use unique identifier: hellobrick-001, hellobrick-002, etc.
- Include date: hellobrick-2024-001




