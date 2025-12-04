import { nanoid } from 'nanoid';
import { db } from '../db/index';
import { sessions } from '../db/schema';
import { eq, and, gt } from 'drizzle-orm';

export class SessionService {
  generateToken(): string {
    return `token_${Date.now()}_${nanoid(10)}`;
  }

  generateSessionExpiry(): Date {
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  async createSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
    const token = this.generateToken();
    const expiresAt = this.generateSessionExpiry();

    await db.insert(sessions).values({
      userId,
      token,
      expiresAt,
    });

    return { token, expiresAt };
  }

  async validateSession(token: string) {
    try {
      const session = await db.query.sessions.findFirst({
        where: and(
          eq(sessions.token, token),
          gt(sessions.expiresAt, new Date())
        ),
        with: {
          user: true,
        },
      });

      return session || null;
    } catch (error) {
      console.error('Session validation error:', error);
      return null;
    }
  }

  async deleteSession(token: string) {
    try {
      await db.delete(sessions).where(eq(sessions.token, token));
      return true;
    } catch (error) {
      console.error('Session deletion error:', error);
      return false;
    }
  }
}

export const sessionService = new SessionService();
