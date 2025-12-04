import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { db } from '../../../db/index';
import { users } from '../../../db/schema';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';

export const updateProfileProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
      name: z.string().optional(),
      phone: z.string().optional(),
      isRunner: z.boolean().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const user = await db.query.users.findFirst({
      where: eq(users.id, input.userId),
    });

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    const updates: Record<string, any> = { updatedAt: new Date() };
    
    if (input.name !== undefined) updates.name = input.name;
    if (input.phone !== undefined) updates.phone = input.phone;
    if (input.isRunner !== undefined) updates.isRunner = input.isRunner;

    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, input.userId))
      .returning();

    console.log('✅ Profile updated:', input.userId);

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      phone: updatedUser.phone,
      isRunner: updatedUser.isRunner,
      verified: updatedUser.verified,
      rating: parseFloat(updatedUser.rating),
      completedTasks: updatedUser.completedTasks,
    };
  });
