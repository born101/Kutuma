import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { db } from '../../../db/index';
import { sessions } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export const logoutProcedure = publicProcedure
  .input(
    z.object({
      token: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      await db.delete(sessions).where(eq(sessions.token, input.token));
      console.log(`✅ Session deleted successfully for token: ${input.token.substring(0, 10)}...`);
      return {
        success: true,
      };
    } catch (error) {
      console.error('❌ Database error during logout:', error);
      console.log('⚠️  Session cleared client-side only');
      return {
        success: true,
      };
    }
  });
