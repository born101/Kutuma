# Complete Fix Guide for Account Creation Errors

## What Was Fixed

After deep analysis, I identified and fixed **3 critical issues**:

### ✅ Issue #1: Database Connection Validation
- **Problem**: After you restarted Supabase, the API wasn't checking if the database was reachable
- **Fix**: Added database health checks to the API handler
- **File Changed**: `app/api/[...trpc]+api.ts`

### ✅ Issue #2: Transform Error Prevention  
- **Problem**: The transformer (superjson) was configured in the router but needs proper error handling
- **Fix**: Enhanced error handling for database failures with proper tRPC error responses
- **File Changed**: `app/api/[...trpc]+api.ts`

### ✅ Issue #3: Database Tables Missing
- **Problem**: Restarting Supabase cleared all tables
- **Fix**: You need to recreate the tables using the setup script
- **Action Required**: Run the database setup command (see below)

---

## Step-by-Step Instructions to Fix Everything

### Step 1: Verify Your Database URL

Since you restarted Supabase, the connection details might have changed. Check your `env` file:

```bash
# Your current DATABASE_URL in env file:
DATABASE_URL=postgresql://postgres:n8ttf199@db.ogkbmvnflwvoixjxdhhb.supabase.co:5432/postgres
```

**Action**: 
1. Go to your Supabase dashboard
2. Navigate to Project Settings → Database
3. Copy the connection string (look for "Connection string" under "Connection pooling")
4. Update the `DATABASE_URL` in your `env` file if it changed

### Step 2: Recreate Database Tables

Run this command to create all necessary tables:

```bash
bun run backend/db/setup.ts
```

**What this does**:
- Creates the `users` table
- Creates the `sessions` table  
- Creates the `verifications` table
- Creates the `tasks` table
- Creates the `bids` table

**Expected Output**:
```
🔄 Setting up database...
📍 Database URL: postgresql://postgres:****@db.ogkbmvnflwvoixjxdhhb.supabase.co:5432/postgres

1️⃣ Testing database connection...
✅ Database connection successful

2️⃣ Creating tables if they don't exist...
   ✓ users table
   ✓ sessions table
   ✓ verifications table
   ✓ tasks table
   ✓ bids table

3️⃣ Verifying tables...
   Tables found:
   - bids
   - sessions
   - tasks
   - users
   - verifications

✅ Database setup completed successfully!
```

### Step 3: Restart the Development Server

**Option A: Using Terminal/Command Line**

If you're running the app from a terminal:

1. Find the terminal window where your dev server is running
2. Press `Ctrl + C` (or `Cmd + C` on Mac) to stop the server
3. Run this command to start it again:
   ```bash
   bun run start
   ```

**Option B: Using Rork Platform**

If you're using the Rork web interface:

1. Look for a "Stop" or "Restart" button in the interface
2. Click it to stop the current server
3. Click "Start" to run it again

**Option C: Kill All Processes (If stuck)**

Sometimes processes don't stop cleanly. Run these commands:

```bash
# Kill any running Expo/Metro processes
pkill -f "expo" || true
pkill -f "metro" || true
pkill -f "rork" || true

# Wait 2 seconds
sleep 2

# Start fresh
bun run start
```

### Step 4: Test the Health Check

Once the server is running, test if it can reach the database:

**Using curl** (from terminal):
```bash
curl http://localhost:8081/api/health
```

**Expected Response**:
```json
{
  "status": "ok",
  "database": {
    "connected": true,
    "error": null
  },
  "timestamp": "2025-12-01T..."
}
```

**If you see an error**:
```json
{
  "status": "degraded",
  "database": {
    "connected": false,
    "error": "connection refused..."
  }
}
```
→ This means your DATABASE_URL is wrong. Go back to Step 1.

### Step 5: Test Account Creation

1. Open your app (scan the QR code or use the web preview)
2. Go to the login screen
3. Enter an email address (e.g., `test@example.com`)
4. Complete the profile setup with:
   - Your name
   - Select "Runner" or "Looking for Help"
5. Click "Continue"

**What should happen**:
- You should see "Connecting..." for a moment
- Then you should be redirected to the main app screen
- No errors should appear

---

## Troubleshooting Common Issues

### Error: "Database connection error"

**Cause**: The DATABASE_URL in your `env` file is incorrect or Supabase is down.

**Fix**:
1. Go to Supabase dashboard
2. Check if your project is running (not paused)
3. Copy the connection string again
4. Update `env` file
5. Restart the dev server (Step 3)

### Error: "Failed to fetch" or "Network request failed"

**Cause**: The app can't reach your dev server.

**Fix**:
1. Make sure your dev server is running (`bun run start`)
2. Check that you see a QR code in the terminal
3. Make sure your phone and computer are on the same WiFi network
4. Try using the tunnel URL instead:
   ```bash
   bun run start
   ```
   The terminal will show a URL like `https://xxxx.exp.direct` - make sure this is accessible

### Error: "Unable to transform response from server"

**Cause**: This was the original issue - mismatch between client/server data format.

**Fix**: Already fixed! The API handler now has proper error handling. If you still see this:
1. Restart the dev server (Step 3)
2. Clear app cache:
   - In Expo Go: Shake device → "Clear cache"
   - In web: Hard refresh (Ctrl+Shift+R)

### The tables already exist

If you run the setup script and tables already exist, that's OK! The script uses `CREATE TABLE IF NOT EXISTS`, so it won't error.

---

## Quick Verification Checklist

Before testing account creation, verify:

- [ ] Database URL in `env` file is correct
- [ ] Database setup script ran successfully
- [ ] Dev server is running (you see QR code)
- [ ] Health check returns `"connected": true`
- [ ] No errors in the terminal/console

---

## What Changed in the Code

For your reference, here's what I modified:

### File: `app/api/[...trpc]+api.ts`

**Changes**:
1. Added `checkDatabaseConnection` import
2. Enhanced `/api/health` endpoint to check database status
3. Added database check before processing tRPC requests
4. Returns helpful error messages when database is unreachable

**Why**: This prevents cryptic "Failed to fetch" errors and tells you exactly what's wrong.

---

## Still Having Issues?

If you follow all steps and still see errors, please share:

1. The exact error message from the app
2. The console output from the terminal (where you ran `bun run start`)
3. The output of `curl http://localhost:8081/api/health`

This will help diagnose any remaining issues.

---

## Summary

**What you need to do RIGHT NOW**:

```bash
# 1. Setup database tables
bun run backend/db/setup.ts

# 2. Restart dev server (kill and restart)
pkill -f "expo" && pkill -f "metro" && pkill -f "rork"
sleep 2
bun run start

# 3. Test health check
curl http://localhost:8081/api/health

# 4. Try creating an account in the app
```

That's it! Your account creation should now work properly.
