# 🚀 Database Setup Guide

This guide will help you fix the "JSON Parse error" and set up your Supabase PostgreSQL database.

## Problem
The "JSON Parse error: Unexpected character" occurs when:
- Database tables don't exist
- Backend tries to query non-existent tables
- Server returns HTML error pages instead of JSON

## Solution

### Step 1: Verify Your Environment
Check your `env` file contains:
```bash
DATABASE_URL=postgresql://postgres:n8ttf199@db.ogkbmvnflwvoixjxdhhb.supabase.co:5432/postgres
```

### Step 2: Run Database Setup
Run this command to create all necessary tables:

```bash
bun run backend/db/setup.ts
```

This will:
1. Test database connection
2. Create all tables (users, sessions, tasks, bids, verifications)
3. Verify the setup

### Step 3: Verify Setup
After running the setup, you should see:
```
✅ Database setup completed successfully!
```

### Step 4: Restart Your Server
After database setup, restart your development server:
1. Stop the current server (Ctrl+C)
2. Run: `bun run start` or `bun run start-web`

## What Was Fixed

### 1. **Added Error Handling** (backend/hono.ts)
- Global error handler that returns proper JSON errors
- Health check endpoint at `/health`

### 2. **Improved Session Management** (backend/services/session.ts)
- Added `validateSession()` method
- Added `deleteSession()` method
- Better token generation

### 3. **Enhanced Context** (backend/trpc/create-context.ts)
- Session validation in context
- Protected procedure for authenticated routes
- Better error formatting

### 4. **Database Setup Script** (backend/db/setup.ts)
- Automated table creation
- Connection verification
- Clear error messages

## Testing the Fix

After setup, test these flows:

### 1. Test Health Check
Visit: `http://localhost:8787/health`

You should see:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-12-01T..."
}
```

### 2. Test Authentication
1. Open the app
2. Click "Login"
3. Enter an email
4. Complete profile setup
5. You should be redirected to the home screen

### 3. Test Task Creation
1. Click "Post a Task"
2. Fill in the details
3. Submit
4. Task should appear on the home screen

## Troubleshooting

### Issue: "DATABASE_URL not found"
**Solution:** Make sure your `env` file exists in the project root with the correct DATABASE_URL.

### Issue: "Connection timeout"
**Solution:** 
1. Check your internet connection
2. Verify Supabase credentials are correct
3. Check if your IP is allowed in Supabase (some plans require IP whitelisting)

### Issue: Tables already exist error
**Solution:** This is fine! The script uses `CREATE TABLE IF NOT EXISTS`, so it's safe to run multiple times.

### Issue: Still getting JSON Parse error
**Solution:**
1. Make sure you ran the database setup script
2. Restart your development server
3. Clear app cache/storage
4. Try refreshing the browser (web) or restarting the app (mobile)

## Database Schema

Your database now has these tables:

### `users`
- User profiles (name, email, phone, isRunner)
- Rating and completed tasks count
- Email and phone verification status

### `sessions`
- Active user sessions
- Token-based authentication
- Automatic expiry (30 days)

### `verifications`
- OTP codes for email/phone verification
- Temporary storage (codes expire)

### `tasks`
- Posted tasks
- Status tracking (open, assigned, completed)
- Budget/pricing information

### `bids`
- Runner bids on tasks
- Bid amounts and messages
- Status (pending, accepted, rejected)

## Next Steps

Once your database is set up:

1. ✅ Create test users
2. ✅ Post test tasks
3. ✅ Place test bids
4. ✅ Test the full workflow

Your platform is now ready for development and testing!

## Need Help?

If you encounter any issues:
1. Check the console logs for detailed error messages
2. Verify your DATABASE_URL is correct
3. Make sure you have a stable internet connection
4. Contact support if the issue persists
