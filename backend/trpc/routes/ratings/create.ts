import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { db } from '../../../db/index';
import { ratings, tasks, users } from '../../../db/schema';
import { TRPCError } from '@trpc/server';
import { eq, and } from 'drizzle-orm';

export const createRatingProcedure = publicProcedure
  .input(
    z.object({
      taskId: z.string(),
      fromUserId: z.string(),
      toUserId: z.string(),
      rating: z.number().min(1).max(5),
      comment: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    // Verify task exists and is completed
    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, input.taskId),
    });

    if (!task) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Task not found',
      });
    }

    if (task.status !== 'completed') {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Can only rate completed tasks',
      });
    }

    // Verify users are part of this task
    const isRequester = task.createdBy === input.fromUserId;
    const isRunner = task.assignedRunnerId === input.fromUserId;

    if (!isRequester && !isRunner) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You can only rate users involved in this task',
      });
    }

    // Verify toUserId is the other party
    if (isRequester && task.assignedRunnerId !== input.toUserId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Can only rate the assigned runner',
      });
    }

    if (isRunner && task.createdBy !== input.toUserId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Can only rate the task creator',
      });
    }

    // Check if rating already exists
    const existingRating = await db.query.ratings.findFirst({
      where: and(
        eq(ratings.taskId, input.taskId),
        eq(ratings.fromUserId, input.fromUserId),
        eq(ratings.toUserId, input.toUserId)
      ),
    });

    if (existingRating) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'You have already rated this user for this task',
      });
    }

    // Create rating
    const [newRating] = await db
      .insert(ratings)
      .values({
        taskId: input.taskId,
        fromUserId: input.fromUserId,
        toUserId: input.toUserId,
        rating: input.rating,
        comment: input.comment || null,
      })
      .returning();

    // Calculate and update user's average rating
    const allRatings = await db.query.ratings.findMany({
      where: eq(ratings.toUserId, input.toUserId),
    });

    const averageRating = allRatings.length > 0
      ? allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length
      : 0;

    await db
      .update(users)
      .set({
        rating: averageRating.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(users.id, input.toUserId));

    console.log('✅ Rating created:', newRating.id);

    return {
      ...newRating,
      success: true,
    };
  });

