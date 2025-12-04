import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { db } from '../../../db/index';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { tasks } from '../../../db/schema';

export const getTaskProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .query(async ({ input }) => {
    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, input.id),
      with: {
        bids: {
          with: {
            runner: true,
          },
        },
        assignedRunner: true,
      },
    });

    if (!task) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Task not found',
      });
    }

    return {
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
      assignedRunner: task.assignedRunner
        ? {
            ...task.assignedRunner,
            rating: parseFloat(task.assignedRunner.rating),
          }
        : null,
    };
  });
