import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { sessionService } from '../services/session';

interface CreateContextOptions {
  req: Request;
  resHeaders?: Headers;
}

export const createContext = async (opts: CreateContextOptions) => {
  const authHeader = opts.req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  let userId: string | null = null;
  if (token) {
    try {
      const session = await sessionService.validateSession(token);
      userId = session?.userId || null;
    } catch (error) {
      console.log('Session validation error (non-fatal):', error);
    }
  }

  return {
    req: opts.req,
    userId,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof Error ? error.cause.message : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }

  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
    },
  });
});
