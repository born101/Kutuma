import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { db } from '../../../db/index';
import { bids, tasks } from '../../../db/schema';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';

export const acceptBidProcedure = publicProcedure
  .input(
    z.object({
      bidId: z.string(),
      userId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const bid = await db.query.bids.findFirst({
      where: eq(bids.id, input.bidId),
      with: {
        task: true,
      },
    });

    if (!bid) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Bid not found',
      });
    }

    if (bid.task.createdBy !== input.userId) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Only the task creator can accept bids',
      });
    }

    if (bid.task.status !== 'open') {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Task is not accepting bids',
      });
    }

    await db
      .update(bids)
      .set({ status: 'accepted', updatedAt: new Date() })
      .where(eq(bids.id, input.bidId));

    await db
      .update(tasks)
      .set({
        status: 'active',
        assignedRunnerId: bid.runnerId,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, bid.taskId));

    const otherBids = await db.query.bids.findMany({
      where: eq(bids.taskId, bid.taskId),
    });

    for (const otherBid of otherBids) {
      if (otherBid.id !== input.bidId) {
        await db
          .update(bids)
          .set({ status: 'rejected', updatedAt: new Date() })
          .where(eq(bids.id, otherBid.id));
      }
    }

    console.log('✅ Bid accepted:', input.bidId);

    return {
      success: true,
    };
  });
