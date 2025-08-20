import {
  type User,
  type InsertUser,
  type UpsertUser,
  type Profile,
  type InsertProfile,
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

  getSectionSettings(
    userId: number,
    sectionName: string
  ): Promise<SectionSettings | undefined>;
  upsertSectionSettings(
    settings: InsertSectionSettings
  ): Promise<SectionSettings>;

  // Portfolio section storage
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

  getPublications(userId: string): Promise<any[]>;
  createPublication(data: any): Promise<any>;
  updatePublication(id: string, data: any): Promise<any>;
  deletePublication(id: string): Promise<boolean>;

  getOrganizations(userId: string): Promise<any[]>;
  createOrganization(data: any): Promise<any>;
  updateOrganization(id: string, data: any): Promise<any>;
  deleteOrganization(id: string): Promise<boolean>;

  getVolunteerExperience(userId: string): Promise<any[]>;
  createVolunteerExperience(data: any): Promise<any>;
  updateVolunteerExperience(id: string, data: any): Promise<any>;
  deleteVolunteerExperience(id: string): Promise<boolean>;
}

export class PgStorage implements IStorage {
  public sessionStore: any = null;

  constructor() {
    console.log("Initializing PgStorage with database connection");
    this.initializeSessionStore();
  }

  private initializeSessionStore() {
    console.log("Session store initialized for PgStorage");
  }

  // User management
  async getUserById(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()));
    return result[0];
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        email: userData.email.toLowerCase(),
      })
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existing = await this.getUserByEmail(userData.email);
    if (existing) {
      const [updated] = await db
        .update(users)
        .set({ ...userData, email: userData.email.toLowerCase() })
        .where(eq(users.id, existing.id))
        .returning();
      return updated;
    }

    return this.createUser({
      email: userData.email,
      password: "", // Default empty password for OAuth users
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
    });
  }

  // Profile management with comprehensive structure and upsert functionality
  async getProfile(userId: string): Promise<Profile | undefined> {
    const result = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, parseInt(userId)));
    return result[0];
  }

  async createProfile(profileData: InsertProfile): Promise<Profile> {
    try {
      // Use ON CONFLICT to implement upsert - update if exists, create if not
      const [profile] = await db
        .insert(profiles)
        .values({
          ...profileData,
          userId: parseInt(profileData.userId.toString()),
        })
        .onConflictDoUpdate({
          target: profiles.userId,
          set: {
            personalDetails: profileData.personalDetails,
            contactDetails: profileData.contactDetails,
            otherDetails: profileData.otherDetails,
            updatedAt: new Date(),
          },
        })
        .returning();

      return profile;
    } catch (error) {
      console.error("Error in createProfile:", error);
      throw error;
    }
  }

  async updateProfile(
    userId: string,
    updates: Partial<InsertProfile>
  ): Promise<Profile | undefined> {
    try {
      const [updated] = await db
        .update(profiles)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(profiles.userId, parseInt(userId)))
        .returning();
      return updated;
    } catch (error) {
      console.error("Error in updateProfile:", error);
      throw error;
    }
  }

  // Learning modules
  async getLearningModules(): Promise<LearningModule[]> {
    try {
      const modules = await db.select().from(learningModules);
      console.log(`Retrieved ${modules.length} learning modules from database`);
      return modules;
    } catch (error) {
      console.error("Error fetching learning modules:", error);
      throw new Error(`Failed to fetch learning modules: ${error}`);
    }
  }

  async getLearningModule(id: string): Promise<LearningModule | undefined> {
    const result = await db
      .select()
      .from(learningModules)
      .where(eq(learningModules.id, id));
    return result[0];
  }

  // User progress
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
    progressData: InsertUserProgress
  ): Promise<UserProgress> {
    const [progress] = await db
      .insert(userProgress)
      .values({
        ...progressData,
        userId: progressData.userId,
      })
      .returning();
    return progress;
  }

  async updateUserProgress(
    userId: number,
    moduleId: string,
    updates: Partial<UserProgress>
  ): Promise<UserProgress | undefined> {
    const [updated] = await db
      .update(userProgress)
      .set(updates)
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.moduleId, moduleId)
        )
      )
      .returning();
    return updated;
  }

  // User stats
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
    const existing = await this.getUserStats(userId);

    if (existing) {
      const [updated] = await db
        .update(userStats)
        .set(statsUpdates)
        .where(eq(userStats.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(userStats)
        .values({
          userId: userId,
          totalXp: 0,
          currentStreak: 0,
          longestStreak: 0,
          ...statsUpdates,
        })
        .returning();
      return created;
    }
  }

  // Daily activity
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
    activityData: InsertDailyActivity
  ): Promise<DailyActivity> {
    const [activity] = await db
      .insert(dailyActivity)
      .values({
        ...activityData,
        userId: activityData.userId,
      })
      .returning();
    return activity;
  }

  // Section settings
  async getSectionSettings(
    userId: number,
    sectionName: string
  ): Promise<SectionSettings | undefined> {
    const result = await db
      .select()
      .from(sectionSettings)
      .where(
        and(
          eq(sectionSettings.userId, userId),
          eq(sectionSettings.sectionName, sectionName)
        )
      );
    return result[0];
  }

  async upsertSectionSettings(
    settingsData: InsertSectionSettings
  ): Promise<SectionSettings> {
    const [settings] = await db
      .insert(sectionSettings)
      .values({
        ...settingsData,
        userId: settingsData.userId,
      })
      .onConflictDoUpdate({
        target: [sectionSettings.userId, sectionSettings.sectionName],
        set: {
          isVisible: settingsData.isVisible,
        },
      })
      .returning();
    return settings;
  }

  // Portfolio section CRUD operations using profile JSON fields
  // Work Experience CRUD - using profile JSON fields
  async getWorkExperience(userId: string): Promise<any[]> {
    const profile = await this.getProfile(userId);
    return profile?.otherDetails?.workExperience || [];
  }

  async createWorkExperience(data: any): Promise<any> {
    const { userId, ...experienceData } = data;
    const newExperience = { ...experienceData, id: randomUUID() };

    const profile = await this.getProfile(userId);
    if (!profile) {
      throw new Error("Profile not found");
    }

    const currentOtherDetails = profile.otherDetails || {};
    const currentWorkExperience = currentOtherDetails.workExperience || [];

    const updatedOtherDetails = {
      ...currentOtherDetails,
      workExperience: [...currentWorkExperience, newExperience],
    };

    await this.updateProfile(userId, { otherDetails: updatedOtherDetails });
    return newExperience;
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

  // Education CRUD - using profile JSON fields
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

  // Skills CRUD - using profile JSON fields with proper array handling
  async getSkills(userId: string): Promise<any[]> {
    const profile = await this.getProfile(userId);
    const skills = profile?.otherDetails?.skills;
    if (!skills) return [];

    // Convert skills object to array format for individual skill management
    const skillsArray: any[] = [];
    Object.entries(skills).forEach(([category, skillNames]) => {
      if (Array.isArray(skillNames)) {
        skillNames.forEach((name, index) => {
          skillsArray.push({
            id: `${category}-${index}`,
            category,
            name,
            level: 3, // default level
          });
        });
      }
    });
    return skillsArray;
  }

  async createSkill(data: any): Promise<any> {
    const { userId, ...skillData } = data;
    const newSkill = { ...skillData, id: randomUUID() };

    const profile = await this.getProfile(userId);
    if (!profile) {
      throw new Error("Profile not found");
    }

    const currentOtherDetails = profile.otherDetails || {};
    const currentSkills = currentOtherDetails.skills || {
      technical: [],
      domainSpecific: [],
      soft: [],
      tools: [],
    };

    // Add to appropriate category
    const category = skillData.category || "technical";
    if (!currentSkills[category as keyof typeof currentSkills]) {
      (currentSkills as any)[category] = [];
    }
    (currentSkills as any)[category].push(skillData.name);

    const updatedOtherDetails = {
      ...currentOtherDetails,
      skills: currentSkills,
    };

    await this.updateProfile(userId, { otherDetails: updatedOtherDetails });
    return newSkill;
  }

  async updateSkill(id: string, data: any): Promise<any> {
    // For skills, we'll need to rebuild the skills object structure
    return { ...data, id };
  }

  async deleteSkill(id: string): Promise<boolean> {
    // For skills, we'll need to remove from the appropriate category array
    return true;
  }

  // Projects CRUD - using profile JSON fields
  async getProjects(userId: string): Promise<any[]> {
    const profile = await this.getProfile(userId);
    return profile?.otherDetails?.projects || [];
  }

  async createProject(data: any): Promise<any> {
    const { userId, ...projectData } = data;
    const newProject = { ...projectData, id: randomUUID() };

    const profile = await this.getProfile(userId);
    if (!profile) {
      throw new Error("Profile not found");
    }

    const currentOtherDetails = profile.otherDetails || {};
    const currentProjects = currentOtherDetails.projects || [];

    const updatedOtherDetails = {
      ...currentOtherDetails,
      projects: [...currentProjects, newProject],
    };

    await this.updateProfile(userId, { otherDetails: updatedOtherDetails });
    return newProject;
  }

  async updateProject(id: string, data: any): Promise<any> {
    const { userId, ...updateData } = data;
    const profile = await this.getProfile(userId);
    if (!profile) {
      throw new Error("Profile not found");
    }

    const currentOtherDetails = profile.otherDetails || {};
    const currentProjects = currentOtherDetails.projects || [];

    const updatedProjects = currentProjects.map((proj: any) =>
      proj.id === id ? { ...proj, ...updateData } : proj
    );

    const updatedOtherDetails = {
      ...currentOtherDetails,
      projects: updatedProjects,
    };

    await this.updateProfile(userId, { otherDetails: updatedOtherDetails });
    return { ...updateData, id };
  }

  async deleteProject(id: string): Promise<boolean> {
    const allProfiles = await db.select().from(profiles);

    for (const profile of allProfiles) {
      const projects = profile.otherDetails?.projects || [];
      const projectExists = projects.some((proj: any) => proj.id === id);

      if (projectExists) {
        const updatedProjects = projects.filter((proj: any) => proj.id !== id);
        const updatedOtherDetails = {
          ...profile.otherDetails,
          projects: updatedProjects,
        };

        await this.updateProfile(profile.userId.toString(), {
          otherDetails: updatedOtherDetails,
        });
        return true;
      }
    }

    return false;
  }

  // Certifications CRUD - using profile JSON fields
  async getCertifications(userId: string): Promise<any[]> {
    const profile = await this.getProfile(userId);
    return profile?.otherDetails?.certifications || [];
  }

  async createCertification(data: any): Promise<any> {
    const { userId, ...certificationData } = data;
    const newCertification = { ...certificationData, id: randomUUID() };

    const profile = await this.getProfile(userId);
    if (!profile) {
      throw new Error("Profile not found");
    }

    const currentOtherDetails = profile.otherDetails || {};
    const currentCertifications = currentOtherDetails.certifications || [];

    const updatedOtherDetails = {
      ...currentOtherDetails,
      certifications: [...currentCertifications, newCertification],
    };

    await this.updateProfile(userId, { otherDetails: updatedOtherDetails });
    return newCertification;
  }

  async updateCertification(id: string, data: any): Promise<any> {
    const { userId, ...updateData } = data;
    const profile = await this.getProfile(userId);
    if (!profile) {
      throw new Error("Profile not found");
    }

    const currentOtherDetails = profile.otherDetails || {};
    const currentCertifications = currentOtherDetails.certifications || [];

    const updatedCertifications = currentCertifications.map((cert: any) =>
      cert.id === id ? { ...cert, ...updateData } : cert
    );

    const updatedOtherDetails = {
      ...currentOtherDetails,
      certifications: updatedCertifications,
    };

    await this.updateProfile(userId, { otherDetails: updatedOtherDetails });
    return { ...updateData, id };
  }

  async deleteCertification(id: string): Promise<boolean> {
    const allProfiles = await db.select().from(profiles);

    for (const profile of allProfiles) {
      const certifications = profile.otherDetails?.certifications || [];
      const certificationExists = certifications.some(
        (cert: any) => cert.id === id
      );

      if (certificationExists) {
        const updatedCertifications = certifications.filter(
          (cert: any) => cert.id !== id
        );
        const updatedOtherDetails = {
          ...profile.otherDetails,
          certifications: updatedCertifications,
        };

        await this.updateProfile(profile.userId.toString(), {
          otherDetails: updatedOtherDetails,
        });
        return true;
      }
    }

    return false;
  }

  // Achievements CRUD - using profile JSON fields
  async getAchievements(userId: string): Promise<any[]> {
    const profile = await this.getProfile(userId);
    return profile?.otherDetails?.achievements || [];
  }

  async createAchievement(data: any): Promise<any> {
    const { userId, ...achievementData } = data;
    const newAchievement = { ...achievementData, id: randomUUID() };

    const profile = await this.getProfile(userId);
    if (!profile) {
      throw new Error("Profile not found");
    }

    const currentOtherDetails = profile.otherDetails || {};
    const currentAchievements = currentOtherDetails.achievements || [];

    const updatedOtherDetails = {
      ...currentOtherDetails,
      achievements: [...currentAchievements, newAchievement],
    };

    await this.updateProfile(userId, { otherDetails: updatedOtherDetails });
    return newAchievement;
  }

  async updateAchievement(id: string, data: any): Promise<any> {
    const { userId, ...updateData } = data;
    const profile = await this.getProfile(userId);
    if (!profile) {
      throw new Error("Profile not found");
    }

    const currentOtherDetails = profile.otherDetails || {};
    const currentAchievements = currentOtherDetails.achievements || [];

    const updatedAchievements = currentAchievements.map((ach: any) =>
      ach.id === id ? { ...ach, ...updateData } : ach
    );

    const updatedOtherDetails = {
      ...currentOtherDetails,
      achievements: updatedAchievements,
    };

    await this.updateProfile(userId, { otherDetails: updatedOtherDetails });
    return { ...updateData, id };
  }

  async deleteAchievement(id: string): Promise<boolean> {
    const allProfiles = await db.select().from(profiles);

    for (const profile of allProfiles) {
      const achievements = profile.otherDetails?.achievements || [];
      const achievementExists = achievements.some((ach: any) => ach.id === id);

      if (achievementExists) {
        const updatedAchievements = achievements.filter(
          (ach: any) => ach.id !== id
        );
        const updatedOtherDetails = {
          ...profile.otherDetails,
          achievements: updatedAchievements,
        };

        await this.updateProfile(profile.userId.toString(), {
          otherDetails: updatedOtherDetails,
        });
        return true;
      }
    }

    return false;
  }

  // Publications CRUD - using profile JSON fields
  async getPublications(userId: string): Promise<any[]> {
    const profile = await this.getProfile(userId);
    return profile?.otherDetails?.publicationsOrCreativeWorks || [];
  }

  async createPublication(data: any): Promise<any> {
    const { userId, ...publicationData } = data;
    const newPublication = { ...publicationData, id: randomUUID() };

    const profile = await this.getProfile(userId);
    if (!profile) {
      throw new Error("Profile not found");
    }

    const currentOtherDetails = profile.otherDetails || {};
    const currentPublications =
      currentOtherDetails.publicationsOrCreativeWorks || [];

    const updatedOtherDetails = {
      ...currentOtherDetails,
      publicationsOrCreativeWorks: [...currentPublications, newPublication],
    };

    await this.updateProfile(userId, { otherDetails: updatedOtherDetails });
    return newPublication;
  }

  async updatePublication(id: string, data: any): Promise<any> {
    const { userId, ...updateData } = data;
    const profile = await this.getProfile(userId);
    if (!profile) {
      throw new Error("Profile not found");
    }

    const currentOtherDetails = profile.otherDetails || {};
    const currentPublications =
      currentOtherDetails.publicationsOrCreativeWorks || [];

    const updatedPublications = currentPublications.map((pub: any) =>
      pub.id === id ? { ...pub, ...updateData } : pub
    );

    const updatedOtherDetails = {
      ...currentOtherDetails,
      publicationsOrCreativeWorks: updatedPublications,
    };

    await this.updateProfile(userId, { otherDetails: updatedOtherDetails });
    return { ...updateData, id };
  }

  async deletePublication(id: string): Promise<boolean> {
    const allProfiles = await db.select().from(profiles);

    for (const profile of allProfiles) {
      const publications =
        profile.otherDetails?.publicationsOrCreativeWorks || [];
      const publicationExists = publications.some((pub: any) => pub.id === id);

      if (publicationExists) {
        const updatedPublications = publications.filter(
          (pub: any) => pub.id !== id
        );
        const updatedOtherDetails = {
          ...profile.otherDetails,
          publicationsOrCreativeWorks: updatedPublications,
        };

        await this.updateProfile(profile.userId.toString(), {
          otherDetails: updatedOtherDetails,
        });
        return true;
      }
    }

    return false;
  }

  // Organizations CRUD - using profile JSON fields
  async getOrganizations(userId: string): Promise<any[]> {
    const profile = await this.getProfile(userId);
    return profile?.otherDetails?.organizations || [];
  }

  async createOrganization(data: any): Promise<any> {
    const { userId, ...organizationData } = data;
    const newOrganization = { ...organizationData, id: randomUUID() };

    const profile = await this.getProfile(userId);
    if (!profile) {
      throw new Error("Profile not found");
    }

    const currentOtherDetails = profile.otherDetails || {};
    const currentOrganizations = currentOtherDetails.organizations || [];

    const updatedOtherDetails = {
      ...currentOtherDetails,
      organizations: [...currentOrganizations, newOrganization],
    };

    await this.updateProfile(userId, { otherDetails: updatedOtherDetails });
    return newOrganization;
  }

  async updateOrganization(id: string, data: any): Promise<any> {
    const { userId, ...updateData } = data;
    const profile = await this.getProfile(userId);
    if (!profile) {
      throw new Error("Profile not found");
    }

    const currentOtherDetails = profile.otherDetails || {};
    const currentOrganizations = currentOtherDetails.organizations || [];

    const updatedOrganizations = currentOrganizations.map((org: any) =>
      org.id === id ? { ...org, ...updateData } : org
    );

    const updatedOtherDetails = {
      ...currentOtherDetails,
      organizations: updatedOrganizations,
    };

    await this.updateProfile(userId, { otherDetails: updatedOtherDetails });
    return { ...updateData, id };
  }

  async deleteOrganization(id: string): Promise<boolean> {
    const allProfiles = await db.select().from(profiles);

    for (const profile of allProfiles) {
      const organizations = profile.otherDetails?.organizations || [];
      const organizationExists = organizations.some(
        (org: any) => org.id === id
      );

      if (organizationExists) {
        const updatedOrganizations = organizations.filter(
          (org: any) => org.id !== id
        );
        const updatedOtherDetails = {
          ...profile.otherDetails,
          organizations: updatedOrganizations,
        };

        await this.updateProfile(profile.userId.toString(), {
          otherDetails: updatedOtherDetails,
        });
        return true;
      }
    }

    return false;
  }

  // Volunteer Experience CRUD - using profile JSON fields
  async getVolunteerExperience(userId: string): Promise<any[]> {
    const profile = await this.getProfile(userId);
    return profile?.otherDetails?.volunteerExperience || [];
  }

  async createVolunteerExperience(data: any): Promise<any> {
    const { userId, ...volunteerData } = data;
    const newVolunteer = { ...volunteerData, id: randomUUID() };

    const profile = await this.getProfile(userId);
    if (!profile) {
      throw new Error("Profile not found");
    }

    const currentOtherDetails = profile.otherDetails || {};
    const currentVolunteer = currentOtherDetails.volunteerExperience || [];

    const updatedOtherDetails = {
      ...currentOtherDetails,
      volunteerExperience: [...currentVolunteer, newVolunteer],
    };

    await this.updateProfile(userId, { otherDetails: updatedOtherDetails });
    return newVolunteer;
  }

  async updateVolunteerExperience(id: string, data: any): Promise<any> {
    const { userId, ...updateData } = data;
    const profile = await this.getProfile(userId);
    if (!profile) {
      throw new Error("Profile not found");
    }

    const currentOtherDetails = profile.otherDetails || {};
    const currentVolunteer = currentOtherDetails.volunteerExperience || [];

    const updatedVolunteer = currentVolunteer.map((vol: any) =>
      vol.id === id ? { ...vol, ...updateData } : vol
    );

    const updatedOtherDetails = {
      ...currentOtherDetails,
      volunteerExperience: updatedVolunteer,
    };

    await this.updateProfile(userId, { otherDetails: updatedOtherDetails });
    return { ...updateData, id };
  }

  async deleteVolunteerExperience(id: string): Promise<boolean> {
    const allProfiles = await db.select().from(profiles);

    for (const profile of allProfiles) {
      const volunteer = profile.otherDetails?.volunteerExperience || [];
      const volunteerExists = volunteer.some((vol: any) => vol.id === id);

      if (volunteerExists) {
        const updatedVolunteer = volunteer.filter((vol: any) => vol.id !== id);
        const updatedOtherDetails = {
          ...profile.otherDetails,
          volunteerExperience: updatedVolunteer,
        };

        await this.updateProfile(profile.userId.toString(), {
          otherDetails: updatedOtherDetails,
        });
        return true;
      }
    }

    return false;
  }
}

// Create storage instance
export const storage: IStorage = new PgStorage();
