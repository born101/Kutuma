# PostgreSQL Setup Guide

This guide will help you set up PostgreSQL for the Kutuma app.

## Option 1: Local PostgreSQL (Recommended for Development)

### Step 1: Install PostgreSQL

**macOS (using Homebrew):**
```bash
brew install postgresql@17
brew services start postgresql@17
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Windows:**
Download and install from [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)

### Step 2: Create Database

```bash
# Create the database
createdb kutuma

# Or if you need to use sudo:
sudo -u postgres createdb kutuma

# Verify it was created
psql -l
```

### Step 3: Create .env File

```bash
# Copy the example environment file
cp env.example .env
```

Edit `.env` and update the DATABASE_URL:
```
DATABASE_URL=postgresql://localhost:5432/kutuma
```

If you created a PostgreSQL user with password:
```
DATABASE_URL=postgresql://username:password@localhost:5432/kutuma
```

### Step 4: Run Migrations

```bash
# Generate migration files from your schema
bunx drizzle-kit generate

# Push schema to database (creates tables)
bunx drizzle-kit push
```

### Step 5: Seed Database (Optional)

```bash
# Add sample data for testing
bun backend/db/seed.ts
```

### Step 6: Verify Setup

Start your app and check the console:
```bash
bun start
```

You should see: `✅ Database connection successful`

---

## Option 2: Supabase (Recommended for Production)

Supabase provides a free PostgreSQL database with great features.

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up for a free account
3. Click "New Project"
4. Fill in:
   - Name: `kutuma`
   - Database Password: (create a strong password)
   - Region: Choose closest to Zimbabwe (e.g., Cape Town)
5. Click "Create new project" (takes ~2 minutes)

### Step 2: Get Connection String

1. Go to Project Settings (gear icon)
2. Click "Database" in the sidebar
3. Scroll to "Connection string"
4. Select "URI" tab
5. Copy the connection string
6. Replace `[YOUR-PASSWORD]` with your database password

Example:
```
postgresql://postgres.abcdefghijk:[YOUR-PASSWORD]@aws-0-af-south-1.pooler.supabase.com:6543/postgres
```

### Step 3: Create .env File

```bash
cp env.example .env
```

Edit `.env` and paste your connection string:
```
DATABASE_URL=postgresql://postgres.abcdefghijk:your-password@aws-0-af-south-1.pooler.supabase.com:6543/postgres
```

### Step 4: Run Migrations

```bash
bunx drizzle-kit generate
bunx drizzle-kit push
```

### Step 5: Seed Database (Optional)

```bash
bun backend/db/seed.ts
```

### Step 6: Verify Setup

Start your app:
```bash
bun start
```

You should see: `✅ Database connection successful`

---

## Option 3: Neon (Alternative Cloud Option)

Neon is another excellent serverless PostgreSQL option.

### Step 1: Create Neon Project

1. Go to [https://neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create a new project
4. Name it `kutuma`
5. Select region closest to you

### Step 2: Get Connection String

1. On the project dashboard, you'll see the connection string
2. Copy the full connection string (starts with `postgresql://`)

### Step 3: Create .env File

```bash
cp env.example .env
```

Edit `.env` and paste your connection string:
```
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb
```

### Step 4: Run Migrations

```bash
bunx drizzle-kit generate
bunx drizzle-kit push
```

### Step 5: Seed Database (Optional)

```bash
bun backend/db/seed.ts
```

---

## Troubleshooting

### Connection Failed

If you see `❌ Database connection failed`:

1. **Check PostgreSQL is running:**
   ```bash
   # macOS/Linux
   pg_isready
   
   # Or check service status
   brew services list  # macOS
   sudo systemctl status postgresql  # Linux
   ```

2. **Verify DATABASE_URL format:**
   ```
   postgresql://username:password@host:port/database_name
   ```

3. **Test connection manually:**
   ```bash
   psql "postgresql://localhost:5432/kutuma"
   ```

4. **Check firewall/network:**
   - For cloud providers, ensure your IP is whitelisted
   - Supabase automatically allows all IPs by default

### Migration Issues

**Error: "relation already exists"**
```bash
# Reset database (WARNING: This deletes all data!)
bunx drizzle-kit drop
bunx drizzle-kit push
```

**Error: "Cannot find module drizzle-kit"**
```bash
bun install
```

### Database Tables Not Created

```bash
# Regenerate and push
bunx drizzle-kit generate
bunx drizzle-kit push --verbose
```

---

## Database Structure

Your database will have these tables:

- **users** - User profiles with authentication info
- **sessions** - Active user sessions with tokens
- **verifications** - Email/phone verification codes
- **tasks** - Task listings
- **bids** - Runner bids on tasks

---

## Next Steps After Setup

Once your database is running:

1. ✅ Test the login flow with email
2. ✅ Create your profile
3. ✅ Post a task or sign up as a runner
4. ✅ Test the full app functionality

---

## Production Checklist

Before deploying to production:

- [ ] Use a production-grade database (Supabase/Neon or managed PostgreSQL)
- [ ] Set strong database password
- [ ] Enable SSL for database connections
- [ ] Set up regular backups
- [ ] Configure connection pooling
- [ ] Add monitoring and alerts
- [ ] Update DATABASE_URL in production environment
- [ ] Never commit .env file to git (it's already in .gitignore)

---

## Need Help?

- PostgreSQL Docs: [https://www.postgresql.org/docs/](https://www.postgresql.org/docs/)
- Supabase Docs: [https://supabase.com/docs](https://supabase.com/docs)
- Neon Docs: [https://neon.tech/docs](https://neon.tech/docs)
- Drizzle ORM: [https://orm.drizzle.team/docs/overview](https://orm.drizzle.team/docs/overview)
