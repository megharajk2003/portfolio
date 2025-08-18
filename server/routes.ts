import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertProfileSchema, insertWorkExperienceSchema,
  insertEducationSchema, insertSkillSchema, insertProjectSchema,
  insertCertificationSchema, insertAchievementSchema, insertUserProgressSchema,
  insertDailyActivitySchema, insertSectionSettingsSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      const user = await storage.createUser(userData);
      res.json({ id: user.id, username: user.username, email: user.email });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      res.json({ id: user.id, username: user.username, email: user.email });
    } catch (error) {
      res.status(400).json({ message: "Login failed" });
    }
  });

  // Profile routes
  app.get("/api/profile/:userId", async (req, res) => {
    try {
      const profile = await storage.getProfile(req.params.userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post("/api/profile", async (req, res) => {
    try {
      const profileData = insertProfileSchema.parse(req.body);
      const profile = await storage.createProfile(profileData);
      res.json(profile);
    } catch (error) {
      res.status(400).json({ message: "Invalid profile data" });
    }
  });

  app.patch("/api/profile/:userId", async (req, res) => {
    try {
      const profile = await storage.updateProfile(req.params.userId, req.body);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Work Experience routes
  app.get("/api/work-experience/:userId", async (req, res) => {
    try {
      const experiences = await storage.getWorkExperience(req.params.userId);
      res.json(experiences);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch work experience" });
    }
  });

  app.post("/api/work-experience", async (req, res) => {
    try {
      const experienceData = insertWorkExperienceSchema.parse(req.body);
      const experience = await storage.createWorkExperience(experienceData);
      res.json(experience);
    } catch (error) {
      res.status(400).json({ message: "Invalid work experience data" });
    }
  });

  app.patch("/api/work-experience/:id", async (req, res) => {
    try {
      const experience = await storage.updateWorkExperience(req.params.id, req.body);
      if (!experience) {
        return res.status(404).json({ message: "Work experience not found" });
      }
      res.json(experience);
    } catch (error) {
      res.status(500).json({ message: "Failed to update work experience" });
    }
  });

  app.delete("/api/work-experience/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteWorkExperience(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Work experience not found" });
      }
      res.json({ message: "Work experience deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete work experience" });
    }
  });

  // Education routes
  app.get("/api/education/:userId", async (req, res) => {
    try {
      const education = await storage.getEducation(req.params.userId);
      res.json(education);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch education" });
    }
  });

  app.post("/api/education", async (req, res) => {
    try {
      const educationData = insertEducationSchema.parse(req.body);
      const education = await storage.createEducation(educationData);
      res.json(education);
    } catch (error) {
      res.status(400).json({ message: "Invalid education data" });
    }
  });

  app.patch("/api/education/:id", async (req, res) => {
    try {
      const education = await storage.updateEducation(req.params.id, req.body);
      if (!education) {
        return res.status(404).json({ message: "Education not found" });
      }
      res.json(education);
    } catch (error) {
      res.status(500).json({ message: "Failed to update education" });
    }
  });

  app.delete("/api/education/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteEducation(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Education not found" });
      }
      res.json({ message: "Education deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete education" });
    }
  });

  // Skills routes
  app.get("/api/skills/:userId", async (req, res) => {
    try {
      const skills = await storage.getSkills(req.params.userId);
      res.json(skills);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch skills" });
    }
  });

  app.post("/api/skills", async (req, res) => {
    try {
      const skillData = insertSkillSchema.parse(req.body);
      const skill = await storage.createSkill(skillData);
      res.json(skill);
    } catch (error) {
      res.status(400).json({ message: "Invalid skill data" });
    }
  });

  app.patch("/api/skills/:id", async (req, res) => {
    try {
      const skill = await storage.updateSkill(req.params.id, req.body);
      if (!skill) {
        return res.status(404).json({ message: "Skill not found" });
      }
      res.json(skill);
    } catch (error) {
      res.status(500).json({ message: "Failed to update skill" });
    }
  });

  app.delete("/api/skills/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSkill(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Skill not found" });
      }
      res.json({ message: "Skill deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete skill" });
    }
  });

  // Projects routes
  app.get("/api/projects/:userId", async (req, res) => {
    try {
      const projects = await storage.getProjects(req.params.userId);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.json(project);
    } catch (error) {
      res.status(400).json({ message: "Invalid project data" });
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.updateProject(req.params.id, req.body);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteProject(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json({ message: "Project deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Certifications routes
  app.get("/api/certifications/:userId", async (req, res) => {
    try {
      const certifications = await storage.getCertifications(req.params.userId);
      res.json(certifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch certifications" });
    }
  });

  app.post("/api/certifications", async (req, res) => {
    try {
      const certificationData = insertCertificationSchema.parse(req.body);
      const certification = await storage.createCertification(certificationData);
      res.json(certification);
    } catch (error) {
      res.status(400).json({ message: "Invalid certification data" });
    }
  });

  app.patch("/api/certifications/:id", async (req, res) => {
    try {
      const certification = await storage.updateCertification(req.params.id, req.body);
      if (!certification) {
        return res.status(404).json({ message: "Certification not found" });
      }
      res.json(certification);
    } catch (error) {
      res.status(500).json({ message: "Failed to update certification" });
    }
  });

  app.delete("/api/certifications/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteCertification(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Certification not found" });
      }
      res.json({ message: "Certification deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete certification" });
    }
  });

  // Achievements routes
  app.get("/api/achievements/:userId", async (req, res) => {
    try {
      const achievements = await storage.getAchievements(req.params.userId);
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  app.post("/api/achievements", async (req, res) => {
    try {
      const achievementData = insertAchievementSchema.parse(req.body);
      const achievement = await storage.createAchievement(achievementData);
      res.json(achievement);
    } catch (error) {
      res.status(400).json({ message: "Invalid achievement data" });
    }
  });

  app.patch("/api/achievements/:id", async (req, res) => {
    try {
      const achievement = await storage.updateAchievement(req.params.id, req.body);
      if (!achievement) {
        return res.status(404).json({ message: "Achievement not found" });
      }
      res.json(achievement);
    } catch (error) {
      res.status(500).json({ message: "Failed to update achievement" });
    }
  });

  app.delete("/api/achievements/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteAchievement(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Achievement not found" });
      }
      res.json({ message: "Achievement deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete achievement" });
    }
  });

  // Learning modules routes
  app.get("/api/learning-modules", async (req, res) => {
    try {
      const modules = await storage.getLearningModules();
      res.json(modules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch learning modules" });
    }
  });

  app.get("/api/learning-modules/:id", async (req, res) => {
    try {
      const module = await storage.getLearningModule(req.params.id);
      if (!module) {
        return res.status(404).json({ message: "Learning module not found" });
      }
      res.json(module);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch learning module" });
    }
  });

  // User progress routes
  app.get("/api/user-progress/:userId", async (req, res) => {
    try {
      const progress = await storage.getUserProgress(req.params.userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user progress" });
    }
  });

  app.post("/api/user-progress", async (req, res) => {
    try {
      const progressData = insertUserProgressSchema.parse(req.body);
      const progress = await storage.createUserProgress(progressData);
      res.json(progress);
    } catch (error) {
      res.status(400).json({ message: "Invalid progress data" });
    }
  });

  app.patch("/api/user-progress/:userId/:moduleId", async (req, res) => {
    try {
      const progress = await storage.updateUserProgress(req.params.userId, req.params.moduleId, req.body);
      if (!progress) {
        return res.status(404).json({ message: "Progress not found" });
      }
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // User stats routes
  app.get("/api/user-stats/:userId", async (req, res) => {
    try {
      const stats = await storage.getUserStats(req.params.userId);
      if (!stats) {
        return res.status(404).json({ message: "User stats not found" });
      }
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  app.patch("/api/user-stats/:userId", async (req, res) => {
    try {
      const stats = await storage.updateUserStats(req.params.userId, req.body);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user stats" });
    }
  });

  // Daily activity routes
  app.get("/api/daily-activity/:userId", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const activity = await storage.getDailyActivity(
        req.params.userId, 
        startDate as string || "2024-01-01", 
        endDate as string || "2024-12-31"
      );
      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch daily activity" });
    }
  });

  app.post("/api/daily-activity", async (req, res) => {
    try {
      const activityData = insertDailyActivitySchema.parse(req.body);
      const activity = await storage.createDailyActivity(activityData);
      res.json(activity);
    } catch (error) {
      res.status(400).json({ message: "Invalid activity data" });
    }
  });

  // Section settings routes
  app.get("/api/section-settings/:userId", async (req, res) => {
    try {
      const settings = await storage.getSectionSettings(req.params.userId);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch section settings" });
    }
  });

  app.patch("/api/section-settings/:userId/:sectionName", async (req, res) => {
    try {
      const settings = await storage.updateSectionSettings(
        req.params.userId, 
        req.params.sectionName, 
        req.body
      );
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to update section settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
