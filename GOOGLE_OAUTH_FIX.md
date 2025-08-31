# 🔧 Google OAuth Setup - Step by Step

## Fix the redirect_uri_mismatch Error

### 1. Go to Google Cloud Console

- URL: https://console.cloud.google.com/

### 2. Select Your Project

- If you don't have one, create a new project

### 3. Enable Required APIs

- Go to "APIs & Services" → "Library"
- Search and enable: "Google+ API" (or "People API")

### 4. Create/Edit OAuth Credentials

- Go to "APIs & Services" → "Credentials"
- Click "Create Credentials" → "OAuth 2.0 Client ID"
- Or edit your existing one

### 5. Configure Application Type

- Choose: "Web application"
- Name it: "AI Trivia Game" (or any name)

### 6. Set Authorized Redirect URIs

Add BOTH of these URIs:

```
http://localhost:3000/api/auth/callback/google
https://brown-cobras-tickle.loca.lt/api/auth/callback/google
```

⚠️ **Important**: The tunnel URL changes each time you restart. Update it when needed.

### 7. Copy Credentials

- Copy Client ID and Client Secret
- These should match what's in your .env.local:
  ```
  GOOGLE_CLIENT_ID="your-google-client-id-here"
  GOOGLE_CLIENT_SECRET="your-google-client-secret-here"
  ```

### 8. Test

- Restart your dev server: `npm run dev`
- Try signing in with Google

## Alternative: Disable Google Auth Temporarily

If you want to test without Google OAuth, comment out the Google provider in your auth config.
