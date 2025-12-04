import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/kutuma';

async function runMigrations() {
  console.log('🔄 Starting database migration...');
  
  const migrationClient = postgres(connectionString, { max: 1, ssl: 'require' });
  const db = drizzle(migrationClient, { schema });

  try {
    await migrate(db, { migrationsFolder: './backend/db/migrations' });
    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await migrationClient.end();
  }
}

runMigrations().catch((error) => {
  console.error('Migration error:', error);
  process.exit(1);
});
