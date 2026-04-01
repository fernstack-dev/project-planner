import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  primaryKey,
} from 'drizzle-orm/pg-core';


export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  name: text('name'),
  password: text('password'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});


export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category'),
  ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'cascade' }),
  status: text('status').default('active'),
  color: text('color'),
  pinned: boolean('pinned').default(false),
  settings: jsonb('settings'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});


export const projectEditors = pgTable(
  'project_editors',
  {
    projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    role: text('role').default('editor'),
    joinedAt: timestamp('joined_at').defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.projectId, table.userId] }),
  })
);


export const kanbanBoards = pgTable('kanban_boards', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  position: integer('position'),
  createdAt: timestamp('created_at').defaultNow(),
});


export const kanbanColumns = pgTable('kanban_columns', {
  id: uuid('id').primaryKey().defaultRandom(),
  boardId: uuid('board_id').references(() => kanbanBoards.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  color: text('color'),
  position: integer('position'),
});

// Kanban cards
export const kanbanCards = pgTable('kanban_cards', {
  id: uuid('id').primaryKey().defaultRandom(),
  columnId: uuid('column_id').references(() => kanbanColumns.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  priority: text('priority').default('none'),
  dueDate: timestamp('due_date'),
  labels: jsonb('labels').default([]),
  checklist: jsonb('checklist').default([]),
  assignee: text('assignee'),
  description: text('description'),
  position: integer('position'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});