import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { db } from '../../../db/index';
import { sessions } from '../../../db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

export const getCurrentUserProcedure = publicProcedure
  .input(
    z.object({
      token: z.string(),
    })
  )
  .query(async ({ input }) => {
    try {
      const session = await db.query.sessions.findFirst({
        where: and(
          eq(sessions.token, input.token),
          gt(sessions.expiresAt, new Date())
        ),
        with: {
          user: true,
        },
      });

      if (!session || !session.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired session',
        });
      }

      return {
        id: session.user.id,
        name: session.user.name || '',
        email: session.user.email || '',
        phone: session.user.phone || '',
        isRunner: session.user.isRunner ?? false,
        verified: session.user.verified,
        emailVerified: session.user.emailVerified ?? false,
        rating: typeof session.user.rating === 'string' ? parseFloat(session.user.rating) : (session.user.rating ? Number(session.user.rating) : 0),
        completedTasks: session.user.completedTasks,
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('❌ Database error during getCurrentUser:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to verify session. Database error.',
      });
    }
  });
