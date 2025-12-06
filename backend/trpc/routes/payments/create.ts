import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { db } from '../../../db/index';
import { payments, tasks } from '../../../db/schema';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';

export const createPaymentProcedure = publicProcedure
  .input(
    z.object({
      taskId: z.string(),
      amount: z.number().positive(),
      method: z.enum(['ecocash', 'onemoney', 'bank', 'cash']),
      transactionId: z.string().optional(),
      payerId: z.string(),
      recipientId: z.string(),
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

    // Verify payment amount matches task price
    const taskAmount = task.bidType === 'max' 
      ? (task.maxBudget ? parseFloat(task.maxBudget) : 0)
      : (task.fixedPrice ? parseFloat(task.fixedPrice) : 0);

    if (Math.abs(input.amount - taskAmount) > 0.01) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Payment amount must match task amount of ${taskAmount}`,
      });
    }

    // Check if payment already exists
    const existingPayment = await db.query.payments.findFirst({
      where: eq(payments.taskId, input.taskId),
    });

    if (existingPayment && existingPayment.status === 'completed') {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Payment already completed for this task',
      });
    }

    // Create or update payment
    let payment;
    if (existingPayment) {
      const [updated] = await db
        .update(payments)
        .set({
          amount: input.amount.toString(),
          method: input.method,
          transactionId: input.transactionId || null,
          status: 'pending',
          updatedAt: new Date(),
        })
        .where(eq(payments.id, existingPayment.id))
        .returning();
      payment = updated;
    } else {
      const [newPayment] = await db
        .insert(payments)
        .values({
          taskId: input.taskId,
          amount: input.amount.toString(),
          method: input.method,
          transactionId: input.transactionId || null,
          payerId: input.payerId,
          recipientId: input.recipientId,
        })
        .returning();
      payment = newPayment;
    }

    console.log('✅ Payment created:', payment.id);

    return {
      ...payment,
      amount: parseFloat(payment.amount),
      success: true,
    };
  });

