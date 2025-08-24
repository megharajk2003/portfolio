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
    .unique()
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

    achievements?: {
      id?: string;
      title: string;
      description?: string;
      year?: string;
      isVisible?: boolean;
    }[];

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
  finalExamPassed: boolean("final_exam_passed").default(false),
  finalExamScore: integer("final_exam_score"),
  finalExamAttempts: integer("final_exam_attempts").default(0),
});

// New table for tracking individual lesson completion
export const lessonProgress = pgTable("lesson_progress", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  moduleId: varchar("module_id")
    .notNull()
    .references(() => modules.id, { onDelete: "cascade" }),
  lessonIndex: integer("lesson_index").notNull(),
  isCompleted: boolean("is_completed").default(false),
  quizPassed: boolean("quiz_passed").default(false),
  quizScore: integer("quiz_score"),
  quizAttempts: integer("quiz_attempts").default(0),
  xpEarned: integer("xp_earned").default(0),
  completedAt: timestamp("completed_at"),
});

// Table for storing quiz questions and answers
export const quizQuestions = pgTable("quiz_questions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  moduleId: varchar("module_id")
    .notNull()
    .references(() => learningModules.id, { onDelete: "cascade" }),
  lessonIndex: integer("lesson_index").notNull(), // -1 for final exam
  question: text("question").notNull(),
  options: jsonb("options").$type<string[]>().notNull(),
  correctAnswer: integer("correct_answer").notNull(), // Index of correct option
  explanation: text("explanation"),
});

// Table for quiz attempts
export const quizAttempts = pgTable("quiz_attempts", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  moduleId: varchar("module_id")
    .notNull()
    .references(() => learningModules.id, { onDelete: "cascade" }),
  lessonIndex: integer("lesson_index").notNull(), // -1 for final exam
  answers: jsonb("answers").$type<number[]>().notNull(), // Array of selected answer indices
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  passed: boolean("passed").notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

// Badge system for achievements
export const badges = pgTable("badges", {
  id: varchar("badge_id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 100 }).notNull(), // Lucide icon name
  color: varchar("color", { length: 50 }).default("blue"), // Color scheme
  type: varchar("type", { length: 50 }).$type<"course_completion" | "milestone" | "streak" | "achievement">().notNull(),
  criteria: jsonb("criteria"), // JSON object with completion criteria
  xpReward: integer("xp_reward").default(0),
  rarity: varchar("rarity", { length: 20 }).$type<"common" | "rare" | "epic" | "legendary">().default("common"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userBadges = pgTable("user_badges", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  badgeId: varchar("badge_id")
    .notNull()
    .references(() => badges.id, { onDelete: "cascade" }),
  earnedAt: timestamp("earned_at").defaultNow(),
  relatedId: varchar("related_id"), // Course ID, module ID, etc.
}, (table) => ({
  unique: { columns: [table.userId, table.badgeId] },
}));

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

// New comprehensive learning platform schema
export const instructors = pgTable("instructors", {
  id: varchar("instructor_id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: integer("user_id")
    .unique()
    .references(() => users.id, { onDelete: "set null" }),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  bio: text("bio"),
  profilePictureUrl: text("profile_picture_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const categories = pgTable("categories", {
  id: integer("category_id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 100 }).unique().notNull(),
  parentCategoryId: integer("parent_category_id").references((): any => categories.id, { onDelete: "set null" }),
});

export const courses = pgTable("courses", {
  id: varchar("course_id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  subtitle: text("subtitle"),
  description: text("description"),
  language: varchar("language", { length: 50 }).default("English"),
  level: varchar("level", { length: 50 }).$type<"Beginner" | "Intermediate" | "Advanced" | "All">(),
  coverImageUrl: text("cover_image_url"),
  promoVideoUrl: text("promo_video_url"),
  isFree: boolean("is_free").default(false),
  price: decimal("price", { precision: 10, scale: 2 }),
  durationMonths: integer("duration_months"),
  scheduleInfo: text("schedule_info"),
  whatYouWillLearn: jsonb("what_you_will_learn"),
  skillsYouWillGain: jsonb("skills_you_will_gain"),
  detailsToKnow: jsonb("details_to_know"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  instructorId: varchar("instructor_id").references(() => instructors.id, { onDelete: "set null" }),
});

export const courseCategories = pgTable("course_categories", {
  courseId: varchar("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
}, (table) => ({
  pk: { columns: [table.courseId, table.categoryId] },
}));

export const modules = pgTable("modules", {
  id: varchar("module_id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  courseId: varchar("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  moduleOrder: integer("module_order").notNull(),
  durationHours: integer("duration_hours"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const lessons = pgTable("lessons", {
  id: varchar("lesson_id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  moduleId: varchar("module_id")
    .notNull()
    .references(() => modules.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  videoUrl: text("video_url"),
  lessonOrder: integer("lesson_order").notNull(),
  durationMinutes: integer("duration_minutes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const enrollments = pgTable("enrollments", {
  id: varchar("enrollment_id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  courseId: varchar("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  enrollmentDate: timestamp("enrollment_date", { withTimezone: true }).defaultNow(),
  progress: decimal("progress", { precision: 5, scale: 2 }).default("0.0"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
}, (table) => ({
  unique: { columns: [table.userId, table.courseId] },
}));

export const reviews = pgTable("reviews", {
  id: varchar("review_id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  courseId: varchar("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  reviewText: text("review_text"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  unique: { columns: [table.userId, table.courseId] },
  checkRating: sql`CHECK (rating >= 1 AND rating <= 5)`,
}));

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

// Dedicated Education Table
export const education = pgTable("education", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  level: text("level").notNull(), // "School", "Undergraduate", "Postgraduate"
  institution: text("institution").notNull(),
  degree: text("degree"),
  fieldOfStudy: text("field_of_study"),
  yearOfPassing: integer("year_of_passing"),
  gradeOrScore: text("grade_or_score"),
  description: text("description"),
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Dedicated Skills Table
export const skills = pgTable("skills", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  category: text("category").notNull(), // "technical", "soft", "tools", "domainSpecific"
  name: text("name").notNull(),
  level: integer("level").default(5), // 1-10 scale
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Dedicated Projects Table
export const projects = pgTable("projects", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  domain: text("domain").notNull(), // "Business", "Marketing", "Technology", etc.
  toolsOrMethods: text("tools_or_methods"), // Stored as comma-separated string
  outcome: text("outcome"),
  url: text("url"),
  githubUrl: text("github_url"),
  startDate: text("start_date"), // YYYY-MM format
  endDate: text("end_date"), // YYYY-MM format
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Dedicated Certifications Table
export const certifications = pgTable("certifications", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  organization: text("organization").notNull(),
  year: integer("year"),
  url: text("url"),
  description: text("description"),
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Dedicated Achievements Table
export const achievements = pgTable("achievements", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  year: text("year"),
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Portfolio Tables for Individual Items
export const workExperience = pgTable("work_experience", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  company: text("company").notNull(),
  position: text("position").notNull(),
  location: text("location"),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  description: text("description"),
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const volunteerExperience = pgTable("volunteer_experience", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  organization: text("organization").notNull(),
  role: text("role").notNull(),
  description: text("description").notNull(),
  year: text("year").notNull(),
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const publications = pgTable("publications", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  type: text("type").notNull(),
  journal: text("journal").notNull(),
  year: text("year").notNull(),
  url: text("url"),
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const organizations = pgTable("organizations", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  role: text("role").notNull(),
  year: text("year").notNull(),
  contribution: text("contribution").notNull(),
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// AI Career Features Tables
export const careerAdvisories = pgTable("career_advisories", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  advice: text("advice").notNull(),
  recommendations: jsonb("recommendations").$type<string[]>(),
  careerGoals: text("career_goals"),
  currentLevel: text("current_level"), // "entry", "mid", "senior", "executive"
  targetRole: text("target_role"),
  skillGaps: jsonb("skill_gaps").$type<string[]>(),
  nextSteps: jsonb("next_steps").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const careerTimelines = pgTable("career_timelines", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  timeline: jsonb("timeline").$type<{
    phase: string;
    duration: string;
    milestones: string[];
    skills: string[];
    description: string;
  }[]>(),
  targetRole: text("target_role"),
  estimatedDuration: text("estimated_duration"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const generatedResumes = pgTable("generated_resumes", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: jsonb("content").$type<{
    personalInfo: any;
    summary: string;
    experience: any[];
    education: any[];
    skills: any[];
    projects: any[];
    certifications: any[];
  }>(),
  template: text("template").default("professional"),
  targetRole: text("target_role"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const chatSessions = pgTable("chat_sessions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  messages: jsonb("messages").$type<{
    role: "user" | "assistant";
    content: string;
    timestamp: string;
  }[]>(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Forum Tables
export const forumPosts = pgTable("forum_posts", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  likesCount: integer("likes_count").default(0),
  repliesCount: integer("replies_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const forumReplies = pgTable("forum_replies", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  postId: varchar("post_id")
    .notNull()
    .references(() => forumPosts.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  likesCount: integer("likes_count").default(0),
  parentReplyId: varchar("parent_reply_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const forumLikes = pgTable("forum_likes", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  postId: varchar("post_id").references(() => forumPosts.id, { onDelete: "cascade" }),
  replyId: varchar("reply_id").references(() => forumReplies.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Types for AI Career Features
export type CareerAdvisory = typeof careerAdvisories.$inferSelect;
export type InsertCareerAdvisory = typeof careerAdvisories.$inferInsert;
export type CareerTimeline = typeof careerTimelines.$inferSelect;
export type InsertCareerTimeline = typeof careerTimelines.$inferInsert;
export type GeneratedResume = typeof generatedResumes.$inferSelect;
export type InsertGeneratedResume = typeof generatedResumes.$inferInsert;
export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = typeof chatSessions.$inferInsert;

// Forum types
export type ForumPost = typeof forumPosts.$inferSelect;
export type InsertForumPost = typeof forumPosts.$inferInsert;
export type ForumReply = typeof forumReplies.$inferSelect;
export type InsertForumReply = typeof forumReplies.$inferInsert;
export type ForumLike = typeof forumLikes.$inferSelect;
export type InsertForumLike = typeof forumLikes.$inferInsert;

// Types for new learning platform tables
export type Instructor = typeof instructors.$inferSelect;
export type InsertInstructor = typeof instructors.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;
export type CourseCategory = typeof courseCategories.$inferSelect;
export type InsertCourseCategory = typeof courseCategories.$inferInsert;
export type Module = typeof modules.$inferSelect;
export type InsertModule = typeof modules.$inferInsert;
export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = typeof lessons.$inferInsert;
export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = typeof enrollments.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

// Zod schemas for AI Career Features
export const insertCareerAdvisorySchema = createInsertSchema(careerAdvisories);
export const insertCareerTimelineSchema = createInsertSchema(careerTimelines);
export const insertGeneratedResumeSchema = createInsertSchema(generatedResumes);
export const insertChatSessionSchema = createInsertSchema(chatSessions);

// Forum validation schemas
export const insertForumPostSchema = createInsertSchema(forumPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  likesCount: true,
  repliesCount: true,
});

export const insertForumReplySchema = createInsertSchema(forumReplies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  likesCount: true,
});

export const insertForumLikeSchema = createInsertSchema(forumLikes).omit({
  id: true,
  createdAt: true,
});

// Zod schemas for new learning platform
export const insertCourseSchema = createInsertSchema(courses);
export const insertCategorySchema = createInsertSchema(categories);
export const insertInstructorSchema = createInsertSchema(instructors);
export const insertModuleSchema = createInsertSchema(modules);
export const insertLessonSchema = createInsertSchema(lessons);
export const insertEnrollmentSchema = createInsertSchema(enrollments);
export const insertReviewSchema = createInsertSchema(reviews);

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
  fieldOfStudy: z.string().optional(),
  description: z.string().optional(),
});

// Education schema with userId for API operations
export const educationWithUserSchema = z.object({
  userId: z.string().transform(Number),
  level: z.string(),
  institution: z.string(),
  degree: z.string().optional(),
  yearOfPassing: z.number().optional(),
  gradeOrScore: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  description: z.string().optional(),
});

// Create insert schemas for new dedicated tables
export const insertEducationTableSchema = createInsertSchema(education).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSkillTableSchema = createInsertSchema(skills).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectTableSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCertificationTableSchema = createInsertSchema(
  certifications
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkExperienceTableSchema = z.object({
  userId: z.string().transform(Number),
  company: z.string(),
  position: z.string(),
  location: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  description: z.string().optional(),
  isVisible: z.boolean().default(true),
});

export const insertAchievementTableSchema = createInsertSchema(
  achievements
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const workExperienceItemSchema = z.object({
  organization: z.string(),
  roleOrPosition: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  responsibilities: z.array(z.string()),
  skillsOrToolsUsed: z.array(z.string()),
});

// Work experience schema with userId for API operations
export const workExperienceWithUserSchema = z.object({
  userId: z.string().transform(Number),
  company: z.string().min(1, "Company name is required"),
  position: z.string().min(1, "Position is required"),
  location: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  description: z.string().optional(),
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
  id: z.string().optional(),
  title: z.string(),
  description: z.string(),
  domain: z.string(),
  technologies: z.array(z.string()).optional(),
  toolsOrMethods: z.array(z.string()),
  outcome: z.string().optional(),
  url: z.string().url().optional(),
  link: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  githubLink: z.string().url().optional(),
  isVisible: z.boolean().default(true),
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

export const achievementItemSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  year: z.string().optional(),
  isVisible: z.boolean().default(true),
});

export const otherDetailsSchema = z.object({
  education: z.array(educationItemSchema).optional(),
  workExperience: z.array(workExperienceItemSchema).optional(),
  internships: z.array(internshipItemSchema).optional(),
  projects: z.array(projectItemSchema).optional(),
  skills: skillsSchema.optional(),
  certifications: z.array(certificationItemSchema).optional(),
  organizations: z.array(organizationItemSchema).optional(),
  achievements: z.array(achievementItemSchema).optional(),
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
export const insertWorkExperienceSchema = workExperienceWithUserSchema;
export const insertEducationSchema = educationWithUserSchema;
// Individual skill schema for API operations
export const skillItemSchema = z.object({
  category: z.string(),
  name: z.string(),
  level: z.number().optional(),
});

export const skillWithUserSchema = z.object({
  userId: z.string(),
  category: z.string(),
  name: z.string(),
  level: z.number().optional(),
});

export const insertSkillSchema = skillWithUserSchema;
// Project schema with userId for API operations
export const projectWithUserSchema = z.object({
  userId: z.string(),
  title: z.string(),
  description: z.string(),
  domain: z.string(),
  toolsOrMethods: z.string().optional(), // Allow string input from forms
  outcome: z.string().optional(),
  url: z.string().optional(),
  githubUrl: z.string().optional(),
  startDate: z.string().optional(), // Add missing fields from form
  endDate: z.string().optional(),
});

// Certification schema with userId for API operations
export const certificationWithUserSchema = z.object({
  userId: z.string(),
  title: z.string(),
  organization: z.string(),
  year: z.number().optional(),
  url: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().url().optional()
  ),
  description: z.string().optional(), // Add missing field from form
});

// Publication schema with userId for API operations
export const publicationWithUserSchema = z.object({
  userId: z.string().transform(Number),
  title: z.string(),
  type: z.string(),
  journal: z.string().optional(), // Made optional to handle field name variations
  journalOrPlatform: z.string().optional(), // Support frontend field name
  year: z.union([z.string(), z.number()]).transform(String), // Accept both string and number, convert to string
  url: z.string().optional(),
}).refine((data) => data.journal || data.journalOrPlatform, {
  message: "Either journal or journalOrPlatform is required",
  path: ["journal"],
});

// Organization schema with userId for API operations
export const organizationWithUserSchema = z.object({
  userId: z.string().transform(Number),
  name: z.string(),
  role: z.string(),
  year: z.string(),
  contribution: z.string(),
});

// Volunteer schema with userId for API operations
export const volunteerWithUserSchema = z.object({
  userId: z.string().transform(Number),
  organization: z.string(),
  role: z.string(),
  description: z.string(),
  year: z.string(),
});

export const insertProjectSchema = projectWithUserSchema;
export const insertCertificationSchema = certificationWithUserSchema;
export const insertPublicationSchema = publicationWithUserSchema;
export const insertOrganizationSchema = organizationWithUserSchema;
export const insertVolunteerSchema = volunteerWithUserSchema;

export const insertAchievementSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  year: z.string().optional(),
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
export type AchievementItem = z.infer<typeof achievementItemSchema>;
export type Skills = z.infer<typeof skillsSchema>;
export type CertificationItem = z.infer<typeof certificationItemSchema>;
export type OrganizationItem = z.infer<typeof organizationItemSchema>;
export type PublicationItem = z.infer<typeof publicationItemSchema>;
export type VolunteerItem = z.infer<typeof volunteerItemSchema>;

// Export aliases for the component
export type Project = ProjectItem;
export type Achievement = AchievementItem;

export type LearningModule = typeof learningModules.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type UserStats = typeof userStats.$inferSelect;
export type DailyActivity = typeof dailyActivity.$inferSelect;

// New types for enhanced learning system
export type LessonProgress = typeof lessonProgress.$inferSelect;
export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type InsertLessonProgress = typeof lessonProgress.$inferInsert;
export type InsertQuizQuestion = typeof quizQuestions.$inferInsert;
export type InsertQuizAttempt = typeof quizAttempts.$inferInsert;
export type InsertDailyActivity = z.infer<typeof insertDailyActivitySchema>;
export type SectionSettings = typeof sectionSettings.$inferSelect;
export type InsertSectionSettings = z.infer<typeof insertSectionSettingsSchema>;

// Portfolio section types
export type InsertWorkExperience = z.infer<typeof insertWorkExperienceSchema>;
export type InsertEducation = z.infer<typeof insertEducationSchema>;
export type EducationWithUser = z.infer<typeof educationWithUserSchema>;
export type WorkExperienceWithUser = z.infer<
  typeof workExperienceWithUserSchema
>;
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertCertification = z.infer<typeof insertCertificationSchema>;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type InsertPublication = z.infer<typeof insertPublicationSchema>;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type InsertVolunteer = z.infer<typeof insertVolunteerSchema>;
export type SkillWithUser = z.infer<typeof skillWithUserSchema>;
export type ProjectWithUser = z.infer<typeof projectWithUserSchema>;
export type CertificationWithUser = z.infer<typeof certificationWithUserSchema>;
export type PublicationWithUser = z.infer<typeof publicationWithUserSchema>;
export type OrganizationWithUser = z.infer<typeof organizationWithUserSchema>;
export type VolunteerWithUser = z.infer<typeof volunteerWithUserSchema>;

// Badge types
export type Badge = typeof badges.$inferSelect;
export type UserBadge = typeof userBadges.$inferSelect;
export type InsertBadge = typeof badges.$inferInsert;
export type InsertUserBadge = typeof userBadges.$inferInsert;

// Badge schemas
export const insertBadgeSchema = createInsertSchema(badges);
export const insertUserBadgeSchema = createInsertSchema(userBadges);

// Goal Tracking System
export const goals = pgTable("goals", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  csvData: jsonb("csv_data"), // Store original CSV data
  totalTopics: integer("total_topics").default(0),
  completedTopics: integer("completed_topics").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const goalCategories = pgTable("goal_categories", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  goalId: varchar("goal_id")
    .notNull()
    .references(() => goals.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  totalTopics: integer("total_topics").default(0),
  completedTopics: integer("completed_topics").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const goalTopics = pgTable("goal_topics", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id")
    .notNull()
    .references(() => goalCategories.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  totalSubtopics: integer("total_subtopics").default(0),
  completedSubtopics: integer("completed_subtopics").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const goalSubtopics = pgTable("goal_subtopics", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  topicId: varchar("topic_id")
    .notNull()
    .references(() => goalTopics.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 })
    .$type<"pending" | "in_progress" | "completed">()
    .default("pending")
    .notNull(),
  priority: varchar("priority", { length: 10 })
    .$type<"low" | "medium" | "high">()
    .default("medium")
    .notNull(),
  notes: text("notes"),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Goal tracking insert schemas and types
export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGoalCategorySchema = createInsertSchema(goalCategories).omit({
  id: true,
  createdAt: true,
});

export const insertGoalTopicSchema = createInsertSchema(goalTopics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGoalSubtopicSchema = createInsertSchema(goalSubtopics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
});

export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;
export type InsertGoalCategory = z.infer<typeof insertGoalCategorySchema>;
export type GoalCategory = typeof goalCategories.$inferSelect;
export type InsertGoalTopic = z.infer<typeof insertGoalTopicSchema>;
export type GoalTopic = typeof goalTopics.$inferSelect;
export type InsertGoalSubtopic = z.infer<typeof insertGoalSubtopicSchema>;
export type GoalSubtopic = typeof goalSubtopics.$inferSelect;
