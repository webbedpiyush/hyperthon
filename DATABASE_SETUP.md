# 🐘 PostgreSQL Setup Guide

## Local PostgreSQL Installation

### macOS (using Homebrew):

```bash
brew install postgresql@15
brew services start postgresql@15
createdb trivia_game
```

### Ubuntu/Debian:

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo -u postgres createdb trivia_game
```

### Windows:

Download from: https://www.postgresql.org/download/windows/

## Cloud PostgreSQL Options

### 1. Neon (Free tier available)

- Go to: https://neon.tech
- Create account and new project
- Copy connection string

### 2. Supabase (Free tier available)

- Go to: https://supabase.com
- Create project
- Go to Settings → Database
- Copy connection string

### 3. Railway (Free tier available)

- Go to: https://railway.app
- Create PostgreSQL service
- Copy connection string

### 4. Render (Free tier available)

- Go to: https://render.com
- Create PostgreSQL database
- Copy connection string

## Connection String Format:

```
DATABASE_URL="postgresql://username:password@host:port/database_name?schema=public"
```

Example:

```
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/trivia_game?schema=public"
```
