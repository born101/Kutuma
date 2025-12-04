# Kutuma Setup Guide

## Quick Start (No Database Required)

The app is designed to work without a database for development and testing. You can start using it immediately:

```bash
# Install dependencies
bun install

# Start the development server
bun start

# Or start web preview
bun start-web
```

**What works without a database:**
- ✅ User registration with email or phone
- ✅ Profile setup
- ✅ Authentication flow (temporary sessions)
- ✅ Full app navigation
- ✅ Task browsing (mock data)
- ⚠️ Data is stored in-memory only (lost on restart)

## Setting Up the Database (For Production)

For a production-ready app with persistent data, you need to set up PostgreSQL.

### Option 1: Supabase (Recommended - Free Tier Available)

1. **Sign up at [Supabase](https://supabase.com)**

2. **Create a new project**
   - Choose a project name
   - Set a secure database password
   - Select a region close to your users

3. **Get your connection string**
   - Go to Project Settings → Database
   - Copy the "Connection string" (NOT "Connection pooling")
   - It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

4. **Configure your app**
   ```bash
   # Copy the environment file
   cp .env.example .env
   
   # Edit .env and add your connection string
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

5. **Run migrations**
   ```bash
   bunx drizzle-kit generate
   bunx drizzle-kit push
   ```

6. **Seed sample data (optional)**
   ```bash
   bun backend/db/seed.ts
   ```

### Option 2: Neon (Alternative Free Tier)

1. **Sign up at [Neon](https://neon.tech)**

2. **Create a new project**
   - Choose project settings
   - Copy the connection string from the dashboard

3. **Configure and migrate**
   ```bash
   cp .env.example .env
   # Update DATABASE_URL in .env
   bunx drizzle-kit generate
   bunx drizzle-kit push
   ```

### Option 3: Local PostgreSQL

1. **Install PostgreSQL**
   - macOS: `brew install postgresql@15`
   - Ubuntu: `sudo apt-get install postgresql-15`
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/)

2. **Create database**
   ```bash
   # Start PostgreSQL service
   # macOS: brew services start postgresql@15
   # Ubuntu: sudo service postgresql start
   
   # Create the database
   createdb kutuma
   ```

3. **Configure and migrate**
   ```bash
   cp .env.example .env
   # Update DATABASE_URL in .env (default: postgresql://localhost:5432/kutuma)
   bunx drizzle-kit generate
   bunx drizzle-kit push
   ```

## Testing the Setup

After setting up the database (or skipping it for now):

1. **Start the app**
   ```bash
   bun start
   ```

2. **Test authentication**
   - Open the app (scan QR code or press `w` for web)
   - You'll see the login screen
   - Choose email or phone authentication
   - Complete profile setup
   - You should be redirected to the home screen

3. **Check the logs**
   - ✅ Green logs = Database connected
   - ⚠️ Yellow logs = Running without database (in-memory mode)
   - ❌ Red logs = Errors (check your database connection)

## Common Issues

### "Database connection failed"
- Check your `DATABASE_URL` in `.env`
- Make sure your database service is running
- For Supabase/Neon: Check your internet connection
- The app will still work in-memory mode

### "Failed to run migrations"
```bash
# Try regenerating migrations
bunx drizzle-kit generate

# Then push to database
bunx drizzle-kit push
```

### Port already in use
```bash
# Kill the process using port 8081
lsof -ti:8081 | xargs kill
```

### Session not persisting
- Without a database, sessions are temporary
- Set up the database for persistent sessions
- Sessions expire after 30 days

## Database Schema

The app uses these tables:
- `users` - User profiles and authentication
- `sessions` - User sessions and tokens
- `verifications` - OTP/email verification codes
- `tasks` - Task listings
- `bids` - Runner bids on tasks

View the full schema in `backend/db/schema.ts`

## Environment Variables

Create a `.env` file (see `.env.example` for template):

```env
# Required for production
DATABASE_URL=postgresql://...

# Optional
NODE_ENV=development

# Future: SMS provider for OTP
# AFRICAS_TALKING_API_KEY=...
# AFRICAS_TALKING_USERNAME=...

# Future: Email service
# SMTP_HOST=...
# SMTP_PORT=...
# SMTP_USER=...
# SMTP_PASSWORD=...
```

## Authentication Flow

### With Database
1. User enters email/phone
2. System sends OTP (currently logged to console)
3. User enters OTP and profile info
4. System creates user in database
5. Session stored in database
6. User can close app and session persists

### Without Database (Development)
1. User enters email/phone
2. Dummy OTP accepted (any 6 digits)
3. User enters profile info
4. Temporary user created in memory
5. Session stored locally only
6. Session cleared on app restart

## Next Steps

Once you have the basic app running:

1. **Production SMS**: Integrate Africa's Talking or Twilio for real OTP
2. **Email Service**: Set up SMTP for email verification
3. **Payment Integration**: Add payment processing for tasks
4. **Push Notifications**: Notify users about new bids/tasks
5. **File Upload**: Add Cloudinary/S3 for profile photos
6. **Maps**: Integrate Google Maps for location services

## Need Help?

- Check `DATABASE_SETUP.md` for detailed database info
- Check `AUTH_SETUP.md` for authentication details
- Review logs in your terminal for specific errors
- All database operations are designed to fail gracefully
