#!/usr/bin/env node

import { execSync } from 'child_process';

console.log('🔄 Pushing database schema to Supabase...');

try {
  execSync('bunx drizzle-kit push', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/kutuma'
    }
  });
  console.log('✅ Database schema pushed successfully');
} catch (error) {
  console.error('❌ Failed to push database schema:', error);
  process.exit(1);
}
