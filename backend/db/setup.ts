#!/usr/bin/env node

import postgres from 'postgres';
import { setDefaultResultOrder } from 'dns';

setDefaultResultOrder('ipv4first');

const connectionString = process.env.DATABASE_URL as string;

if (!connectionString) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

async function setupDatabase() {
  console.log('🔄 Setting up database...');
  console.log('📍 Database URL:', connectionString.replace(/:[^:@]*@/, ':****@'));

  const client = postgres(connectionString, { 
    max: 1, 
    ssl: { rejectUnauthorized: false },
    connect_timeout: 10,
    idle_timeout: 0,
    max_lifetime: 0,
    connection: {
      application_name: 'kutuma-setup',
    },
  });

  try {
    console.log('\n1️⃣ Testing database connection...');
    await client`SELECT 1 as test`;
    console.log('✅ Database connection successful\n');

    console.log('2️⃣ Creating tables if they don\'t exist...');
    
    await client`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT,
        email TEXT UNIQUE,
        phone TEXT UNIQUE,
        is_runner BOOLEAN,
        verified BOOLEAN NOT NULL DEFAULT false,
        email_verified BOOLEAN NOT NULL DEFAULT false,
        rating DECIMAL(3, 2) NOT NULL DEFAULT 0,
        completed_tasks INTEGER NOT NULL DEFAULT 0,
        profile_photo TEXT,
        preferred_zones TEXT[],
        bio TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log('   ✓ users table');

    await client`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log('   ✓ sessions table');

    await client`
      CREATE TABLE IF NOT EXISTS verifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        phone TEXT,
        email TEXT,
        code TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        verified BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log('   ✓ verifications table');

    await client`
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        location TEXT NOT NULL,
        timeframe TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'open',
        bid_type TEXT NOT NULL,
        max_budget DECIMAL(10, 2),
        fixed_price DECIMAL(10, 2),
        created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        assigned_runner_id UUID REFERENCES users(id) ON DELETE SET NULL,
        completed_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log('   ✓ tasks table');

    await client`
      CREATE TABLE IF NOT EXISTS bids (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        runner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10, 2) NOT NULL,
        message TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log('   ✓ bids table\n');

    console.log('3️⃣ Verifying tables...');
    const tablesResult = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    console.log('   Tables found:');
    tablesResult.forEach((row: any) => {
      console.log(`   - ${row.table_name}`);
    });

    console.log('\n✅ Database setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Restart your development server');
    console.log('   2. Test the authentication flow');
    console.log('   3. Create your first task\n');

  } catch (error: any) {
    console.error('\n❌ Database setup failed:', error.message);
    console.error('\nDetails:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupDatabase().catch((error) => {
  console.error('Setup error:', error);
  process.exit(1);
});
