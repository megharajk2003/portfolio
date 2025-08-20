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
  createSectionSettings(
    settings: InsertSectionSettings
  ): Promise<SectionSettings>;
  updateSectionSettings(
    userId: number,
    sectionName: string,
    settings: Partial<SectionSettings>
  ): Promise<SectionSettings | undefined>;

  // Portfolio section CRUD operations
  getWorkExperience(userId: string): Promise<any[]>;
  createWorkExperience(data: any): Promise<any>;
  updateWorkExperience(id: string, data: any): Promise<any>;
  deleteWorkExperience(id: string): Promise<boolean>;

  getEducation(userId: string): Promise<any[]>;
  createEducation(data: any): Promise<any>;
  updateEducation(id: string, data: any): Promise<any>;
  deleteEducation(id: string): Promise<boolean>;

  getSkills(userId: string): Promise<any[]>;
  createSkill(data: any): Promise<any>;
  updateSkill(id: string, data: any): Promise<any>;
  deleteSkill(id: string): Promise<boolean>;

  getProjects(userId: string): Promise<any[]>;
  createProject(data: any): Promise<any>;
  updateProject(id: string, data: any): Promise<any>;
  deleteProject(id: string): Promise<boolean>;

  getCertifications(userId: string): Promise<any[]>;
  createCertification(data: any): Promise<any>;
  updateCertification(id: string, data: any): Promise<any>;
  deleteCertification(id: string): Promise<boolean>;

  getAchievements(userId: string): Promise<any[]>;
  createAchievement(data: any): Promise<any>;
  updateAchievement(id: string, data: any): Promise<any>;
  deleteAchievement(id: string): Promise<boolean>;
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

  // Portfolio section storage
  private workExperience: Map<string, any> = new Map();
  private education: Map<string, any> = new Map();
  private skills: Map<string, any> = new Map();
  private projects: Map<string, any> = new Map();
  private certifications: Map<string, any> = new Map();
  private achievements: Map<string, any> = new Map();

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
      id,
      email: user.email,
      password: user.password,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      profileImageUrl: user.profileImageUrl ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(id, newUser);
    this.usersByEmail.set(newUser.email, newUser);
    return newUser;
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    const existingUser = await this.getUserByEmail(user.email);
    if (existingUser) {
      const updatedUser = { ...existingUser, ...user, updatedAt: new Date() };
      this.users.set(existingUser.id, updatedUser);
      this.usersByEmail.set(updatedUser.email, updatedUser);
      return updatedUser;
    }
    return this.createUser(user as InsertUser);
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
    for (const [key, progress] of Array.from(this.userProgress.entries())) {
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
      id,
      userId: progress.userId,
      moduleId: progress.moduleId,
      currentLesson: progress.currentLesson || null,
      isCompleted: progress.isCompleted || null,
      xpEarned: progress.xpEarned || null,
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
    for (const [key, activity] of Array.from(this.dailyActivity.entries())) {
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
      id,
      userId: activity.userId,
      date: activity.date,
      xpEarned: activity.xpEarned || null,
      lessonsCompleted: activity.lessonsCompleted || null,
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
    for (const [key, setting] of Array.from(this.sectionSettings.entries())) {
      if (key.startsWith(`${userId}-`)) {
        settings.push(setting);
      }
    }
    return settings.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
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

  async createSectionSettings(
    settings: InsertSectionSettings
  ): Promise<SectionSettings> {
    const id = randomUUID();
    const newSettings: SectionSettings = {
      id,
      userId: settings.userId,
      sectionName: settings.sectionName,
      isVisible: settings.isVisible || null,
      sortOrder: settings.sortOrder || null,
    };

    this.sectionSettings.set(
      `${settings.userId}-${settings.sectionName}`,
      newSettings
    );
    return newSettings;
  }

  // Portfolio section CRUD implementations
  async getWorkExperience(userId: string): Promise<any[]> {
    const results: any[] = [];
    for (const [key, experience] of Array.from(this.workExperience.entries())) {
      if (key.startsWith(`${userId}-`)) {
        results.push(experience);
      }
    }
    return results;
  }

  async createWorkExperience(data: any): Promise<any> {
    const id = randomUUID();
    const newExperience = { ...data, id };
    this.workExperience.set(`${data.userId}-${id}`, newExperience);
    return newExperience;
  }

  async updateWorkExperience(id: string, data: any): Promise<any> {
    const key = Array.from(this.workExperience.keys()).find((k) =>
      k.endsWith(`-${id}`)
    );
    if (key) {
      const existing = this.workExperience.get(key);
      const updated = { ...existing, ...data };
      this.workExperience.set(key, updated);
      return updated;
    }
    return null;
  }

  async deleteWorkExperience(id: string): Promise<boolean> {
    const key = Array.from(this.workExperience.keys()).find((k) =>
      k.endsWith(`-${id}`)
    );
    if (key) {
      this.workExperience.delete(key);
      return true;
    }
    return false;
  }

  async getEducation(userId: string): Promise<any[]> {
    const results: any[] = [];
    for (const [key, edu] of Array.from(this.education.entries())) {
      if (key.startsWith(`${userId}-`)) {
        results.push(edu);
      }
    }
    return results;
  }

  async createEducation(data: any): Promise<any> {
    const id = randomUUID();
    const newEducation = { ...data, id };
    this.education.set(`${data.userId}-${id}`, newEducation);
    return newEducation;
  }

  async updateEducation(id: string, data: any): Promise<any> {
    const key = Array.from(this.education.keys()).find((k) =>
      k.endsWith(`-${id}`)
    );
    if (key) {
      const existing = this.education.get(key);
      const updated = { ...existing, ...data };
      this.education.set(key, updated);
      return updated;
    }
    return null;
  }

  async deleteEducation(id: string): Promise<boolean> {
    const key = Array.from(this.education.keys()).find((k) =>
      k.endsWith(`-${id}`)
    );
    if (key) {
      this.education.delete(key);
      return true;
    }
    return false;
  }

  async getSkills(userId: string): Promise<any[]> {
    const results: any[] = [];
    for (const [key, skill] of Array.from(this.skills.entries())) {
      if (key.startsWith(`${userId}-`)) {
        results.push(skill);
      }
    }
    return results;
  }

  async createSkill(data: any): Promise<any> {
    const id = randomUUID();
    const newSkill = { ...data, id };
    this.skills.set(`${data.userId}-${id}`, newSkill);
    return newSkill;
  }

  async updateSkill(id: string, data: any): Promise<any> {
    const key = Array.from(this.skills.keys()).find((k) =>
      k.endsWith(`-${id}`)
    );
    if (key) {
      const existing = this.skills.get(key);
      const updated = { ...existing, ...data };
      this.skills.set(key, updated);
      return updated;
    }
    return null;
  }

  async deleteSkill(id: string): Promise<boolean> {
    const key = Array.from(this.skills.keys()).find((k) =>
      k.endsWith(`-${id}`)
    );
    if (key) {
      this.skills.delete(key);
      return true;
    }
    return false;
  }

  async getProjects(userId: string): Promise<any[]> {
    const results: any[] = [];
    for (const [key, project] of Array.from(this.projects.entries())) {
      if (key.startsWith(`${userId}-`)) {
        results.push(project);
      }
    }
    return results;
  }

  async createProject(data: any): Promise<any> {
    const id = randomUUID();
    const newProject = { ...data, id };
    this.projects.set(`${data.userId}-${id}`, newProject);
    return newProject;
  }

  async updateProject(id: string, data: any): Promise<any> {
    const key = Array.from(this.projects.keys()).find((k) =>
      k.endsWith(`-${id}`)
    );
    if (key) {
      const existing = this.projects.get(key);
      const updated = { ...existing, ...data };
      this.projects.set(key, updated);
      return updated;
    }
    return null;
  }

  async deleteProject(id: string): Promise<boolean> {
    const key = Array.from(this.projects.keys()).find((k) =>
      k.endsWith(`-${id}`)
    );
    if (key) {
      this.projects.delete(key);
      return true;
    }
    return false;
  }

  async getCertifications(userId: string): Promise<any[]> {
    const results: any[] = [];
    for (const [key, cert] of Array.from(this.certifications.entries())) {
      if (key.startsWith(`${userId}-`)) {
        results.push(cert);
      }
    }
    return results;
  }

  async createCertification(data: any): Promise<any> {
    const id = randomUUID();
    const newCertification = { ...data, id };
    this.certifications.set(`${data.userId}-${id}`, newCertification);
    return newCertification;
  }

  async updateCertification(id: string, data: any): Promise<any> {
    const key = Array.from(this.certifications.keys()).find((k) =>
      k.endsWith(`-${id}`)
    );
    if (key) {
      const existing = this.certifications.get(key);
      const updated = { ...existing, ...data };
      this.certifications.set(key, updated);
      return updated;
    }
    return null;
  }

  async deleteCertification(id: string): Promise<boolean> {
    const key = Array.from(this.certifications.keys()).find((k) =>
      k.endsWith(`-${id}`)
    );
    if (key) {
      this.certifications.delete(key);
      return true;
    }
    return false;
  }

  async getAchievements(userId: string): Promise<any[]> {
    const results: any[] = [];
    for (const [key, achievement] of Array.from(this.achievements.entries())) {
      if (key.startsWith(`${userId}-`)) {
        results.push(achievement);
      }
    }
    return results;
  }

  async createAchievement(data: any): Promise<any> {
    const id = randomUUID();
    const newAchievement = { ...data, id };
    this.achievements.set(`${data.userId}-${id}`, newAchievement);
    return newAchievement;
  }

  async updateAchievement(id: string, data: any): Promise<any> {
    const key = Array.from(this.achievements.keys()).find((k) =>
      k.endsWith(`-${id}`)
    );
    if (key) {
      const existing = this.achievements.get(key);
      const updated = { ...existing, ...data };
      this.achievements.set(key, updated);
      return updated;
    }
    return null;
  }

  async deleteAchievement(id: string): Promise<boolean> {
    const key = Array.from(this.achievements.keys()).find((k) =>
      k.endsWith(`-${id}`)
    );
    if (key) {
      this.achievements.delete(key);
      return true;
    }
    return false;
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
    const result = await db
      .insert(users)
      .values({
        email: user.email,
        password: user.password,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
      })
      .returning();
    return result[0];
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    const result = await db
      .insert(users)
      .values({
        email: user.email,
        password: user.password || "",
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        profileImageUrl: user.profileImageUrl || null,
      })
      .onConflictDoUpdate({
        target: users.email,
        set: {
          firstName: user.firstName || null,
          lastName: user.lastName || null,
          profileImageUrl: user.profileImageUrl || null,
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

  async createSectionSettings(
    settings: InsertSectionSettings
  ): Promise<SectionSettings> {
    const result = await db
      .insert(sectionSettings)
      .values(settings)
      .returning();
    return result[0];
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

  // Portfolio section CRUD operations - placeholder implementations
  // These would normally access separate tables or profile JSON fields
  async getWorkExperience(userId: string): Promise<any[]> {
    const profile = await this.getProfile(userId);
    return profile?.otherDetails?.workExperience || [];
  }

  async createWorkExperience(data: any): Promise<any> {
    // Placeholder - would normally insert into a separate table
    return { ...data, id: randomUUID() };
  }

  async updateWorkExperience(id: string, data: any): Promise<any> {
    // Placeholder - would normally update in a separate table
    return { ...data, id };
  }

  async deleteWorkExperience(id: string): Promise<boolean> {
    // Placeholder - would normally delete from a separate table
    return true;
  }

  async getEducation(userId: string): Promise<any[]> {
    const profile = await this.getProfile(userId);
    return profile?.otherDetails?.education || [];
  }

  async createEducation(data: any): Promise<any> {
    return { ...data, id: randomUUID() };
  }

  async updateEducation(id: string, data: any): Promise<any> {
    return { ...data, id };
  }

  async deleteEducation(id: string): Promise<boolean> {
    return true;
  }

  async getSkills(userId: string): Promise<any[]> {
    const profile = await this.getProfile(userId);
    return profile?.otherDetails?.skills
      ? Object.values(profile.otherDetails.skills).flat()
      : [];
  }

  async createSkill(data: any): Promise<any> {
    return { ...data, id: randomUUID() };
  }

  async updateSkill(id: string, data: any): Promise<any> {
    return { ...data, id };
  }

  async deleteSkill(id: string): Promise<boolean> {
    return true;
  }

  async getProjects(userId: string): Promise<any[]> {
    const profile = await this.getProfile(userId);
    return profile?.otherDetails?.projects || [];
  }

  async createProject(data: any): Promise<any> {
    return { ...data, id: randomUUID() };
  }

  async updateProject(id: string, data: any): Promise<any> {
    return { ...data, id };
  }

  async deleteProject(id: string): Promise<boolean> {
    return true;
  }

  async getCertifications(userId: string): Promise<any[]> {
    const profile = await this.getProfile(userId);
    return profile?.otherDetails?.certifications || [];
  }

  async createCertification(data: any): Promise<any> {
    return { ...data, id: randomUUID() };
  }

  async updateCertification(id: string, data: any): Promise<any> {
    return { ...data, id };
  }

  async deleteCertification(id: string): Promise<boolean> {
    return true;
  }

  async getAchievements(userId: string): Promise<any[]> {
    const profile = await this.getProfile(userId);
    return profile?.otherDetails?.achievements || [];
  }

  async createAchievement(data: any): Promise<any> {
    return { ...data, id: randomUUID() };
  }

  async updateAchievement(id: string, data: any): Promise<any> {
    return { ...data, id };
  }

  async deleteAchievement(id: string): Promise<boolean> {
    return true;
  }
}

// Create storage instance
const isProduction = process.env.NODE_ENV === "production";
export const storage: IStorage = isProduction
  ? new PgStorage()
  : new MemStorage();
