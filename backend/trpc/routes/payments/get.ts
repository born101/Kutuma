import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { db } from '../../../db/index';
import { payments } from '../../../db/schema';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';

export const getPaymentProcedure = publicProcedure
  .input(
    z.object({
      taskId: z.string(),
    })
  )
  .query(async ({ input }) => {
    const payment = await db.query.payments.findFirst({
      where: eq(payments.taskId, input.taskId),
      with: {
        payer: {
          columns: {
            id: true,
            name: true,
          },
        },
        recipient: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!payment) {
      return null;
    }

    return {
      ...payment,
      amount: parseFloat(payment.amount),
    };
  });

