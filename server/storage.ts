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
  type Course,
  type InsertCourse,
  type Category,
  type InsertCategory,
  type Instructor,
  type InsertInstructor,
  type Module,
  type InsertModule,
  type Lesson,
  type InsertLesson,
  type Enrollment,
  type InsertEnrollment,
  type Review,
  type InsertReview,
  type LessonProgress,
  type InsertLessonProgress,
  type CareerAdvisory,
  type InsertCareerAdvisory,
  type CareerTimeline,
  type InsertCareerTimeline,
  type GeneratedResume,
  type InsertGeneratedResume,
  type ChatSession,
  type InsertChatSession,
  type ForumPost,
  type InsertForumPost,
  type ForumReply,
  type InsertForumReply,
  type ForumLike,
  type InsertForumLike,
  type Badge,
  type InsertBadge,
  type UserBadge,
  type InsertUserBadge,
  type Goal,
  type InsertGoal,
  type GoalCategory,
  type InsertGoalCategory,
  type GoalTopic,
  type InsertGoalTopic,
  type GoalSubtopic,
  type InsertGoalSubtopic,
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
  courses,
  categories,
  instructors,
  modules,
  lessons,
  enrollments,
  reviews,
  courseCategories,
  lessonProgress,
  careerAdvisories,
  careerTimelines,
  generatedResumes,
  chatSessions,
  forumPosts,
  forumReplies,
  forumLikes,
  badges,
  userBadges,
  goals,
  goalCategories,
  goalTopics,
  goalSubtopics,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, sql, desc, ne, or, isNull } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  sessionStore: any;

  // User management for JWT Auth
  getUserById(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
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

  // AI Career Features
  getCareerAdvisories(userId: number): Promise<CareerAdvisory[]>;
  createCareerAdvisory(data: InsertCareerAdvisory): Promise<CareerAdvisory>;
  
  getCareerTimelines(userId: number): Promise<CareerTimeline[]>;
  createCareerTimeline(data: InsertCareerTimeline): Promise<CareerTimeline>;
  deleteCareerTimeline(id: string): Promise<boolean>;
  
  getGeneratedResumes(userId: number): Promise<GeneratedResume[]>;
  createGeneratedResume(data: InsertGeneratedResume): Promise<GeneratedResume>;
  updateGeneratedResume(id: string, data: Partial<InsertGeneratedResume>): Promise<GeneratedResume | undefined>;
  deleteGeneratedResume(id: string): Promise<boolean>;
  
  getChatSessions(userId: number): Promise<ChatSession[]>;
  getChatSession(id: string): Promise<ChatSession | undefined>;
  createChatSession(data: InsertChatSession): Promise<ChatSession>;
  updateChatSession(id: string, data: Partial<InsertChatSession>): Promise<ChatSession | undefined>;

  // Forum methods
  getForumPosts(): Promise<(ForumPost & { user: User; repliesCount: number })[]>;
  getForumPost(id: string): Promise<(ForumPost & { user: User }) | undefined>;
  createForumPost(data: InsertForumPost): Promise<ForumPost>;
  updateForumPost(id: string, data: Partial<InsertForumPost>): Promise<ForumPost | undefined>;
  deleteForumPost(id: string): Promise<boolean>;
  
  getForumReplies(postId: string): Promise<(ForumReply & { user: User })[]>;
  createForumReply(data: InsertForumReply): Promise<ForumReply>;
  updateForumReply(id: string, data: Partial<InsertForumReply>): Promise<ForumReply | undefined>;
  deleteForumReply(id: string): Promise<boolean>;
  
  toggleForumLike(data: InsertForumLike): Promise<{ liked: boolean; likesCount: number }>;
  getForumLike(userId: number, postId?: string, replyId?: string): Promise<ForumLike | undefined>;

  // New learning platform methods
  getCourses(): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, course: Partial<InsertCourse>): Promise<Course | undefined>;
  deleteCourse(id: string): Promise<boolean>;

  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  getInstructors(): Promise<Instructor[]>;
  getInstructor(id: string): Promise<Instructor | undefined>;
  createInstructor(instructor: InsertInstructor): Promise<Instructor>;

  getCourseModules(courseId: string): Promise<Module[]>;
  getModule(id: string): Promise<Module | undefined>;
  createModule(module: InsertModule): Promise<Module>;

  getModuleLessons(moduleId: string): Promise<Lesson[]>;
  getLesson(id: string): Promise<Lesson | undefined>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;

  getUserEnrollments(userId: number): Promise<Enrollment[]>;
  getCourseEnrollments(courseId: string): Promise<Enrollment[]>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  updateEnrollment(id: string, enrollment: Partial<InsertEnrollment>): Promise<Enrollment | undefined>;

  getCourseReviews(courseId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Lesson Progress methods
  getLessonProgress(userId: number, moduleId: string): Promise<LessonProgress[]>;
  getLessonProgressByIndex(userId: number, moduleId: string, lessonIndex: number): Promise<LessonProgress | undefined>;
  createLessonProgress(progress: InsertLessonProgress): Promise<LessonProgress>;
  completeLessonProgress(userId: number, moduleId: string, lessonIndex: number): Promise<LessonProgress>;

  // Badge system methods
  getBadges(): Promise<Badge[]>;
  createBadge(badge: InsertBadge): Promise<Badge>;
  getUserBadges(userId: number): Promise<(UserBadge & { badge: Badge })[]>;
  awardBadge(userBadge: InsertUserBadge): Promise<UserBadge>;
  checkAndAwardBadges(userId: number, type: string, relatedId?: string): Promise<UserBadge[]>;
  
  // Goal tracking methods
  createGoal(goalData: InsertGoal): Promise<Goal>;
  getUserGoals(userId: number): Promise<Goal[]>;
  getGoal(id: string): Promise<Goal | undefined>;
  updateGoal(id: string, goalData: Partial<InsertGoal>): Promise<Goal | undefined>;
  deleteGoal(id: string): Promise<boolean>;
  createGoalFromCSV(userId: number, goalName: string, csvData: any[]): Promise<Goal>;
  getGoalWithCategories(goalId: string): Promise<Goal & { categories: (GoalCategory & { topics: (GoalTopic & { subtopics: GoalSubtopic[] })[] })[] } | undefined>;
  updateTopicStatus(topicId: string, status: "pending" | "start" | "completed", notes?: string): Promise<GoalTopic | undefined>;
  // Subtopic methods
  createGoalSubtopic(subtopicData: InsertGoalSubtopic): Promise<GoalSubtopic>;
  getTopicSubtopics(topicId: string): Promise<GoalSubtopic[]>;
  updateSubtopicStatus(subtopicId: string, status: "pending" | "start" | "completed", notes?: string): Promise<GoalSubtopic | undefined>;
  deleteSubtopic(subtopicId: string): Promise<boolean>;
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
      this.seedBadgesInFallback();
      console.log("Database not available, using in-memory fallback storage");
    }
  }

  private initializeSessionStore() {
    console.log("Session store initialized for PgStorage");
  }

  private seedBadgesInFallback() {
    const badgeData = [
      // Course Completion Badges
      {
        id: "badge-ai-pioneer",
        title: "AI Pioneer",
        description: "Completed your first AI & Machine Learning course",
        icon: "Zap",
        color: "purple",
        type: "course_completion",
        criteria: { courseType: "AI & Machine Learning" },
        xpReward: 100,
        rarity: "rare",
        createdAt: new Date(),
      },
      {
        id: "badge-data-scientist",
        title: "Data Scientist",
        description: "Mastered Data Science fundamentals",
        icon: "Trophy",
        color: "blue",
        type: "course_completion",
        criteria: { courseType: "Data Science" },
        xpReward: 150,
        rarity: "epic",
        createdAt: new Date(),
      },
      
      // Milestone Badges
      {
        id: "badge-fast-learner",
        title: "Fast Learner",
        description: "Completed first course in under 30 days",
        icon: "Flame",
        color: "orange",
        type: "milestone",
        criteria: { timeLimit: 30 },
        xpReward: 75,
        rarity: "rare",
        createdAt: new Date(),
      },
      {
        id: "badge-streak-master",
        title: "Streak Master",
        description: "Maintained a 7-day learning streak",
        icon: "Calendar",
        color: "green",
        type: "streak",
        criteria: { streakDays: 7 },
        xpReward: 50,
        rarity: "common",
        createdAt: new Date(),
      },
      {
        id: "badge-knowledge-seeker",
        title: "Knowledge Seeker",
        description: "Completed 5 courses",
        icon: "BookOpen",
        color: "indigo",
        type: "milestone",
        criteria: { coursesCompleted: 5 },
        xpReward: 200,
        rarity: "epic",
        createdAt: new Date(),
      },
      
      // Achievement Badges
      {
        id: "badge-perfect-score",
        title: "Perfect Score",
        description: "Achieved 100% on a final exam",
        icon: "Star",
        color: "yellow",
        type: "achievement",
        criteria: { examScore: 100 },
        xpReward: 100,
        rarity: "rare",
        createdAt: new Date(),
      },
      {
        id: "badge-learning-champion",
        title: "Learning Champion",
        description: "Completed 10 courses with distinction",
        icon: "Crown",
        color: "gold",
        type: "milestone",
        criteria: { coursesCompleted: 10, grade: "distinction" },
        xpReward: 500,
        rarity: "legendary",
        createdAt: new Date(),
      },
      {
        id: "badge-first-steps",
        title: "First Steps",
        description: "Welcome to your learning journey!",
        icon: "Star",
        color: "blue",
        type: "milestone",
        criteria: { firstLogin: true },
        xpReward: 25,
        rarity: "common",
        createdAt: new Date(),
      }
    ];

    this.fallbackData.set('badges', badgeData);
    console.log(`✅ Seeded ${badgeData.length} badges in fallback storage`);
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

  async getAllUsers(): Promise<User[]> {
    const result = await db.select().from(users);
    return result;
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
    if (!this.isDbConnected) {
      const key = `userProgress_${userId}`;
      const progressList = this.fallbackData.get(key) || [];
      return progressList.find((p: any) => p.moduleId === moduleId);
    }
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
    if (!this.isDbConnected) {
      const key = `dailyActivity_${userId}`;
      const activities = this.fallbackData.get(key) || [];
      // Filter by date range  
      return activities.filter((activity: any) => 
        activity.date >= startDate && activity.date <= endDate
      ).sort((a: any, b: any) => a.date.localeCompare(b.date));
    }
    try {
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
    } catch (error) {
      console.error("Error fetching daily activity:", error);
      return [];
    }
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

  // New learning platform implementations
  async getCourses(): Promise<Course[]> {
    if (!this.isDbConnected) {
      return this.fallbackData.get('courses') || [];
    }
    return await db.select().from(courses);
  }

  async getCourse(id: string): Promise<Course | undefined> {
    if (!this.isDbConnected) {
      const allCourses = this.fallbackData.get('courses') || [];
      return allCourses.find((c: any) => c.id === id);
    }
    const result = await db.select().from(courses).where(eq(courses.id, id));
    return result[0];
  }

  async createCourse(courseData: InsertCourse): Promise<Course> {
    if (!this.isDbConnected) {
      const course = { ...courseData, id: randomUUID() };
      const allCourses = this.fallbackData.get('courses') || [];
      allCourses.push(course);
      this.fallbackData.set('courses', allCourses);
      return course as Course;
    }
    const [course] = await db.insert(courses).values(courseData).returning();
    return course;
  }

  async updateCourse(id: string, courseData: Partial<InsertCourse>): Promise<Course | undefined> {
    if (!this.isDbConnected) {
      const allCourses = this.fallbackData.get('courses') || [];
      const index = allCourses.findIndex((c: any) => c.id === id);
      if (index !== -1) {
        allCourses[index] = { ...allCourses[index], ...courseData };
        this.fallbackData.set('courses', allCourses);
        return allCourses[index];
      }
      return undefined;
    }
    const [course] = await db.update(courses).set(courseData).where(eq(courses.id, id)).returning();
    return course;
  }

  async deleteCourse(id: string): Promise<boolean> {
    if (!this.isDbConnected) {
      const allCourses = this.fallbackData.get('courses') || [];
      const index = allCourses.findIndex((c: any) => c.id === id);
      if (index !== -1) {
        allCourses.splice(index, 1);
        this.fallbackData.set('courses', allCourses);
        return true;
      }
      return false;
    }
    const result = await db.delete(courses).where(eq(courses.id, id));
    return result.length > 0;
  }

  async getCategories(): Promise<Category[]> {
    if (!this.isDbConnected) {
      return this.fallbackData.get('categories') || [];
    }
    return await db.select().from(categories);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    if (!this.isDbConnected) {
      const allCategories = this.fallbackData.get('categories') || [];
      return allCategories.find((c: any) => c.id === id);
    }
    const result = await db.select().from(categories).where(eq(categories.id, id));
    return result[0];
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    if (!this.isDbConnected) {
      const category = { ...categoryData, id: Math.floor(Math.random() * 10000) };
      const allCategories = this.fallbackData.get('categories') || [];
      allCategories.push(category);
      this.fallbackData.set('categories', allCategories);
      return category as Category;
    }
    const [category] = await db.insert(categories).values(categoryData).returning();
    return category;
  }

  async getInstructors(): Promise<Instructor[]> {
    if (!this.isDbConnected) {
      return this.fallbackData.get('instructors') || [];
    }
    return await db.select().from(instructors);
  }

  async getInstructor(id: string): Promise<Instructor | undefined> {
    if (!this.isDbConnected) {
      const allInstructors = this.fallbackData.get('instructors') || [];
      return allInstructors.find((i: any) => i.id === id);
    }
    const result = await db.select().from(instructors).where(eq(instructors.id, id));
    return result[0];
  }

  async createInstructor(instructorData: InsertInstructor): Promise<Instructor> {
    if (!this.isDbConnected) {
      const instructor = { ...instructorData, id: randomUUID() };
      const allInstructors = this.fallbackData.get('instructors') || [];
      allInstructors.push(instructor);
      this.fallbackData.set('instructors', allInstructors);
      return instructor as Instructor;
    }
    const [instructor] = await db.insert(instructors).values(instructorData).returning();
    return instructor;
  }

  async getCourseModules(courseId: string): Promise<Module[]> {
    if (!this.isDbConnected) {
      const allModules = this.fallbackData.get('modules') || [];
      return allModules.filter((m: any) => m.courseId === courseId);
    }
    return await db.select().from(modules).where(eq(modules.courseId, courseId));
  }

  async getModule(id: string): Promise<Module | undefined> {
    if (!this.isDbConnected) {
      const allModules = this.fallbackData.get('modules') || [];
      return allModules.find((m: any) => m.id === id);
    }
    const result = await db.select().from(modules).where(eq(modules.id, id));
    return result[0];
  }

  async createModule(moduleData: InsertModule): Promise<Module> {
    if (!this.isDbConnected) {
      const module = { ...moduleData, id: randomUUID() };
      const allModules = this.fallbackData.get('modules') || [];
      allModules.push(module);
      this.fallbackData.set('modules', allModules);
      return module as Module;
    }
    const [module] = await db.insert(modules).values(moduleData).returning();
    return module;
  }

  async getModuleLessons(moduleId: string): Promise<Lesson[]> {
    if (!this.isDbConnected) {
      const allLessons = this.fallbackData.get('lessons') || [];
      return allLessons.filter((l: any) => l.moduleId === moduleId);
    }
    return await db.select().from(lessons).where(eq(lessons.moduleId, moduleId));
  }

  async getLesson(id: string): Promise<Lesson | undefined> {
    if (!this.isDbConnected) {
      const allLessons = this.fallbackData.get('lessons') || [];
      return allLessons.find((l: any) => l.id === id);
    }
    const result = await db.select().from(lessons).where(eq(lessons.id, id));
    return result[0];
  }

  async createLesson(lessonData: InsertLesson): Promise<Lesson> {
    if (!this.isDbConnected) {
      const lesson = { ...lessonData, id: randomUUID() };
      const allLessons = this.fallbackData.get('lessons') || [];
      allLessons.push(lesson);
      this.fallbackData.set('lessons', allLessons);
      return lesson as Lesson;
    }
    const [lesson] = await db.insert(lessons).values(lessonData).returning();
    return lesson;
  }

  async getUserEnrollments(userId: number): Promise<Enrollment[]> {
    if (!this.isDbConnected) {
      const allEnrollments = this.fallbackData.get('enrollments') || [];
      return allEnrollments.filter((e: any) => e.userId === userId);
    }
    return await db.select().from(enrollments).where(eq(enrollments.userId, userId));
  }

  async getCourseEnrollments(courseId: string): Promise<Enrollment[]> {
    if (!this.isDbConnected) {
      const allEnrollments = this.fallbackData.get('enrollments') || [];
      return allEnrollments.filter((e: any) => e.courseId === courseId);
    }
    return await db.select().from(enrollments).where(eq(enrollments.courseId, courseId));
  }

  async createEnrollment(enrollmentData: InsertEnrollment): Promise<Enrollment> {
    if (!this.isDbConnected) {
      const enrollment = { ...enrollmentData, id: randomUUID() };
      const allEnrollments = this.fallbackData.get('enrollments') || [];
      allEnrollments.push(enrollment);
      this.fallbackData.set('enrollments', allEnrollments);
      return enrollment as Enrollment;
    }
    const [enrollment] = await db.insert(enrollments).values(enrollmentData).returning();
    return enrollment;
  }

  async updateEnrollment(id: string, enrollmentData: Partial<InsertEnrollment>): Promise<Enrollment | undefined> {
    if (!this.isDbConnected) {
      const allEnrollments = this.fallbackData.get('enrollments') || [];
      const index = allEnrollments.findIndex((e: any) => e.id === id);
      if (index !== -1) {
        allEnrollments[index] = { ...allEnrollments[index], ...enrollmentData };
        this.fallbackData.set('enrollments', allEnrollments);
        return allEnrollments[index];
      }
      return undefined;
    }
    const [enrollment] = await db.update(enrollments).set(enrollmentData).where(eq(enrollments.id, id)).returning();
    return enrollment;
  }

  async getCourseReviews(courseId: string): Promise<Review[]> {
    if (!this.isDbConnected) {
      const allReviews = this.fallbackData.get('reviews') || [];
      return allReviews.filter((r: any) => r.courseId === courseId);
    }
    return await db.select().from(reviews).where(eq(reviews.courseId, courseId));
  }

  async createReview(reviewData: InsertReview): Promise<Review> {
    if (!this.isDbConnected) {
      const review = { ...reviewData, id: randomUUID() };
      const allReviews = this.fallbackData.get('reviews') || [];
      allReviews.push(review);
      this.fallbackData.set('reviews', allReviews);
      return review as Review;
    }
    const [review] = await db.insert(reviews).values(reviewData).returning();
    return review;
  }

  // Lesson Progress implementations
  async getLessonProgress(userId: number, moduleId: string): Promise<LessonProgress[]> {
    if (!this.isDbConnected) {
      const key = `lessonProgress_${userId}_${moduleId}`;
      return this.fallbackData.get(key) || [];
    }
    return await db
      .select()
      .from(lessonProgress)
      .where(
        and(
          eq(lessonProgress.userId, userId),
          eq(lessonProgress.moduleId, moduleId)
        )
      );
  }

  async getLessonProgressByIndex(userId: number, moduleId: string, lessonIndex: number): Promise<LessonProgress | undefined> {
    if (!this.isDbConnected) {
      const key = `lessonProgress_${userId}_${moduleId}`;
      const progressList = this.fallbackData.get(key) || [];
      return progressList.find((p: any) => p.lessonIndex === lessonIndex);
    }
    const result = await db
      .select()
      .from(lessonProgress)
      .where(
        and(
          eq(lessonProgress.userId, userId),
          eq(lessonProgress.moduleId, moduleId),
          eq(lessonProgress.lessonIndex, lessonIndex)
        )
      );
    return result[0];
  }

  async createLessonProgress(progressData: InsertLessonProgress): Promise<LessonProgress> {
    if (!this.isDbConnected) {
      const progress = { 
        ...progressData, 
        id: randomUUID(),
        completedAt: progressData.isCompleted ? new Date() : null
      };
      const key = `lessonProgress_${progressData.userId}_${progressData.moduleId}`;
      const progressList = this.fallbackData.get(key) || [];
      progressList.push(progress);
      this.fallbackData.set(key, progressList);
      return progress as LessonProgress;
    }
    const [progress] = await db
      .insert(lessonProgress)
      .values(progressData)
      .returning();
    return progress;
  }

  async completeLessonProgress(userId: number, moduleId: string, lessonIndex: number): Promise<LessonProgress> {
    const existing = await this.getLessonProgressByIndex(userId, moduleId, lessonIndex);
    
    let completedProgress: LessonProgress;
    
    if (existing) {
      // Update existing progress
      if (!this.isDbConnected) {
        const key = `lessonProgress_${userId}_${moduleId}`;
        const progressList = this.fallbackData.get(key) || [];
        const updatedList = progressList.map((p: any) => 
          p.lessonIndex === lessonIndex 
            ? { ...p, isCompleted: true, completedAt: new Date() }
            : p
        );
        this.fallbackData.set(key, updatedList);
        completedProgress = updatedList.find((p: any) => p.lessonIndex === lessonIndex);
      } else {
        const [updated] = await db
          .update(lessonProgress)
          .set({ 
            isCompleted: true, 
            completedAt: new Date() 
          })
          .where(eq(lessonProgress.id, existing.id))
          .returning();
        completedProgress = updated;
      }
    } else {
      // Create new progress record
      const progressData: InsertLessonProgress = {
        userId,
        moduleId,
        lessonIndex,
        isCompleted: true,
        quizPassed: false,
        quizScore: null,
        quizAttempts: 0,
        xpEarned: 10, // Default XP for lesson completion
        completedAt: new Date()
      };
      completedProgress = await this.createLessonProgress(progressData);
    }

    // Update daily activity with real XP
    await this.updateDailyActivityForLessonCompletion(userId, completedProgress.xpEarned || 10);

    // Check if all lessons in the module are completed
    await this.checkAndCompleteModule(userId, moduleId);
    
    return completedProgress;
  }

  // Helper method to update daily activity when lessons are completed
  private async updateDailyActivityForLessonCompletion(userId: number, xpEarned: number): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      if (!this.isDbConnected) {
        const key = `dailyActivity_${userId}`;
        const activities = this.fallbackData.get(key) || [];
        const existingActivity = activities.find((a: any) => a.date === today);
        
        if (existingActivity) {
          existingActivity.xpEarned = (existingActivity.xpEarned || 0) + xpEarned;
          existingActivity.lessonsCompleted = (existingActivity.lessonsCompleted || 0) + 1;
        } else {
          activities.push({
            userId,
            date: today,
            xpEarned,
            lessonsCompleted: 1,
            timeSpent: 30 // Default 30 minutes per lesson
          });
        }
        this.fallbackData.set(key, activities);
      } else {
        // Update database daily activity
        await db
          .insert(dailyActivity)
          .values({
            date: today,
            userId,
            xpEarned,
            lessonsCompleted: 1
          })
          .onConflictDoUpdate({
            target: [dailyActivity.userId, dailyActivity.date],
            set: {
              xpEarned: sql`${dailyActivity.xpEarned} + ${xpEarned}`,
              lessonsCompleted: sql`${dailyActivity.lessonsCompleted} + 1`
            }
          });
      }
    } catch (error) {
      console.error('Error updating daily activity:', error);
    }
  }

  // Helper method to check if all lessons are completed and mark module as completed
  private async checkAndCompleteModule(userId: number, moduleId: string): Promise<void> {
    try {
      // Get lessons for this module from the courses/modules endpoint
      const lessons = await this.getModuleLessons(moduleId);
      if (!lessons || lessons.length === 0) return;

      const totalLessons = lessons.length;

      // Get all lesson progress for this module
      const allProgress = await this.getLessonProgress(userId, moduleId);
      const completedLessons = allProgress.filter(p => p.isCompleted).length;

      console.log(`Checking module completion: ${completedLessons}/${totalLessons} lessons completed`);

      // If all lessons are completed, mark the module as completed
      if (completedLessons >= totalLessons) {
        console.log(`All lessons completed, marking module ${moduleId} as completed for user ${userId}`);
        
        // Get or create module progress
        let moduleProgress = await this.getUserProgressForModule(userId, moduleId);
        
        if (moduleProgress) {
          // Update existing progress to mark as completed
          if (!this.isDbConnected) {
            const key = `userProgress_${userId}`;
            const progressList = this.fallbackData.get(key) || [];
            const updatedList = progressList.map((p: any) => 
              p.moduleId === moduleId 
                ? { ...p, isCompleted: true, completedAt: new Date(), currentLesson: totalLessons }
                : p
            );
            this.fallbackData.set(key, updatedList);
            console.log(`Updated module progress in fallback storage`);
          } else {
            await db
              .update(userProgress)
              .set({ 
                isCompleted: true, 
                completedAt: new Date(),
                currentLesson: totalLessons
              })
              .where(and(
                eq(userProgress.userId, userId),
                eq(userProgress.moduleId, moduleId)
              ));
            console.log(`Updated module progress in database`);
          }
        } else {
          // Create new module progress record as completed
          const progressData = {
            userId,
            moduleId,
            currentLesson: totalLessons,
            isCompleted: true,
            xpEarned: 0, // Will be set based on module data if available
            completedAt: new Date()
          };
          await this.createUserProgress(progressData);
          console.log(`Created new completed module progress`);
        }

        // Check if all modules in the course are completed
        await this.checkAndCompleteCourse(userId, moduleId);
      }
    } catch (error) {
      console.error("Error checking module completion:", error);
    }
  }

  // Helper method to check if all modules are completed and mark course as completed
  private async checkAndCompleteCourse(userId: number, moduleId: string): Promise<void> {
    try {
      // Get the module to find the courseId
      const module = await this.getModule(moduleId);
      if (!module) return;

      const courseId = module.courseId;

      // Get all modules for this course
      const allModules = await this.getCourseModules(courseId);
      if (!allModules || allModules.length === 0) return;

      // Check if all modules are completed
      const allUserProgress = await this.getUserProgress(userId);
      const courseModuleProgress = allUserProgress.filter(p => 
        allModules.some(m => m.id === p.moduleId)
      );

      const completedModules = courseModuleProgress.filter(p => p.isCompleted).length;
      const totalModules = allModules.length;

      console.log(`Checking course completion: ${completedModules}/${totalModules} modules completed`);

      // If all modules are completed, mark course as completed and award XP
      if (completedModules >= totalModules) {
        console.log(`All modules completed, marking course ${courseId} as completed for user ${userId}`);

        // Get or create enrollment record and mark as completed
        const enrollments = await this.getUserEnrollments(userId);
        const courseEnrollment = enrollments.find(e => e.courseId === courseId);

        if (courseEnrollment) {
          await this.updateEnrollment(courseEnrollment.id, {
            completedAt: new Date(),
            progress: '100'
          });
        }

        // Award course completion XP (5 points as requested)
        const courseCompletionXP = 5;
        const currentStats = await this.getUserStats(userId);
        const newXp = (currentStats?.totalXp || 0) + courseCompletionXP;
        await this.updateUserStats(userId, {
          totalXp: newXp
        });

        console.log(`Awarded ${courseCompletionXP} XP for course completion to user ${userId}`);

        // Check and award course completion badge if available
        await this.checkAndAwardBadges(userId, 'course_completion', courseId);
      }
    } catch (error) {
      console.error("Error checking course completion:", error);
    }
  }

  // AI Career Features Implementation
  async getCareerAdvisories(userId: number): Promise<CareerAdvisory[]> {
    if (!this.isDbConnected) {
      return this.fallbackData.get(`careerAdvisories_${userId}`) || [];
    }
    try {
      const result = await db.select().from(careerAdvisories).where(eq(careerAdvisories.userId, userId));
      return result;
    } catch (error) {
      console.error("Error fetching career advisories:", error);
      return this.fallbackData.get(`careerAdvisories_${userId}`) || [];
    }
  }

  async createCareerAdvisory(data: InsertCareerAdvisory): Promise<CareerAdvisory> {
    if (!this.isDbConnected) {
      const id = randomUUID();
      const advisory = { id, ...data, createdAt: new Date() };
      const existing = this.fallbackData.get(`careerAdvisories_${data.userId}`) || [];
      this.fallbackData.set(`careerAdvisories_${data.userId}`, [...existing, advisory]);
      return advisory as CareerAdvisory;
    }
    try {
      const result = await db.insert(careerAdvisories).values(data).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating career advisory:", error);
      throw error;
    }
  }

  async getCareerTimelines(userId: number): Promise<CareerTimeline[]> {
    if (!this.isDbConnected) {
      return this.fallbackData.get(`careerTimelines_${userId}`) || [];
    }
    try {
      const result = await db.select().from(careerTimelines).where(eq(careerTimelines.userId, userId));
      return result;
    } catch (error) {
      console.error("Error fetching career timelines:", error);
      return this.fallbackData.get(`careerTimelines_${userId}`) || [];
    }
  }

  async createCareerTimeline(data: InsertCareerTimeline): Promise<CareerTimeline> {
    if (!this.isDbConnected) {
      const id = randomUUID();
      const timeline = { id, ...data, createdAt: new Date() };
      const existing = this.fallbackData.get(`careerTimelines_${data.userId}`) || [];
      this.fallbackData.set(`careerTimelines_${data.userId}`, [...existing, timeline]);
      return timeline as CareerTimeline;
    }
    try {
      const result = await db.insert(careerTimelines).values(data).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating career timeline:", error);
      throw error;
    }
  }

  async deleteCareerTimeline(id: string): Promise<boolean> {
    if (!this.isDbConnected) {
      for (const key of this.fallbackData.keys()) {
        if (key.startsWith('careerTimelines_')) {
          const timelines = this.fallbackData.get(key) || [];
          const filtered = timelines.filter((t: any) => t.id !== id);
          this.fallbackData.set(key, filtered);
        }
      }
      return true;
    }
    try {
      await db.delete(careerTimelines).where(eq(careerTimelines.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting career timeline:", error);
      return false;
    }
  }

  async getGeneratedResumes(userId: number): Promise<GeneratedResume[]> {
    if (!this.isDbConnected) {
      return this.fallbackData.get(`generatedResumes_${userId}`) || [];
    }
    try {
      const result = await db.select().from(generatedResumes).where(eq(generatedResumes.userId, userId));
      return result;
    } catch (error) {
      console.error("Error fetching generated resumes:", error);
      return this.fallbackData.get(`generatedResumes_${userId}`) || [];
    }
  }

  async createGeneratedResume(data: InsertGeneratedResume): Promise<GeneratedResume> {
    if (!this.isDbConnected) {
      const id = randomUUID();
      const resume = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
      const existing = this.fallbackData.get(`generatedResumes_${data.userId}`) || [];
      this.fallbackData.set(`generatedResumes_${data.userId}`, [...existing, resume]);
      return resume as GeneratedResume;
    }
    try {
      const result = await db.insert(generatedResumes).values(data).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating generated resume:", error);
      throw error;
    }
  }

  async updateGeneratedResume(id: string, data: Partial<InsertGeneratedResume>): Promise<GeneratedResume | undefined> {
    if (!this.isDbConnected) {
      for (const key of this.fallbackData.keys()) {
        if (key.startsWith('generatedResumes_')) {
          const resumes = this.fallbackData.get(key) || [];
          const index = resumes.findIndex((r: any) => r.id === id);
          if (index !== -1) {
            resumes[index] = { ...resumes[index], ...data, updatedAt: new Date() };
            this.fallbackData.set(key, resumes);
            return resumes[index];
          }
        }
      }
      return undefined;
    }
    try {
      const result = await db
        .update(generatedResumes)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(generatedResumes.id, id))
        .returning();
      return result[0] || undefined;
    } catch (error) {
      console.error("Error updating generated resume:", error);
      return undefined;
    }
  }

  async deleteGeneratedResume(id: string): Promise<boolean> {
    if (!this.isDbConnected) {
      for (const key of this.fallbackData.keys()) {
        if (key.startsWith('generatedResumes_')) {
          const resumes = this.fallbackData.get(key) || [];
          const filtered = resumes.filter((r: any) => r.id !== id);
          this.fallbackData.set(key, filtered);
        }
      }
      return true;
    }
    try {
      await db.delete(generatedResumes).where(eq(generatedResumes.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting generated resume:", error);
      return false;
    }
  }

  async getChatSessions(userId: number): Promise<ChatSession[]> {
    if (!this.isDbConnected) {
      return this.fallbackData.get(`chatSessions_${userId}`) || [];
    }
    try {
      const result = await db.select().from(chatSessions).where(eq(chatSessions.userId, userId));
      return result;
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      return this.fallbackData.get(`chatSessions_${userId}`) || [];
    }
  }

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    if (!this.isDbConnected) {
      for (const key of this.fallbackData.keys()) {
        if (key.startsWith('chatSessions_')) {
          const sessions = this.fallbackData.get(key) || [];
          const session = sessions.find((s: any) => s.id === id);
          if (session) return session;
        }
      }
      return undefined;
    }
    try {
      const result = await db.select().from(chatSessions).where(eq(chatSessions.id, id));
      return result[0] || undefined;
    } catch (error) {
      console.error("Error fetching chat session:", error);
      return undefined;
    }
  }

  async createChatSession(data: InsertChatSession): Promise<ChatSession> {
    if (!this.isDbConnected) {
      const id = randomUUID();
      const session = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
      const existing = this.fallbackData.get(`chatSessions_${data.userId}`) || [];
      this.fallbackData.set(`chatSessions_${data.userId}`, [...existing, session]);
      return session as ChatSession;
    }
    try {
      const result = await db.insert(chatSessions).values(data).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating chat session:", error);
      throw error;
    }
  }

  async updateChatSession(id: string, data: Partial<InsertChatSession>): Promise<ChatSession | undefined> {
    if (!this.isDbConnected) {
      for (const key of this.fallbackData.keys()) {
        if (key.startsWith('chatSessions_')) {
          const sessions = this.fallbackData.get(key) || [];
          const index = sessions.findIndex((s: any) => s.id === id);
          if (index !== -1) {
            sessions[index] = { ...sessions[index], ...data, updatedAt: new Date() };
            this.fallbackData.set(key, sessions);
            return sessions[index];
          }
        }
      }
      return undefined;
    }
    try {
      const result = await db
        .update(chatSessions)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(chatSessions.id, id))
        .returning();
      return result[0] || undefined;
    } catch (error) {
      console.error("Error updating chat session:", error);
      return undefined;
    }
  }

  // Forum methods implementation
  async getForumPosts(): Promise<(ForumPost & { user: User; repliesCount: number })[]> {
    if (!this.isDbConnected) {
      return this.fallbackData.get('forumPosts') || [];
    }
    try {
      const result = await db
        .select()
        .from(forumPosts)
        .innerJoin(users, eq(forumPosts.userId, users.id))
        .where(eq(forumPosts.isActive, true))
        .orderBy(desc(forumPosts.createdAt));
      
      return result.map(row => ({
        ...row.forum_posts,
        user: row.users,
        repliesCount: row.forum_posts.repliesCount || 0
      }));
    } catch (error) {
      console.error("Error fetching forum posts:", error);
      return this.fallbackData.get('forumPosts') || [];
    }
  }

  async getForumPost(id: string): Promise<(ForumPost & { user: User }) | undefined> {
    if (!this.isDbConnected) {
      const posts = this.fallbackData.get('forumPosts') || [];
      return posts.find((p: any) => p.id === id);
    }
    try {
      const result = await db
        .select()
        .from(forumPosts)
        .innerJoin(users, eq(forumPosts.userId, users.id))
        .where(and(eq(forumPosts.id, id), eq(forumPosts.isActive, true)));
      
      if (result.length === 0) return undefined;
      return {
        ...result[0].forum_posts,
        user: result[0].users
      };
    } catch (error) {
      console.error("Error fetching forum post:", error);
      return undefined;
    }
  }

  async createForumPost(data: InsertForumPost): Promise<ForumPost> {
    if (!this.isDbConnected) {
      const newPost = {
        id: randomUUID(),
        ...data,
        isActive: true,
        likesCount: 0,
        repliesCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const posts = this.fallbackData.get('forumPosts') || [];
      posts.push(newPost);
      this.fallbackData.set('forumPosts', posts);
      return newPost;
    }
    try {
      const result = await db
        .insert(forumPosts)
        .values(data)
        .returning();
      return result[0];
    } catch (error) {
      console.error("Error creating forum post:", error);
      throw error;
    }
  }

  async updateForumPost(id: string, data: Partial<InsertForumPost>): Promise<ForumPost | undefined> {
    if (!this.isDbConnected) {
      const posts = this.fallbackData.get('forumPosts') || [];
      const index = posts.findIndex((p: any) => p.id === id);
      if (index !== -1) {
        posts[index] = { ...posts[index], ...data, updatedAt: new Date() };
        this.fallbackData.set('forumPosts', posts);
        return posts[index];
      }
      return undefined;
    }
    try {
      const result = await db
        .update(forumPosts)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(forumPosts.id, id))
        .returning();
      return result[0] || undefined;
    } catch (error) {
      console.error("Error updating forum post:", error);
      return undefined;
    }
  }

  async deleteForumPost(id: string): Promise<boolean> {
    if (!this.isDbConnected) {
      const posts = this.fallbackData.get('forumPosts') || [];
      const index = posts.findIndex((p: any) => p.id === id);
      if (index !== -1) {
        posts[index] = { ...posts[index], isActive: false };
        this.fallbackData.set('forumPosts', posts);
        return true;
      }
      return false;
    }
    try {
      await db
        .update(forumPosts)
        .set({ isActive: false })
        .where(eq(forumPosts.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting forum post:", error);
      return false;
    }
  }

  async getForumReplies(postId: string): Promise<(ForumReply & { user: User })[]> {
    if (!this.isDbConnected) {
      return this.fallbackData.get(`forumReplies_${postId}`) || [];
    }
    try {
      const result = await db
        .select()
        .from(forumReplies)
        .innerJoin(users, eq(forumReplies.userId, users.id))
        .where(and(eq(forumReplies.postId, postId), eq(forumReplies.isActive, true)))
        .orderBy(forumReplies.createdAt);
      
      return result.map(row => ({
        ...row.forum_replies,
        user: row.users
      }));
    } catch (error) {
      console.error("Error fetching forum replies:", error);
      return this.fallbackData.get(`forumReplies_${postId}`) || [];
    }
  }

  async createForumReply(data: InsertForumReply): Promise<ForumReply> {
    if (!this.isDbConnected) {
      const newReply = {
        id: randomUUID(),
        ...data,
        parentReplyId: data.parentReplyId || null,
        isActive: true,
        likesCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const replies = this.fallbackData.get(`forumReplies_${data.postId}`) || [];
      replies.push(newReply);
      this.fallbackData.set(`forumReplies_${data.postId}`, replies);
      
      // Update reply count
      const posts = this.fallbackData.get('forumPosts') || [];
      const postIndex = posts.findIndex((p: any) => p.id === data.postId);
      if (postIndex !== -1) {
        posts[postIndex].repliesCount = (posts[postIndex].repliesCount || 0) + 1;
        this.fallbackData.set('forumPosts', posts);
      }
      
      return newReply;
    }
    try {
      const result = await db
        .insert(forumReplies)
        .values({
          ...data,
          parentReplyId: data.parentReplyId || null
        })
        .returning();
      
      // Update reply count in the post
      await db
        .update(forumPosts)
        .set({ 
          repliesCount: sql`COALESCE(${forumPosts.repliesCount}, 0) + 1`,
          updatedAt: new Date()
        })
        .where(eq(forumPosts.id, data.postId));
      
      return result[0];
    } catch (error) {
      console.error("Error creating forum reply:", error);
      throw error;
    }
  }

  async updateForumReply(id: string, data: Partial<InsertForumReply>): Promise<ForumReply | undefined> {
    if (!this.isDbConnected) {
      for (const key of this.fallbackData.keys()) {
        if (key.startsWith('forumReplies_')) {
          const replies = this.fallbackData.get(key) || [];
          const index = replies.findIndex((r: any) => r.id === id);
          if (index !== -1) {
            replies[index] = { ...replies[index], ...data, updatedAt: new Date() };
            this.fallbackData.set(key, replies);
            return replies[index];
          }
        }
      }
      return undefined;
    }
    try {
      const result = await db
        .update(forumReplies)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(forumReplies.id, id))
        .returning();
      return result[0] || undefined;
    } catch (error) {
      console.error("Error updating forum reply:", error);
      return undefined;
    }
  }

  async deleteForumReply(id: string): Promise<boolean> {
    if (!this.isDbConnected) {
      for (const key of this.fallbackData.keys()) {
        if (key.startsWith('forumReplies_')) {
          const replies = this.fallbackData.get(key) || [];
          const index = replies.findIndex((r: any) => r.id === id);
          if (index !== -1) {
            const reply = replies[index];
            replies[index] = { ...reply, isActive: false };
            this.fallbackData.set(key, replies);
            
            // Update reply count
            const posts = this.fallbackData.get('forumPosts') || [];
            const postIndex = posts.findIndex((p: any) => p.id === reply.postId);
            if (postIndex !== -1) {
              posts[postIndex].repliesCount = Math.max(0, (posts[postIndex].repliesCount || 0) - 1);
              this.fallbackData.set('forumPosts', posts);
            }
            return true;
          }
        }
      }
      return false;
    }
    try {
      const reply = await db
        .select()
        .from(forumReplies)
        .where(eq(forumReplies.id, id))
        .limit(1);
      
      if (reply.length === 0) return false;
      
      await db
        .update(forumReplies)
        .set({ isActive: false })
        .where(eq(forumReplies.id, id));
      
      // Update reply count
      await db
        .update(forumPosts)
        .set({ repliesCount: sql`${forumPosts.repliesCount} - 1` })
        .where(eq(forumPosts.id, reply[0].postId));
      
      return true;
    } catch (error) {
      console.error("Error deleting forum reply:", error);
      return false;
    }
  }

  async toggleForumLike(data: InsertForumLike): Promise<{ liked: boolean; likesCount: number }> {
    if (!this.isDbConnected) {
      // Simplified in-memory implementation
      return { liked: true, likesCount: 1 };
    }
    try {
      const existingLike = await db
        .select()
        .from(forumLikes)
        .where(
          and(
            eq(forumLikes.userId, data.userId),
            data.postId ? eq(forumLikes.postId, data.postId) : sql`${forumLikes.postId} IS NULL`,
            data.replyId ? eq(forumLikes.replyId, data.replyId) : sql`${forumLikes.replyId} IS NULL`
          )
        );

      if (existingLike.length > 0) {
        // Remove like
        await db
          .delete(forumLikes)
          .where(eq(forumLikes.id, existingLike[0].id));
        
        // Update count
        if (data.postId) {
          await db
            .update(forumPosts)
            .set({ likesCount: sql`${forumPosts.likesCount} - 1` })
            .where(eq(forumPosts.id, data.postId));
          
          const updatedPost = await db
            .select({ likesCount: forumPosts.likesCount })
            .from(forumPosts)
            .where(eq(forumPosts.id, data.postId));
          
          return { liked: false, likesCount: updatedPost[0]?.likesCount || 0 };
        } else if (data.replyId) {
          await db
            .update(forumReplies)
            .set({ likesCount: sql`${forumReplies.likesCount} - 1` })
            .where(eq(forumReplies.id, data.replyId));
          
          const updatedReply = await db
            .select({ likesCount: forumReplies.likesCount })
            .from(forumReplies)
            .where(eq(forumReplies.id, data.replyId));
          
          return { liked: false, likesCount: updatedReply[0]?.likesCount || 0 };
        }
      } else {
        // Add like
        await db
          .insert(forumLikes)
          .values(data);
        
        // Update count
        if (data.postId) {
          await db
            .update(forumPosts)
            .set({ likesCount: sql`${forumPosts.likesCount} + 1` })
            .where(eq(forumPosts.id, data.postId));
          
          const updatedPost = await db
            .select({ likesCount: forumPosts.likesCount })
            .from(forumPosts)
            .where(eq(forumPosts.id, data.postId));
          
          return { liked: true, likesCount: updatedPost[0]?.likesCount || 1 };
        } else if (data.replyId) {
          await db
            .update(forumReplies)
            .set({ likesCount: sql`${forumReplies.likesCount} + 1` })
            .where(eq(forumReplies.id, data.replyId));
          
          const updatedReply = await db
            .select({ likesCount: forumReplies.likesCount })
            .from(forumReplies)
            .where(eq(forumReplies.id, data.replyId));
          
          return { liked: true, likesCount: updatedReply[0]?.likesCount || 1 };
        }
      }
      
      return { liked: false, likesCount: 0 };
    } catch (error) {
      console.error("Error toggling forum like:", error);
      return { liked: false, likesCount: 0 };
    }
  }

  async getForumLike(userId: number, postId?: string, replyId?: string): Promise<ForumLike | undefined> {
    if (!this.isDbConnected) {
      return undefined;
    }
    try {
      const result = await db
        .select()
        .from(forumLikes)
        .where(
          and(
            eq(forumLikes.userId, userId),
            postId ? eq(forumLikes.postId, postId) : sql`${forumLikes.postId} IS NULL`,
            replyId ? eq(forumLikes.replyId, replyId) : sql`${forumLikes.replyId} IS NULL`
          )
        );
      
      return result[0] || undefined;
    } catch (error) {
      console.error("Error fetching forum like:", error);
      return undefined;
    }
  }

  // Badge system implementation
  async getBadges(): Promise<Badge[]> {
    if (!this.isDbConnected) {
      return this.fallbackData.get('badges') || [];
    }
    try {
      return await db.select().from(badges);
    } catch (error) {
      console.error("Error fetching badges:", error);
      return this.fallbackData.get('badges') || [];
    }
  }

  async createBadge(badge: InsertBadge): Promise<Badge> {
    if (!this.isDbConnected) {
      const newBadge = { ...badge, id: randomUUID(), createdAt: new Date(), updatedAt: new Date() };
      const allBadges = this.fallbackData.get('badges') || [];
      allBadges.push(newBadge);
      this.fallbackData.set('badges', allBadges);
      return newBadge as Badge;
    }
    try {
      const [createdBadge] = await db.insert(badges).values(badge).returning();
      return createdBadge;
    } catch (error) {
      console.error("Error creating badge:", error);
      throw error;
    }
  }

  async getUserBadges(userId: number): Promise<(UserBadge & { badge: Badge })[]> {
    if (!this.isDbConnected) {
      const userBadges = this.fallbackData.get(`userBadges_${userId}`) || [];
      const allBadges = this.fallbackData.get('badges') || [];
      return userBadges.map((ub: any) => ({
        ...ub,
        badge: allBadges.find((b: any) => b.id === ub.badgeId) || {}
      }));
    }
    try {
      const result = await db
        .select({
          id: userBadges.id,
          userId: userBadges.userId,
          badgeId: userBadges.badgeId,
          earnedAt: userBadges.earnedAt,
          relatedId: userBadges.relatedId,
          badge: badges
        })
        .from(userBadges)
        .innerJoin(badges, eq(userBadges.badgeId, badges.id))
        .where(eq(userBadges.userId, userId));
      return result;
    } catch (error) {
      console.error("Error fetching user badges:", error);
      return [];
    }
  }

  async awardBadge(userBadge: InsertUserBadge): Promise<UserBadge> {
    if (!this.isDbConnected) {
      const newUserBadge = { ...userBadge, id: randomUUID(), awardedAt: new Date() };
      const allUserBadges = this.fallbackData.get(`userBadges_${userBadge.userId}`) || [];
      allUserBadges.push(newUserBadge);
      this.fallbackData.set(`userBadges_${userBadge.userId}`, allUserBadges);
      return newUserBadge as UserBadge;
    }
    try {
      const [awarded] = await db.insert(userBadges).values(userBadge).returning();
      return awarded;
    } catch (error) {
      console.error("Error awarding badge:", error);
      throw error;
    }
  }

  async checkAndAwardBadges(userId: number, type: string, relatedId?: string): Promise<UserBadge[]> {
    try {
      // Get available badges for the given type
      const availableBadges = await this.getBadges();
      const typeBadges = availableBadges.filter(badge => badge.type === type);
      
      if (typeBadges.length === 0) return [];

      // Get user's current badges to avoid duplicates
      const currentUserBadges = await this.getUserBadges(userId);
      const currentBadgeIds = currentUserBadges.map(ub => ub.badgeId);
      
      const newBadges: UserBadge[] = [];
      
      for (const badge of typeBadges) {
        if (currentBadgeIds.includes(badge.id)) continue; // Already has this badge
        
        // Check if user meets criteria for this badge
        const meetsRequirement = await this.checkBadgeRequirement(userId, badge, relatedId);
        if (meetsRequirement) {
          const userBadge = await this.awardBadge({
            userId,
            badgeId: badge.id,
            relatedId: relatedId || null
          });
          newBadges.push(userBadge);
        }
      }
      
      return newBadges;
    } catch (error) {
      console.error("Error checking and awarding badges:", error);
      return [];
    }
  }

  private async checkBadgeRequirement(userId: number, badge: Badge, relatedId?: string): Promise<boolean> {
    try {
      const criteria = badge.criteria as any;
      
      switch (badge.type) {
        case 'course_completion':
          if (criteria?.courseType && relatedId) {
            const course = await this.getCourse(relatedId);
            return !!(course?.title?.includes(criteria.courseType) || course?.description?.includes(criteria.courseType));
          }
          return true; // Award badge for completing any course
          
        case 'milestone':
          if (criteria?.coursesCompleted) {
            const userProgress = await this.getUserProgress(userId);
            const completedCourses = userProgress.filter(p => p.isCompleted).length;
            return completedCourses >= criteria.coursesCompleted;
          }
          if (criteria?.totalXp) {
            const userStats = await this.getUserStats(userId);
            return (userStats?.totalXp || 0) >= criteria.totalXp;
          }
          if (criteria?.firstLogin) {
            return true; // Assume this is checked on first login
          }
          return true;
          
        case 'streak':
          if (criteria?.streakDays) {
            const userStats = await this.getUserStats(userId);
            return (userStats?.currentStreak || 0) >= criteria.streakDays;
          }
          return true;
          
        case 'achievement':
          if (criteria?.examScore) {
            // Check for perfect scores or high achievements
            return true; // Placeholder for now
          }
          return true;
          
        default:
          return false;
      }
    } catch (error) {
      console.error("Error checking badge requirement:", error);
      return false;
    }
  }

  // Goal tracking system implementation
  async createGoal(goalData: InsertGoal): Promise<Goal> {
    if (!this.isDbConnected) {
      const newGoal = {
        ...goalData,
        id: randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
        totalTopics: 0,
        completedTopics: 0
      };
      const userGoals = this.fallbackData.get(`goals_${goalData.userId}`) || [];
      userGoals.push(newGoal);
      this.fallbackData.set(`goals_${goalData.userId}`, userGoals);
      return newGoal as Goal;
    }
    
    try {
      const [goal] = await db.insert(goals).values(goalData).returning();
      return goal;
    } catch (error) {
      console.error("Error creating goal:", error);
      throw error;
    }
  }

  async getUserGoals(userId: number): Promise<Goal[]> {
    if (!this.isDbConnected) {
      return this.fallbackData.get(`goals_${userId}`) || [];
    }
    
    try {
      const goals = await db.select().from(goals).where(eq(goals.userId, userId)).orderBy(desc(goals.createdAt));
      
      // Calculate subtopic totals for each goal
      const goalsWithSubtopicTotals = await Promise.all(
        goals.map(async (goal) => {
          const { totalSubtopics, completedSubtopics } = await this.calculateGoalSubtopicTotals(goal.id);
          return {
            ...goal,
            totalSubtopics,
            completedSubtopics
          };
        })
      );
      
      return goalsWithSubtopicTotals;
    } catch (error) {
      console.error("Error fetching user goals:", error);
      return this.fallbackData.get(`goals_${userId}`) || [];
    }
  }

  // Helper method to calculate subtopic totals for a goal
  private async calculateGoalSubtopicTotals(goalId: string): Promise<{ totalSubtopics: number; completedSubtopics: number }> {
    try {
      const categories = await this.getGoalCategories(goalId);
      let totalSubtopics = 0;
      let completedSubtopics = 0;
      
      for (const category of categories) {
        const topics = await this.getCategoryTopics(category.id);
        for (const topic of topics) {
          const subtopics = await this.getTopicSubtopics(topic.id);
          totalSubtopics += subtopics.length;
          completedSubtopics += subtopics.filter(s => s.status === 'completed').length;
        }
      }
      
      return { totalSubtopics, completedSubtopics };
    } catch (error) {
      console.error("Error calculating subtopic totals:", error);
      return { totalSubtopics: 0, completedSubtopics: 0 };
    }
  }

  async getGoal(id: string): Promise<Goal | undefined> {
    if (!this.isDbConnected) {
      for (const key of this.fallbackData.keys()) {
        if (key.startsWith('goals_')) {
          const goals = this.fallbackData.get(key) || [];
          const goal = goals.find((g: any) => g.id === id);
          if (goal) return goal;
        }
      }
      return undefined;
    }
    
    try {
      const result = await db.select().from(goals).where(eq(goals.id, id));
      return result[0];
    } catch (error) {
      console.error("Error fetching goal:", error);
      return undefined;
    }
  }

  async updateGoal(id: string, goalData: Partial<InsertGoal>): Promise<Goal | undefined> {
    if (!this.isDbConnected) {
      for (const key of this.fallbackData.keys()) {
        if (key.startsWith('goals_')) {
          const goals = this.fallbackData.get(key) || [];
          const index = goals.findIndex((g: any) => g.id === id);
          if (index !== -1) {
            goals[index] = { ...goals[index], ...goalData, updatedAt: new Date() };
            this.fallbackData.set(key, goals);
            return goals[index];
          }
        }
      }
      return undefined;
    }
    
    try {
      const [goal] = await db
        .update(goals)
        .set({ ...goalData, updatedAt: new Date() })
        .where(eq(goals.id, id))
        .returning();
      return goal;
    } catch (error) {
      console.error("Error updating goal:", error);
      return undefined;
    }
  }

  async deleteGoal(id: string): Promise<boolean> {
    if (!this.isDbConnected) {
      for (const key of this.fallbackData.keys()) {
        if (key.startsWith('goals_')) {
          const goals = this.fallbackData.get(key) || [];
          const index = goals.findIndex((g: any) => g.id === id);
          if (index !== -1) {
            goals.splice(index, 1);
            this.fallbackData.set(key, goals);
            // Clean up related categories and topics
            this.fallbackData.delete(`categories_${id}`);
            this.fallbackData.delete(`topics_${id}`);
            return true;
          }
        }
      }
      return false;
    }
    
    try {
      const result = await db.delete(goals).where(eq(goals.id, id));
      return result.length > 0;
    } catch (error) {
      console.error("Error deleting goal:", error);
      return false;
    }
  }

  async createGoalFromCSV(userId: number, goalName: string, csvData: any[]): Promise<Goal> {
    try {
      // Create the main goal
      const goalData: InsertGoal = {
        userId,
        name: goalName,
        description: `Goal created from CSV with ${csvData.length} subtopics`,
        csvData,
        totalTopics: 0, // Will be calculated after processing
        completedTopics: 0
      };
      
      const goal = await this.createGoal(goalData);
      
      // Process CSV data and create categories, topics, and subtopics
      const categoryMap = new Map<string, string>();
      const topicMap = new Map<string, string>();
      
      for (const row of csvData) {
        const categoryName = row.Category || row.category || 'General';
        const topicName = row.Topics || row.Topic || row.topic || 'Untitled Topic';
        const subtopicName = row['Sub-topics'] || row.Subtopic || row.subtopic || topicName;
        const status = (row.Status || row.status || 'pending').toLowerCase();
        
        // Create or get category
        let categoryId = categoryMap.get(categoryName);
        if (!categoryId) {
          const categoryData: InsertGoalCategory = {
            goalId: goal.id,
            name: categoryName,
            description: `Category for ${categoryName}`,
            totalTopics: 0,
            completedTopics: 0
          };
          
          const category = await this.createGoalCategory(categoryData);
          categoryId = category.id;
          categoryMap.set(categoryName, categoryId);
        }
        
        // Create or get topic
        const topicKey = `${categoryId}-${topicName}`;
        let topicId = topicMap.get(topicKey);
        if (!topicId) {
          const topicData: InsertGoalTopic = {
            categoryId,
            name: topicName,
            description: `Topic for ${topicName}`,
            totalSubtopics: 0,
            completedSubtopics: 0
          };
          
          const topic = await this.createGoalTopic(topicData);
          topicId = topic.id;
          topicMap.set(topicKey, topicId);
        }
        
        // Create subtopic with the status
        const priority = (row.priority || row.Priority || 'medium').toLowerCase();
        const subtopicData: InsertGoalSubtopic = {
          topicId,
          name: subtopicName.trim(),
          description: row.description || row.Description || null,
          status: ['pending', 'start', 'completed'].includes(status) 
            ? status as "pending" | "start" | "completed" 
            : 'pending',
          priority: ['low', 'medium', 'high'].includes(priority) 
            ? priority as "low" | "medium" | "high" 
            : 'medium',
          notes: row.notes || row.Notes || null,
          dueDate: row.dueDate || row.DueDate ? new Date(row.dueDate || row.DueDate) : null
        };
        
        await this.createGoalSubtopic(subtopicData);
      }
      
      // Update all counters after processing all data
      for (const [topicKey, topicId] of topicMap) {
        const subtopics = await this.getTopicSubtopics(topicId);
        const completedSubtopics = subtopics.filter(s => s.status === 'completed').length;
        
        if (this.isDbConnected) {
          await db
            .update(goalTopics)
            .set({ 
              totalSubtopics: subtopics.length,
              completedSubtopics,
              updatedAt: new Date()
            })
            .where(eq(goalTopics.id, topicId));
        }
      }
      
      // Update category topic counts
      for (const [categoryName, categoryId] of categoryMap) {
        const topics = await this.getCategoryTopics(categoryId);
        const totalSubtopics = topics.reduce((sum, topic) => sum + (topic.totalSubtopics || 0), 0);
        const completedSubtopics = topics.reduce((sum, topic) => sum + (topic.completedSubtopics || 0), 0);
        
        await this.updateGoalCategory(categoryId, {
          totalTopics: topics.length,
          completedTopics: completedSubtopics // Total completed subtopics in category
        });
      }
      
      // Update goal counts
      const allCategories = await this.getGoalCategories(goal.id);
      const totalSubtopicsInGoal = allCategories.reduce((sum, cat) => sum + (cat.completedTopics || 0), 0);
      const completedSubtopicsInGoal = csvData.filter(row => 
        (row.Status || row.status || 'pending').toLowerCase() === 'completed'
      ).length;
      
      await this.updateGoal(goal.id, { 
        totalTopics: totalSubtopicsInGoal, // Actually tracking total subtopics
        completedTopics: completedSubtopicsInGoal 
      });
      
      return goal;
    } catch (error) {
      console.error("Error creating goal from CSV:", error);
      throw error;
    }
  }

  async getGoalWithCategories(goalId: string): Promise<Goal & { categories: (GoalCategory & { topics: (GoalTopic & { subtopics: GoalSubtopic[] })[] })[] } | undefined> {
    const goal = await this.getGoal(goalId);
    if (!goal) return undefined;
    
    const categories = await this.getGoalCategories(goalId);
    const categoriesWithTopics = await Promise.all(
      categories.map(async (category) => {
        const topics = await this.getCategoryTopics(category.id);
        const topicsWithSubtopics = await Promise.all(
          topics.map(async (topic) => {
            const subtopics = await this.getTopicSubtopics(topic.id);
            return { ...topic, subtopics };
          })
        );
        return { ...category, topics: topicsWithSubtopics };
      })
    );
    
    return { ...goal, categories: categoriesWithTopics };
  }

  async updateTopicStatus(topicId: string, status: "pending" | "start" | "completed", notes?: string): Promise<GoalTopic | undefined> {
    // This method is deprecated - status is now managed at subtopic level
    // Return the topic for compatibility
    return await this.getTopic(topicId);
  }
  
  private async getTopic(topicId: string): Promise<GoalTopic | undefined> {
    if (!this.isDbConnected) {
      for (const key of this.fallbackData.keys()) {
        if (key.startsWith('topics_')) {
          const topics = this.fallbackData.get(key) || [];
          const topic = topics.find((t: any) => t.id === topicId);
          if (topic) return topic;
        }
      }
      return undefined;
    }
    
    try {
      const result = await db.select().from(goalTopics).where(eq(goalTopics.id, topicId));
      return result[0];
    } catch (error) {
      console.error("Error fetching topic:", error);
      return undefined;
    }
  }

  // Helper methods for goal management
  private async createGoalCategory(categoryData: InsertGoalCategory): Promise<GoalCategory> {
    if (!this.isDbConnected) {
      const newCategory = {
        ...categoryData,
        id: randomUUID(),
        createdAt: new Date()
      };
      const categories = this.fallbackData.get(`categories_${categoryData.goalId}`) || [];
      categories.push(newCategory);
      this.fallbackData.set(`categories_${categoryData.goalId}`, categories);
      return newCategory as GoalCategory;
    }
    
    const [category] = await db.insert(goalCategories).values(categoryData).returning();
    return category;
  }

  private async getGoalCategories(goalId: string): Promise<GoalCategory[]> {
    if (!this.isDbConnected) {
      return this.fallbackData.get(`categories_${goalId}`) || [];
    }
    
    return await db.select().from(goalCategories).where(eq(goalCategories.goalId, goalId)).orderBy(goalCategories.createdAt);
  }

  private async updateGoalCategory(id: string, data: Partial<InsertGoalCategory>): Promise<GoalCategory | undefined> {
    if (!this.isDbConnected) {
      // Implementation for fallback storage
      return undefined;
    }
    
    const [category] = await db
      .update(goalCategories)
      .set(data)
      .where(eq(goalCategories.id, id))
      .returning();
    
    return category;
  }

  private async createGoalTopic(topicData: InsertGoalTopic): Promise<GoalTopic> {
    if (!this.isDbConnected) {
      const newTopic = {
        ...topicData,
        id: randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const topics = this.fallbackData.get(`topics_${topicData.categoryId}`) || [];
      topics.push(newTopic);
      this.fallbackData.set(`topics_${topicData.categoryId}`, topics);
      return newTopic as GoalTopic;
    }
    
    const [topic] = await db.insert(goalTopics).values(topicData).returning();
    return topic;
  }

  private async getCategoryTopics(categoryId: string): Promise<GoalTopic[]> {
    if (!this.isDbConnected) {
      return this.fallbackData.get(`topics_${categoryId}`) || [];
    }
    
    return await db.select().from(goalTopics).where(eq(goalTopics.categoryId, categoryId)).orderBy(goalTopics.createdAt);
  }

  private async updateProgressCounters(categoryId: string): Promise<void> {
    try {
      const topics = await this.getCategoryTopics(categoryId);
      const completedTopics = topics.reduce((sum, topic) => sum + (topic.completedSubtopics || 0), 0);
      const totalTopics = topics.reduce((sum, topic) => sum + (topic.totalSubtopics || 0), 0);
      
      // Update category counters
      await this.updateGoalCategory(categoryId, {
        totalTopics: topics.length,
        completedTopics: completedTopics
      });
      
      // Get category to find goal ID and update goal counters
      const category = await this.getGoalCategory(categoryId);
      if (category) {
        const allCategories = await this.getGoalCategories(category.goalId);
        const totalSubtopics = allCategories.reduce((sum, cat) => sum + (cat.totalTopics || 0), 0);
        const completedSubtopics = allCategories.reduce((sum, cat) => sum + (cat.completedTopics || 0), 0);
        
        await this.updateGoal(category.goalId, {
          totalTopics: allCategories.length,
          completedTopics: completedSubtopics,
          totalSubtopics: totalSubtopics,
          completedSubtopics: completedSubtopics
        });
      }
    } catch (error) {
      console.error("Error updating progress counters:", error);
    }
  }

  private async getGoalCategory(id: string): Promise<GoalCategory | undefined> {
    if (!this.isDbConnected) {
      return undefined;
    }
    
    const result = await db.select().from(goalCategories).where(eq(goalCategories.id, id));
    return result[0];
  }

  // Subtopic management methods
  async createGoalSubtopic(subtopicData: InsertGoalSubtopic): Promise<GoalSubtopic> {
    if (!this.isDbConnected) {
      const newSubtopic = {
        ...subtopicData,
        id: randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const subtopics = this.fallbackData.get(`subtopics_${subtopicData.topicId}`) || [];
      subtopics.push(newSubtopic);
      this.fallbackData.set(`subtopics_${subtopicData.topicId}`, subtopics);
      return newSubtopic as GoalSubtopic;
    }
    
    const [subtopic] = await db.insert(goalSubtopics).values([{
      ...subtopicData,
      status: subtopicData.status as "pending" | "start" | "completed",
      priority: subtopicData.priority as "low" | "medium" | "high"
    }]).returning();
    return subtopic;
  }

  async getTopicSubtopics(topicId: string): Promise<GoalSubtopic[]> {
    if (!this.isDbConnected) {
      return this.fallbackData.get(`subtopics_${topicId}`) || [];
    }
    
    return await db.select().from(goalSubtopics).where(eq(goalSubtopics.topicId, topicId)).orderBy(goalSubtopics.createdAt);
  }

  async updateSubtopicStatus(subtopicId: string, status: "pending" | "start" | "completed", notes?: string): Promise<GoalSubtopic | undefined> {
    const updateData = {
      status,
      notes,
      ...(status === 'completed' && { completedAt: new Date() }),
      updatedAt: new Date()
    };
    
    if (!this.isDbConnected) {
      for (const key of this.fallbackData.keys()) {
        if (key.startsWith('subtopics_')) {
          const subtopics = this.fallbackData.get(key) || [];
          const index = subtopics.findIndex((s: any) => s.id === subtopicId);
          if (index !== -1) {
            subtopics[index] = { ...subtopics[index], ...updateData };
            this.fallbackData.set(key, subtopics);
            return subtopics[index];
          }
        }
      }
      return undefined;
    }
    
    try {
      const [subtopic] = await db
        .update(goalSubtopics)
        .set(updateData)
        .where(eq(goalSubtopics.id, subtopicId))
        .returning();
      
      if (subtopic) {
        // Update topic and category counters
        await this.updateTopicProgressCounters(subtopic.topicId);
      }
      
      return subtopic;
    } catch (error) {
      console.error("Error updating subtopic status:", error);
      return undefined;
    }
  }

  async deleteSubtopic(subtopicId: string): Promise<boolean> {
    if (!this.isDbConnected) {
      for (const key of this.fallbackData.keys()) {
        if (key.startsWith('subtopics_')) {
          const subtopics = this.fallbackData.get(key) || [];
          const index = subtopics.findIndex((s: any) => s.id === subtopicId);
          if (index !== -1) {
            subtopics.splice(index, 1);
            this.fallbackData.set(key, subtopics);
            return true;
          }
        }
      }
      return false;
    }
    
    try {
      const result = await db.delete(goalSubtopics).where(eq(goalSubtopics.id, subtopicId));
      return result.length > 0;
    } catch (error) {
      console.error("Error deleting subtopic:", error);
      return false;
    }
  }

  private async updateTopicProgressCounters(topicId: string): Promise<void> {
    try {
      const subtopics = await this.getTopicSubtopics(topicId);
      const completedSubtopics = subtopics.filter(s => s.status === 'completed').length;
      
      // Update topic counters
      await db
        .update(goalTopics)
        .set({ 
          totalSubtopics: subtopics.length,
          completedSubtopics,
          updatedAt: new Date()
        })
        .where(eq(goalTopics.id, topicId));
      
      // Get topic to find category ID and update category counters
      const [topic] = await db.select().from(goalTopics).where(eq(goalTopics.id, topicId));
      if (topic) {
        await this.updateProgressCounters(topic.categoryId);
      }
    } catch (error) {
      console.error("Error updating topic progress counters:", error);
    }
  }
}

// Create storage instance
export const storage: IStorage = new PgStorage();
