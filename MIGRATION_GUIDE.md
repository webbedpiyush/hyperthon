# 🎯 Migration Complete: NextAuth.js Setup Instructions

## 🚀 Quick Start

### 1. Install Dependencies (already done)

```bash
npm install next-auth @auth/prisma-adapter prisma @prisma/client bcryptjs @types/bcryptjs
```

### 2. Database Setup

#### Option A: PostgreSQL (Recommended)

```bash
# Install PostgreSQL locally or use a cloud provider like Neon, Supabase, or Railway

# Create database
createdb trivia_game

# Add to your .env
DATABASE_URL="postgresql://username:password@localhost:5432/trivia_game?schema=public"
```

#### Option B: SQLite (Quick Testing)

```bash
# Change prisma/schema.prisma datasource to:
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

# Add to your .env
DATABASE_URL="file:./dev.db"
```

### 3. Environment Variables Setup

```bash
cp .env.example .env.local
```

Fill out your `.env.local`:

```bash
# Required
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$(openssl rand -base64 32)
DATABASE_URL="your-database-url"

# Optional OAuth providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret
```

### 4. Database Migration

```bash
npx prisma generate
npx prisma db push
```

### 5. Start Development

```bash
npm run dev
```

## 🔧 OAuth Provider Setup (Optional)

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs

### GitHub OAuth

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth App
3. Set Authorization callback URL to `http://localhost:3000/api/auth/callback/github`

## 📊 What Changed

### ✅ What You Gained

- **Standard authentication** with email/password and OAuth
- **Trivia game functionality** with scoring and leaderboard
- **Database integration** with user profiles and game history
- **Broader user base** (not limited to Farcaster users)
- **Easier testing and development**

### ❌ What You Lost

- Farcaster social graph integration
- FID-based user identification
- Neynar API integration for social features
- Farcaster notifications
- Frame functionality

### 🔄 Key File Changes

- `src/lib/auth.ts` - New NextAuth-based authentication
- `src/app/providers.tsx` - SessionProvider instead of MiniAppProvider
- `src/components/Demo.tsx` → `src/components/DemoNew.tsx` - New trivia game interface
- `src/app/api/` - New trivia game API routes
- `prisma/schema.prisma` - Database schema for users and games

## 🎮 Using the New App

### Home Tab

- View your total score and games played
- Start new trivia games
- Access leaderboard

### Trivia Tab

- Answer multiple-choice questions
- Track progress through questions
- See results after completion

### Leaderboard Tab

- View top players by total score
- See your ranking
- View average scores

### Wallet Tab

- Connect Web3 wallets (unchanged functionality)

## 🚀 Next Steps

1. **Seed trivia questions**: Add more questions to the database
2. **Add categories**: Implement category-based filtering
3. **Difficulty levels**: Add easy/medium/hard question filtering
4. **Social features**: Add friend systems without Farcaster
5. **Achievements**: Add badges and achievements system
6. **Real-time**: Add WebSocket support for live competitions

## 🐛 Troubleshooting

### Database Issues

```bash
# Reset database
npx prisma db push --force-reset

# View data
npx prisma studio
```

### Auth Issues

```bash
# Make sure NEXTAUTH_SECRET is set
openssl rand -base64 32
```

### Missing Dependencies

```bash
npm install --legacy-peer-deps
```

## 📝 Notes

- The `DemoNew.tsx` component replaces the old Farcaster-based Demo
- Update your main page to use `DemoNew` instead of `Demo`
- OAuth providers are optional - users can still create accounts
- The trivia questions are currently hardcoded - move to database for production
