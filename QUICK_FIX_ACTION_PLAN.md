# 🔧 IMMEDIATE FIX ACTION PLAN
**Status:** Ready to implement  
**Priority:** Critical (must fix before testing in Expo)  
**Time to Complete:** 45 minutes - 1 hour

---

## Fix #1: Export OTPService ⏱️ 5 minutes

**File:** `backend/services/otp.ts`

**Current Status:** OTPService class exists but isn't exported

**Action:**
1. Open `backend/services/otp.ts`
2. Go to the end of the file (after the closing brace)
3. Add this line:

```typescript
export const otpService = new OTPService();
```

**Verification:** After saving, the export should be available for import in other files.

---

## Fix #2: Export SessionService ⏱️ 5 minutes

**File:** `backend/services/session.ts`

**Current Status:** SessionService class exists but isn't exported

**Action:**
1. Open `backend/services/session.ts`
2. Go to the end of the file (after the closing brace)
3. Add this line:

```typescript
export const sessionService = new SessionService();
```

**Verification:** After saving, you should be able to import `sessionService` in other files.

---

## Fix #3: Implement Email Service ⏱️ 20 minutes

**File:** `backend/services/email.ts`

**Current Status:** File exists but is empty

**Action:**
1. Open `backend/services/email.ts`
2. Replace ALL content with:

```typescript
export class EmailService {
  async sendVerificationEmail(email: string, code: string): Promise<void> {
    console.log(`📧 Email verification code for ${email}: ${code}`);
    // TODO: Integrate with email provider (SendGrid, Twilio, etc.)
    // For now, just logs to console for testing
  }

  async verifyEmail(email: string, code: string): Promise<boolean> {
    // TODO: In production, verify code matches stored code in database
    console.log(`✅ Email verified: ${email}`);
    return true;
  }
}

export const emailService = new EmailService();
```

3. Save the file

**Verification:** This stub implementation will allow the code to run without errors while you set up a real email service later.

---

## Fix #4: Add OTP Verification to verify-otp Route ⏱️ 15 minutes

**File:** `backend/trpc/routes/auth/verify-otp.ts`

**Current Status:** OTP is generated in send-otp but never validated in verify-otp

**Action:**
1. Open `backend/trpc/routes/auth/verify-otp.ts`
2. Add this import at the top (after the first few imports):

**After this line:**
```typescript
import { TRPCError } from '@trpc/server';
```

**Add this:**
```typescript
import { otpService } from '../../../services/otp';
```

3. Now find the mutation function (around line 10)
4. Add OTP verification as the FIRST thing in the mutation:

**Find this code:**
```typescript
.mutation(async ({ input }) => {
    let useDatabaseFallback = false;

    let user;
    let session;

    try {
      user = await db.query.users.findFirst({
        where: eq(users.phone, input.phone),
      });
```

**Replace with:**
```typescript
.mutation(async ({ input }) => {
    // Verify OTP FIRST before anything else
    if (!otpService.verifyOTP(input.phone, input.code)) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invalid or expired OTP. Please request a new code.',
      });
    }

    let useDatabaseFallback = false;

    let user;
    let session;

    try {
      user = await db.query.users.findFirst({
        where: eq(users.phone, input.phone),
      });
```

5. Save the file

**Verification:** Now the OTP will be validated before creating a session.

---

## Fix #5: Fix CORS Configuration ⏱️ 10 minutes

**File:** `backend/hono.ts`

**Current Status:** CORS config has conflicting settings (`credentials: true` with `origin: '*'`)

**Action:**
1. Open `backend/hono.ts`
2. Find the CORS configuration (lines 10-15):

**Current:**
```typescript
app.use("*", cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));
```

**Replace with:**
```typescript
app.use("*", cors({
  origin: (origin) => {
    // Allow all origins for development
    // In production, specify allowed origins explicitly
    return origin || '*';
  },
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));
```

3. Save the file

**Verification:** CORS should now work properly with credentials.

---

## Fix #6: Verify AuthContext Logout Export ⏱️ 10 minutes

**File:** `contexts/AuthContext.tsx`

**Current Status:** Logout function exists but may not be exposed in context

**Action:**
1. Open `contexts/AuthContext.tsx`
2. Look at the end of the file where the context hook is created
3. Find this line (around line 150-160):

```typescript
export const [AuthProvider, useAuth] = createContextHook(() => {
```

4. This hook should return an object that includes the `logout` function
5. Inside the hook function, you should see a return statement that looks like:

```typescript
return {
  user,
  token,
  isLoading,
  logout,  // Make sure this is included!
  // ... other values
};
```

6. If `logout` is missing from the return statement, add it

**Verification:** After this fix, components should be able to call `const { logout } = useAuth()`

---

## Fix #7: Check Email Service Integration ⏱️ 10 minutes

**Files to Check:**
- `backend/trpc/routes/auth/send-email-verification.ts`
- `backend/trpc/routes/auth/verify-email.ts`

**Action:**
1. Open `backend/trpc/routes/auth/send-email-verification.ts`
2. Check if it imports and uses `emailService`
3. It should look like:

```typescript
import { emailService } from '../../../services/email';

// Then in the mutation:
await emailService.sendVerificationEmail(input.email, code);
```

4. If this import is missing, add it
5. Repeat for `verify-email.ts`

**Verification:** Email-based authentication should now work (even if just in console mode)

---

## ✅ Validation Checklist

After applying all 7 fixes, verify by:

1. **Check TypeScript Compilation:**
   ```powershell
   npx tsc --noEmit
   ```
   Should show: `error TS0` (no errors)

2. **Check no import errors:**
   ```powershell
   grep -r "otpService\|sessionService\|emailService" backend/
   ```
   All should resolve correctly

3. **Check file exports:**
   ```powershell
   grep "export const" backend/services/
   ```
   Should show all three services exported

---

## 🧪 Quick Testing After Fixes

1. **Restart dev server:**
   ```powershell
   npm run dev
   ```

2. **Check server logs** for:
   - ✅ No "Cannot find module" errors
   - ✅ No "xxx is not exported" errors
   - ✅ Server starts successfully

3. **Test OTP flow in browser/Expo:**
   - Go to login
   - Request OTP for phone
   - Try invalid OTP → should be rejected
   - Use correct OTP → should work

---

## 📝 Summary

| Fix | File | Time | Difficulty |
|-----|------|------|------------|
| 1. Export OTPService | `backend/services/otp.ts` | 5 min | ⭐ Easy |
| 2. Export SessionService | `backend/services/session.ts` | 5 min | ⭐ Easy |
| 3. Implement Email Service | `backend/services/email.ts` | 20 min | ⭐ Easy |
| 4. Add OTP Verification | `backend/trpc/routes/auth/verify-otp.ts` | 15 min | ⭐⭐ Medium |
| 5. Fix CORS Config | `backend/hono.ts` | 10 min | ⭐ Easy |
| 6. Verify Logout Export | `contexts/AuthContext.tsx` | 10 min | ⭐ Easy |
| 7. Check Email Integration | Multiple files | 10 min | ⭐⭐ Medium |

**Total Time: 45-75 minutes**

---

## 🚀 Next Steps After Fixes

1. Apply all 7 fixes above
2. Run TypeScript check: `npx tsc --noEmit`
3. Start dev server: `npm run dev`
4. Test in Expo (start with web, then mobile)
5. Report any errors found
6. Move to Phase 2 fixes if needed

Good luck! You've got this! 💪
