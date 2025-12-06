import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { db } from '../../../db/index';
import { tasks, users } from '../../../db/schema';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';

export const completeTaskProcedure = publicProcedure
  .input(
    z.object({
      taskId: z.string(),
      userId: z.string(),
      completedBy: z.enum(['runner', 'requester']),
    })
  )
  .mutation(async ({ input }) => {
    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, input.taskId),
      with: {
        assignedRunner: true,
        creator: true,
      },
    });

    if (!task) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Task not found',
      });
    }

    // Verify user has permission to complete
    if (input.completedBy === 'runner') {
      if (task.assignedRunnerId !== input.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only the assigned runner can mark task as complete',
        });
      }
    } else {
      if (task.createdBy !== input.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only the task creator can mark task as complete',
        });
      }
    }

    if (task.status !== 'active') {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Task must be active to be completed',
      });
    }

    // Update task status
    await db
      .update(tasks)
      .set({
        status: 'completed',
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, input.taskId));

    // Update runner's completed tasks count
    if (task.assignedRunnerId) {
      const runner = await db.query.users.findFirst({
        where: eq(users.id, task.assignedRunnerId),
      });

      if (runner) {
        await db
          .update(users)
          .set({
            completedTasks: (runner.completedTasks || 0) + 1,
            updatedAt: new Date(),
          })
          .where(eq(users.id, task.assignedRunnerId));
      }
    }

    console.log('✅ Task completed:', input.taskId);

    const updatedTask = await db.query.tasks.findFirst({
      where: eq(tasks.id, input.taskId),
      with: {
        assignedRunner: true,
      },
    });

    return {
      success: true,
      task: updatedTask
        ? {
            ...updatedTask,
            maxBudget: updatedTask.maxBudget ? parseFloat(updatedTask.maxBudget) : undefined,
            fixedPrice: updatedTask.fixedPrice ? parseFloat(updatedTask.fixedPrice) : undefined,
            assignedRunner: updatedTask.assignedRunner
              ? {
                  ...updatedTask.assignedRunner,
                  rating: parseFloat(updatedTask.assignedRunner.rating),
                }
              : null,
          }
        : null,
    };
  });

