import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { db } from '../../../db/index';
import { tasks } from '../../../db/schema';

export const createTaskProcedure = publicProcedure
  .input(
    z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      category: z.enum(['groceries', 'queue', 'delivery', 'research', 'pickup', 'other']),
      location: z.string().min(1),
      timeframe: z.string().min(1),
      bidType: z.enum(['max', 'fixed']),
      maxBudget: z.number().optional(),
      fixedPrice: z.number().optional(),
      createdBy: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const [newTask] = await db
      .insert(tasks)
      .values({
        title: input.title,
        description: input.description,
        category: input.category,
        location: input.location,
        timeframe: input.timeframe,
        bidType: input.bidType,
        maxBudget: input.maxBudget?.toString(),
        fixedPrice: input.fixedPrice?.toString(),
        createdBy: input.createdBy,
      })
      .returning();

    console.log('✅ Task created:', newTask.id);

    return {
      ...newTask,
      maxBudget: newTask.maxBudget ? parseFloat(newTask.maxBudget) : undefined,
      fixedPrice: newTask.fixedPrice ? parseFloat(newTask.fixedPrice) : undefined,
      bids: [],
    };
  });
