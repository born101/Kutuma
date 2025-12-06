import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { db } from '../../../db/index';
import { ratings } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export const listRatingsProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string().optional(),
      taskId: z.string().optional(),
    }).optional()
  )
  .query(async ({ input }) => {
    const conditions = [];

    if (input?.userId) {
      conditions.push(eq(ratings.toUserId, input.userId));
    }

    if (input?.taskId) {
      conditions.push(eq(ratings.taskId, input.taskId));
    }

    const allRatings = await db.query.ratings.findMany({
      where: conditions.length > 0 ? conditions[0] : undefined,
      with: {
        fromUser: {
          columns: {
            id: true,
            name: true,
            profilePhoto: true,
          },
        },
        task: {
          columns: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: (ratings, { desc }) => [desc(ratings.createdAt)],
    });

    return allRatings;
  });

