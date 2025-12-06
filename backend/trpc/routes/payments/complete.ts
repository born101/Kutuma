import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { db } from '../../../db/index';
import { payments, tasks } from '../../../db/schema';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';

export const completePaymentProcedure = publicProcedure
  .input(
    z.object({
      paymentId: z.string(),
      userId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const payment = await db.query.payments.findFirst({
      where: eq(payments.id, input.paymentId),
      with: {
        task: true,
      },
    });

    if (!payment) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Payment not found',
      });
    }

    // Only recipient can mark payment as completed
    if (payment.recipientId !== input.userId) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Only the recipient can confirm payment',
      });
    }

    if (payment.status === 'completed') {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Payment already completed',
      });
    }

    // Update payment status
    await db
      .update(payments)
      .set({
        status: 'completed',
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(payments.id, input.paymentId));

    console.log('✅ Payment completed:', input.paymentId);

    const updatedPayment = await db.query.payments.findFirst({
      where: eq(payments.id, input.paymentId),
    });

    return {
      ...updatedPayment,
      amount: updatedPayment ? parseFloat(updatedPayment.amount) : 0,
      success: true,
    };
  });

