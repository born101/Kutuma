import { pgTable, text, timestamp, boolean, integer, decimal, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name'),
  email: text('email').unique(),
  phone: text('phone').unique(),
  isRunner: boolean('is_runner'),
  verified: boolean('verified').notNull().default(false),
  emailVerified: boolean('email_verified').notNull().default(false),
  rating: decimal('rating', { precision: 3, scale: 2 }).notNull().default('0'),
  completedTasks: integer('completed_tasks').notNull().default(0),
  profilePhoto: text('profile_photo'),
  preferredZones: text('preferred_zones').array(),
  bio: text('bio'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const verifications = pgTable('verifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  phone: text('phone'),
  email: text('email'),
  code: text('code').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  verified: boolean('verified').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  location: text('location').notNull(),
  timeframe: text('timeframe').notNull(),
  status: text('status').notNull().default('open'),
  bidType: text('bid_type').notNull(),
  maxBudget: decimal('max_budget', { precision: 10, scale: 2 }),
  fixedPrice: decimal('fixed_price', { precision: 10, scale: 2 }),
  createdBy: uuid('created_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  assignedRunnerId: uuid('assigned_runner_id').references(() => users.id, { onDelete: 'set null' }),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const bids = pgTable('bids', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  runnerId: uuid('runner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  message: text('message'),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  createdTasks: many(tasks, { relationName: 'createdTasks' }),
  assignedTasks: many(tasks, { relationName: 'assignedTasks' }),
  bids: many(bids),
  sessions: many(sessions),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  creator: one(users, {
    fields: [tasks.createdBy],
    references: [users.id],
    relationName: 'createdTasks',
  }),
  assignedRunner: one(users, {
    fields: [tasks.assignedRunnerId],
    references: [users.id],
    relationName: 'assignedTasks',
  }),
  bids: many(bids),
}));

export const bidsRelations = relations(bids, ({ one }) => ({
  task: one(tasks, {
    fields: [bids.taskId],
    references: [tasks.id],
  }),
  runner: one(users, {
    fields: [bids.runnerId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Verification = typeof verifications.$inferSelect;
export type NewVerification = typeof verifications.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Bid = typeof bids.$inferSelect;
export type NewBid = typeof bids.$inferInsert;
