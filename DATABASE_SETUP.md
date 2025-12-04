# Database & Auth Setup Progress

## ✅ Completed

### 1. Database Foundation
- ✅ Installed Drizzle ORM, PostgreSQL, and dependencies
- ✅ Created database schema with proper tables:
  - `users` - User profiles with phone, ratings, verification status
  - `sessions` - Session management with tokens and expiry
  - `verifications` - OTP verification records
  - `tasks` - Task listings with bidding system
  - `bids` - Bid submissions from runners
- ✅ Set up Drizzle config for migrations
- ✅ Created seed script with mock data

### 2. Phone Verification Auth System
- ✅ Built OTP service (generates 6-digit codes)
- ✅ Session service (generates secure tokens)
- ✅ Auth tRPC routes:
  - `auth.sendOTP` - Send verification code to phone
  - `auth.verifyOTP` - Verify code & create/login user
  - `auth.getCurrentUser` - Get user from session token
  - `auth.logout` - Invalidate session

### 3. Backend Routes (All Updated to Use Drizzle)
- ✅ Task routes (list, get, create, myTasks)
- ✅ Bid routes (create, accept, list)
- ✅ Profile routes (get, update)

### 4. Auth Context
- ✅ Updated to integrate with backend auth
- ✅ Session persistence with AsyncStorage
- ✅ Token-based authentication

## 🚧 Next Steps

### 1. Database Setup Instructions
You need to:
1. **Set up PostgreSQL database**:
   - Install PostgreSQL locally or use a service like Supabase/Neon
   - Create a database named `tuma`
   - Set `DATABASE_URL` environment variable

2. **Run migrations**:
   ```bash
   bunx drizzle-kit generate
   bunx drizzle-kit push
   ```

3. **Seed the database**:
   ```bash
   bun backend/db/seed.ts
   ```

### 2. Environment Variables
Create a `.env` file:
```
DATABASE_URL=postgresql://username:password@localhost:5432/tuma
NODE_ENV=development
```

### 3. Login/Signup Screen
Need to create `app/login.tsx` with:
- Phone number input
- OTP verification flow
- Name input for new users
- Integration with AuthContext

### 4. Protected Routes
- Update tRPC context to include user from session token
- Create `protectedProcedure` for authenticated routes
- Update existing routes to use `protectedProcedure` where needed

### 5. Navigation Guards
- Redirect to login if not authenticated
- Skip onboarding if already logged in

## 📝 How Authentication Works

1. **User enters phone number** → `auth.sendOTP` → Receives 6-digit code
2. **User enters OTP** → `auth.verifyOTP` → Returns user data + session token
3. **Token stored** in AsyncStorage
4. **All requests** can use token to authenticate
5. **Token validated** on server for protected routes

## 🔒 Security Notes

- OTPs expire after 10 minutes
- Sessions expire after 30 days  
- In production, integrate real SMS provider (Africa's Talking recommended for Zimbabwe)
- Currently logs OTP to console in development mode

## 📱 For Production SMS

Update `backend/services/otp.ts` sendSMS method to integrate with:
- Africa's Talking API
- Twilio
- or other SMS provider

Example for Africa's Talking:
```typescript
private async sendSMS(phone: string, code: string): Promise<void> {
  const response = await fetch('https://api.africastalking.com/version1/messaging', {
    method: 'POST',
    headers: {
      'apiKey': process.env.AFRICAS_TALKING_API_KEY,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      username: process.env.AFRICAS_TALKING_USERNAME,
      to: phone,
      message: `Your Tuma verification code is ${code}`,
    }),
  });
}
```
