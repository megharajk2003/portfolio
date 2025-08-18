import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, decimal, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  role: text("role"),
  email: text("email"),
  phone: text("phone"),
  location: text("location"),
  photoUrl: text("photo_url"),
  summary: text("summary"),
  portfolioTheme: text("portfolio_theme").default("modern"),
  isPublic: boolean("is_public").default(false),
});

export const workExperience = pgTable("work_experience", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  company: text("company").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  description: text("description"),
  isVisible: boolean("is_visible").default(true),
});

export const education = pgTable("education", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  institution: text("institution").notNull(),
  degree: text("degree").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  isVisible: boolean("is_visible").default(true),
});

export const skills = pgTable("skills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  level: integer("level").notNull().default(1), // 1-100
  category: text("category").default("technical"),
  isVisible: boolean("is_visible").default(true),
});

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  technologies: text("technologies").array(),
  link: text("link"),
  githubLink: text("github_link"),
  isVisible: boolean("is_visible").default(true),
});

export const certifications = pgTable("certifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  issuer: text("issuer").notNull(),
  date: text("date").notNull(),
  link: text("link"),
  isVisible: boolean("is_visible").default(true),
});

export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  year: text("year"),
  isVisible: boolean("is_visible").default(true),
});

export const learningModules = pgTable("learning_modules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  xpReward: integer("xp_reward").default(100),
  lessons: jsonb("lessons"), // Array of lesson objects
  isActive: boolean("is_active").default(true),
});

export const userProgress = pgTable("user_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  moduleId: varchar("module_id").notNull().references(() => learningModules.id, { onDelete: "cascade" }),
  currentLesson: integer("current_lesson").default(0),
  isCompleted: boolean("is_completed").default(false),
  xpEarned: integer("xp_earned").default(0),
  completedAt: timestamp("completed_at"),
});

export const userStats = pgTable("user_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  totalXp: integer("total_xp").default(0),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastActivityDate: timestamp("last_activity_date"),
  portfolioViews: integer("portfolio_views").default(0),
});

export const dailyActivity = pgTable("daily_activity", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // YYYY-MM-DD format
  xpEarned: integer("xp_earned").default(0),
  lessonsCompleted: integer("lessons_completed").default(0),
});

export const sectionSettings = pgTable("section_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sectionName: text("section_name").notNull(),
  isVisible: boolean("is_visible").default(true),
  sortOrder: integer("sort_order").default(0),
});

// Insert schemas for Replit Auth
export const upsertUserSchema = createInsertSchema(users).omit({ createdAt: true, updatedAt: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProfileSchema = createInsertSchema(profiles).omit({ id: true });
export const insertWorkExperienceSchema = createInsertSchema(workExperience).omit({ id: true });
export const insertEducationSchema = createInsertSchema(education).omit({ id: true });
export const insertSkillSchema = createInsertSchema(skills).omit({ id: true });
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true });
export const insertCertificationSchema = createInsertSchema(certifications).omit({ id: true });
export const insertAchievementSchema = createInsertSchema(achievements).omit({ id: true });
export const insertUserProgressSchema = createInsertSchema(userProgress).omit({ id: true, completedAt: true });
export const insertDailyActivitySchema = createInsertSchema(dailyActivity).omit({ id: true });
export const insertSectionSettingsSchema = createInsertSchema(sectionSettings).omit({ id: true });

// Types for Replit Auth
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;
export type InsertWorkExperience = z.infer<typeof insertWorkExperienceSchema>;
export type WorkExperience = typeof workExperience.$inferSelect;
export type InsertEducation = z.infer<typeof insertEducationSchema>;
export type Education = typeof education.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type Skill = typeof skills.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertCertification = z.infer<typeof insertCertificationSchema>;
export type Certification = typeof certifications.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type LearningModule = typeof learningModules.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type UserStats = typeof userStats.$inferSelect;
export type DailyActivity = typeof dailyActivity.$inferSelect;
export type InsertDailyActivity = z.infer<typeof insertDailyActivitySchema>;
export type SectionSettings = typeof sectionSettings.$inferSelect;
export type InsertSectionSettings = z.infer<typeof insertSectionSettingsSchema>;
