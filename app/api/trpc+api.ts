import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/backend/trpc/app-router';
import { createContext } from '@/backend/trpc/create-context';
import { checkDatabaseConnection, getDatabaseStatus } from '@/backend/db/index';

export async function GET(request: Request) {
  try {
    console.log('[tRPC /api/trpc] GET Method:', request.method, 'URL:', request.url);

    const dbConnected = await checkDatabaseConnection();
    console.log('[tRPC /api/trpc] DB Connected:', dbConnected);
    
    if (!dbConnected) {
      const dbStatus = getDatabaseStatus();
      console.error('[tRPC /api/trpc] Database not connected:', dbStatus.error);
      
      const errorResponse = [{
        error: {
          message: 'Database connection error',
          code: -32603,
          data: {
            code: 'INTERNAL_SERVER_ERROR',
            httpStatus: 503,
          },
        },
      }];
      
      return new Response(JSON.stringify(errorResponse), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }

    return fetchRequestHandler({
      endpoint: '/api/trpc',
      req: request,
      router: appRouter,
      createContext: ({ req }) => createContext({ req }),
      onError({ error, path }) {
        console.error('[tRPC /api/trpc] Error:', path, error.message);
      },
    });
  } catch (error) {
    console.error('[tRPC /api/trpc] Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}

export async function POST(request: Request) {
  try {
    console.log('[tRPC /api/trpc] POST Method:', request.method, 'URL:', request.url);

    const dbConnected = await checkDatabaseConnection();
    console.log('[tRPC /api/trpc] DB Connected:', dbConnected);
    
    if (!dbConnected) {
      const dbStatus = getDatabaseStatus();
      console.error('[tRPC /api/trpc] Database not connected:', dbStatus.error);
      
      const errorResponse = [{
        error: {
          message: 'Database connection error',
          code: -32603,
          data: {
            code: 'INTERNAL_SERVER_ERROR',
            httpStatus: 503,
          },
        },
      }];
      
      return new Response(JSON.stringify(errorResponse), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }

    return fetchRequestHandler({
      endpoint: '/api/trpc',
      req: request,
      router: appRouter,
      createContext: ({ req }) => createContext({ req }),
      onError({ error, path }) {
        console.error('[tRPC /api/trpc] Error:', path, error.message);
      },
    });
  } catch (error) {
    console.error('[tRPC /api/trpc] Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
