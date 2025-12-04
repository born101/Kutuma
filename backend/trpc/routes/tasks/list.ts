import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { db } from '../../../db/index';
import { tasks } from '../../../db/schema';
import { eq, and, like, or } from 'drizzle-orm';

export const listTasksProcedure = publicProcedure
  .input(
    z.object({
      category: z.enum(['groceries', 'queue', 'delivery', 'research', 'pickup', 'other', 'all']).optional(),
      search: z.string().optional(),
      status: z.enum(['open', 'active', 'completed', 'cancelled']).optional(),
    }).optional()
  )
  .query(async ({ input }) => {
    const conditions = [];

    if (input?.category && input.category !== 'all') {
      conditions.push(eq(tasks.category, input.category));
    }

    if (input?.status) {
      conditions.push(eq(tasks.status, input.status));
    }

    if (input?.search) {
      conditions.push(
        or(
          like(tasks.title, `%${input.search}%`),
          like(tasks.description, `%${input.search}%`)
        )
      );
    }

    const allTasks = await db.query.tasks.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        bids: {
          with: {
            runner: true,
          },
        },
      },
      orderBy: (tasks, { desc }) => [desc(tasks.createdAt)],
    });

    return allTasks.map((task) => ({
      ...task,
      maxBudget: task.maxBudget ? parseFloat(task.maxBudget) : undefined,
      fixedPrice: task.fixedPrice ? parseFloat(task.fixedPrice) : undefined,
      bids: task.bids.map((bid) => ({
        ...bid,
        amount: parseFloat(bid.amount),
        runner: {
          ...bid.runner,
          rating: parseFloat(bid.runner.rating),
        },
      })),
    }));
  });
