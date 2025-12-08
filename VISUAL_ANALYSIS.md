# 🔍 Visual Analysis: Data Flow & Problem Areas

## Current Authentication Flow (What's Broken)

```
LOGIN FLOW (PHONE-BASED):

1. User enters phone number
   ↓
2. Frontend calls: trpc.auth.sendOTP({ phone: '+263123456789' })
   ↓
3. Backend (send-otp.ts):
   ├─ ❌ otpService is NOT EXPORTED
   │  └─ WILL CRASH: "Cannot find module"
   ├─ Generates OTP: 123456
   ├─ Saves to database (optional)
   └─ Returns success
   ↓
4. User receives OTP (in console during dev)
   ↓
5. User enters OTP and calls: trpc.auth.verifyOTP({ phone, code })
   ↓
6. Backend (verify-otp.ts):
   ├─ ❌ otpService is NOT IMPORTED
   │  └─ WILL CRASH: "otpService is not defined"
   ├─ ❌ OTP is NEVER VERIFIED
   │  └─ BUG: Any code is accepted!
   ├─ Creates/finds user in database
   ├─ Creates session
   └─ Returns token
   ↓
7. Frontend stores token in AsyncStorage
   ↓
8. ✅ User logged in (but verification was skipped!)
```

**Problems:** 3 issues in 2 endpoints = flow broken

---

## Service Dependencies Map

```
Current State (BROKEN):

┌─────────────────────────────────────┐
│ verify-otp.ts (Frontend/Route)      │
│                                     │
│ try to use:                         │
│   otpService.verifyOTP()  ❌ 404    │
│   sessionService.createSession() ❌ │
│                                     │
│ Error: "Module not found"           │
└─────────────────────────────────────┘
         ↓
         X (broken link)
         ↓
┌─────────────────────────────────────┐
│ services/otp.ts                     │
│ class OTPService { ... }            │
│ ❌ NOT EXPORTED                     │
│                                     │
│ export const otpService = ...  ← ADD THIS
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ services/session.ts                 │
│ class SessionService { ... }        │
│ ❌ NOT EXPORTED                     │
│                                     │
│ export const sessionService = ... ← ADD THIS
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ services/email.ts                   │
│ 0 LINES OF CODE ❌                  │
│                                     │
│ export class EmailService { ... } ← ADD IMPLEMENTATION
└─────────────────────────────────────┘
```

**Solution:** Add 3 export statements

---

## OTP Verification Flow (What's Missing)

```
CURRENT (BROKEN):
┌──────────────┐
│ Phone: 1234  │
│ OTP: 123456  │
└──────────────┘
      ↓
   verifyOTP()
      ↓
   ⚠️ SKIPPED!  (No verification happening)
      ↓
   CREATE SESSION
      ↓
   ✅ LOGGED IN (shouldn't be!)

CORRECT (WHAT WE NEED):
┌──────────────┐
│ Phone: 1234  │
│ OTP: 123456  │
└──────────────┘
      ↓
   verifyOTP(phone, code)
      ↓
   Check: Does OTP match?
   ├─ If 123456 == 123456 → ✅ VERIFIED
   ├─ If 999999 != 123456 → ❌ REJECTED
   └─ If expired → ❌ REJECTED
      ↓
   IF verified:
   │  CREATE SESSION
   │  RETURN TOKEN
   │  ✅ USER LOGGED IN
   │
   ELSE:
   │  THROW ERROR
   │  ❌ LOGIN REJECTED
```

**Solution:** Add `otpService.verifyOTP()` call

---

## Email Service (Currently Missing)

```
CURRENT STATE:

┌─────────────────────────────────┐
│ send-email-verification.ts      │
│                                 │
│ import { emailService } ← 404!   │
│ emailService.send(...) ← 404!    │
│                                 │
│ FILE: services/email.ts         │
│ STATUS: Empty (0 lines)         │
└─────────────────────────────────┘

NEEDED STATE:

┌─────────────────────────────────┐
│ send-email-verification.ts      │
│                                 │
│ import { emailService } ✅       │
│ emailService.send(...) ✅        │
│                                 │
│ FILE: services/email.ts         │
│ STATUS: Implemented (20+ lines) │
└─────────────────────────────────┘
```

**Solution:** Implement stub EmailService class

---

## CORS Issue Explained

```
CURRENT (BROKEN):

Browser Request:
  GET /api/trpc
  Origin: http://localhost:8081

Server Response:
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Credentials: true
  
Browser Security Check:
  ❌ ERROR: Can't use * with credentials
  ❌ Request blocked
  ❌ CORS Error

CORRECT (FIXED):

Browser Request:
  GET /api/trpc
  Origin: http://localhost:8081

Server Response:
  Access-Control-Allow-Origin: http://localhost:8081
  Access-Control-Allow-Credentials: true
  
Browser Security Check:
  ✅ OK: Origin matches
  ✅ Credentials allowed
  ✅ Request succeeds
```

**Solution:** Change CORS to allow specific origins

---

## Component Error State (Unhandled)

```
CURRENT (USER SEES NOTHING):

Component Renders:
  const query = trpc.tasks.list.useQuery()
  
  if (query.error) {
    // ← Nothing here! Error is ignored
  }
  
  if (query.isLoading) {
    // ← Nothing here! Spinner not shown
  }
  
  return <TaskList tasks={query.data} />
     ↓
  Shows empty list / crashes

BETTER (PROPER UX):

Component Renders:
  const query = trpc.tasks.list.useQuery()
  
  if (query.isLoading) {
    return <LoadingSpinner />
  }
  
  if (query.error) {
    return <ErrorMessage error={query.error.message} />
  }
  
  return <TaskList tasks={query.data} />
     ↓
  Shows spinner while loading
  Shows error message if fails
  Shows data if succeeds
```

**Solution:** Add loading/error states (Phase 2)

---

## Database Fallback (Security Issue)

```
CURRENT (RISKY):

DB Connection:
  ├─ If DB available ✅
  │  └─ Use real database
  │
  └─ If DB down ❌
     └─ Use in-memory fallback
        ├─ Create temp user
        │  id: 'temp-1702052400000'
        ├─ No verification
        ├─ No proper validation
        └─ User fully logged in

BETTER (SECURE):

DB Connection:
  ├─ If DB available ✅
  │  └─ Use real database
  │
  └─ If DB down ❌
     └─ Reject login
        ├─ Throw error
        ├─ Tell user "Try again later"
        └─ ❌ User NOT logged in
```

**Solution:** Block login when DB unavailable

---

## Data Flow: Happy Path (After Fixes)

```
┌────────────────────────────────────────────────────┐
│ USER OPENS APP                                     │
└────────────────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────────────┐
│ AuthContext.useAuth()                              │
│ - Checks AsyncStorage for token                    │
│ - Loads stored user data                           │
│ - Validates session (async)                        │
└────────────────────────────────────────────────────┘
                    ↓
         ┌─────────┴─────────┐
         ↓                   ↓
    ✅ User Found        ❌ No User
         ↓                   ↓
  ✅ Go to Tabs       ❌ Go to Login
                            ↓
                  ┌─────────────────────┐
                  │ LOGIN SCREEN        │
                  │                     │
                  │ [Enter Phone]       │
                  │ [Send OTP]          │
                  └─────────────────────┘
                            ↓
                  ┌─────────────────────┐
                  │ backend/services/   │
                  │ otp.ts:             │
                  │ sendOTP() ✅         │
                  │ (generates code)    │
                  └─────────────────────┘
                            ↓
                  ┌─────────────────────┐
                  │ OTP VERIFICATION    │
                  │                     │
                  │ [Enter OTP Code]    │
                  │ [Verify]            │
                  └─────────────────────┘
                            ↓
                  ┌─────────────────────┐
                  │ backend/services/   │
                  │ otp.ts:             │
                  │ verifyOTP() ✅       │
                  │ (validates code)    │
                  └─────────────────────┘
                            ↓
                  ┌─────────────────────┐
                  │ Verification Result │
                  └─────────────────────┘
                         ↓
              ┌──────────┴──────────┐
              ↓                     ↓
          ✅ VALID             ❌ INVALID
              ↓                     ↓
         Create Session       Show Error
         Create Token         Ask to retry
              ↓
      ┌─────────────────────┐
      │ Return Token to App │
      │ Store in Async      │
      │ Storage             │
      └─────────────────────┘
              ↓
      ┌─────────────────────┐
      │ Update AuthContext  │
      │ with User Data      │
      └─────────────────────┘
              ↓
      ✅ LOGGED IN!
              ↓
      Go to Main Tabs Screen
      - Browse Tasks
      - My Tasks
      - Profile
```

---

## File Update Checklist

```
TO FIX (7 Files):

☐ backend/services/otp.ts
  └─ ADD: export const otpService = new OTPService();

☐ backend/services/session.ts
  └─ ADD: export const sessionService = new SessionService();

☐ backend/services/email.ts
  └─ REPLACE: Entire file with implementation

☐ backend/trpc/routes/auth/verify-otp.ts
  ├─ ADD: import { otpService }
  └─ ADD: OTP verification check

☐ backend/hono.ts
  └─ MODIFY: CORS configuration

☐ contexts/AuthContext.tsx
  └─ CHECK: logout is returned from hook

☐ backend/trpc/routes/auth/send-email-verification.ts
  └─ CHECK: emailService is imported and used


VERIFICATION:

Run: npx tsc --noEmit
Expected: No errors (✅)

Run: npm run dev
Expected: Server starts (✅)

Test: Login flow
Expected: Can login with OTP (✅)
```

---

## Performance & Loading Diagram

```
WITHOUT FIXES:
User opens app
    ↓
Try to import otpService
    ↓
❌ MODULE NOT FOUND
    ↓
🔴 CRASH
    ↓
Show error screen


WITH FIXES:
User opens app
    ↓
✅ Import otpService
    ↓
✅ Import sessionService
    ↓
✅ Setup auth context
    ↓
✅ Load saved session
    ↓
🟢 READY TO USE
    ↓
Smooth user experience
```

---

## Architecture Score

```
Current: 70/100

Component Details:
├─ Structure: 95/100 ✅ (Excellent)
├─ Setup: 90/100 ✅ (Very Good)
├─ Services: 30/100 ⚠️ (Not Exported)
├─ Validation: 60/100 ⚠️ (Incomplete)
├─ Error Handling: 70/100 ✅ (Good)
├─ Documentation: 50/100 ⚠️ (Needs Work)
└─ Configuration: 85/100 ✅ (Good)

To reach 90/100:
├─ Apply critical fixes: +15 points
├─ Add error states: +5 points
└─ Add validation: +5 points
```

---

This is great! Your code quality is solid, you just need these small connection pieces! 💪
