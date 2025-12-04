import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { db } from '../../../db/index';
import { users } from '../../../db/schema';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';

export const getProfileProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
    })
  )
  .query(async ({ input }) => {
    const user = await db.query.users.findFirst({
      where: eq(users.id, input.userId),
    });

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
      isRunner: user.isRunner,
      verified: user.verified,
      rating: parseFloat(user.rating),
      completedTasks: user.completedTasks,
      createdAt: user.createdAt,
    };
  });
