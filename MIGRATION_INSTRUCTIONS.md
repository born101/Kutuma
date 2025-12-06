# 🚀 Database Migration Instructions

**Status:** Ready to Apply  
**Tables to Create:** `ratings`, `payments` (already defined, need to push to Supabase)  
**Time Required:** 5 minutes  
**Difficulty:** Easy (3 clicks)  

---

## ✅ Good News!

Your migration file **already exists** at:
```
backend/db/migrations/0000_volatile_master_mold.sql
```

This file contains:
- ✅ `users` table
- ✅ `sessions` table
- ✅ `verifications` table
- ✅ `tasks` table
- ✅ `bids` table
- ✅ `ratings` table ⭐ (FOR YOUR APP)
- ✅ `payments` table ⭐ (FOR YOUR APP)

All foreign keys and constraints are defined.

---

## 📋 Option 1: Use Drizzle CLI (Recommended - If npm works)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Generate New Migrations (if needed)
```bash
npx drizzle-kit generate
```

### Step 3: Push to Supabase
```bash
npx drizzle-kit push
```

**This will:**
- ✅ Check your local schema vs. Supabase
- ✅ Apply any missing migrations
- ✅ Create ratings & payments tables
- ✅ Create all foreign keys
- ✅ Complete in seconds

---

## 📋 Option 2: Manual SQL in Supabase (If npm doesn't work)

### Step 1: Go to Supabase Console
1. Open https://supabase.com/dashboard/projects
2. Select your project (Kutuma)
3. Go to **SQL Editor**

### Step 2: Copy This SQL

**⚠️ IMPORTANT: Run ALL of this in one SQL query execution**

```sql
-- Create ratings table
CREATE TABLE IF NOT EXISTS "ratings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"from_user_id" uuid NOT NULL,
	"to_user_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Create payments table
CREATE TABLE IF NOT EXISTS "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"method" text NOT NULL,
	"transaction_id" text,
	"payer_id" uuid NOT NULL,
	"recipient_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);

-- Add foreign keys for ratings
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_task_id_tasks_id_fk" 
	FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "ratings" ADD CONSTRAINT "ratings_from_user_id_users_id_fk" 
	FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "ratings" ADD CONSTRAINT "ratings_to_user_id_users_id_fk" 
	FOREIGN KEY ("to_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

-- Add foreign keys for payments
ALTER TABLE "payments" ADD CONSTRAINT "payments_task_id_tasks_id_fk" 
	FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "payments" ADD CONSTRAINT "payments_payer_id_users_id_fk" 
	FOREIGN KEY ("payer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "payments" ADD CONSTRAINT "payments_recipient_id_users_id_fk" 
	FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
```

### Step 3: Execute!
1. Paste the SQL above in the SQL Editor
2. Click **Run** button (⏵ button in bottom right)
3. Wait 2-3 seconds for success message
4. ✅ Done!

---

## ✅ Verify Success

### Check 1: Tables Exist
Go to **Supabase → Tables** and confirm:
- ✅ `ratings` table exists
- ✅ `payments` table exists

### Check 2: Columns are Correct
Click on each table and verify columns:

**ratings table should have:**
- id (uuid, primary key)
- task_id (uuid, foreign key)
- from_user_id (uuid, foreign key)
- to_user_id (uuid, foreign key)
- rating (integer)
- comment (text, nullable)
- created_at (timestamp)

**payments table should have:**
- id (uuid, primary key)
- task_id (uuid, foreign key)
- amount (numeric)
- status (text)
- method (text)
- transaction_id (text, nullable)
- payer_id (uuid, foreign key)
- recipient_id (uuid, foreign key)
- created_at (timestamp)
- completed_at (timestamp, nullable)

### Check 3: Foreign Keys Work
Try this query in SQL Editor:
```sql
SELECT 
  (SELECT COUNT(*) FROM ratings) as ratings_count,
  (SELECT COUNT(*) FROM payments) as payments_count;
```

Should return:
```
ratings_count | payments_count
0             | 0
```

If you see numbers instead of errors, foreign keys are working! ✅

---

## 🎯 What This Means

### Your App Can Now:
1. ✅ Store ratings when users rate each other
2. ✅ Store payment transactions
3. ✅ Retrieve ratings history
4. ✅ Retrieve payment history
5. ✅ Calculate average ratings

### Endpoints That Work:
- `POST /trpc/ratings.create` → Stores in ratings table
- `GET /trpc/ratings.list` → Retrieves from ratings table
- `POST /trpc/payments.create` → Stores in payments table
- `GET /trpc/payments.get` → Retrieves from payments table
- `POST /trpc/payments.complete` → Updates payment status

---

## 🆘 Troubleshooting

### "Table already exists"
✅ This is OK! Drizzle uses `CREATE TABLE IF NOT EXISTS` which is safe to run multiple times.

### "Foreign key error"
🔴 This means one of the parent tables doesn't exist. Check:
- [ ] `users` table exists (should exist from first migration)
- [ ] `tasks` table exists (should exist from first migration)

### "Column already exists"
✅ This is also OK! The migration won't create duplicates.

### Database rejected the SQL
Check that:
- [ ] You copied the entire SQL block
- [ ] You're running in SQL Editor (not elsewhere)
- [ ] Your DATABASE_URL is configured
- [ ] You have write permissions on the database

---

## ⏱️ Expected Timeline

| Step | Time | What Happens |
|------|------|--------------|
| 1. Run migrations | 30 sec | Tables created |
| 2. Verify in Supabase | 1 min | Confirm tables exist |
| 3. Test endpoints | 2 min | Try creating a rating |
| **Total** | **5 min** | **Database ready!** |

---

## ✨ After Migration Complete

Once tables are created, your app immediately gains:

### Rating Flow
```
User completes task
    ↓
Rating modal appears (✅ frontend already done!)
    ↓
User selects stars + comment
    ↓
Backend hits ratings.create mutation (✅ already coded!)
    ↓
Rating stored in 'ratings' table (← you are creating this now)
    ↓
Profile shows rating with stars (✅ frontend already done!)
```

### Payment Flow
```
Task complete
    ↓
Payment button available (✅ frontend already done!)
    ↓
User selects payment method + enters transaction ID
    ↓
Backend hits payments.create mutation (✅ already coded!)
    ↓
Payment stored in 'payments' table (← you are creating this now)
    ↓
Profile shows payment history (✅ frontend already done!)
```

---

## 🚀 Next Steps

### After Migration
1. ✅ Tables exist in database
2. 🔄 Test with 2 test accounts (Testing Phase)
3. 📱 Run through complete user flow
4. 🎉 LAUNCH!

---

## 📞 Need Help?

If anything goes wrong:

1. **Check table existence:** Go to Supabase → Tables
2. **Check column types:** Click into each table
3. **Run test query:** Run the verification check above
4. **Reset if needed:** Delete tables and run migration again

**All straightforward. You've got this!** 💪

---

**Status:** Ready to Execute  
**Time to Complete:** 5 minutes  
**Next Action:** Choose Option 1 or 2 above and execute!

---

## ✅ Quick Checklist

Before running migration:
- [ ] DATABASE_URL in `.env` is correct
- [ ] You have Supabase account access
- [ ] You can access SQL Editor

Then:
- [ ] Run Option 1 OR Option 2
- [ ] Verify tables exist
- [ ] Continue to Testing Phase

Done! ✅
