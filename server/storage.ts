import {
  type User,
  type InsertUser,
  type UpsertUser,
  type Profile,
  type InsertProfile,
  type ComprehensiveProfile,
  type PersonalDetails,
  type ContactDetails,
  type OtherDetails,
  type LearningModule,
  type UserProgress,
  type InsertUserProgress,
  type UserStats,
  type DailyActivity,
  type InsertDailyActivity,
  type SectionSettings,
  type InsertSectionSettings,
  users,
  profiles,
  learningModules,
  userProgress,
  userStats,
  dailyActivity,
  sectionSettings,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  sessionStore: any;

  // User management for JWT Auth
  getUserById(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Comprehensive Profile management
  getProfile(userId: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(
    userId: string,
    profile: Partial<InsertProfile>
  ): Promise<Profile | undefined>;

  // Learning and Gamification
  getLearningModules(): Promise<LearningModule[]>;
  getLearningModule(id: string): Promise<LearningModule | undefined>;

  getUserProgress(userId: number): Promise<UserProgress[]>;
  getUserProgressForModule(
    userId: number,
    moduleId: string
  ): Promise<UserProgress | undefined>;
  createUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  updateUserProgress(
    userId: number,
    moduleId: string,
    progress: Partial<UserProgress>
  ): Promise<UserProgress | undefined>;

  getUserStats(userId: number): Promise<UserStats | undefined>;
  updateUserStats(
    userId: number,
    stats: Partial<UserStats>
  ): Promise<UserStats | undefined>;

  getDailyActivity(
    userId: number,
    startDate: string,
    endDate: string
  ): Promise<DailyActivity[]>;
  createDailyActivity(activity: InsertDailyActivity): Promise<DailyActivity>;
  updateDailyActivity(
    userId: number,
    date: string,
    activity: Partial<DailyActivity>
  ): Promise<DailyActivity | undefined>;

  getSectionSettings(userId: number): Promise<SectionSettings[]>;
  updateSectionSettings(
    userId: number,
    sectionName: string,
    settings: Partial<SectionSettings>
  ): Promise<SectionSettings | undefined>;
}

export class MemStorage implements IStorage {
  public sessionStore: any = null;
  private users: Map<number, User> = new Map();
  private usersByEmail: Map<string, User> = new Map();
  private profiles: Map<string, Profile> = new Map(); // userId -> Profile
  private learningModules: Map<string, LearningModule> = new Map();
  private userProgress: Map<string, UserProgress> = new Map(); // userId-moduleId -> Progress
  private userStats: Map<number, UserStats> = new Map();
  private dailyActivity: Map<string, DailyActivity> = new Map(); // userId-date -> Activity
  private sectionSettings: Map<string, SectionSettings> = new Map(); // userId-sectionName -> Settings

  constructor() {
    // Initialize with sample learning modules
    this.initializeSampleModules();
  }

  private initializeSampleModules() {
    const modules: LearningModule[] = [
      {
        id: "module-1",
        title: "JavaScript Fundamentals",
        description: "Learn the basics of JavaScript programming",
        category: "Programming",
        xpReward: 100,
        lessons: [
          { title: "Variables and Data Types", completed: false },
          { title: "Functions and Scope", completed: false },
          { title: "Objects and Arrays", completed: false },
        ],
        isActive: true,
      },
      {
        id: "module-2",
        title: "React Development",
        description: "Build modern web applications with React",
        category: "Frontend",
        xpReward: 150,
        lessons: [
          { title: "Components and Props", completed: false },
          { title: "State and Lifecycle", completed: false },
          { title: "Hooks and Context", completed: false },
        ],
        isActive: true,
      },
    ];

    modules.forEach((module) => {
      this.learningModules.set(module.id, module);
    });
  }

  // User management
  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.usersByEmail.get(email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = Date.now(); // Simple ID generation
    const newUser: User = {
      ...user,
      id,
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      profileImageUrl: user.profileImageUrl || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(id, newUser);
    this.usersByEmail.set(user.email, newUser);
    return newUser;
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    const existingUser = await this.getUserByEmail(user.email);
    if (existingUser) {
      const updatedUser = { ...existingUser, ...user, updatedAt: new Date() };
      this.users.set(existingUser.id, updatedUser);
      this.usersByEmail.set(user.email, updatedUser);
      return updatedUser;
    }
    return this.createUser(user);
  }

  // Profile management
  async getProfile(userId: string): Promise<Profile | undefined> {
    return this.profiles.get(userId);
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const id = randomUUID();
    const newProfile: Profile = {
      ...profile,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      personalDetails: profile.personalDetails || null,
      contactDetails: profile.contactDetails || null,
      otherDetails: profile.otherDetails || null,
      portfolioTheme: profile.portfolioTheme || "modern",
      isPublic: profile.isPublic || false,
    };

    this.profiles.set(profile.userId.toString(), newProfile);
    return newProfile;
  }

  async updateProfile(
    userId: string,
    profileUpdates: Partial<InsertProfile>
  ): Promise<Profile | undefined> {
    const existingProfile = this.profiles.get(userId);
    if (!existingProfile) {
      return undefined;
    }

    const updatedProfile: Profile = {
      ...existingProfile,
      ...profileUpdates,
      updatedAt: new Date(),
    };

    this.profiles.set(userId, updatedProfile);
    return updatedProfile;
  }

  // Learning Modules
  async getLearningModules(): Promise<LearningModule[]> {
    return Array.from(this.learningModules.values()).filter((m) => m.isActive);
  }

  async getLearningModule(id: string): Promise<LearningModule | undefined> {
    return this.learningModules.get(id);
  }

  // User Progress
  async getUserProgress(userId: number): Promise<UserProgress[]> {
    const userProgressList: UserProgress[] = [];
    for (const [key, progress] of this.userProgress.entries()) {
      if (key.startsWith(`${userId}-`)) {
        userProgressList.push(progress);
      }
    }
    return userProgressList;
  }

  async getUserProgressForModule(
    userId: number,
    moduleId: string
  ): Promise<UserProgress | undefined> {
    return this.userProgress.get(`${userId}-${moduleId}`);
  }

  async createUserProgress(
    progress: InsertUserProgress
  ): Promise<UserProgress> {
    const id = randomUUID();
    const newProgress: UserProgress = {
      ...progress,
      id,
      completedAt: null,
    };

    this.userProgress.set(
      `${progress.userId}-${progress.moduleId}`,
      newProgress
    );
    return newProgress;
  }

  async updateUserProgress(
    userId: number,
    moduleId: string,
    progressUpdates: Partial<UserProgress>
  ): Promise<UserProgress | undefined> {
    const key = `${userId}-${moduleId}`;
    const existingProgress = this.userProgress.get(key);
    if (!existingProgress) {
      return undefined;
    }

    const updatedProgress: UserProgress = {
      ...existingProgress,
      ...progressUpdates,
      completedAt: progressUpdates.isCompleted
        ? new Date()
        : existingProgress.completedAt,
    };

    this.userProgress.set(key, updatedProgress);
    return updatedProgress;
  }

  // User Stats
  async getUserStats(userId: number): Promise<UserStats | undefined> {
    return this.userStats.get(userId);
  }

  async updateUserStats(
    userId: number,
    statsUpdates: Partial<UserStats>
  ): Promise<UserStats | undefined> {
    const existingStats = this.userStats.get(userId) || {
      id: randomUUID(),
      userId,
      totalXp: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      portfolioViews: 0,
    };

    const updatedStats: UserStats = {
      ...existingStats,
      ...statsUpdates,
    };

    this.userStats.set(userId, updatedStats);
    return updatedStats;
  }

  // Daily Activity
  async getDailyActivity(
    userId: number,
    startDate: string,
    endDate: string
  ): Promise<DailyActivity[]> {
    const activities: DailyActivity[] = [];
    for (const [key, activity] of this.dailyActivity.entries()) {
      if (
        key.startsWith(`${userId}-`) &&
        activity.date >= startDate &&
        activity.date <= endDate
      ) {
        activities.push(activity);
      }
    }
    return activities.sort((a, b) => a.date.localeCompare(b.date));
  }

  async createDailyActivity(
    activity: InsertDailyActivity
  ): Promise<DailyActivity> {
    const id = randomUUID();
    const newActivity: DailyActivity = {
      ...activity,
      id,
    };

    this.dailyActivity.set(`${activity.userId}-${activity.date}`, newActivity);
    return newActivity;
  }

  async updateDailyActivity(
    userId: number,
    date: string,
    activityUpdates: Partial<DailyActivity>
  ): Promise<DailyActivity | undefined> {
    const key = `${userId}-${date}`;
    const existingActivity = this.dailyActivity.get(key) || {
      id: randomUUID(),
      userId,
      date,
      xpEarned: 0,
      lessonsCompleted: 0,
    };

    const updatedActivity: DailyActivity = {
      ...existingActivity,
      ...activityUpdates,
    };

    this.dailyActivity.set(key, updatedActivity);
    return updatedActivity;
  }

  // Section Settings
  async getSectionSettings(userId: number): Promise<SectionSettings[]> {
    const settings: SectionSettings[] = [];
    for (const [key, setting] of this.sectionSettings.entries()) {
      if (key.startsWith(`${userId}-`)) {
        settings.push(setting);
      }
    }
    return settings.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async updateSectionSettings(
    userId: number,
    sectionName: string,
    settingsUpdates: Partial<SectionSettings>
  ): Promise<SectionSettings | undefined> {
    const key = `${userId}-${sectionName}`;
    const existingSettings = this.sectionSettings.get(key) || {
      id: randomUUID(),
      userId,
      sectionName,
      isVisible: true,
      sortOrder: 0,
    };

    const updatedSettings: SectionSettings = {
      ...existingSettings,
      ...settingsUpdates,
    };

    this.sectionSettings.set(key, updatedSettings);
    return updatedSettings;
  }
}

export class PgStorage implements IStorage {
  public sessionStore: any = null;

  constructor(sessionStore?: any) {
    this.sessionStore = sessionStore;
  }

  // User management for JWT Auth
  async getUserById(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    const result = await db
      .insert(users)
      .values(user)
      .onConflictDoUpdate({
        target: users.email,
        set: {
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result[0];
  }

  // Profile management
  async getProfile(userId: string): Promise<Profile | undefined> {
    const result = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, parseInt(userId)));
    return result[0];
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const result = await db.insert(profiles).values(profile).returning();
    return result[0];
  }

  async updateProfile(
    userId: string,
    profileUpdates: Partial<InsertProfile>
  ): Promise<Profile | undefined> {
    const result = await db
      .update(profiles)
      .set({ ...profileUpdates, updatedAt: new Date() })
      .where(eq(profiles.userId, parseInt(userId)))
      .returning();
    return result[0];
  }

  // Learning and Gamification
  async getLearningModules(): Promise<LearningModule[]> {
    return await db
      .select()
      .from(learningModules)
      .where(eq(learningModules.isActive, true));
  }

  async getLearningModule(id: string): Promise<LearningModule | undefined> {
    const result = await db
      .select()
      .from(learningModules)
      .where(eq(learningModules.id, id));
    return result[0];
  }

  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));
  }

  async getUserProgressForModule(
    userId: number,
    moduleId: string
  ): Promise<UserProgress | undefined> {
    const result = await db
      .select()
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.moduleId, moduleId)
        )
      );
    return result[0];
  }

  async createUserProgress(
    progress: InsertUserProgress
  ): Promise<UserProgress> {
    const result = await db.insert(userProgress).values(progress).returning();
    return result[0];
  }

  async updateUserProgress(
    userId: number,
    moduleId: string,
    progressUpdates: Partial<UserProgress>
  ): Promise<UserProgress | undefined> {
    const result = await db
      .update(userProgress)
      .set(progressUpdates)
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.moduleId, moduleId)
        )
      )
      .returning();
    return result[0];
  }

  async getUserStats(userId: number): Promise<UserStats | undefined> {
    const result = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, userId));
    return result[0];
  }

  async updateUserStats(
    userId: number,
    statsUpdates: Partial<UserStats>
  ): Promise<UserStats | undefined> {
    const result = await db
      .update(userStats)
      .set(statsUpdates)
      .where(eq(userStats.userId, userId))
      .returning();
    return result[0];
  }

  async getDailyActivity(
    userId: number,
    startDate: string,
    endDate: string
  ): Promise<DailyActivity[]> {
    return await db
      .select()
      .from(dailyActivity)
      .where(
        and(
          eq(dailyActivity.userId, userId),
          gte(dailyActivity.date, startDate),
          lte(dailyActivity.date, endDate)
        )
      );
  }

  async createDailyActivity(
    activity: InsertDailyActivity
  ): Promise<DailyActivity> {
    const result = await db.insert(dailyActivity).values(activity).returning();
    return result[0];
  }

  async updateDailyActivity(
    userId: number,
    date: string,
    activityUpdates: Partial<DailyActivity>
  ): Promise<DailyActivity | undefined> {
    const result = await db
      .update(dailyActivity)
      .set(activityUpdates)
      .where(
        and(eq(dailyActivity.userId, userId), eq(dailyActivity.date, date))
      )
      .returning();
    return result[0];
  }

  async getSectionSettings(userId: number): Promise<SectionSettings[]> {
    return await db
      .select()
      .from(sectionSettings)
      .where(eq(sectionSettings.userId, userId));
  }

  async updateSectionSettings(
    userId: number,
    sectionName: string,
    settingsUpdates: Partial<SectionSettings>
  ): Promise<SectionSettings | undefined> {
    const result = await db
      .update(sectionSettings)
      .set(settingsUpdates)
      .where(
        and(
          eq(sectionSettings.userId, userId),
          eq(sectionSettings.sectionName, sectionName)
        )
      )
      .returning();
    return result[0];
  }
}

// Create storage instance
const isProduction = process.env.NODE_ENV === "production";
export const storage: IStorage = isProduction
  ? new PgStorage()
  : new MemStorage();
