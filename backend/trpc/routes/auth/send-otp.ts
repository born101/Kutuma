import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { otpService } from '../../../services/otp';
import { db } from '../../../db/index';
import { verifications } from '../../../db/schema';

export const sendOTPProcedure = publicProcedure
  .input(
    z.object({
      phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const { code, expiresAt } = await otpService.sendOTP(input.phone);

      try {
        await db.insert(verifications).values({
          phone: input.phone,
          code,
          expiresAt,
          verified: false,
        });
        console.log(`✅ OTP sent to ${input.phone} and saved to database`);
      } catch {
        console.log(`⚠️  OTP sent to ${input.phone} (in-memory only, database not available)`);
      }

      return {
        success: true,
        message: 'OTP sent successfully',
      };
    } catch (error) {
      console.error('❌ Send OTP error:', error);
      throw new Error('Failed to send OTP. Please try again.');
    }
  });
