# Database Setup Guide

## Quick Setup Options

You have 3 options for setting up PostgreSQL. **I recommend Option 1 (Supabase)** as it's the easiest and free.

---

## Option 1: Supabase (Recommended - Easiest & Free)

### Step 1: Create Supabase Account
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub, Google, or email
4. Create a new organization (if prompted)

### Step 2: Create a New Project
1. Click "New Project"
2. Fill in:
   - **Name**: `kutuma` (or any name you like)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is fine
3. Click "Create new project"
4. Wait 2-3 minutes for project to be created

### Step 3: Get Connection String
1. Go to **Settings** (gear icon in left sidebar)
2. Click **Database**
3. Scroll down to **Connection string**
4. Under **Connection string**, select **URI**
5. Copy the connection string (looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`)
6. Replace `[YOUR-PASSWORD]` with the password you created in Step 2

### Step 4: Create .env File
1. Copy `env.example` to `.env`:
   ```powershell
   Copy-Item env.example .env
   ```

2. Open `.env` and update the `DATABASE_URL`:
   ```
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres
   ```
   (Replace with your actual connection string from Step 3)

### Step 5: Run Migration
```powershell
npx drizzle-kit push
```

**Done!** Your database is now set up.

---

## Option 2: Neon (Free Cloud Database)

### Step 1: Create Neon Account
1. Go to https://neon.tech
2. Click "Sign Up"
3. Sign up with GitHub or email

### Step 2: Create a Project
1. Click "Create a project"
2. Fill in:
   - **Name**: `kutuma`
   - **Region**: Choose closest to you
3. Click "Create project"

### Step 3: Get Connection String
1. After project is created, you'll see a connection string
2. It looks like: `postgresql://username:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require`
3. Copy this string

### Step 4: Create .env File
1. Copy `env.example` to `.env`:
   ```powershell
   Copy-Item env.example .env
   ```

2. Open `.env` and update the `DATABASE_URL`:
   ```
   DATABASE_URL=postgresql://username:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
   (Replace with your actual connection string from Step 3)

### Step 5: Run Migration
```powershell
npx drizzle-kit push
```

**Done!** Your database is now set up.

---

## Option 3: Local PostgreSQL (Advanced)

### Step 1: Install PostgreSQL
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer
3. During installation:
   - Remember the password you set for the `postgres` user
   - Keep default port (5432)
   - Keep default installation directory

### Step 2: Start PostgreSQL Service
1. Open **Services** (search "services" in Windows)
2. Find **postgresql-x64-XX** service
3. Make sure it's **Running** (if not, right-click and Start)

### Step 3: Create Database
1. Open **pgAdmin** (installed with PostgreSQL) or use command line
2. **Using pgAdmin:**
   - Connect to server (password is what you set during installation)
   - Right-click "Databases" → "Create" → "Database"
   - Name: `kutuma`
   - Click "Save"

3. **Using Command Line:**
   ```powershell
   # Find PostgreSQL bin directory (usually C:\Program Files\PostgreSQL\XX\bin)
   # Add to PATH or use full path
   & "C:\Program Files\PostgreSQL\16\bin\createdb.exe" -U postgres kutuma
   ```
   (Enter password when prompted)

### Step 4: Create .env File
1. Copy `env.example` to `.env`:
   ```powershell
   Copy-Item env.example .env
   ```

2. Open `.env` and update the `DATABASE_URL`:
   ```
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/kutuma
   ```
   (Replace `YOUR_PASSWORD` with the password you set during installation)

### Step 5: Run Migration
```powershell
npx drizzle-kit push
```

**Done!** Your database is now set up.

---

## Verify Setup

After running `npx drizzle-kit push`, you should see:
```
✓ Pushed schema to database
```

If you see errors:
- **Connection refused**: Database isn't running or wrong connection string
- **Authentication failed**: Wrong password in DATABASE_URL
- **Database does not exist**: Database name is wrong

---

## Troubleshooting

### "ECONNREFUSED" Error
- **Supabase/Neon**: Check your connection string is correct
- **Local**: Make sure PostgreSQL service is running

### "Authentication failed" Error
- Check your password in DATABASE_URL
- For Supabase: Use the password you set when creating the project
- For Neon: Use the password from your connection string
- For Local: Use the postgres user password

### "Database does not exist" Error
- For Supabase/Neon: The database is created automatically, just use the connection string as-is
- For Local: Make sure you created the `kutuma` database

### Can't find .env file
- Make sure you created it in the project root (same folder as `package.json`)
- The file should be named exactly `.env` (with the dot at the start)

---

## Next Steps

Once your database is set up:
1. ✅ Run `npx drizzle-kit push` to create tables
2. (Optional) Run `bun backend/db/seed.ts` to add sample data
3. Start your app and test!

---

## Need Help?

- **Supabase Docs**: https://supabase.com/docs/guides/database
- **Neon Docs**: https://neon.tech/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
