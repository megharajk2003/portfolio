import { eq, sql } from "drizzle-orm";
import { db } from "./db";
import {
  badges,
  userBadges,
  userStats,
} from "@shared/schema";
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
  type Notification,
  type InsertNotification,
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
  notifications,
} from "@shared/schema";
import { getTableColumns } from "drizzle-orm";
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
  updateGeneratedResume(
    id: string,
    data: Partial<InsertGeneratedResume>
  ): Promise<GeneratedResume | undefined>;
  deleteGeneratedResume(id: string): Promise<boolean>;

  getChatSessions(userId: number): Promise<ChatSession[]>;
  getChatSession(id: string): Promise<ChatSession | undefined>;
  createChatSession(data: InsertChatSession): Promise<ChatSession>;
  updateChatSession(
    id: string,
    data: Partial<InsertChatSession>
  ): Promise<ChatSession | undefined>;

  // Forum methods
  getForumPosts(): Promise<
    (ForumPost & { user: User; repliesCount: number })[]
  >;
  getForumPost(id: string): Promise<(ForumPost & { user: User }) | undefined>;
  createForumPost(data: InsertForumPost): Promise<ForumPost>;
  updateForumPost(
    id: string,
    data: Partial<InsertForumPost>
  ): Promise<ForumPost | undefined>;
  deleteForumPost(id: string): Promise<boolean>;

  getForumReplies(postId: string): Promise<(ForumReply & { user: User })[]>;
  createForumReply(data: InsertForumReply): Promise<ForumReply>;
  updateForumReply(
    id: string,
    data: Partial<InsertForumReply>
  ): Promise<ForumReply | undefined>;
  deleteForumReply(id: string): Promise<boolean>;

  toggleForumLike(
    data: InsertForumLike
  ): Promise<{ liked: boolean; likesCount: number }>;
  getForumLike(
    userId: number,
    postId?: string,
    replyId?: string
  ): Promise<ForumLike | undefined>;

  // New learning platform methods
  getCourses(): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(
    id: string,
    course: Partial<InsertCourse>
  ): Promise<Course | undefined>;
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
  updateEnrollment(
    id: string,
    enrollment: Partial<InsertEnrollment>
  ): Promise<Enrollment | undefined>;

  getCourseReviews(courseId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Lesson Progress methods
  getLessonProgress(
    userId: number,
    moduleId: string
  ): Promise<LessonProgress[]>;
  getLessonProgressByIndex(
    userId: number,
    moduleId: string,
    lessonIndex: number
  ): Promise<LessonProgress | undefined>;
  createLessonProgress(progress: InsertLessonProgress): Promise<LessonProgress>;
  completeLessonProgress(
    userId: number,
    moduleId: string,
    lessonIndex: number
  ): Promise<LessonProgress>;

  // Badge system methods
  getBadges(): Promise<Badge[]>;
  createBadge(badge: InsertBadge): Promise<Badge>;
  getUserBadges(userId: number): Promise<(UserBadge & { badge: Badge })[]>;
  awardBadge(userBadge: InsertUserBadge): Promise<UserBadge>;
  checkAndAwardBadges(
    userId: number,
    type: string,
    relatedId?: string
  ): Promise<UserBadge[]>;

  // Course completion checking
  checkCourseCompletion(
    userId: number,
    courseId: string
  ): Promise<{
    isCompleted: boolean;
    completedAt?: Date;
    totalLessons: number;
    completedLessons: number;
  }>;

  // Goal tracking methods
  createGoal(goalData: InsertGoal): Promise<Goal>;
  getUserGoals(userId: number): Promise<Goal[]>;
  getGoal(id: string): Promise<Goal | undefined>;
  updateGoal(
    id: string,
    goalData: Partial<InsertGoal>
  ): Promise<Goal | undefined>;
  deleteGoal(id: string): Promise<boolean>;
  createGoalFromCSV(
    userId: number,
    goalName: string,
    csvData: any[]
  ): Promise<Goal>;
  getGoalWithCategories(
    goalId: string
  ): Promise<
    | (Goal & {
        categories: (GoalCategory & {
          topics: (GoalTopic & { subtopics: GoalSubtopic[] })[];
        })[];
      })
    | undefined
  >;
  updateTopicStatus(
    topicId: string,
    status: "pending" | "start" | "completed",
    notes?: string
  ): Promise<GoalTopic | undefined>;
  // Subtopic methods
  createGoalSubtopic(subtopicData: InsertGoalSubtopic): Promise<GoalSubtopic>;
  getTopicSubtopics(topicId: string): Promise<GoalSubtopic[]>;
  updateSubtopicStatus(
    subtopicId: string,
    status: "pending" | "start" | "completed",
    notes?: string
  ): Promise<GoalSubtopic | undefined>;
  updateGoalSubtopic(
    subtopicId: string,
    updateData: Partial<InsertGoalSubtopic>
  ): Promise<GoalSubtopic | undefined>;
  deleteSubtopic(subtopicId: string): Promise<boolean>;

  // Notifications methods
  getNotifications(userId: number, limit?: number): Promise<Notification[]>;
  getUnreadNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<boolean>;
  markAllNotificationsAsRead(userId: number): Promise<boolean>;
  deleteNotification(id: string): Promise<boolean>;
  getNotificationCount(userId: number, unreadOnly?: boolean): Promise<number>;
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
      },
    ];
    
    // Store badges in fallback data
    this.fallbackData.set("badges", badgeData);
  }

  async updateGoalSubtopic(
    subtopicId: string,
    updateData: Partial<InsertGoalSubtopic>
  ): Promise<GoalSubtopic | undefined> {
    if (!this.isDbConnected) {
      for (const key of this.fallbackData.keys()) {
        if (key.startsWith("subtopics_")) {
          const subtopics = this.fallbackData.get(key) || [];
          const index = subtopics.findIndex((s: any) => s.id === subtopicId);
          if (index !== -1) {
            subtopics[index] = {
              ...subtopics[index],
              ...updateData,
              dueDate: updateData.dueDate ? new Date(updateData.dueDate) : subtopics[index].dueDate,
              updatedAt: new Date(),
            };
            this.fallbackData.set(key, subtopics);
            return subtopics[index];
          }
        }
      }
      return undefined;
    }

    try {
      const updatePayload = {
        ...updateData,
        dueDate: updateData.dueDate ? new Date(updateData.dueDate) : undefined,
        updatedAt: new Date(),
      };

      // Remove undefined values
      Object.keys(updatePayload).forEach(key => {
        if (updatePayload[key as keyof typeof updatePayload] === undefined) {
          delete updatePayload[key as keyof typeof updatePayload];
        }
      });

      const [subtopic] = await db
        .update(goalSubtopics)
        .set(updatePayload)
        .where(eq(goalSubtopics.id, subtopicId))
        .returning();

      if (subtopic) {
        // Update topic progress counters
        await this.updateTopicProgressCounters(subtopic.topicId);
      }

      return subtopic;
    } catch (error) {
      console.error("Error updating subtopic:", error);
      return undefined;
    }
  }

  async deleteGoalSubtopic(subtopicId: string): Promise<boolean> {
    if (!this.isDbConnected) {
      for (const key of this.fallbackData.keys()) {
        if (key.startsWith("subtopics_")) {
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
      // Get the subtopic first to know which topic to update
      const subtopic = await db
        .select()
        .from(goalSubtopics)
        .where(eq(goalSubtopics.id, subtopicId))
        .limit(1);

      if (subtopic.length === 0) {
        return false;
      }

      const topicId = subtopic[0].topicId;

      await db.delete(goalSubtopics).where(eq(goalSubtopics.id, subtopicId));

      // Update topic progress counters
      await this.updateTopicProgressCounters(topicId);

      return true;
    } catch (error) {
      console.error("Error deleting subtopic:", error);
      return false;
    }
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
    const existingUser = await this.getUserByEmail(userData.email);
    
    if (existingUser) {
      // Update existing user
      const [updatedUser] = await db
        .update(users)
        .set({
          firstName: userData.firstName,
          lastName: userData.lastName,
        })
        .where(eq(users.id, existingUser.id))
        .returning();
      return updatedUser;
    } else {
      // Create new user
      return this.createUser(userData as InsertUser);
    }
  }

  // Profile management
  async getProfile(userId: string): Promise<Profile | undefined> {
    const result = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, parseInt(userId)));
    return result[0];
  }

  async createProfile(profileData: InsertProfile): Promise<Profile> {
    const [profile] = await db
      .insert(profiles)
      .values({
        ...profileData,
        userId: parseInt(profileData.userId.toString()),
      })
      .returning();
    return profile;
  }

  async updateProfile(
    userId: string,
    profileData: Partial<InsertProfile>
  ): Promise<Profile | undefined> {
    const [profile] = await db
      .update(profiles)
      .set(profileData)
      .where(eq(profiles.userId, parseInt(userId)))
      .returning();
    return profile;
  }

  // Learning modules
  async getLearningModules(): Promise<LearningModule[]> {
    return [];
  }

  async getLearningModule(id: string): Promise<LearningModule | undefined> {
    return undefined;
  }

  // User progress methods (stub implementations)
  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return [];
  }

  async getUserProgressForModule(
    userId: number,
    moduleId: string
  ): Promise<UserProgress[]> {
    return [];
  }

  async createUserProgress(
    progressData: InsertUserProgress
  ): Promise<UserProgress> {
    throw new Error("Not implemented");
  }

  async updateUserProgress(
    userId: number,
    moduleId: string,
    progressData: Partial<InsertUserProgress>
  ): Promise<UserProgress | undefined> {
    return undefined;
  }

  async getUserStats(userId: number): Promise<UserStats | undefined> {
    return undefined;
  }

  async updateUserStats(
    userId: number,
    statsData: Partial<InsertUserStats>
  ): Promise<UserStats | undefined> {
    return undefined;
  }

  async getDailyActivity(
    userId: number,
    date?: string
  ): Promise<DailyActivity[]> {
    return [];
  }

  async createDailyActivity(
    activityData: InsertDailyActivity
  ): Promise<DailyActivity> {
    throw new Error("Not implemented");
  }

  async getSectionSettings(
    userId: number
  ): Promise<SectionSettings | undefined> {
    return undefined;
  }

  async upsertSectionSettings(
    settingsData: InsertSectionSettings
  ): Promise<SectionSettings> {
    throw new Error("Not implemented");
  }

  // Work experience methods
  async getWorkExperience(userId: string): Promise<WorkExperience[]> {
    if (!this.isDbConnected) {
      return this.fallbackData.get(`workExperience_${userId}`) || [];
    }

    const result = await db
      .select()
      .from(workExperience)
      .where(eq(workExperience.userId, parseInt(userId)))
      .orderBy(desc(workExperience.startDate));
    return result;
  }

  async createWorkExperience(
    experienceData: InsertWorkExperience
  ): Promise<WorkExperience> {
    if (!this.isDbConnected) {
      const experience = {
        ...experienceData,
        id: `we_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const userExperience = this.fallbackData.get(`workExperience_${experienceData.userId}`) || [];
      userExperience.push(experience);
      this.fallbackData.set(`workExperience_${experienceData.userId}`, userExperience);
      return experience as WorkExperience;
    }

    const [experience] = await db
      .insert(workExperience)
      .values(experienceData)
      .returning();
    return experience;
  }

  async updateWorkExperience(
    id: string,
    experienceData: Partial<InsertWorkExperience>
  ): Promise<WorkExperience | undefined> {
    if (!this.isDbConnected) {
      for (const key of this.fallbackData.keys()) {
        if (key.startsWith("workExperience_")) {
          const experiences = this.fallbackData.get(key) || [];
          const index = experiences.findIndex((e: any) => e.id === id);
          if (index !== -1) {
            experiences[index] = { ...experiences[index], ...experienceData, updatedAt: new Date() };
            this.fallbackData.set(key, experiences);
            return experiences[index];
          }
        }
      }
      return undefined;
    }

    const [experience] = await db
      .update(workExperience)
      .set({
        ...experienceData,
        updatedAt: new Date(),
      })
      .where(eq(workExperience.id, id))
      .returning();
    return experience;
  }

  async deleteWorkExperience(id: string): Promise<boolean> {
    if (!this.isDbConnected) {
      for (const key of this.fallbackData.keys()) {
        if (key.startsWith("workExperience_")) {
          const experiences = this.fallbackData.get(key) || [];
          const index = experiences.findIndex((e: any) => e.id === id);
          if (index !== -1) {
            experiences.splice(index, 1);
            this.fallbackData.set(key, experiences);
            return true;
          }
        }
      }
      return false;
    }

    const result = await db
      .delete(workExperience)
      .where(eq(workExperience.id, id))
      .returning();
    return result.length > 0;
  }

  // Goal management methods
  async createGoal(goalData: InsertGoal): Promise<Goal> {
    if (!this.isDbConnected) {
      const goal = {
        ...goalData,
        id: `goal_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const userGoals = this.fallbackData.get(`goals_${goalData.userId}`) || [];
      userGoals.push(goal);
      this.fallbackData.set(`goals_${goalData.userId}`, userGoals);
      return goal as Goal;
    }

    const [goal] = await db.insert(goals).values(goalData).returning();
    return goal;
  }

  async getUserGoals(userId: number): Promise<Goal[]> {
    if (!this.isDbConnected) {
      return this.fallbackData.get(`goals_${userId}`) || [];
    }

    return await db
      .select()
      .from(goals)
      .where(eq(goals.userId, userId))
      .orderBy(desc(goals.createdAt));
  }

  async getGoal(id: string): Promise<Goal | undefined> {
    if (!this.isDbConnected) {
      for (const key of this.fallbackData.keys()) {
        if (key.startsWith("goals_")) {
          const userGoals = this.fallbackData.get(key) || [];
          const goal = userGoals.find((g: any) => g.id === id);
          if (goal) return goal;
        }
      }
      return undefined;
    }

    const result = await db.select().from(goals).where(eq(goals.id, id));
    return result[0];
  }

  async updateGoal(
    id: string,
    goalData: Partial<InsertGoal>
  ): Promise<Goal | undefined> {
    if (!this.isDbConnected) {
      for (const key of this.fallbackData.keys()) {
        if (key.startsWith("goals_")) {
          const userGoals = this.fallbackData.get(key) || [];
          const index = userGoals.findIndex((g: any) => g.id === id);
          if (index !== -1) {
            userGoals[index] = { ...userGoals[index], ...goalData, updatedAt: new Date() };
            this.fallbackData.set(key, userGoals);
            return userGoals[index];
          }
        }
      }
      return undefined;
    }

    const [goal] = await db
      .update(goals)
      .set({ ...goalData, updatedAt: new Date() })
      .where(eq(goals.id, id))
      .returning();
    return goal;
  }

  async deleteGoal(id: string): Promise<boolean> {
    if (!this.isDbConnected) {
      for (const key of this.fallbackData.keys()) {
        if (key.startsWith("goals_")) {
          const userGoals = this.fallbackData.get(key) || [];
          const index = userGoals.findIndex((g: any) => g.id === id);
          if (index !== -1) {
            userGoals.splice(index, 1);
            this.fallbackData.set(key, userGoals);
            return true;
          }
        }
      }
      return false;
    }

    const result = await db.delete(goals).where(eq(goals.id, id)).returning();
    return result.length > 0;
  }

  async createGoalFromCSV(
    userId: number,
    goalName: string,
    csvData: any[]
  ): Promise<Goal> {
    // Create the main goal
    const goalData = {
      userId,
      name: goalName,
      description: `Goal created from CSV with ${csvData.length} items`,
      totalTopics: 0,
      completedTopics: 0,
      totalSubtopics: 0,
      completedSubtopics: 0,
    };

    const goal = await this.createGoal(goalData);
    return goal;
  }

  async getGoalWithCategories(goalId: string) {
    // Stub implementation
    return undefined;
  }

  async updateTopicStatus(
    topicId: string,
    status: "pending" | "start" | "completed",
    notes?: string
  ) {
    // Stub implementation
    return undefined;
  }

  async createGoalSubtopic(subtopicData: any) {
    // Stub implementation
    return undefined;
  }

  async getTopicSubtopics(topicId: string) {
    // Stub implementation
    return [];
  }

  async updateSubtopicStatus(
    subtopicId: string,
    status: "pending" | "start" | "completed",
    notes?: string
  ) {
    // Stub implementation
    return undefined;
  }

  async deleteSubtopic(subtopicId: string): Promise<boolean> {
    // Stub implementation  
    return false;
  }

  // Notification methods
  async getNotifications(userId: number, limit?: number) {
    return [];
  }

  async getUnreadNotifications(userId: number) {
    return [];
  }

  async createNotification(notification: any) {
    return notification;
  }

  async markNotificationAsRead(id: string): Promise<boolean> {
    return true;
  }

  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    return true;
  }

  async deleteNotification(id: string): Promise<boolean> {
    return true;
  }

  async getNotificationCount(
    userId: number,
    unreadOnly: boolean = false
  ): Promise<number> {
    return 0;
  }

  // Helper method for updating topic progress
  private async updateTopicProgressCounters(topicId: string): Promise<void> {
    // Stub implementation
    console.log("Updating topic progress counters for:", topicId);
  }

  // Badge system methods implementation
  async getBadges(): Promise<Badge[]> {
    if (!this.isDbConnected) {
      return this.fallbackData.get("badges") || [];
    }
    
    return await db.select().from(badges);
  }

  async createBadge(badge: InsertBadge): Promise<Badge> {
    if (!this.isDbConnected) {
      const newBadge = { 
        id: `badge-${Date.now()}`, 
        ...badge, 
        createdAt: new Date() 
      } as Badge;
      const badgesData = this.fallbackData.get("badges") || [];
      badgesData.push(newBadge);
      this.fallbackData.set("badges", badgesData);
      return newBadge;
    }

    const [created] = await db.insert(badges).values(badge).returning();
    return created;
  }

  async getUserBadges(userId: number): Promise<(UserBadge & { badge: Badge })[]> {
    if (!this.isDbConnected) {
      const userBadgesData = this.fallbackData.get(`userBadges_${userId}`) || [];
      const badgesData = this.fallbackData.get("badges") || [];
      
      return userBadgesData.map((ub: UserBadge) => ({
        ...ub,
        badge: badgesData.find((b: Badge) => b.id === ub.badgeId) || badgesData[0]
      }));
    }

    return await db
      .select()
      .from(userBadges)
      .leftJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, userId))
      .then(rows => 
        rows.map(row => ({
          ...row.user_badges,
          badge: row.badges!
        }))
      );
  }

  async awardBadge(userBadge: InsertUserBadge): Promise<UserBadge> {
    if (!this.isDbConnected) {
      const newUserBadge = {
        id: `user_badge-${Date.now()}`,
        ...userBadge,
        earnedAt: new Date()
      } as UserBadge;
      
      const userBadgesData = this.fallbackData.get(`userBadges_${userBadge.userId}`) || [];
      userBadgesData.push(newUserBadge);
      this.fallbackData.set(`userBadges_${userBadge.userId}`, userBadgesData);
      return newUserBadge;
    }

    const [awarded] = await db.insert(userBadges).values(userBadge).returning();
    return awarded;
  }

  // Comprehensive badge checking function
  async checkAndAwardBadges(
    userId: number,
    type: string = "all",
    relatedId?: string
  ): Promise<UserBadge[]> {
    try {
      const allBadges = await this.getBadges();
      const userBadges = await this.getUserBadges(userId);
      const userBadgeIds = new Set(userBadges.map(ub => ub.badgeId));
      
      // Get user data for criteria checking
      const userData = await this.getUserCriteriaData(userId);
      
      const newBadges: UserBadge[] = [];
      
      // Check each badge that the user doesn't already have
      for (const badge of allBadges) {
        if (userBadgeIds.has(badge.id)) continue;
        
        // Filter by type if specified and not "all"
        if (type !== "all" && badge.type !== type) continue;
        
        // Check if user meets the criteria for this badge
        if (await this.checkBadgeCriteria(badge, userData, relatedId)) {
          const userBadge = await this.awardBadge({
            userId,
            badgeId: badge.id,
            relatedId
          });
          newBadges.push(userBadge);
          
          // Award XP for the badge
          if (badge.xpReward && badge.xpReward > 0) {
            await this.updateUserXP(userId, badge.xpReward);
          }
          
          console.log(`🏆 Awarded badge "${badge.title}" to user ${userId}`);
        }
      }
      
      return newBadges;
    } catch (error) {
      console.error("Error in checkAndAwardBadges:", error);
      return [];
    }
  }

  // Get user data for badge criteria evaluation
  private async getUserCriteriaData(userId: number) {
    const profile = await this.getProfile(userId.toString());
    const userStats = await this.getUserStats(userId);
    const goals = await this.getUserGoals(userId);
    const workExperience = await this.getWorkExperience(userId.toString());
    
    // Calculate profile completion percentage
    let profileCompletion = 0;
    if (profile) {
      let completedSections = 0;
      let totalSections = 0;
      
      // Check personal details
      if (profile.personalDetails) {
        const pd = profile.personalDetails as any;
        totalSections += 6;
        if (pd.fullName) completedSections++;
        if (pd.photo) completedSections++;
        if (pd.roleOrTitle) completedSections++;
        if (pd.summary) completedSections++;
        if (pd.location?.city) completedSections++;
        if (pd.dob) completedSections++;
      }
      
      // Check contact details
      if (profile.contactDetails) {
        const cd = profile.contactDetails as any;
        totalSections += 4;
        if (cd.email) completedSections++;
        if (cd.phone) completedSections++;
        if (cd.linkedin) completedSections++;
        if (cd.githubOrPortfolio) completedSections++;
      }
      
      profileCompletion = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;
    }

    return {
      profile,
      profileCompletion,
      userStats,
      goalsCount: goals.length,
      workExperienceCount: workExperience.length,
      hasProfilePicture: profile?.personalDetails?.photo ? true : false,
      hasBio: profile?.personalDetails?.summary ? true : false,
      totalXp: userStats?.totalXp || 0,
      currentStreak: userStats?.currentStreak || 0,
      // Add more criteria data as needed
      skillsCount: 0, // TODO: implement when skills are available
      projectsCount: 0, // TODO: implement when projects are available
      educationCount: 0, // TODO: implement when education is available
      lessonsCompleted: 0, // TODO: implement when lessons are available
      coursesCompleted: 0, // TODO: implement when courses are available
    };
  }

  // Check if user meets badge criteria
  private async checkBadgeCriteria(badge: Badge, userData: any, relatedId?: string): Promise<boolean> {
    if (!badge.criteria) return false;
    
    const criteria = badge.criteria as any;
    
    // Profile completion badges
    if (criteria.profileCompleted !== undefined) {
      return userData.profileCompletion >= criteria.profileCompleted;
    }
    
    // First login badge
    if (criteria.firstLogin) {
      return true; // If we're checking, user has logged in
    }
    
    // Profile picture badge
    if (criteria.profilePicture) {
      return userData.hasProfilePicture;
    }
    
    // Bio badge
    if (criteria.bioAdded) {
      return userData.hasBio;
    }
    
    // Goals created badges
    if (criteria.goalsCreated !== undefined) {
      return userData.goalsCount >= criteria.goalsCreated;
    }
    
    // Work experience badges
    if (criteria.workExperienceAdded !== undefined) {
      return userData.workExperienceCount >= criteria.workExperienceAdded;
    }
    
    // XP-based badges
    if (criteria.xpThreshold !== undefined) {
      return userData.totalXp >= criteria.xpThreshold;
    }
    
    // Streak badges
    if (criteria.streakDays !== undefined) {
      return userData.currentStreak >= criteria.streakDays;
    }
    
    // Skills badges (when implemented)
    if (criteria.skillsAdded !== undefined) {
      return userData.skillsCount >= criteria.skillsAdded;
    }
    
    // Projects badges (when implemented)
    if (criteria.projectsAdded !== undefined) {
      return userData.projectsCount >= criteria.projectsAdded;
    }
    
    // Education badges (when implemented)
    if (criteria.educationAdded !== undefined) {
      return userData.educationCount >= criteria.educationAdded;
    }
    
    // Learning-related badges (when implemented)
    if (criteria.lessonsCompleted !== undefined) {
      return userData.lessonsCompleted >= criteria.lessonsCompleted;
    }
    
    if (criteria.coursesCompleted !== undefined) {
      return userData.coursesCompleted >= criteria.coursesCompleted;
    }
    
    // Course type specific badges
    if (criteria.courseType && relatedId) {
      // TODO: Check if completed course matches the required type
      return false;
    }
    
    return false;
  }

  // Helper method to update user XP
  private async updateUserXP(userId: number, xpToAdd: number): Promise<void> {
    if (!this.isDbConnected) {
      const userStatsData = this.fallbackData.get(`userStats_${userId}`) || { totalXp: 0 };
      userStatsData.totalXp += xpToAdd;
      this.fallbackData.set(`userStats_${userId}`, userStatsData);
      return;
    }

    await db
      .update(userStats)
      .set({ 
        totalXp: sql`${userStats.totalXp} + ${xpToAdd}`,
        updatedAt: new Date()
      })
      .where(eq(userStats.userId, userId));
  }
}

// Create storage instance  
export const storage: IStorage = new PgStorage();
