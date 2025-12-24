# Capacitor Setup Guide - Convert to Native App

## Overview
Capacitor wraps your Next.js web app in a native container, allowing you to publish to iOS App Store and Google Play Store while keeping your existing codebase.

## Prerequisites
- ✅ Next.js app (you have this)
- ✅ Node.js 18+
- ✅ For iOS: macOS with Xcode
- ✅ For Android: Android Studio

## Step 1: Install Capacitor

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
```

## Step 2: Initialize Capacitor

```bash
npx cap init
```

When prompted:
- **App name:** LN Forever
- **App ID:** com.lnforever.app (or your domain reversed)
- **Web dir:** .next (or out if using static export)

## Step 3: Configure Next.js for Static Export

Update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Enable static export
  images: {
    unoptimized: true, // Required for static export
  },
}

module.exports = nextConfig
```

## Step 4: Add Platforms

```bash
# Build your Next.js app
npm run build

# Add iOS platform
npx cap add ios

# Add Android platform
npx cap add android
```

## Step 5: Sync Your App

After each build:

```bash
npm run build
npx cap sync
```

## Step 6: Configure App

### iOS Configuration
Edit `ios/App/App/Info.plist`:
- App name
- Bundle identifier
- Permissions (if needed)

### Android Configuration
Edit `android/app/build.gradle`:
- Application ID
- Version code/name
- Permissions

## Step 7: Build and Run

### iOS
```bash
npx cap open ios
# Opens in Xcode, then build and run
```

### Android
```bash
npx cap open android
# Opens in Android Studio, then build and run
```

## Step 8: Add Native Features (Optional)

### Push Notifications
```bash
npm install @capacitor/push-notifications
npx cap sync
```

### Camera
```bash
npm install @capacitor/camera
npx cap sync
```

### Other Plugins
See: https://capacitorjs.com/docs/plugins

## Step 9: App Store Submission

### iOS App Store
1. Archive in Xcode
2. Upload to App Store Connect
3. Submit for review

### Google Play Store
1. Generate signed APK/AAB
2. Upload to Google Play Console
3. Submit for review

## Workflow

1. **Development:**
   ```bash
   npm run dev
   # Test in browser
   ```

2. **Build for Mobile:**
   ```bash
   npm run build
   npx cap sync
   npx cap open ios  # or android
   ```

3. **Update After Changes:**
   ```bash
   npm run build
   npx cap sync
   # Rebuild in Xcode/Android Studio
   ```

## Important Notes

- **Static Export Required:** Next.js must export static files
- **API Routes:** Won't work with static export - use Supabase client-side
- **Image Optimization:** Disabled for static export
- **Environment Variables:** Must be prefixed with `NEXT_PUBLIC_`
- **Supabase:** Works perfectly with Capacitor (client-side)

## Troubleshooting

### Build Errors
- Ensure `output: 'export'` in next.config.js
- Check all images use `unoptimized: true`

### Capacitor Sync Issues
- Delete `ios/` and `android/` folders
- Run `npx cap add ios` and `npx cap add android` again

### Native Features Not Working
- Run `npx cap sync` after installing plugins
- Rebuild in Xcode/Android Studio

## Next Steps After Setup

1. Add app icons (192x192, 512x512)
2. Configure splash screens
3. Set up push notifications
4. Test on real devices
5. Prepare app store listings
6. Submit for review

