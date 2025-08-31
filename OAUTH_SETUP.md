# 🔐 OAuth Providers Setup Guide

## Google OAuth Setup

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create or select a project**
3. **Enable Google+ API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it
4. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
5. **Copy Client ID and Secret** to your `.env.local`

## GitHub OAuth Setup

1. **Go to GitHub Settings**: https://github.com/settings/developers
2. **Click "New OAuth App"**
3. **Fill in details**:
   - Application name: "AI Trivia Game"
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. **Copy Client ID and Secret** to your `.env.local`

## Optional: Discord OAuth Setup

1. **Go to Discord Developer Portal**: https://discord.com/developers/applications
2. **Create New Application**
3. **Go to OAuth2 settings**
4. **Add redirect**: `http://localhost:3000/api/auth/callback/discord`
5. **Copy Client ID and Secret**
