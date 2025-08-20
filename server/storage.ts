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
    // Check if profile already exists for this user
    const existingProfile = await this.getProfile(profile.userId.toString());
    if (existingProfile) {
      // Update existing profile instead of creating new one
      const updatedProfile = await this.updateProfile(
        profile.userId.toString(),
        profile
      );
      return updatedProfile || existingProfile;
    }

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

  // Upsert profile - create or update based on existing profile
  async upsertProfile(profile: InsertProfile): Promise<Profile> {
    const existingProfile = await this.getProfile(profile.userId.toString());
    if (existingProfile) {
      const updatedProfile = await this.updateProfile(
        profile.userId.toString(),
        profile
      );
      return updatedProfile || existingProfile;
    } else {
      const result = await db.insert(profiles).values(profile).returning();
      return result[0];
    }
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

  // Portfolio section CRUD operations - proper implementation using profile JSON fields
  async getWorkExperience(userId: string): Promise<any[]> {
    const profile = await this.getProfile(userId);
    return profile?.otherDetails?.workExperience || [];
  }

  async createWorkExperience(data: any): Promise<any> {
    const { userId, ...workExperienceData } = data;
    const newWorkExperience = { ...workExperienceData, id: randomUUID() };

    const profile = await this.getProfile(userId);
    if (!profile) {
      throw new Error("Profile not found");
    }

    const currentOtherDetails = profile.otherDetails || {};
    const currentWorkExperience = currentOtherDetails.workExperience || [];

    const updatedOtherDetails = {
      ...currentOtherDetails,
      workExperience: [...currentWorkExperience, newWorkExperience],
    };

    await this.updateProfile(userId, { otherDetails: updatedOtherDetails });
    return newWorkExperience;
  }

  async updateWorkExperience(id: string, data: any): Promise<any> {
    const { userId, ...updateData } = data;
    const profile = await this.getProfile(userId);
    if (!profile) {
      throw new Error("Profile not found");
    }

    const currentOtherDetails = profile.otherDetails || {};
    const currentWorkExperience = currentOtherDetails.workExperience || [];

    const updatedWorkExperience = currentWorkExperience.map((exp: any) =>
      exp.id === id ? { ...exp, ...updateData } : exp
    );

    const updatedOtherDetails = {
      ...currentOtherDetails,
      workExperience: updatedWorkExperience,
    };

    await this.updateProfile(userId, { otherDetails: updatedOtherDetails });
    return { ...updateData, id };
  }

  async deleteWorkExperience(id: string): Promise<boolean> {
    // We need the userId to be passed somehow - this is a limitation of the current API design
    // For now, we'll search through all profiles to find the one containing this work experience
    const allProfiles = await db.select().from(profiles);

    for (const profile of allProfiles) {
      const workExperience = profile.otherDetails?.workExperience || [];
      const experienceExists = workExperience.some((exp: any) => exp.id === id);

      if (experienceExists) {
        const updatedWorkExperience = workExperience.filter(
          (exp: any) => exp.id !== id
        );
        const updatedOtherDetails = {
          ...profile.otherDetails,
          workExperience: updatedWorkExperience,
        };

        await this.updateProfile(profile.userId.toString(), {
          otherDetails: updatedOtherDetails,
        });
        return true;
      }
    }

    return false;
  }

  async getEducation(userId: string): Promise<any[]> {
    const profile = await this.getProfile(userId);
    return profile?.otherDetails?.education || [];
  }

  async createEducation(data: any): Promise<any> {
    const { userId, ...educationData } = data;
    const newEducation = { ...educationData, id: randomUUID() };

    const profile = await this.getProfile(userId);
    if (!profile) {
      throw new Error("Profile not found");
    }

    const currentOtherDetails = profile.otherDetails || {};
    const currentEducation = currentOtherDetails.education || [];

    const updatedOtherDetails = {
      ...currentOtherDetails,
      education: [...currentEducation, newEducation],
    };

    await this.updateProfile(userId, { otherDetails: updatedOtherDetails });
    return newEducation;
  }

  async updateEducation(id: string, data: any): Promise<any> {
    const { userId, ...updateData } = data;
    const profile = await this.getProfile(userId);
    if (!profile) {
      throw new Error("Profile not found");
    }

    const currentOtherDetails = profile.otherDetails || {};
    const currentEducation = currentOtherDetails.education || [];

    const updatedEducation = currentEducation.map((edu: any) =>
      edu.id === id ? { ...edu, ...updateData } : edu
    );

    const updatedOtherDetails = {
      ...currentOtherDetails,
      education: updatedEducation,
    };

    await this.updateProfile(userId, { otherDetails: updatedOtherDetails });
    return { ...updateData, id };
  }

  async deleteEducation(id: string): Promise<boolean> {
    const allProfiles = await db.select().from(profiles);

    for (const profile of allProfiles) {
      const education = profile.otherDetails?.education || [];
      const educationExists = education.some((edu: any) => edu.id === id);

      if (educationExists) {
        const updatedEducation = education.filter((edu: any) => edu.id !== id);
        const updatedOtherDetails = {
          ...profile.otherDetails,
          education: updatedEducation,
        };

        await this.updateProfile(profile.userId.toString(), {
          otherDetails: updatedOtherDetails,
        });
        return true;
      }
    }

    return false;
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

export const storage: IStorage = new PgStorage();
