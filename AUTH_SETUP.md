# Kutuma - Task Marketplace App

## Authentication System

This app now supports **dual authentication methods**:
- **Email Authentication** - Sign in using email with verification code
- **Phone Authentication** - Sign in using phone number (+263 Zimbabwe) with SMS OTP

## User Flow

### 1. Login/Signup (`/login`)
- User selects authentication method (Email or Phone)
- Enters email address or phone number
- Receives 6-digit verification code
- Enters verification code

### 2. Profile Setup (`/profile-setup`)
- User enters their full name
- User selects account type:
  - **Runner** - Offers services and completes tasks for others
  - **Requester** - Posts tasks and finds people to help

### 3. Main App (`/(tabs)`)
- After completing profile setup, user is redirected to the main app

## Database Setup

### Option 1: Local PostgreSQL
```bash
# Install PostgreSQL
brew install postgresql  # macOS
# or
sudo apt-get install postgresql  # Ubuntu

# Create database
createdb kutuma

# Set DATABASE_URL
export DATABASE_URL="postgresql://localhost:5432/kutuma"

# Run migrations
bunx drizzle-kit generate
bunx drizzle-kit push
```

### Option 2: Supabase (Recommended)
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy the connection string from Settings > Database
4. Add to your environment:
```bash
export DATABASE_URL="postgresql://[user]:[password]@[host]/[database]"
```
5. Run migrations:
```bash
bunx drizzle-kit generate
bunx drizzle-kit push
```

### Option 3: Development Mode (No Database)
The app will work in development mode without a database:
- OTP codes will be logged to console
- Users will get temporary sessions
- Data won't persist between sessions

## Database Schema Updates

The schema has been updated to support both authentication methods:
- `users.email` - Email address (nullable)
- `users.phone` - Phone number (nullable)
- `users.emailVerified` - Email verification status
- `users.isRunner` - Account type (nullable until profile setup)
- `verifications.email` - Email for verification codes
- `verifications.phone` - Phone for OTP codes

## Key Features

✅ Dual authentication (Email + Phone)
✅ Profile completion flow
✅ Runner/Requester account type selection
✅ Zimbabwe phone number (+263) support
✅ Graceful fallback when database is unavailable
✅ Beautiful onboarding experience
✅ Type-safe with TypeScript

## Development

```bash
# Install dependencies
bun install

# Start the app
bun start

# Open in web browser
press 'w'

# Open on device
Scan QR code with Expo Go app
```

## Environment Variables

```bash
# Required for production
DATABASE_URL="postgresql://user:password@host:5432/database"

# Optional - email service (not yet implemented)
# EMAIL_API_KEY="your-email-service-key"
```

## Next Steps

- [ ] Set up email service (SendGrid, Mailgun, etc.)
- [ ] Set up SMS service (Twilio, etc.) for Zimbabwe numbers
- [ ] Add password-based authentication option
- [ ] Add social auth (Google, Facebook)
- [ ] Implement forgot password flow
