import {
  type User,
  type InsertUser,
  type UpsertUser,
  type Profile,
  type InsertProfile,
  type WorkExperience,
  type InsertWorkExperience,
  type Education,
  type InsertEducation,
  type Skill,
  type InsertSkill,
  type Project,
  type InsertProject,
  type Certification,
  type InsertCertification,
  type Achievement,
  type InsertAchievement,
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
  workExperience,
  education,
  skills,
  projects,
  certifications,
  achievements,
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
  // User management for Clerk Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  // Legacy methods
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Profile management
  getProfile(userId: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(
    userId: string,
    profile: Partial<Profile>
  ): Promise<Profile | undefined>;

  // Work Experience
  getWorkExperience(userId: string): Promise<WorkExperience[]>;
  createWorkExperience(
    experience: InsertWorkExperience
  ): Promise<WorkExperience>;
  updateWorkExperience(
    id: string,
    experience: Partial<WorkExperience>
  ): Promise<WorkExperience | undefined>;
  deleteWorkExperience(id: string): Promise<boolean>;

  // Education
  getEducation(userId: string): Promise<Education[]>;
  createEducation(education: InsertEducation): Promise<Education>;
  updateEducation(
    id: string,
    education: Partial<Education>
  ): Promise<Education | undefined>;
  deleteEducation(id: string): Promise<boolean>;

  // Skills
  getSkills(userId: string): Promise<Skill[]>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  updateSkill(id: string, skill: Partial<Skill>): Promise<Skill | undefined>;
  deleteSkill(id: string): Promise<boolean>;

  // Projects
  getProjects(userId: string): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(
    id: string,
    project: Partial<Project>
  ): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;

  // Certifications
  getCertifications(userId: string): Promise<Certification[]>;
  createCertification(
    certification: InsertCertification
  ): Promise<Certification>;
  updateCertification(
    id: string,
    certification: Partial<Certification>
  ): Promise<Certification | undefined>;
  deleteCertification(id: string): Promise<boolean>;

  // Achievements
  getAchievements(userId: string): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  updateAchievement(
    id: string,
    achievement: Partial<Achievement>
  ): Promise<Achievement | undefined>;
  deleteAchievement(id: string): Promise<boolean>;

  // Learning modules
  getLearningModules(): Promise<LearningModule[]>;
  getLearningModule(id: string): Promise<LearningModule | undefined>;

  // User progress
  getUserProgress(userId: string): Promise<UserProgress[]>;
  createUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  updateUserProgress(
    userId: string,
    moduleId: string,
    progress: Partial<UserProgress>
  ): Promise<UserProgress | undefined>;

  // User stats
  getUserStats(userId: string): Promise<UserStats | undefined>;
  updateUserStats(
    userId: string,
    stats: Partial<UserStats>
  ): Promise<UserStats>;

  // Daily activity
  getDailyActivity(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<DailyActivity[]>;
  createDailyActivity(activity: InsertDailyActivity): Promise<DailyActivity>;

  // Section settings
  getSectionSettings(userId: string): Promise<SectionSettings[]>;
  updateSectionSettings(
    userId: string,
    sectionName: string,
    settings: Partial<SectionSettings>
  ): Promise<SectionSettings>;
}

export class DatabaseStorage implements IStorage {
  // User management for Clerk Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Legacy methods
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();

    // Initialize user stats
    await db.insert(userStats).values({
      userId: user.id,
      totalXp: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      portfolioViews: 0,
    });

    return user;
  }

  async getProfile(userId: string): Promise<Profile | undefined> {
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId));
    return profile || undefined;
  }

  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const [profile] = await db
      .insert(profiles)
      .values(insertProfile)
      .returning();
    return profile;
  }

  async updateProfile(
    userId: string,
    profileUpdate: Partial<Profile>
  ): Promise<Profile | undefined> {
    const [updated] = await db
      .update(profiles)
      .set(profileUpdate)
      .where(eq(profiles.userId, userId))
      .returning();
    return updated || undefined;
  }

  async getWorkExperience(userId: string): Promise<WorkExperience[]> {
    return await db
      .select()
      .from(workExperience)
      .where(eq(workExperience.userId, userId));
  }

  async createWorkExperience(
    insertExperience: InsertWorkExperience
  ): Promise<WorkExperience> {
    const [experience] = await db
      .insert(workExperience)
      .values(insertExperience)
      .returning();
    return experience;
  }

  async updateWorkExperience(
    id: string,
    experienceUpdate: Partial<WorkExperience>
  ): Promise<WorkExperience | undefined> {
    const [updated] = await db
      .update(workExperience)
      .set(experienceUpdate)
      .where(eq(workExperience.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteWorkExperience(id: string): Promise<boolean> {
    const result = await db
      .delete(workExperience)
      .where(eq(workExperience.id, id));
    return result.length > 0;
  }

  async getEducation(userId: string): Promise<Education[]> {
    return await db
      .select()
      .from(education)
      .where(eq(education.userId, userId));
  }

  async createEducation(insertEducation: InsertEducation): Promise<Education> {
    const [edu] = await db
      .insert(education)
      .values(insertEducation)
      .returning();
    return edu;
  }

  async updateEducation(
    id: string,
    educationUpdate: Partial<Education>
  ): Promise<Education | undefined> {
    const [updated] = await db
      .update(education)
      .set(educationUpdate)
      .where(eq(education.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteEducation(id: string): Promise<boolean> {
    const result = await db.delete(education).where(eq(education.id, id));
    return result.length > 0;
  }

  async getSkills(userId: string): Promise<Skill[]> {
    return await db.select().from(skills).where(eq(skills.userId, userId));
  }

  async createSkill(insertSkill: InsertSkill): Promise<Skill> {
    const [skill] = await db.insert(skills).values(insertSkill).returning();
    return skill;
  }

  async updateSkill(
    id: string,
    skillUpdate: Partial<Skill>
  ): Promise<Skill | undefined> {
    const [updated] = await db
      .update(skills)
      .set(skillUpdate)
      .where(eq(skills.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteSkill(id: string): Promise<boolean> {
    const result = await db.delete(skills).where(eq(skills.id, id));
    return result.length > 0;
  }

  async getProjects(userId: string): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.userId, userId));
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values(insertProject)
      .returning();
    return project;
  }

  async updateProject(
    id: string,
    projectUpdate: Partial<Project>
  ): Promise<Project | undefined> {
    const [updated] = await db
      .update(projects)
      .set(projectUpdate)
      .where(eq(projects.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return result.length > 0;
  }

  async getCertifications(userId: string): Promise<Certification[]> {
    return await db
      .select()
      .from(certifications)
      .where(eq(certifications.userId, userId));
  }

  async createCertification(
    insertCertification: InsertCertification
  ): Promise<Certification> {
    const [certification] = await db
      .insert(certifications)
      .values(insertCertification)
      .returning();
    return certification;
  }

  async updateCertification(
    id: string,
    certificationUpdate: Partial<Certification>
  ): Promise<Certification | undefined> {
    const [updated] = await db
      .update(certifications)
      .set(certificationUpdate)
      .where(eq(certifications.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteCertification(id: string): Promise<boolean> {
    const result = await db
      .delete(certifications)
      .where(eq(certifications.id, id));
    return result.length > 0;
  }

  async getAchievements(userId: string): Promise<Achievement[]> {
    return await db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, userId));
  }

  async createAchievement(
    insertAchievement: InsertAchievement
  ): Promise<Achievement> {
    const [achievement] = await db
      .insert(achievements)
      .values(insertAchievement)
      .returning();
    return achievement;
  }

  async updateAchievement(
    id: string,
    achievementUpdate: Partial<Achievement>
  ): Promise<Achievement | undefined> {
    const [updated] = await db
      .update(achievements)
      .set(achievementUpdate)
      .where(eq(achievements.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteAchievement(id: string): Promise<boolean> {
    const result = await db.delete(achievements).where(eq(achievements.id, id));
    return result.length > 0;
  }

  async getLearningModules(): Promise<LearningModule[]> {
    return await db
      .select()
      .from(learningModules)
      .where(eq(learningModules.isActive, true));
  }

  async getLearningModule(id: string): Promise<LearningModule | undefined> {
    const [module] = await db
      .select()
      .from(learningModules)
      .where(eq(learningModules.id, id));
    return module || undefined;
  }

  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));
  }

  async createUserProgress(
    insertProgress: InsertUserProgress
  ): Promise<UserProgress> {
    const [progress] = await db
      .insert(userProgress)
      .values(insertProgress)
      .returning();
    return progress;
  }

  async updateUserProgress(
    userId: string,
    moduleId: string,
    progressUpdate: Partial<UserProgress>
  ): Promise<UserProgress | undefined> {
    const [updated] = await db
      .update(userProgress)
      .set(progressUpdate)
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.moduleId, moduleId)
        )
      )
      .returning();
    return updated || undefined;
  }

  async getUserStats(userId: string): Promise<UserStats | undefined> {
    const [stats] = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, userId));
    return stats || undefined;
  }

  async updateUserStats(
    userId: string,
    statsUpdate: Partial<UserStats>
  ): Promise<UserStats> {
    const [updated] = await db
      .update(userStats)
      .set(statsUpdate)
      .where(eq(userStats.userId, userId))
      .returning();
    return updated;
  }

  async getDailyActivity(
    userId: string,
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
    insertActivity: InsertDailyActivity
  ): Promise<DailyActivity> {
    const [activity] = await db
      .insert(dailyActivity)
      .values(insertActivity)
      .returning();
    return activity;
  }

  async getSectionSettings(userId: string): Promise<SectionSettings[]> {
    return await db
      .select()
      .from(sectionSettings)
      .where(eq(sectionSettings.userId, userId));
  }

  async updateSectionSettings(
    userId: string,
    sectionName: string,
    settingsUpdate: Partial<SectionSettings>
  ): Promise<SectionSettings> {
    const [updated] = await db
      .update(sectionSettings)
      .set(settingsUpdate)
      .where(
        and(
          eq(sectionSettings.userId, userId),
          eq(sectionSettings.sectionName, sectionName)
        )
      )
      .returning();
    return updated;
  }
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private profiles: Map<string, Profile> = new Map();
  private workExperience: Map<string, WorkExperience> = new Map();
  private education: Map<string, Education> = new Map();
  private skills: Map<string, Skill> = new Map();
  private projects: Map<string, Project> = new Map();
  private certifications: Map<string, Certification> = new Map();
  private achievements: Map<string, Achievement> = new Map();
  private learningModules: Map<string, LearningModule> = new Map();
  private userProgress: Map<string, UserProgress> = new Map();
  private userStats: Map<string, UserStats> = new Map();
  private dailyActivity: Map<string, DailyActivity> = new Map();
  private sectionSettings: Map<string, SectionSettings> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Create sample user
    const userId = "user-1";
    const user: User = {
      id: userId,
      email: "megharaj@example.com",
      firstName: "Megharaj",
      lastName: "K",
      profileImageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(userId, user);

    // Create sample profile
    const profileId = randomUUID();
    const profile: Profile = {
      id: profileId,
      userId,
      name: "Megharaj K",
      role: "Full Stack Developer",
      email: "megharaj@example.com",
      phone: "+91 12345 67890",
      location: "Tamil Nadu, India",
      photoUrl: null,
      summary:
        "Passionate full-stack developer with experience in MERN stack and modern web technologies.",
      portfolioTheme: "modern",
      isPublic: true,
    };
    this.profiles.set(profileId, profile);

    // Create sample skills
    const skills = [
      { name: "JavaScript", level: 90, category: "technical" },
      { name: "React", level: 85, category: "technical" },
      { name: "Node.js", level: 80, category: "technical" },
      { name: "TypeScript", level: 75, category: "technical" },
      { name: "MongoDB", level: 70, category: "technical" },
      { name: "UI/UX Design", level: 65, category: "design" },
      { name: "Figma", level: 60, category: "design" },
      { name: "Communication", level: 85, category: "soft" },
      { name: "Problem Solving", level: 90, category: "soft" },
      { name: "Leadership", level: 75, category: "soft" },
    ];

    skills.forEach((skill) => {
      const skillId = randomUUID();
      this.skills.set(skillId, {
        id: skillId,
        userId,
        name: skill.name,
        level: skill.level,
        category: skill.category,
        isVisible: true,
      });
    });

    // Create sample projects
    const projects = [
      {
        title: "Hospital Management System",
        description:
          "Full-stack web application for managing hospital operations with patient records, appointments, and staff management.",
        technologies: ["React", "Node.js", "MongoDB", "Express"],
        link: "https://hospital-demo.example.com",
        githubLink: "https://github.com/megharaj/hospital-management",
      },
      {
        title: "E-Commerce Platform",
        description:
          "Modern e-commerce solution with payment gateway integration and admin dashboard.",
        technologies: ["Next.js", "Stripe", "PostgreSQL", "Tailwind"],
        link: "https://ecommerce-demo.example.com",
        githubLink: "https://github.com/megharaj/ecommerce-platform",
      },
      {
        title: "Task Management App",
        description:
          "Collaborative task management tool with real-time updates and team collaboration features.",
        technologies: ["Vue.js", "Socket.io", "Redis", "Docker"],
        link: null,
        githubLink: "https://github.com/megharaj/task-manager",
      },
    ];

    projects.forEach((project) => {
      const projectId = randomUUID();
      this.projects.set(projectId, {
        id: projectId,
        userId,
        title: project.title,
        description: project.description,
        technologies: project.technologies,
        link: project.link,
        githubLink: project.githubLink,
        isVisible: true,
      });
    });

    // Create sample achievements
    const achievements = [
      {
        title: "Smart India Hackathon Finalist",
        description:
          "Reached finals in national-level hackathon with innovative healthcare solution",
        year: "2024",
      },
      {
        title: "AWS Certified Developer",
        description: "Achieved AWS Developer Associate certification",
        year: "2024",
      },
      {
        title: "Open Source Contributor",
        description:
          "Active contributor to React ecosystem with 50+ contributions",
        year: "2023",
      },
    ];

    achievements.forEach((achievement) => {
      const achievementId = randomUUID();
      this.achievements.set(achievementId, {
        id: achievementId,
        userId,
        title: achievement.title,
        description: achievement.description,
        year: achievement.year,
        isVisible: true,
      });
    });

    // Create sample work experience
    const workExp = {
      title: "Software Developer Intern",
      company: "ABC Tech Solutions",
      startDate: "2024-06",
      endDate: "2024-12",
      description:
        "Developed REST APIs and optimized database queries. Built responsive web applications using React and Node.js.",
    };

    const workId = randomUUID();
    this.workExperience.set(workId, {
      id: workId,
      userId,
      ...workExp,
      isVisible: true,
    });

    // Initialize user stats
    const statsId = randomUUID();
    const stats: UserStats = {
      id: statsId,
      userId,
      totalXp: 2847,
      currentStreak: 5,
      longestStreak: 12,
      lastActivityDate: new Date(),
      portfolioViews: 1234,
    };
    this.userStats.set(userId, stats);

    // Create sample learning modules
    const modules = [
      {
        id: randomUUID(),
        title: "JavaScript ES6+",
        description: "Master modern JavaScript features and syntax",
        category: "Programming",
        xpReward: 150,
        lessons: [
          {
            title: "Arrow Functions",
            content: "Learn about arrow function syntax",
            xp: 30,
          },
          {
            title: "Destructuring",
            content: "Master object and array destructuring",
            xp: 30,
          },
          {
            title: "Async/Await",
            content: "Handle asynchronous operations",
            xp: 40,
          },
          { title: "Modules", content: "Import and export modules", xp: 25 },
          {
            title: "Classes",
            content: "Object-oriented programming in JS",
            xp: 25,
          },
        ],
        isActive: true,
      },
      {
        id: randomUUID(),
        title: "React.js Advanced Patterns",
        description:
          "Learn advanced React patterns including hooks, context, and performance optimization",
        category: "Frontend",
        xpReward: 200,
        lessons: [
          {
            title: "Custom Hooks",
            content: "Create reusable custom hooks",
            xp: 40,
          },
          {
            title: "Context API",
            content: "State management with Context",
            xp: 40,
          },
          {
            title: "Performance Optimization",
            content: "Memo, useMemo, useCallback",
            xp: 50,
          },
          {
            title: "Error Boundaries",
            content: "Handle errors gracefully",
            xp: 35,
          },
          {
            title: "Testing",
            content: "Unit testing React components",
            xp: 35,
          },
        ],
        isActive: true,
      },
      {
        id: randomUUID(),
        title: "Node.js & Express",
        description:
          "Build robust backend applications with Node.js and Express",
        category: "Backend",
        xpReward: 180,
        lessons: [
          {
            title: "Express Basics",
            content: "Setting up Express server",
            xp: 30,
          },
          {
            title: "Middleware",
            content: "Understanding middleware functions",
            xp: 35,
          },
          {
            title: "Authentication",
            content: "JWT and session management",
            xp: 45,
          },
          {
            title: "Database Integration",
            content: "Connect to databases",
            xp: 40,
          },
          {
            title: "API Design",
            content: "RESTful API best practices",
            xp: 30,
          },
        ],
        isActive: true,
      },
    ];

    modules.forEach((module) => {
      this.learningModules.set(module.id, module);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existing = this.users.get(userData.id);
    if (existing) {
      const updated = { ...existing, ...userData, updatedAt: new Date() };
      this.users.set(userData.id, updated);
      return updated;
    } else {
      const user: User = {
        ...userData,
        email: userData.email ?? null,
        firstName: userData.firstName ?? null,
        lastName: userData.lastName ?? null,
        profileImageUrl: userData.profileImageUrl ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.users.set(userData.id, user);
      return user;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      email: insertUser.email ?? null,
      firstName: insertUser.firstName ?? null,
      lastName: insertUser.lastName ?? null,
      profileImageUrl: insertUser.profileImageUrl ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);

    // Initialize user stats
    const statsId = randomUUID();
    const stats: UserStats = {
      id: statsId,
      userId: id,
      totalXp: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      portfolioViews: 0,
    };
    this.userStats.set(id, stats);

    return user;
  }

  async getProfile(userId: string): Promise<Profile | undefined> {
    return Array.from(this.profiles.values()).find(
      (profile) => profile.userId === userId
    );
  }

  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const id = randomUUID();
    const profile: Profile = {
      ...insertProfile,
      id,
      summary: insertProfile.summary ?? null,
      role: insertProfile.role ?? null,
      email: insertProfile.email ?? null,
      phone: insertProfile.phone ?? null,
      location: insertProfile.location ?? null,
      photoUrl: insertProfile.photoUrl ?? null,
      portfolioTheme: insertProfile.portfolioTheme ?? "modern",
      isPublic: insertProfile.isPublic ?? false,
    };
    this.profiles.set(id, profile);
    return profile;
  }

  async updateProfile(
    userId: string,
    profileUpdate: Partial<Profile>
  ): Promise<Profile | undefined> {
    const existing = await this.getProfile(userId);
    if (!existing) return undefined;

    const updated = { ...existing, ...profileUpdate };
    this.profiles.set(existing.id, updated);
    return updated;
  }

  async getWorkExperience(userId: string): Promise<WorkExperience[]> {
    return Array.from(this.workExperience.values()).filter(
      (exp) => exp.userId === userId
    );
  }

  async createWorkExperience(
    insertExperience: InsertWorkExperience
  ): Promise<WorkExperience> {
    const id = randomUUID();
    const experience: WorkExperience = {
      ...insertExperience,
      id,
      endDate: insertExperience.endDate ?? null,
      description: insertExperience.description ?? null,
      isVisible: insertExperience.isVisible ?? true,
    };
    this.workExperience.set(id, experience);
    return experience;
  }

  async updateWorkExperience(
    id: string,
    experienceUpdate: Partial<WorkExperience>
  ): Promise<WorkExperience | undefined> {
    const existing = this.workExperience.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...experienceUpdate };
    this.workExperience.set(id, updated);
    return updated;
  }

  async deleteWorkExperience(id: string): Promise<boolean> {
    return this.workExperience.delete(id);
  }

  async getEducation(userId: string): Promise<Education[]> {
    return Array.from(this.education.values()).filter(
      (edu) => edu.userId === userId
    );
  }

  async createEducation(insertEducation: InsertEducation): Promise<Education> {
    const id = randomUUID();
    const education: Education = {
      ...insertEducation,
      id,
      endDate: insertEducation.endDate ?? null,
      isVisible: insertEducation.isVisible ?? true,
    };
    this.education.set(id, education);
    return education;
  }

  async updateEducation(
    id: string,
    educationUpdate: Partial<Education>
  ): Promise<Education | undefined> {
    const existing = this.education.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...educationUpdate };
    this.education.set(id, updated);
    return updated;
  }

  async deleteEducation(id: string): Promise<boolean> {
    return this.education.delete(id);
  }

  async getSkills(userId: string): Promise<Skill[]> {
    return Array.from(this.skills.values()).filter(
      (skill) => skill.userId === userId
    );
  }

  async createSkill(insertSkill: InsertSkill): Promise<Skill> {
    const id = randomUUID();
    const skill: Skill = {
      ...insertSkill,
      id,
      level: insertSkill.level ?? 1,
      category: insertSkill.category ?? "technical",
      isVisible: insertSkill.isVisible ?? true,
    };
    this.skills.set(id, skill);
    return skill;
  }

  async updateSkill(
    id: string,
    skillUpdate: Partial<Skill>
  ): Promise<Skill | undefined> {
    const existing = this.skills.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...skillUpdate };
    this.skills.set(id, updated);
    return updated;
  }

  async deleteSkill(id: string): Promise<boolean> {
    return this.skills.delete(id);
  }

  async getProjects(userId: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.userId === userId
    );
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const project: Project = {
      ...insertProject,
      id,
      description: insertProject.description ?? null,
      technologies: insertProject.technologies ?? null,
      link: insertProject.link ?? null,
      githubLink: insertProject.githubLink ?? null,
      isVisible: insertProject.isVisible ?? true,
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(
    id: string,
    projectUpdate: Partial<Project>
  ): Promise<Project | undefined> {
    const existing = this.projects.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...projectUpdate };
    this.projects.set(id, updated);
    return updated;
  }

  async deleteProject(id: string): Promise<boolean> {
    return this.projects.delete(id);
  }

  async getCertifications(userId: string): Promise<Certification[]> {
    return Array.from(this.certifications.values()).filter(
      (cert) => cert.userId === userId
    );
  }

  async createCertification(
    insertCertification: InsertCertification
  ): Promise<Certification> {
    const id = randomUUID();
    const certification: Certification = {
      ...insertCertification,
      id,
      link: insertCertification.link ?? null,
      isVisible: insertCertification.isVisible ?? true,
    };
    this.certifications.set(id, certification);
    return certification;
  }

  async updateCertification(
    id: string,
    certificationUpdate: Partial<Certification>
  ): Promise<Certification | undefined> {
    const existing = this.certifications.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...certificationUpdate };
    this.certifications.set(id, updated);
    return updated;
  }

  async deleteCertification(id: string): Promise<boolean> {
    return this.certifications.delete(id);
  }

  async getAchievements(userId: string): Promise<Achievement[]> {
    return Array.from(this.achievements.values()).filter(
      (achievement) => achievement.userId === userId
    );
  }

  async createAchievement(
    insertAchievement: InsertAchievement
  ): Promise<Achievement> {
    const id = randomUUID();
    const achievement: Achievement = {
      ...insertAchievement,
      id,
      description: insertAchievement.description ?? null,
      year: insertAchievement.year ?? null,
      isVisible: insertAchievement.isVisible ?? true,
    };
    this.achievements.set(id, achievement);
    return achievement;
  }

  async updateAchievement(
    id: string,
    achievementUpdate: Partial<Achievement>
  ): Promise<Achievement | undefined> {
    const existing = this.achievements.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...achievementUpdate };
    this.achievements.set(id, updated);
    return updated;
  }

  async deleteAchievement(id: string): Promise<boolean> {
    return this.achievements.delete(id);
  }

  async getLearningModules(): Promise<LearningModule[]> {
    return Array.from(this.learningModules.values()).filter(
      (module) => module.isActive
    );
  }

  async getLearningModule(id: string): Promise<LearningModule | undefined> {
    return this.learningModules.get(id);
  }

  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values()).filter(
      (progress) => progress.userId === userId
    );
  }

  async createUserProgress(
    insertProgress: InsertUserProgress
  ): Promise<UserProgress> {
    const id = randomUUID();
    const progress: UserProgress = {
      ...insertProgress,
      id,
      completedAt: null,
      currentLesson: insertProgress.currentLesson ?? 0,
      isCompleted: insertProgress.isCompleted ?? false,
      xpEarned: insertProgress.xpEarned ?? 0,
    };
    this.userProgress.set(id, progress);
    return progress;
  }

  async updateUserProgress(
    userId: string,
    moduleId: string,
    progressUpdate: Partial<UserProgress>
  ): Promise<UserProgress | undefined> {
    const existing = Array.from(this.userProgress.values()).find(
      (progress) => progress.userId === userId && progress.moduleId === moduleId
    );
    if (!existing) return undefined;

    const updated = { ...existing, ...progressUpdate };
    if (progressUpdate.isCompleted) {
      updated.completedAt = new Date();
    }
    this.userProgress.set(existing.id, updated);
    return updated;
  }

  async getUserStats(userId: string): Promise<UserStats | undefined> {
    return this.userStats.get(userId);
  }

  async updateUserStats(
    userId: string,
    statsUpdate: Partial<UserStats>
  ): Promise<UserStats> {
    const existing = await this.getUserStats(userId);
    const updated = existing
      ? { ...existing, ...statsUpdate }
      : {
          id: randomUUID(),
          userId,
          totalXp: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastActivityDate: null,
          portfolioViews: 0,
          ...statsUpdate,
        };
    this.userStats.set(userId, updated);
    return updated;
  }

  async getDailyActivity(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<DailyActivity[]> {
    return Array.from(this.dailyActivity.values()).filter(
      (activity) =>
        activity.userId === userId &&
        activity.date >= startDate &&
        activity.date <= endDate
    );
  }

  async createDailyActivity(
    insertActivity: InsertDailyActivity
  ): Promise<DailyActivity> {
    const id = randomUUID();
    const activity: DailyActivity = {
      ...insertActivity,
      id,
      xpEarned: insertActivity.xpEarned ?? 0,
      lessonsCompleted: insertActivity.lessonsCompleted ?? 0,
    };
    this.dailyActivity.set(id, activity);
    return activity;
  }

  async getSectionSettings(userId: string): Promise<SectionSettings[]> {
    return Array.from(this.sectionSettings.values()).filter(
      (setting) => setting.userId === userId
    );
  }

  async updateSectionSettings(
    userId: string,
    sectionName: string,
    settingsUpdate: Partial<SectionSettings>
  ): Promise<SectionSettings> {
    const existing = Array.from(this.sectionSettings.values()).find(
      (setting) =>
        setting.userId === userId && setting.sectionName === sectionName
    );

    if (existing) {
      const updated = { ...existing, ...settingsUpdate };
      this.sectionSettings.set(existing.id, updated);
      return updated;
    } else {
      const id = randomUUID();
      const newSetting: SectionSettings = {
        id,
        userId,
        sectionName,
        isVisible: true,
        sortOrder: 0,
        ...settingsUpdate,
      };
      this.sectionSettings.set(id, newSetting);
      return newSetting;
    }
  }
}

export const storage = new DatabaseStorage();
