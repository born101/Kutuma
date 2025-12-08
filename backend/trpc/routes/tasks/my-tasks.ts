import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { db } from '../../../db/index';
import { tasks } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export const myTasksProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
      type: z.enum(['posted', 'assigned']),
    })
  )
  .query(async ({ input }) => {
    if (input.type === 'posted') {
      const myTasks = await db.query.tasks.findMany({
        where: eq(tasks.createdBy, input.userId),
        with: {
          bids: {
            with: {
              runner: true,
            },
          },
          assignedRunner: true,
        },
        orderBy: (tasks, { desc }) => [desc(tasks.createdAt)],
      });

      return myTasks.map((task) => ({
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
      }));
    }

    const assignedTasks = await db.query.tasks.findMany({
      where: eq(tasks.assignedRunnerId, input.userId),
      with: {
        creator: true,
        bids: {
          with: {
            runner: true,
          },
        },
      },
      orderBy: (tasks, { desc }) => [desc(tasks.createdAt)],
    });

    return assignedTasks.map((task) => ({
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
      creator: task.creator
        ? {
            ...task.creator,
            rating: parseFloat(task.creator.rating),
          }
        : null,
    }));
  });
