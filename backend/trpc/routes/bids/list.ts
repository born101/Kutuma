import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { db } from '../../../db/index';
import { bids } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export const listBidsProcedure = publicProcedure
  .input(
    z.object({
      taskId: z.string(),
    })
  )
  .query(async ({ input }) => {
    const taskBids = await db.query.bids.findMany({
      where: eq(bids.taskId, input.taskId),
      with: {
        runner: true,
      },
      orderBy: (bids, { asc }) => [asc(bids.amount)],
    });

    return taskBids.map((bid) => ({
      ...bid,
      amount: parseFloat(bid.amount),
      runner: {
        ...bid.runner,
        rating: parseFloat(bid.runner.rating),
      },
    }));
  });
