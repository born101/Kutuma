# 🔧 Code Quality Improvements & Optimization Plan

## Overview
Your code is already in good shape (zero linting errors!). This document identifies potential improvements and optimizations to make it production-ready.

---

## 🎯 Priority 1: Critical Issues (Must Fix)

### 1. Rate Limiting on Auth Routes
**Severity:** HIGH  
**Why:** Without rate limiting, attackers can spam OTP requests  
**Impact:** Security vulnerability  
**Effort:** 1-2 hours

**Current Issue:**
```typescript
// backend/trpc/routes/auth/send-otp.ts
export const sendOtpRoute = publicProcedure
  .input(z.object({ phone: z.string() }))
  .mutation(async ({ input }) => {
    // No rate limiting!
    // Users can request unlimited OTPs
  });
```

**Solution:**
Create a rate limiting service:

```typescript
// backend/services/rate-limiter.ts
import { redis } from './redis'; // You'd need to add redis

export async function checkRateLimit(key: string, maxAttempts = 5, windowSeconds = 300) {
  const count = await redis.incr(key);
  
  if (count === 1) {
    await redis.expire(key, windowSeconds);
  }
  
  if (count > maxAttempts) {
    throw new Error(`Too many attempts. Please try again in ${windowSeconds} seconds.`);
  }
  
  return { remainingAttempts: maxAttempts - count };
}
```

**Apply to:** 
- `send-otp.ts` - Max 5 requests per 15 minutes
- `send-email-verification.ts` - Max 5 requests per 15 minutes
- `verify-otp.ts` - Max 10 attempts per 5 minutes

**For MVP:** Use in-memory rate limiting (simpler):

```typescript
// backend/services/simple-rate-limiter.ts
const attempts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, maxAttempts = 5, windowSeconds = 300): boolean {
  const now = Date.now();
  const record = attempts.get(key);

  if (!record || record.resetAt < now) {
    // New window
    attempts.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return true;
  }

  if (record.count >= maxAttempts) {
    return false;
  }

  record.count++;
  return true;
}
```

---

### 2. Input Validation Improvements
**Severity:** MEDIUM  
**Why:** Better validation prevents bugs and attacks  
**Impact:** Improved security & reliability  
**Effort:** 1-2 hours

**Current Issues:**
1. Phone number validation could be stricter
2. No length limits on text inputs
3. No budget validation (negative amounts?)

**Solutions:**

```typescript
// lib/validation.ts
import { z } from 'zod';

// Zimbabwe phone number format
export const zimbabwePhoneSchema = z.string()
  .refine((val) => {
    const cleaned = val.replace(/\D/g, '');
    return cleaned.length === 12 && (cleaned.startsWith('263') || cleaned.startsWith('27'));
  }, 'Invalid Zimbabwe phone number')
  .transform((val) => {
    let cleaned = val.replace(/\D/g, '');
    if (cleaned.startsWith('27')) {
      cleaned = '263' + cleaned.substring(2);
    }
    return '+' + cleaned;
  });

export const taskTitleSchema = z.string()
  .min(5, 'Title must be at least 5 characters')
  .max(100, 'Title must be less than 100 characters')
  .trim();

export const taskDescriptionSchema = z.string()
  .min(10, 'Description must be at least 10 characters')
  .max(1000, 'Description must be less than 1000 characters')
  .trim();

export const budgetSchema = z.number()
  .positive('Budget must be greater than 0')
  .max(10000, 'Budget cannot exceed ZWL 10,000')
  .multipleOf(0.01, 'Budget must have at most 2 decimal places');

export const emailSchema = z.string()
  .email('Invalid email address')
  .max(255, 'Email too long')
  .toLowerCase()
  .trim();
```

**Apply to:**
```typescript
// Update all tRPC route inputs to use these schemas
export const createTaskRoute = protectedProcedure
  .input(z.object({
    title: taskTitleSchema,
    description: taskDescriptionSchema,
    category: categorySchema,
    location: locationSchema,
    timeframe: timeframeSchema,
    bidType: bidTypeSchema,
    maxBudget: budgetSchema.optional(),
    fixedPrice: budgetSchema.optional(),
  }))
  .mutation(async ({ input }) => {
    // Safe validated input
  });
```

---

### 3. Database Query Optimization
**Severity:** MEDIUM  
**Why:** Prevent N+1 queries and improve performance  
**Impact:** Faster API responses  
**Effort:** 1-2 hours

**Current Pattern (Inefficient):**
```typescript
// backend/trpc/routes/tasks/list.ts
export const listTasksRoute = publicProcedure
  .query(async ({ ctx }) => {
    const tasks = await db.query.tasks.findMany({
      limit: 20,
    });
    
    // This causes N queries for bids!
    const tasksWithBids = await Promise.all(
      tasks.map(async (task) => ({
        ...task,
        bids: await db.query.bids.findMany({ 
          where: eq(bids.taskId, task.id) 
        }),
      }))
    );
    
    return tasksWithBids;
  });
```

**Optimized Pattern:**
```typescript
// Use Drizzle relations - single query!
export const listTasksRoute = publicProcedure
  .query(async ({ ctx }) => {
    const tasks = await db.query.tasks.findMany({
      with: {
        bids: {
          with: { runner: true },
        },
        creator: true,
      },
      limit: 20,
      orderBy: desc(tasks.createdAt),
    });
    
    return tasks; // All data in one query!
  });
```

**Locations to Review & Fix:**
- [ ] `backend/trpc/routes/tasks/list.ts`
- [ ] `backend/trpc/routes/tasks/get.ts`
- [ ] `backend/trpc/routes/profile/get.ts`
- [ ] `backend/trpc/routes/bids/list.ts`

---

### 4. Error Handling Consistency
**Severity:** MEDIUM  
**Why:** Different error formats confuse clients  
**Impact:** Better debugging & user experience  
**Effort:** 1-2 hours

**Current Issues:**
Some routes throw different error types. Need consistent error responses.

**Solution - Create error handler:**

```typescript
// backend/services/errors.ts
import { TRPCError } from '@trpc/server';

export class AppError extends TRPCError {
  constructor(code: string, message: string, cause?: unknown) {
    super({
      code: code as any,
      message,
      cause,
    });
  }
}

export const errors = {
  notFound: (resource: string) => 
    new AppError('NOT_FOUND', `${resource} not found`),
  
  unauthorized: (action?: string) => 
    new AppError('UNAUTHORIZED', `Unauthorized${action ? ': ' + action : ''}`),
  
  forbidden: (action?: string) => 
    new AppError('FORBIDDEN', `Forbidden${action ? ': ' + action : ''}`),
  
  conflict: (message: string) => 
    new AppError('CONFLICT', message),
  
  validation: (message: string) => 
    new AppError('BAD_REQUEST', message),
  
  internal: (message = 'Internal server error') => 
    new AppError('INTERNAL_SERVER_ERROR', message),
};

// Usage:
throw errors.notFound('Task');
throw errors.unauthorized('Cannot modify task');
throw errors.validation('Budget must be positive');
```

**Apply to all routes** - Ensure consistent error messages.

---

## 🎯 Priority 2: Important Improvements (Should Have)

### 5. TypeScript Strict Mode
**Severity:** MEDIUM  
**Why:** Catches potential bugs at compile time  
**Impact:** Better code safety  
**Effort:** 1-2 hours

**Check tsconfig.json:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

**Review flags:**
- [ ] All `any` types removed (already done ✅)
- [ ] All possible null values handled
- [ ] Function types strictly defined
- [ ] No implicit `any`

---

### 6. Environment Variable Validation
**Severity:** MEDIUM  
**Why:** Invalid config crashes in production  
**Impact:** Prevent deployment with bad config  
**Effort:** 30 minutes

**Create validation:**

```typescript
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url('Invalid DATABASE_URL'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  // Add other required env vars
});

export const env = envSchema.parse(process.env);

// Call at app startup
// This will crash immediately if config is invalid
```

---

### 7. Request Validation Middleware
**Severity:** MEDIUM  
**Why:** Catch invalid requests early  
**Impact:** Better error messages  
**Effort:** 1 hour

```typescript
// backend/middleware/validate.ts
export const validateInput = (schema: z.ZodSchema) => {
  return async (ctx: any, input: any) => {
    try {
      return await schema.parseAsync(input);
    } catch (error) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: error instanceof z.ZodError 
          ? error.errors.map(e => e.message).join(', ')
          : 'Invalid input',
      });
    }
  };
};
```

---

### 8. Logging & Monitoring
**Severity:** LOW  
**Why:** Can't debug production issues without logs  
**Impact:** Better debugging  
**Effort:** 1-2 hours

**Add structured logging:**

```typescript
// backend/services/logger.ts
const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data);
  },
  
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data);
  },
  
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
  },
  
  debug: (message: string, data?: any) => {
    if (process.env.DEBUG) {
      console.log(`[DEBUG] ${message}`, data);
    }
  },
};

// Usage in routes:
logger.info('Task created', { taskId, userId });
logger.error('Payment failed', { taskId, error: e.message });
```

---

## 🎯 Priority 3: Nice to Have (Polish)

### 9. API Response Standardization
**Effort:** 30 minutes

Ensure all API responses follow same format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
  requestId: string;
}
```

---

### 10. Caching Strategy
**Effort:** 1-2 hours

```typescript
// Cache frequent queries
export const getUserWithCaching = async (userId: string) => {
  const cacheKey = `user:${userId}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  
  cache.set(cacheKey, user, 300); // 5 minute cache
  return user;
};
```

---

### 11. Database Connection Pooling
**Effort:** 30 minutes  
**Status:** Already configured ✅

Your Transaction Pooler setup in `env` is correct:
```
postgresql://...@aws-1-eu-west-3.pooler.supabase.com:6543/postgres?sslmode=require
```

This already gives you:
✅ Connection pooling
✅ SSL encryption
✅ Production ready

---

## 🧪 Testing Improvements

### Unit Tests
**Effort:** 2-3 hours  
**Benefit:** Catch regressions early

```typescript
// backend/services/__tests__/rate-limiter.test.ts
describe('Rate Limiter', () => {
  it('should allow requests within limit', () => {
    expect(checkRateLimit('test-key')).toBe(true);
    expect(checkRateLimit('test-key')).toBe(true);
  });
  
  it('should reject requests exceeding limit', () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit('test-key-2');
    }
    expect(checkRateLimit('test-key-2')).toBe(false);
  });
});
```

### Integration Tests
**Effort:** 3-4 hours

```typescript
// __tests__/integration/tasks.test.ts
describe('Task API', () => {
  it('should create and list tasks', async () => {
    const task = await trpc.tasks.create.mutate({
      title: 'Test Task',
      // ...
    });
    
    const tasks = await trpc.tasks.list.query();
    expect(tasks).toContainEqual(task);
  });
});
```

---

## 🚀 Performance Optimizations

### Frontend
- [ ] Memoize expensive components with `React.memo`
- [ ] Use `useMemo` for derived state
- [ ] Lazy load images with `expo-image`
- [ ] Pagination for long lists

### Backend
- [ ] [ ] Database indexes on frequently queried fields
- [ ] [ ] Query result pagination
- [ ] [ ] Response compression (gzip)
- [ ] [ ] Redis caching for hot data

### Build
- [ ] [ ] Tree-shaking unused code
- [ ] [ ] Code splitting for faster initial load
- [ ] [ ] Asset optimization

---

## 📋 Implementation Priority

For **MVP Launch** (do ASAP):
1. ✅ Rate limiting (1-2 hours)
2. ✅ Input validation (1-2 hours)
3. ✅ Error consistency (1-2 hours)
4. ✅ Database optimization (1-2 hours)
**Total: 4-8 hours**

For **Beta Release** (Week 2):
5. Environment validation (30 min)
6. Logging (1-2 hours)
7. Response standardization (30 min)
**Total: 2-3 hours**

For **Full Release** (Week 3+):
8. Unit tests (2-3 hours)
9. Integration tests (3-4 hours)
10. Performance optimization (varies)
**Total: 5-10 hours**

---

## Quick Checklist

### Before MVP Launch
- [ ] Rate limiting on auth routes
- [ ] Input validation on all routes
- [ ] Error handling consistency
- [ ] Database query optimization
- [ ] No `console.log` statements in production code
- [ ] All `any` types removed
- [ ] HTTPS enforced (`sslmode=require`)
- [ ] Secrets not in code (using env)
- [ ] Database backups enabled
- [ ] Error tracking set up

### Before Public Launch
- [ ] Unit tests for critical functions
- [ ] Integration tests for main flows
- [ ] Load testing
- [ ] Security audit
- [ ] Performance benchmarks
- [ ] User documentation
- [ ] Monitoring & logging

---

## Code Quality Tools

Add to your workflow:

```bash
# Linting (already set up ✅)
npm run lint

# Type checking
bunx tsc --noEmit

# Format code
bunx prettier --write .

# Check for vulnerabilities
bun audit

# Bundle analysis
bunx source-map-explorer dist
```

---

Your app already has **excellent code quality**. Focus on the Priority 1 items before launch, then iterate on the rest based on user feedback!
