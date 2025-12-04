import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { db } from '../../../db/index';
import { bids, tasks } from '../../../db/schema';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';

export const createBidProcedure = publicProcedure
  .input(
    z.object({
      taskId: z.string(),
      runnerId: z.string(),
      amount: z.number().positive(),
      message: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, input.taskId),
    });

    if (!task) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Task not found',
      });
    }

    if (task.status !== 'open') {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Task is not accepting bids',
      });
    }

    const [newBid] = await db
      .insert(bids)
      .values({
        taskId: input.taskId,
        runnerId: input.runnerId,
        amount: input.amount.toString(),
        message: input.message,
      })
      .returning();

    const bidWithRunner = await db.query.bids.findFirst({
      where: eq(bids.id, newBid.id),
      with: {
        runner: true,
      },
    });

    console.log('✅ Bid created:', newBid.id);

    if (!bidWithRunner) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve bid',
      });
    }

    return {
      ...bidWithRunner,
      amount: parseFloat(bidWithRunner.amount),
      runner: {
        ...bidWithRunner.runner,
        rating: parseFloat(bidWithRunner.runner.rating),
      },
    };
  });
