import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { db } from '../../../db/index';
import { tasks } from '../../../db/schema';
import { TRPCError } from '@trpc/server';
import { eq, and } from 'drizzle-orm';

export const startTaskProcedure = publicProcedure
  .input(
    z.object({
      taskId: z.string(),
      runnerId: z.string(),
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

    if (task.assignedRunnerId !== input.runnerId) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Only the assigned runner can start this task',
      });
    }

    if (task.status !== 'active') {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Task must be in active status to start',
      });
    }

    // Task is already active, no need to change status
    // This endpoint can be used to track when runner actually starts working
    // For now, we'll just return success
    // In the future, we could add a "startedAt" timestamp

    console.log('✅ Task started by runner:', input.taskId);

    return {
      success: true,
      task: {
        ...task,
        maxBudget: task.maxBudget ? parseFloat(task.maxBudget) : undefined,
        fixedPrice: task.fixedPrice ? parseFloat(task.fixedPrice) : undefined,
      },
    };
  });

