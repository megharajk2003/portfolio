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
  education,
  skills,
  projects,
  workExperience,
  certifications,
  achievements,
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
  private isDbConnected: boolean = false;
  private fallbackData: Map<string, any> = new Map();

  constructor() {
    console.log("Initializing PgStorage with database connection");
    this.initializeSessionStore();
    this.checkDbConnection();
  }

  private async checkDbConnection() {
    try {
      await db.select().from(users).limit(1);
      this.isDbConnected = true;
      console.log("Database connection established");
    } catch (error) {
      this.isDbConnected = false;
      console.log("Database not available, using in-memory fallback storage");
    }
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
  // Work Experience CRUD - using dedicated PostgreSQL table
  async getWorkExperience(userId: string): Promise<any[]> {
    try {
      const workExperienceRecords = await db
        .select()
        .from(workExperience)
        .where(eq(workExperience.userId, parseInt(userId)));
      console.log(
        `Retrieved ${workExperienceRecords.length} work experience records from database`
      );
      return workExperienceRecords;
    } catch (error) {
      console.log(
        "Database error, using fallback storage for getWorkExperience"
      );
      const key = `workExperience_${userId}`;
      return this.fallbackData.get(key) || [];
    }
  }

  async createWorkExperience(data: any): Promise<any> {
    const { userId, ...experienceData } = data;

    try {
      console.log("Attempting to create work experience record:", {
        userId: parseInt(userId),
        ...experienceData,
      });

      const [newExperience] = await db
        .insert(workExperience)
        .values({
          userId: parseInt(userId),
          ...experienceData,
        })
        .returning();
      console.log("Created work experience record in database:", newExperience);
      return newExperience;
    } catch (error) {
      console.error("Database error in createWorkExperience:", error);
      console.log("Using fallback storage for createWorkExperience");
      const newExperience = {
        ...experienceData,
        id: randomUUID(),
        userId: parseInt(userId),
      };
      const key = `workExperience_${userId}`;
      const currentExperience = this.fallbackData.get(key) || [];
      this.fallbackData.set(key, [...currentExperience, newExperience]);
      console.log(
        "Created work experience entry in fallback storage:",
        newExperience
      );
      return newExperience;
    }
  }

  async updateWorkExperience(id: string, data: any): Promise<any> {
    const { userId, ...updateData } = data;

    try {
      console.log(`💼 STORAGE updateWorkExperience - Received data for ID ${id}:`, data);
      console.log(`💼 STORAGE updateWorkExperience - UpdateData after removing userId:`, updateData);
      
      const [updatedExperience] = await db
        .update(workExperience)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(workExperience.id, id))
        .returning();

      if (!updatedExperience) {
        throw new Error("Work experience record not found");
      }

      console.log(
        "💼 STORAGE updateWorkExperience - Updated work experience record in database:",
        updatedExperience
      );
      return updatedExperience;
    } catch (error) {
      console.log(
        "Database error, using fallback storage for updateWorkExperience"
      );
      const key = `workExperience_${userId}`;
      const currentExperience = this.fallbackData.get(key) || [];
      const updatedExperience = currentExperience.map((exp: any) =>
        exp.id === id ? { ...exp, ...updateData } : exp
      );
      this.fallbackData.set(key, updatedExperience);
      return { ...updateData, id };
    }
  }

  async deleteWorkExperience(id: string): Promise<boolean> {
    try {
      const deletedExperience = await db
        .delete(workExperience)
        .where(eq(workExperience.id, id))
        .returning();

      if (deletedExperience.length === 0) {
        return false;
      }

      console.log(
        "Deleted work experience record from database:",
        deletedExperience[0]
      );
      return true;
    } catch (error) {
      console.log(
        "Database error, using fallback storage for deleteWorkExperience"
      );
      const entries = Array.from(this.fallbackData.entries());
      for (const [key, experienceList] of entries) {
        if (
          key.startsWith("workExperience_") &&
          Array.isArray(experienceList)
        ) {
          const experienceExists = experienceList.some(
            (exp: any) => exp.id === id
          );
          if (experienceExists) {
            const updatedExperience = experienceList.filter(
              (exp: any) => exp.id !== id
            );
            this.fallbackData.set(key, updatedExperience);
            console.log(
              "Deleted work experience entry from fallback storage:",
              id
            );
            return true;
          }
        }
      }
      return false;
    }
  }

  // Education CRUD - using dedicated PostgreSQL table with fallback to profile JSONB
  async getEducation(userId: string): Promise<any[]> {
    try {
      // First try to get from dedicated education table
      const educationRecords = await db
        .select()
        .from(education)
        .where(eq(education.userId, parseInt(userId)));
      
      console.log(
        `Retrieved ${educationRecords.length} education records from dedicated table`
      );
      
      // If no records in dedicated table, try to get from profile's otherDetails
      if (educationRecords.length === 0) {
        const profile = await this.getProfile(userId);
        if (profile?.otherDetails?.education && Array.isArray(profile.otherDetails.education)) {
          console.log(
            `Retrieved ${profile.otherDetails.education.length} education records from profile JSONB`
          );
          return profile.otherDetails.education;
        }
      }
      
      return educationRecords;
    } catch (error) {
      console.log("Database error, using fallback storage for getEducation");
      const key = `education_${userId}`;
      return this.fallbackData.get(key) || [];
    }
  }

  async createEducation(data: any): Promise<any> {
    const { userId, ...educationData } = data;

    try {
      console.log("Attempting to create education record:", {
        userId: parseInt(userId),
        ...educationData,
      });

      const [newEducation] = await db
        .insert(education)
        .values({
          userId: parseInt(userId),
          ...educationData,
        })
        .returning();
      console.log("Created education record in database:", newEducation);
      return newEducation;
    } catch (error) {
      console.error("Database error in createEducation:", error);
      console.log("Using fallback storage for createEducation");
      const newEducation = {
        ...educationData,
        id: randomUUID(),
        userId: parseInt(userId),
      };
      const key = `education_${userId}`;
      const currentEducation = this.fallbackData.get(key) || [];
      this.fallbackData.set(key, [...currentEducation, newEducation]);
      console.log("Created education entry in fallback storage:", newEducation);
      return newEducation;
    }
  }

  async updateEducation(id: string, data: any): Promise<any> {
    const { userId, ...updateData } = data;

    try {
      const [updatedEducation] = await db
        .update(education)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(education.id, id))
        .returning();

      if (!updatedEducation) {
        throw new Error("Education record not found");
      }

      console.log("Updated education record in database:", updatedEducation);
      return updatedEducation;
    } catch (error) {
      console.log("Database error, using fallback storage for updateEducation");
      const key = `education_${userId}`;
      const currentEducation = this.fallbackData.get(key) || [];
      const updatedEducation = currentEducation.map((edu: any) =>
        edu.id === id ? { ...edu, ...updateData } : edu
      );
      this.fallbackData.set(key, updatedEducation);
      console.log("Updated education entry in fallback storage:", {
        id,
        ...updateData,
      });
      return { ...updateData, id };
    }
  }

  async deleteEducation(id: string): Promise<boolean> {
    try {
      const deletedEducation = await db
        .delete(education)
        .where(eq(education.id, id))
        .returning();

      if (deletedEducation.length === 0) {
        return false;
      }

      console.log(
        "Deleted education record from database:",
        deletedEducation[0]
      );
      return true;
    } catch (error) {
      console.log("Database error, using fallback storage for deleteEducation");
      // Search through all user education data in fallback storage
      const entries = Array.from(this.fallbackData.entries());
      for (const [key, educationList] of entries) {
        if (key.startsWith("education_") && Array.isArray(educationList)) {
          const educationExists = educationList.some(
            (edu: any) => edu.id === id
          );
          if (educationExists) {
            const updatedEducation = educationList.filter(
              (edu: any) => edu.id !== id
            );
            this.fallbackData.set(key, updatedEducation);
            console.log("Deleted education entry from fallback storage:", id);
            return true;
          }
        }
      }
      return false;
    }
  }

  // Skills CRUD - using dedicated PostgreSQL table
  async getSkills(userId: string): Promise<any[]> {
    try {
      const skillsRecords = await db
        .select()
        .from(skills)
        .where(eq(skills.userId, parseInt(userId)));
      console.log(
        `Retrieved ${skillsRecords.length} skills records from database`
      );
      return skillsRecords;
    } catch (error) {
      console.log("Database error, using fallback storage for getSkills");
      const key = `skills_${userId}`;
      return this.fallbackData.get(key) || [];
    }
  }

  async createSkill(data: any): Promise<any> {
    const { userId, ...skillData } = data;

    try {
      console.log("Attempting to create skill record:", {
        userId: parseInt(userId),
        ...skillData,
      });

      const [newSkill] = await db
        .insert(skills)
        .values({
          userId: parseInt(userId),
          ...skillData,
        })
        .returning();
      console.log("Created skill record in database:", newSkill);
      return newSkill;
    } catch (error) {
      console.error("Database error in createSkill:", error);
      console.log("Using fallback storage for createSkill");
      const newSkill = {
        ...skillData,
        id: randomUUID(),
        userId: parseInt(userId),
      };
      const key = `skills_${userId}`;
      const currentSkills = this.fallbackData.get(key) || [];
      this.fallbackData.set(key, [...currentSkills, newSkill]);
      console.log("Created skill entry in fallback storage:", newSkill);
      return newSkill;
    }
  }

  async updateSkill(id: string, data: any): Promise<any> {
    const { userId, ...updateData } = data;

    try {
      const [updatedSkill] = await db
        .update(skills)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(skills.id, id))
        .returning();

      if (!updatedSkill) {
        throw new Error("Skill record not found");
      }

      console.log("Updated skill record in database:", updatedSkill);
      return updatedSkill;
    } catch (error) {
      console.log("Database error, using fallback storage for updateSkill");
      const key = `skills_${userId}`;
      const currentSkills = this.fallbackData.get(key) || [];
      const updatedSkills = currentSkills.map((skill: any) =>
        skill.id === id ? { ...skill, ...updateData } : skill
      );
      this.fallbackData.set(key, updatedSkills);
      return { ...updateData, id };
    }
  }

  async deleteSkill(id: string): Promise<boolean> {
    try {
      const deletedSkill = await db
        .delete(skills)
        .where(eq(skills.id, id))
        .returning();

      if (deletedSkill.length === 0) {
        return false;
      }

      console.log("Deleted skill record from database:", deletedSkill[0]);
      return true;
    } catch (error) {
      console.log("Database error, using fallback storage for deleteSkill");
      const entries = Array.from(this.fallbackData.entries());
      for (const [key, skillsList] of entries) {
        if (key.startsWith("skills_") && Array.isArray(skillsList)) {
          const skillExists = skillsList.some((skill: any) => skill.id === id);
          if (skillExists) {
            const updatedSkills = skillsList.filter(
              (skill: any) => skill.id !== id
            );
            this.fallbackData.set(key, updatedSkills);
            console.log("Deleted skill entry from fallback storage:", id);
            return true;
          }
        }
      }
      return false;
    }
  }

  // Projects CRUD - using dedicated PostgreSQL table
  async getProjects(userId: string): Promise<any[]> {
    try {
      const projectsRecords = await db
        .select()
        .from(projects)
        .where(eq(projects.userId, parseInt(userId)));
      console.log(
        `Retrieved ${projectsRecords.length} projects records from database`
      );
      return projectsRecords;
    } catch (error) {
      console.log("Database error, using fallback storage for getProjects");
      const key = `projects_${userId}`;
      return this.fallbackData.get(key) || [];
    }
  }

  async createProject(data: any): Promise<any> {
    const { userId, ...projectData } = data;

    try {
      console.log("Attempting to create project record:", {
        userId: parseInt(userId),
        ...projectData,
      });

      const [newProject] = await db
        .insert(projects)
        .values({
          userId: parseInt(userId),
          ...projectData,
        })
        .returning();
      console.log("Created project record in database:", newProject);
      return newProject;
    } catch (error) {
      console.error("Database error in createProject:", error);
      console.log("Using fallback storage for createProject");
      const newProject = {
        ...projectData,
        id: randomUUID(),
        userId: parseInt(userId),
      };
      const key = `projects_${userId}`;
      const currentProjects = this.fallbackData.get(key) || [];
      this.fallbackData.set(key, [...currentProjects, newProject]);
      console.log("Created project entry in fallback storage:", newProject);
      return newProject;
    }
  }

  async updateProject(id: string, data: any): Promise<any> {
    const { userId, ...updateData } = data;

    try {
      const [updatedProject] = await db
        .update(projects)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(projects.id, id))
        .returning();

      if (!updatedProject) {
        throw new Error("Project record not found");
      }

      console.log("Updated project record in database:", updatedProject);
      return updatedProject;
    } catch (error) {
      console.log("Database error, using fallback storage for updateProject");
      const key = `projects_${userId}`;
      const currentProjects = this.fallbackData.get(key) || [];
      const updatedProjects = currentProjects.map((proj: any) =>
        proj.id === id ? { ...proj, ...updateData } : proj
      );
      this.fallbackData.set(key, updatedProjects);
      return { ...updateData, id };
    }
  }

  async deleteProject(id: string): Promise<boolean> {
    try {
      const deletedProject = await db
        .delete(projects)
        .where(eq(projects.id, id))
        .returning();

      if (deletedProject.length === 0) {
        return false;
      }

      console.log("Deleted project record from database:", deletedProject[0]);
      return true;
    } catch (error) {
      console.log("Database error, using fallback storage for deleteProject");
      const entries = Array.from(this.fallbackData.entries());
      for (const [key, projectsList] of entries) {
        if (key.startsWith("projects_") && Array.isArray(projectsList)) {
          const projectExists = projectsList.some(
            (proj: any) => proj.id === id
          );
          if (projectExists) {
            const updatedProjects = projectsList.filter(
              (proj: any) => proj.id !== id
            );
            this.fallbackData.set(key, updatedProjects);
            console.log("Deleted project entry from fallback storage:", id);
            return true;
          }
        }
      }
      return false;
    }
  }

  // Certifications CRUD - using dedicated PostgreSQL table
  async getCertifications(userId: string): Promise<any[]> {
    try {
      const certificationsRecords = await db
        .select()
        .from(certifications)
        .where(eq(certifications.userId, parseInt(userId)));
      console.log(
        `Retrieved ${certificationsRecords.length} certifications records from database`
      );
      return certificationsRecords;
    } catch (error) {
      console.log(
        "Database error, using fallback storage for getCertifications"
      );
      const key = `certifications_${userId}`;
      return this.fallbackData.get(key) || [];
    }
  }

  async createCertification(data: any): Promise<any> {
    const { userId, ...certificationData } = data;

    try {
      console.log("Attempting to create certification record:", {
        userId: parseInt(userId),
        ...certificationData,
      });

      const [newCertification] = await db
        .insert(certifications)
        .values({
          userId: parseInt(userId),
          ...certificationData,
        })
        .returning();
      console.log(
        "Created certification record in database:",
        newCertification
      );
      return newCertification;
    } catch (error) {
      console.error("Database error in createCertification:", error);
      console.log("Using fallback storage for createCertification");
      const newCertification = {
        ...certificationData,
        id: randomUUID(),
        userId: parseInt(userId),
      };
      const key = `certifications_${userId}`;
      const currentCertifications = this.fallbackData.get(key) || [];
      this.fallbackData.set(key, [...currentCertifications, newCertification]);
      console.log(
        "Created certification entry in fallback storage:",
        newCertification
      );
      return newCertification;
    }
  }

  async updateCertification(id: string, data: any): Promise<any> {
    const { userId, ...updateData } = data;

    try {
      const [updatedCertification] = await db
        .update(certifications)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(certifications.id, id))
        .returning();

      if (!updatedCertification) {
        throw new Error("Certification record not found");
      }

      console.log(
        "Updated certification record in database:",
        updatedCertification
      );
      return updatedCertification;
    } catch (error) {
      console.log(
        "Database error, using fallback storage for updateCertification"
      );
      const key = `certifications_${userId}`;
      const currentCertifications = this.fallbackData.get(key) || [];
      const updatedCertifications = currentCertifications.map((cert: any) =>
        cert.id === id ? { ...cert, ...updateData } : cert
      );
      this.fallbackData.set(key, updatedCertifications);
      return { ...updateData, id };
    }
  }

  async deleteCertification(id: string): Promise<boolean> {
    try {
      const deletedCertification = await db
        .delete(certifications)
        .where(eq(certifications.id, id))
        .returning();

      if (deletedCertification.length === 0) {
        return false;
      }

      console.log(
        "Deleted certification record from database:",
        deletedCertification[0]
      );
      return true;
    } catch (error) {
      console.log(
        "Database error, using fallback storage for deleteCertification"
      );
      const entries = Array.from(this.fallbackData.entries());
      for (const [key, certificationsList] of entries) {
        if (
          key.startsWith("certifications_") &&
          Array.isArray(certificationsList)
        ) {
          const certificationExists = certificationsList.some(
            (cert: any) => cert.id === id
          );
          if (certificationExists) {
            const updatedCertifications = certificationsList.filter(
              (cert: any) => cert.id !== id
            );
            this.fallbackData.set(key, updatedCertifications);
            console.log(
              "Deleted certification entry from fallback storage:",
              id
            );
            return true;
          }
        }
      }
      return false;
    }
  }

  // Achievements CRUD - using profile JSON fields
  async getAchievements(userId: string): Promise<any[]> {
    console.log("Storage getAchievements - userId:", userId);
    const profile = await this.getProfile(userId);
    console.log("Storage getAchievements - profile:", profile);
    console.log(
      "Storage getAchievements - otherDetails:",
      profile?.otherDetails
    );
    console.log(
      "Storage getAchievements - achievements:",
      profile?.otherDetails?.achievements
    );
    const achievements = profile?.otherDetails?.achievements || [];
    console.log(
      "Storage getAchievements - returning achievements:",
      achievements
    );
    return achievements;
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
