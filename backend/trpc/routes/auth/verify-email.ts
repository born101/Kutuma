import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { TRPCError } from '@trpc/server';
import { db } from '../../../db/index';
import { users, sessions } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { sessionService } from '../../../services/session';

export const verifyEmailProcedure = publicProcedure
  .input(
    z.object({
      email: z.string().email(),
      code: z.string().length(6),
      name: z.string().min(2).optional(),
      isRunner: z.boolean().optional(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      if (!input.name || input.isRunner === undefined) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Name and account type are required for new users',
        });
      }

      console.log(`✅ Email verification disabled - creating account for ${input.email}`);
      
      let existingUser;
      try {
        existingUser = await db.query.users.findFirst({
          where: eq(users.email, input.email),
        });
      } catch (dbError) {
        console.error('❌ Database query error:', dbError);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database connection error. Please try again.',
        });
      }

      let user;
      if (!existingUser) {
        try {
          const [newUser] = await db
            .insert(users)
            .values({
              name: input.name,
              email: input.email,
              isRunner: input.isRunner,
              verified: true,
              emailVerified: true,
            })
            .returning();

          user = newUser;
          console.log(`✅ New user created: ${user.id}`);
        } catch (insertError) {
          console.error('❌ User insert error:', insertError);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create user account. Please try again.',
          });
        }
      } else {
        user = existingUser;
        console.log(`✅ Existing user found: ${user.id}`);
      }

      const token = sessionService.generateToken();
      const expiresAt = sessionService.generateSessionExpiry();

      try {
        const [newSession] = await db
          .insert(sessions)
          .values({
            userId: user.id,
            token,
            expiresAt,
          })
          .returning();

        console.log(`✅ Session created for user ${user.id}`);

        return {
          user: {
            id: user.id,
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            isRunner: user.isRunner ?? false,
            verified: user.verified,
            emailVerified: user.emailVerified ?? false,
            rating: typeof user.rating === 'string' ? parseFloat(user.rating) : (user.rating ? Number(user.rating) : 0),
            completedTasks: user.completedTasks,
          },
          token: newSession.token,
          expiresAt: newSession.expiresAt,
        };
      } catch (sessionError) {
        console.error('❌ Session creation error:', sessionError);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create session. Please try again.',
        });
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('❌ Unexpected error in verifyEmail:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred. Please try again.',
      });
    }
  });
