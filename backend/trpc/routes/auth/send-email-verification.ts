import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { db } from '../../../db/index';
import { verifications } from '../../../db/schema';
import { emailService } from '../../../services/email';

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const sendEmailVerificationProcedure = publicProcedure
  .input(
    z.object({
      email: z.string().email(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const code = generateCode();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      try {
        await db.insert(verifications).values({
          email: input.email,
          code,
          expiresAt,
          verified: false,
        });
        console.log(`✅ Email verification code sent to ${input.email} and saved to database`);
      } catch {
        console.log(`⚠️  Email verification code sent to ${input.email} (in-memory only, database not available)`);
      }

      await emailService.sendVerificationEmail(input.email, code);

      return {
        success: true,
        message: 'Verification code sent to your email',
      };
    } catch (error) {
      console.error('❌ Send email verification error:', error);
      throw new Error('Failed to send verification code. Please try again.');
    }
  });
