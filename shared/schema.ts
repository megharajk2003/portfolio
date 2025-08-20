import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  jsonb,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User storage table for JWT Auth
export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Comprehensive Profile Schema matching the provided structure
export const profiles = pgTable("profiles", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Personal Details Section
  personalDetails: jsonb("personal_details").$type<{
    photo?: string;
    fullName: string;
    dob?: string; // YYYY-MM-DD format
    gender?: "Male" | "Female" | "Other";
    location?: {
      city?: string;
      state?: string;
      country?: string;
      pincode?: string;
    };
    roleOrTitle?: string;
    summary?: string;
    languagesKnown?: string[];
    nationality?: string;
  }>(),

  // Contact Details Section
  contactDetails: jsonb("contact_details").$type<{
    email?: string;
    phone?: string;
    linkedin?: string;
    githubOrPortfolio?: string;
    website?: string;
    twitter?: string;
    otherProfiles?: {
      behance?: string;
      dribbble?: string;
      researchgate?: string;
      orcid?: string;
    };
  }>(),

  // Other Details Section
  otherDetails: jsonb("other_details").$type<{
    education?: {
      level: string; // "School", "Undergraduate", "Postgraduate"
      institution: string;
      degree?: string;
      yearOfPassing?: number;
      gradeOrScore?: string;
    }[];

    workExperience?: {
      organization: string;
      roleOrPosition: string;
      startDate: string; // YYYY-MM format
      endDate?: string; // YYYY-MM format or null for current
      responsibilities: string[];
      skillsOrToolsUsed: string[];
    }[];

    internships?: {
      organization: string;
      roleOrPosition: string;
      startDate: string; // YYYY-MM format
      endDate: string; // YYYY-MM format
      projectsOrTasks: string[];
      skillsOrToolsUsed: string[];
    }[];

    projects?: {
      title: string;
      description: string;
      domain: string; // "Business", "Marketing", "Technology", etc.
      toolsOrMethods: string[];
      outcome?: string;
      url?: string;
      githubUrl?: string;
    }[];

    skills?: {
      technical: string[];
      domainSpecific: string[];
      soft: string[];
      tools: string[];
    };

    certifications?: {
      title: string;
      organization: string;
      year: number;
      url?: string;
    }[];

    organizations?: {
      name: string;
      role: string;
      year: string; // "2019-2020" format
      contribution: string;
    }[];

    achievements?: string[];

    publicationsOrCreativeWorks?: {
      title: string;
      type: "Research Paper" | "Portfolio Work" | "Article" | "Book" | "Other";
      journalOrPlatform: string;
      year: number;
      url?: string;
    }[];

    volunteerExperience?: {
      organization: string;
      role: string;
      description: string;
      year: string; // "2020-2021" format
    }[];

    interestsOrHobbies?: string[];
  }>(),

  // Portfolio Settings
  portfolioTheme: text("portfolio_theme").default("modern"),
  isPublic: boolean("is_public").default(false),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Learning and Gamification Tables (unchanged)
export const learningModules = pgTable("learning_modules", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  xpReward: integer("xp_reward").default(100),
  lessons: jsonb("lessons"), // Array of lesson objects
  isActive: boolean("is_active").default(true),
});

export const userProgress = pgTable("user_progress", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  moduleId: varchar("module_id")
    .notNull()
    .references(() => learningModules.id, { onDelete: "cascade" }),
  currentLesson: integer("current_lesson").default(0),
  isCompleted: boolean("is_completed").default(false),
  xpEarned: integer("xp_earned").default(0),
  completedAt: timestamp("completed_at"),
});

export const userStats = pgTable("user_stats", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  totalXp: integer("total_xp").default(0),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastActivityDate: timestamp("last_activity_date"),
  portfolioViews: integer("portfolio_views").default(0),
});

export const dailyActivity = pgTable("daily_activity", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // YYYY-MM-DD format
  xpEarned: integer("xp_earned").default(0),
  lessonsCompleted: integer("lessons_completed").default(0),
});

export const sectionSettings = pgTable("section_settings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sectionName: text("section_name").notNull(),
  isVisible: boolean("is_visible").default(true),
  sortOrder: integer("sort_order").default(0),
});

// Zod Schemas for Validation
export const personalDetailsSchema = z.object({
  photo: z.string().optional(),
  fullName: z.string().min(2, "Full name is required"),
  dob: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  location: z
    .object({
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
      pincode: z.string().optional(),
    })
    .optional(),
  roleOrTitle: z.string().optional(),
  summary: z.string().optional(),
  languagesKnown: z.array(z.string()).optional(),
  nationality: z.string().optional(),
});

export const contactDetailsSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  linkedin: z.string().url().optional(),
  githubOrPortfolio: z.string().url().optional(),
  website: z.string().url().optional(),
  twitter: z.string().url().optional(),
  otherProfiles: z
    .object({
      behance: z.string().url().optional(),
      dribbble: z.string().url().optional(),
      researchgate: z.string().url().optional(),
      orcid: z.string().url().optional(),
    })
    .optional(),
});

export const educationItemSchema = z.object({
  level: z.string(),
  institution: z.string(),
  degree: z.string().optional(),
  yearOfPassing: z.number().optional(),
  gradeOrScore: z.string().optional(),
});

export const workExperienceItemSchema = z.object({
  organization: z.string(),
  roleOrPosition: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  responsibilities: z.array(z.string()),
  skillsOrToolsUsed: z.array(z.string()),
});

export const internshipItemSchema = z.object({
  organization: z.string(),
  roleOrPosition: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  projectsOrTasks: z.array(z.string()),
  skillsOrToolsUsed: z.array(z.string()),
});

export const projectItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  domain: z.string(),
  toolsOrMethods: z.array(z.string()),
  outcome: z.string().optional(),
  url: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
});

export const skillsSchema = z.object({
  technical: z.array(z.string()).optional(),
  domainSpecific: z.array(z.string()).optional(),
  soft: z.array(z.string()).optional(),
  tools: z.array(z.string()).optional(),
});

export const certificationItemSchema = z.object({
  title: z.string(),
  organization: z.string(),
  year: z.number(),
  url: z.string().url().optional(),
});

export const organizationItemSchema = z.object({
  name: z.string(),
  role: z.string(),
  year: z.string(),
  contribution: z.string(),
});

export const publicationItemSchema = z.object({
  title: z.string(),
  type: z.enum([
    "Research Paper",
    "Portfolio Work",
    "Article",
    "Book",
    "Other",
  ]),
  journalOrPlatform: z.string(),
  year: z.number(),
  url: z.string().url().optional(),
});

export const volunteerItemSchema = z.object({
  organization: z.string(),
  role: z.string(),
  description: z.string(),
  year: z.string(),
});

export const otherDetailsSchema = z.object({
  education: z.array(educationItemSchema).optional(),
  workExperience: z.array(workExperienceItemSchema).optional(),
  internships: z.array(internshipItemSchema).optional(),
  projects: z.array(projectItemSchema).optional(),
  skills: skillsSchema.optional(),
  certifications: z.array(certificationItemSchema).optional(),
  organizations: z.array(organizationItemSchema).optional(),
  achievements: z.array(z.string()).optional(),
  publicationsOrCreativeWorks: z.array(publicationItemSchema).optional(),
  volunteerExperience: z.array(volunteerItemSchema).optional(),
  interestsOrHobbies: z.array(z.string()).optional(),
});

// Main Profile Schema
export const comprehensiveProfileSchema = z.object({
  userId: z.number(),
  personalDetails: personalDetailsSchema.optional(),
  contactDetails: contactDetailsSchema.optional(),
  otherDetails: otherDetailsSchema.optional(),
  portfolioTheme: z.string().optional(),
  isPublic: z.boolean().optional(),
});

// Insert schemas for individual portfolio sections
export const insertWorkExperienceSchema = workExperienceItemSchema;
export const insertEducationSchema = educationItemSchema;
export const insertSkillSchema = z.object({
  category: z.string(),
  name: z.string(),
  level: z.number().optional(),
});
export const insertProjectSchema = projectItemSchema;
export const insertCertificationSchema = certificationItemSchema;
export const insertAchievementSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.string(),
});

// Insert schemas
export const insertUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  profileImageUrl: z.string().nullable().optional(),
});

export const insertProfileSchema = z.object({
  userId: z.number(),
  personalDetails: z.any().optional(),
  contactDetails: z.any().optional(),
  otherDetails: z.any().optional(),
  portfolioTheme: z.string().optional(),
  isPublic: z.boolean().optional(),
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  completedAt: true,
});

export const insertDailyActivitySchema = createInsertSchema(dailyActivity).omit(
  { id: true }
);

export const insertSectionSettingsSchema = createInsertSchema(
  sectionSettings
).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = InsertUser;

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type ComprehensiveProfile = z.infer<typeof comprehensiveProfileSchema>;

export type PersonalDetails = z.infer<typeof personalDetailsSchema>;
export type ContactDetails = z.infer<typeof contactDetailsSchema>;
export type OtherDetails = z.infer<typeof otherDetailsSchema>;

export type EducationItem = z.infer<typeof educationItemSchema>;
export type WorkExperienceItem = z.infer<typeof workExperienceItemSchema>;
export type InternshipItem = z.infer<typeof internshipItemSchema>;
export type ProjectItem = z.infer<typeof projectItemSchema>;
export type Skills = z.infer<typeof skillsSchema>;
export type CertificationItem = z.infer<typeof certificationItemSchema>;
export type OrganizationItem = z.infer<typeof organizationItemSchema>;
export type PublicationItem = z.infer<typeof publicationItemSchema>;
export type VolunteerItem = z.infer<typeof volunteerItemSchema>;

export type LearningModule = typeof learningModules.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type UserStats = typeof userStats.$inferSelect;
export type DailyActivity = typeof dailyActivity.$inferSelect;
export type InsertDailyActivity = z.infer<typeof insertDailyActivitySchema>;
export type SectionSettings = typeof sectionSettings.$inferSelect;
export type InsertSectionSettings = z.infer<typeof insertSectionSettingsSchema>;

// Portfolio section types
export type InsertWorkExperience = z.infer<typeof insertWorkExperienceSchema>;
export type InsertEducation = z.infer<typeof insertEducationSchema>;
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertCertification = z.infer<typeof insertCertificationSchema>;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
