import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { setDefaultResultOrder } from 'dns';

setDefaultResultOrder('ipv4first');

const connectionString = process.env.DATABASE_URL || '';

if (!connectionString) {
  console.error('❌ DATABASE_URL is not set!');
}

const client = postgres(connectionString, { 
  max: 5,
  idle_timeout: 30,
  connect_timeout: 10,
  ssl: { rejectUnauthorized: false },
  onnotice: () => {},
  connection: {
    application_name: 'kutuma-app',
  },
});

export const db = drizzle(client, { schema });

let isConnected = false;
let connectionError: Error | null = null;

export async function checkDatabaseConnection(): Promise<boolean> {
  if (isConnected) return true;
  
  try {
    console.log('🔄 Attempting database connection...');
    console.log('📍 Connection URL:', connectionString.replace(/:[^:@]+@/, ':***@'));
    await client`SELECT 1`;
    console.log('✅ Database connection successful');
    isConnected = true;
    connectionError = null;
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    connectionError = error as Error;
    isConnected = false;
    return false;
  }
}

export function getDatabaseStatus() {
  return {
    isConnected,
    error: connectionError?.message || null,
  };
}
