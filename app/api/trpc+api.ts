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

    try {
      const response = await fetchRequestHandler({
        endpoint: '/api/trpc',
        req: request,
        router: appRouter,
        createContext: ({ req }) => createContext({ req }),
        onError({ error, path }) {
          console.error('[tRPC /api/trpc] Error:', path, error.message);
        },
      });
      
      // Ensure response has proper content-type header and is JSON
      if (response) {
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          const clonedResponse = response.clone();
          const text = await clonedResponse.text();
          console.warn('[tRPC /api/trpc] Response is not JSON, content-type:', contentType);
          console.warn('[tRPC /api/trpc] Response body preview:', text.substring(0, 200));
          
          // If it's HTML, it means we got an error page
          if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
            console.error('[tRPC /api/trpc] Received HTML error page instead of JSON');
            const errorResponse = [{
              error: {
                message: 'Server returned HTML error page. The API route may not be configured correctly.',
                code: -32603,
                data: {
                  code: 'INTERNAL_SERVER_ERROR',
                  httpStatus: response.status,
                },
              },
            }];
            
            return new Response(JSON.stringify(errorResponse), {
              status: 200,
              headers: { 'content-type': 'application/json' },
            });
          }
        }
        
        // Ensure content-type header is set correctly
        const headers = new Headers(response.headers);
        if (!headers.get('content-type')) {
          headers.set('content-type', 'application/json');
        }
        
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: headers,
        });
      }
      
      return response;
    } catch (handlerError: any) {
      console.error('[tRPC /api/trpc] Handler error:', handlerError);
      const errorResponse = [{
        error: {
          message: handlerError?.message || 'Request handler error',
          code: -32603,
          data: {
            code: 'INTERNAL_SERVER_ERROR',
            httpStatus: 500,
          },
        },
      }];
      
      return new Response(JSON.stringify(errorResponse), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }
  } catch (error: any) {
    console.error('[tRPC /api/trpc] Unexpected error:', error);
    const errorResponse = [{
      error: {
        message: error?.message || 'Internal server error',
        code: -32603,
        data: {
          code: 'INTERNAL_SERVER_ERROR',
          httpStatus: 500,
        },
      },
    }];
    
    return new Response(JSON.stringify(errorResponse), {
      status: 200,
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

    try {
      const response = await fetchRequestHandler({
        endpoint: '/api/trpc',
        req: request,
        router: appRouter,
        createContext: ({ req }) => createContext({ req }),
        onError({ error, path }) {
          console.error('[tRPC /api/trpc] Error:', path, error.message);
        },
      });
      
      // Ensure response has proper content-type header and is JSON
      if (response) {
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          const clonedResponse = response.clone();
          const text = await clonedResponse.text();
          console.warn('[tRPC /api/trpc] Response is not JSON, content-type:', contentType);
          console.warn('[tRPC /api/trpc] Response body preview:', text.substring(0, 200));
          
          // If it's HTML, it means we got an error page
          if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
            console.error('[tRPC /api/trpc] Received HTML error page instead of JSON');
            const errorResponse = [{
              error: {
                message: 'Server returned HTML error page. The API route may not be configured correctly.',
                code: -32603,
                data: {
                  code: 'INTERNAL_SERVER_ERROR',
                  httpStatus: response.status,
                },
              },
            }];
            
            return new Response(JSON.stringify(errorResponse), {
              status: 200,
              headers: { 'content-type': 'application/json' },
            });
          }
        }
        
        // Ensure content-type header is set correctly
        const headers = new Headers(response.headers);
        if (!headers.get('content-type')) {
          headers.set('content-type', 'application/json');
        }
        
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: headers,
        });
      }
      
      return response;
    } catch (handlerError: any) {
      console.error('[tRPC /api/trpc] Handler error:', handlerError);
      const errorResponse = [{
        error: {
          message: handlerError?.message || 'Request handler error',
          code: -32603,
          data: {
            code: 'INTERNAL_SERVER_ERROR',
            httpStatus: 500,
          },
        },
      }];
      
      return new Response(JSON.stringify(errorResponse), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }
  } catch (error: any) {
    console.error('[tRPC /api/trpc] Unexpected error:', error);
    const errorResponse = [{
      error: {
        message: error?.message || 'Internal server error',
        code: -32603,
        data: {
          code: 'INTERNAL_SERVER_ERROR',
          httpStatus: 500,
        },
      },
    }];
    
    return new Response(JSON.stringify(errorResponse), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }
}
