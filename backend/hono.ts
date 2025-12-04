import { Hono } from "hono";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import { checkDatabaseConnection, getDatabaseStatus } from "./db/index";

const app = new Hono();

app.use("*", cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

app.onError((err, c) => {
  console.error('🔥 Server Error:', err);
  console.error('Stack:', err.stack);
  
  const errorMessage = err.message || 'Internal Server Error';
  const statusCode = (err as any).status || 500;
  
  return c.json(
    {
      error: {
        message: errorMessage,
        code: 'INTERNAL_SERVER_ERROR',
      },
    },
    statusCode
  );
});

// Handle all tRPC requests using fetch adapter
app.all("/api/*", async (c) => {
  console.log('📥 tRPC request:', c.req.method, c.req.url);
  
  const response = await fetchRequestHandler({
    endpoint: '/api',
    req: c.req.raw,
    router: appRouter,
    createContext: ({ req }) => createContext({ req }),
    onError({ error, path }) {
      console.error(`❌ tRPC Error on ${path}:`, error.message);
      if (error.stack) {
        console.error('Stack:', error.stack);
      }
    },
  });
  
  return response;
});

// Handle batch requests to /api (without trailing path)
app.all("/api", async (c) => {
  console.log('📥 tRPC batch request:', c.req.method, c.req.url);
  
  const response = await fetchRequestHandler({
    endpoint: '/api',
    req: c.req.raw,
    router: appRouter,
    createContext: ({ req }) => createContext({ req }),
    onError({ error, path }) {
      console.error(`❌ tRPC Error on ${path}:`, error.message);
      if (error.stack) {
        console.error('Stack:', error.stack);
      }
    },
  });
  
  return response;
});

app.get("/", (c) => {
  return c.json({ status: "ok", message: "Kutuma API is running" });
});

app.get("/health", async (c) => {
  const dbConnected = await checkDatabaseConnection();
  const dbStatus = getDatabaseStatus();
  return c.json({
    status: dbConnected ? "healthy" : "degraded",
    database: {
      connected: dbConnected,
      error: dbStatus.error,
    },
    timestamp: new Date().toISOString(),
  });
});

checkDatabaseConnection().then((connected) => {
  if (connected) {
    console.log('✅ Server started with database connection');
  } else {
    console.warn('⚠️ Server started without database connection');
  }
});

export default app;
