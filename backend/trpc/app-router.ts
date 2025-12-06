import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { listTasksProcedure } from "./routes/tasks/list";
import { getTaskProcedure } from "./routes/tasks/get";
import { createTaskProcedure } from "./routes/tasks/create";
import { myTasksProcedure } from "./routes/tasks/my-tasks";
import { startTaskProcedure } from "./routes/tasks/start";
import { completeTaskProcedure } from "./routes/tasks/complete";
import { createBidProcedure } from "./routes/bids/create";
import { acceptBidProcedure } from "./routes/bids/accept";
import { listBidsProcedure } from "./routes/bids/list";
import { getProfileProcedure } from "./routes/profile/get";
import { updateProfileProcedure } from "./routes/profile/update";
import { createRatingProcedure } from "./routes/ratings/create";
import { listRatingsProcedure } from "./routes/ratings/list";
import { createPaymentProcedure } from "./routes/payments/create";
import { completePaymentProcedure } from "./routes/payments/complete";
import { getPaymentProcedure } from "./routes/payments/get";
import { sendOTPProcedure } from "./routes/auth/send-otp";
import { verifyOTPProcedure } from "./routes/auth/verify-otp";
import { getCurrentUserProcedure } from "./routes/auth/get-current-user";
import { logoutProcedure } from "./routes/auth/logout";
import { sendEmailVerificationProcedure } from "./routes/auth/send-email-verification";
import { verifyEmailProcedure } from "./routes/auth/verify-email";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  tasks: createTRPCRouter({
    list: listTasksProcedure,
    get: getTaskProcedure,
    create: createTaskProcedure,
    myTasks: myTasksProcedure,
    start: startTaskProcedure,
    complete: completeTaskProcedure,
  }),
  bids: createTRPCRouter({
    create: createBidProcedure,
    accept: acceptBidProcedure,
    list: listBidsProcedure,
  }),
  profile: createTRPCRouter({
    get: getProfileProcedure,
    update: updateProfileProcedure,
  }),
  ratings: createTRPCRouter({
    create: createRatingProcedure,
    list: listRatingsProcedure,
  }),
  payments: createTRPCRouter({
    create: createPaymentProcedure,
    complete: completePaymentProcedure,
    get: getPaymentProcedure,
  }),
  auth: createTRPCRouter({
    sendOTP: sendOTPProcedure,
    verifyOTP: verifyOTPProcedure,
    sendEmailVerification: sendEmailVerificationProcedure,
    verifyEmail: verifyEmailProcedure,
    getCurrentUser: getCurrentUserProcedure,
    logout: logoutProcedure,
  }),
});

export type AppRouter = typeof appRouter;
