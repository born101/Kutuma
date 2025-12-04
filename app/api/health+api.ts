import { checkDatabaseConnection, getDatabaseStatus } from '@/backend/db/index';

const handler = async (req: Request) => {
  console.log('[Health Check] Request received');
  
  const dbConnected = await checkDatabaseConnection();
  const dbStatus = getDatabaseStatus();
  
  const healthData = {
    status: dbConnected ? 'ok' : 'degraded',
    database: {
      connected: dbConnected,
      error: dbStatus.error,
    },
    timestamp: new Date().toISOString(),
  };
  
  console.log('[Health Check] Response:', healthData);
  
  return new Response(JSON.stringify(healthData), {
    status: dbConnected ? 200 : 503,
    headers: { 'content-type': 'application/json' },
  });
};

export const GET = handler;
export const POST = handler;
