import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import {
  insertUserSchema,
  insertProfileSchema,
  insertWorkExperienceSchema,
  insertEducationSchema,
  insertSkillSchema,
  insertProjectSchema,
  insertCertificationSchema,
  insertAchievementSchema,
  insertUserProgressSchema,
  insertDailyActivitySchema,
  insertSectionSettingsSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes for Clerk
  app.get(
    "/api/auth/user",
    ClerkExpressRequireAuth(),
    async (req: any, res) => {
      try {
        const userId = req.auth.userId;
        let user = await storage.getUser(userId);

        // If user doesn't exist, create from Clerk data
        if (!user) {
          const userData = {
            id: userId,
            email: req.auth.emailAddress,
            firstName: req.auth.firstName,
            lastName: req.auth.lastName,
            profileImageUrl: req.auth.imageUrl,
          };
          user = await storage.upsertUser(userData);
        }

        res.json(user);
      } catch (error) {
        console.error("Error fetching user:", error);

        // Narrow error type safely
        if (error instanceof Error) {
          console.error("Full error:", error);
          return res.status(500).json({
            message: "Failed to fetch user",
            error: error.message,
            stack: error.stack,
          });
        }

        // fallback if it's not an instance of Error
        return res.status(500).json({
          message: "Unknown error occurred",
          error: JSON.stringify(error),
        });
      }
    }
  );

  // Profile routes
  app.get("/api/profile/:userId", async (req, res) => {
    try {
      const profile = await storage.getProfile(req.params.userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);

      // Narrow error type safely
      if (error instanceof Error) {
        console.error("Full error:", error);
        return res.status(500).json({
          message: "Failed to fetch profile",
          error: error.message,
          stack: error.stack,
        });
      }

      // fallback if it's not an instance of Error
      return res.status(500).json({
        message: "Unknown error occurred",
        error: JSON.stringify(error),
      });
    }
  });

  app.post("/api/profile", async (req, res) => {
    try {
      const profileData = insertProfileSchema.parse(req.body);
      const profile = await storage.createProfile(profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error creating profile:", error);

      if (error instanceof Error) {
        console.error("Full error:", error);
        return res.status(500).json({
          message: "Failed to create profile",
          error: error.message,
          stack: error.stack,
        });
      }

      return res.status(500).json({
        message: "Unknown error occurred",
        error: JSON.stringify(error),
      });
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
      console.error("Error updating profile:", error);

      if (error instanceof Error) {
        console.error("Full error:", error);
        return res.status(500).json({
          message: "Failed to update profile",
          error: error.message,
          stack: error.stack,
        });
      }

      return res.status(500).json({
        message: "Unknown error occurred",
        error: JSON.stringify(error),
      });
    }
  });

  // Work Experience routes
  app.get("/api/work-experience/:userId", async (req, res) => {
    try {
      const experiences = await storage.getWorkExperience(req.params.userId);
      res.json(experiences);
    } catch (error) {
      console.error("Error fetching work experience:", error);

      if (error instanceof Error) {
        console.error("Full error:", error);
        return res.status(500).json({
          message: "Failed to fetch work experience",
          error: error.message,
          stack: error.stack,
        });
      }

      return res.status(500).json({
        message: "Unknown error occurred",
        error: JSON.stringify(error),
      });
    }
  });

  app.post("/api/work-experience", async (req, res) => {
    try {
      const experienceData = insertWorkExperienceSchema.parse(req.body);
      const experience = await storage.createWorkExperience(experienceData);
      res.json(experience);
    } catch (error) {
      console.error("Error creating work experience:", error);

      if (error instanceof Error) {
        console.error("Full error:", error);
        return res.status(500).json({
          message: "Failed to create work experience",
          error: error.message,
          stack: error.stack,
        });
      }

      return res.status(500).json({
        message: "Unknown error occurred",
        error: JSON.stringify(error),
      });
    }
  });

  app.patch("/api/work-experience/:id", async (req, res) => {
    try {
      const experience = await storage.updateWorkExperience(
        req.params.id,
        req.body
      );
      if (!experience) {
        return res.status(404).json({ message: "Work experience not found" });
      }
      res.json(experience);
    } catch (error) {
      console.error("Error updating work experience:", error);

      if (error instanceof Error) {
        console.error("Full error:", error);
        return res.status(500).json({
          message: "Failed to update work experience",
          error: error.message,
          stack: error.stack,
        });
      }

      return res.status(500).json({
        message: "Unknown error occurred",
        error: JSON.stringify(error),
      });
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
      console.error("Error deleting work experience:", error);

      if (error instanceof Error) {
        console.error("Full error:", error);
        return res.status(500).json({
          message: "Failed to delete work experience",
          error: error.message,
          stack: error.stack,
        });
      }

      return res.status(500).json({
        message: "Unknown error occurred",
        error: JSON.stringify(error),
      });
    }
  });

  // Education routes
  app.get("/api/education/:userId", async (req, res) => {
    try {
      const education = await storage.getEducation(req.params.userId);
      res.json(education);
    } catch (error) {
      console.error("Error fetching education:", error);

      if (error instanceof Error) {
        console.error("Full error:", error);
        return res.status(500).json({
          message: "Failed to fetch education",
          error: error.message,
          stack: error.stack,
        });
      }

      return res.status(500).json({
        message: "Unknown error occurred",
        error: JSON.stringify(error),
      });
    }
  });

  app.post("/api/education", async (req, res) => {
    try {
      const educationData = insertEducationSchema.parse(req.body);
      const education = await storage.createEducation(educationData);
      res.json(education);
    } catch (error) {
      console.error("Error creating education:", error);

      if (error instanceof Error) {
        console.error("Full error:", error);
        return res.status(500).json({
          message: "Failed to create education",
          error: error.message,
          stack: error.stack,
        });
      }

      return res.status(500).json({
        message: "Unknown error occurred",
        error: JSON.stringify(error),
      });
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
      console.error("Error updating education:", error);

      if (error instanceof Error) {
        console.error("Full error:", error);
        return res.status(500).json({
          message: "Failed to update education",
          error: error.message,
          stack: error.stack,
        });
      }

      return res.status(500).json({
        message: "Unknown error occurred",
        error: JSON.stringify(error),
      });
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
      console.error("Error deleting education:", error);

      if (error instanceof Error) {
        console.error("Full error:", error);
        return res.status(500).json({
          message: "Failed to delete education",
          error: error.message,
          stack: error.stack,
        });
      }

      return res.status(500).json({
        message: "Unknown error occurred",
        error: JSON.stringify(error),
      });
    }
  });

  // Skills routes
  app.get("/api/skills/:userId", async (req, res) => {
    try {
      const skills = await storage.getSkills(req.params.userId);
      res.json(skills);
    } catch (error) {
      console.error("Error fetching skills:", error);

      if (error instanceof Error) {
        console.error("Full error:", error);
        return res.status(500).json({
          message: "Failed to fetch skills",
          error: error.message,
          stack: error.stack,
        });
      }

      return res.status(500).json({
        message: "Unknown error occurred",
        error: JSON.stringify(error),
      });
    }
  });

  app.post("/api/skills", async (req, res) => {
    try {
      const skillData = insertSkillSchema.parse(req.body);
      const skill = await storage.createSkill(skillData);
      res.json(skill);
    } catch (error) {
      console.error("Error creating skill:", error);

      if (error instanceof Error) {
        console.error("Full error:", error);
        return res.status(500).json({
          message: "Failed to create skill",
          error: error.message,
          stack: error.stack,
        });
      }

      return res.status(500).json({
        message: "Unknown error occurred",
        error: JSON.stringify(error),
      });
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
      console.error("Error updating skill:", error);

      if (error instanceof Error) {
        console.error("Full error:", error);
        return res.status(500).json({
          message: "Failed to update skill",
          error: error.message,
          stack: error.stack,
        });
      }

      return res.status(500).json({
        message: "Unknown error occurred",
        error: JSON.stringify(error),
      });
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
      console.error("Error deleting skill:", error);

      if (error instanceof Error) {
        console.error("Full error:", error);
        return res.status(500).json({
          message: "Failed to delete skill",
          error: error.message,
          stack: error.stack,
        });
      }

      return res.status(500).json({
        message: "Unknown error occurred",
        error: JSON.stringify(error),
      });
    }
  });

  // Projects routes
  app.get("/api/projects/:userId", async (req, res) => {
    try {
      const projects = await storage.getProjects(req.params.userId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);

      if (error instanceof Error) {
        console.error("Full error:", error);
        return res.status(500).json({
          message: "Failed to fetch projects",
          error: error.message,
          stack: error.stack,
        });
      }

      return res.status(500).json({
        message: "Unknown error occurred",
        error: JSON.stringify(error),
      });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);

      if (error instanceof Error) {
        console.error("Full error:", error);
        return res.status(500).json({
          message: "Failed to create project",
          error: error.message,
          stack: error.stack,
        });
      }

      return res.status(500).json({
        message: "Unknown error occurred",
        error: JSON.stringify(error),
      });
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
      console.error("Error updating project:", error);

      if (error instanceof Error) {
        console.error("Full error:", error);
        return res.status(500).json({
          message: "Failed to update project",
          error: error.message,
          stack: error.stack,
        });
      }

      return res.status(500).json({
        message: "Unknown error occurred",
        error: JSON.stringify(error),
      });
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
      console.error("Error deleting project:", error);

      if (error instanceof Error) {
        console.error("Full error:", error);
        return res.status(500).json({
          message: "Failed to delete project",
          error: error.message,
          stack: error.stack,
        });
      }

      return res.status(500).json({
        message: "Unknown error occurred",
        error: JSON.stringify(error),
      });
    }
  });

  // Certifications routes
  app.get("/api/certifications/:userId", async (req, res) => {
    try {
      const certifications = await storage.getCertifications(req.params.userId);
      res.json(certifications);
    } catch (error) {
      console.error("Error fetching certifications:", error);

      if (error instanceof Error) {
        console.error("Full error:", error);
        return res.status(500).json({
          message: "Failed to fetch certifications",
          error: error.message,
          stack: error.stack,
        });
      }

      return res.status(500).json({
        message: "Unknown error occurred",
        error: JSON.stringify(error),
      });
    }
  });

  app.post("/api/certifications", async (req, res) => {
    try {
      const certificationData = insertCertificationSchema.parse(req.body);
      const certification = await storage.createCertification(
        certificationData
      );
      res.json(certification);
    } catch (error) {
      console.error("Error creating certification:", error);

      if (error instanceof Error) {
        console.error("Full error:", error);
        return res.status(500).json({
          message: "Failed to create certification",
          error: error.message,
          stack: error.stack,
        });
      }

      return res.status(500).json({
        message: "Unknown error occurred",
        error: JSON.stringify(error),
      });
    }
  });

  app.patch("/api/certifications/:id", async (req, res) => {
    try {
      const certification = await storage.updateCertification(
        req.params.id,
        req.body
      );
      if (!certification) {
        return res.status(404).json({ message: "Certification not found" });
      }
      res.json(certification);
    } catch (error) {
      console.error("Error updating certification:", error);

      if (error instanceof Error) {
        console.error("Full error:", error);
        return res.status(500).json({
          message: "Failed to update certification",
          error: error.message,
          stack: error.stack,
        });
      }

      return res.status(500).json({
        message: "Unknown error occurred",
        error: JSON.stringify(error),
      });
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
      console.error("Error deleting certification:", error);

      if (error instanceof Error) {
        console.error("Full error:", error);
        return res.status(500).json({
          message: "Failed to delete certification",
          error: error.message,
          stack: error.stack,
        });
      }

      return res.status(500).json({
        message: "Unknown error occurred",
        error: JSON.stringify(error),
      });
    }
  });

  // Achievements routes
  app.get("/api/achievements/:userId", async (req, res) => {
    try {
      const achievements = await storage.getAchievements(req.params.userId);
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);

      if (error instanceof Error) {
        console.error("Full error:", error);
        return res.status(500).json({
          message: "Failed to fetch achievements",
          error: error.message,
          stack: error.stack,
        });
      }

      return res.status(500).json({
        message: "Unknown error occurred",
        error: JSON.stringify(error),
      });
    }
  });

  app.post("/api/achievements", async (req, res) => {
    try {
      const achievementData = insertAchievementSchema.parse(req.body);
      const achievement = await storage.createAchievement(achievementData);
      res.json(achievement);
    } catch (error) {
      console.error("Error creating achievement:", error);

      if (error instanceof Error) {
        console.error("Full error:", error);
        return res.status(500).json({
          message: "Failed to create achievement",
          error: error.message,
          stack: error.stack,
        });
      }

      return res.status(500).json({
        message: "Unknown error occurred",
        error: JSON.stringify(error),
      });
    }
  });

  app.patch("/api/achievements/:id", async (req, res) => {
    try {
      const achievement = await storage.updateAchievement(
        req.params.id,
        req.body
      );
      if (!achievement) {
        return res.status(404).json({ message: "Achievement not found" });
      }
      res.json(achievement);
    } catch (error) {
      console.error("Error updating achievement:", error);

      if (error instanceof Error) {
        console.error("Full error:", error);
        return res.status(500).json({
          message: "Failed to update achievement",
          error: error.message,
          stack: error.stack,
        });
      }

      return res.status(500).json({
        message: "Unknown error occurred",
        error: JSON.stringify(error),
      });
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
      console.error("Error deleting achievement:", error);

      if (error instanceof Error) {
        console.error("Full error:", error);
        return res.status(500).json({
          message: "Failed to delete achievement",
          error: error.message,
          stack: error.stack,
        });
      }

      return res.status(500).json({
        message: "Unknown error occurred",
        error: JSON.stringify(error),
      });
    }
  });

  // Learning modules routes
  app.get("/api/learning-modules", async (req, res) => {
    try {
      const modules = await storage.getLearningModules();
      res.json(modules);
    } catch (error) {
      console.error("Error fetching learning modules:", error);

      if (error instanceof Error) {
        console.error("Full error:", error);
        return res.status(500).json({
          message: "Failed to fetch learning modules",
          error: error.message,
          stack: error.stack,
        });
      }

      return res.status(500).json({
        message: "Unknown error occurred",
        error: JSON.stringify(error),
      });
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
      console.error("Error fetching learning module:", error);

      if (error instanceof Error) {
        console.error("Full error:", error);
        return res.status(500).json({
          message: "Failed to fetch learning module",
          error: error.message,
          stack: error.stack,
        });
      }

      return res.status(500).json({
        message: "Unknown error occurred",
        error: JSON.stringify(error),
      });
    }
  });

  // User progress routes
  app.get("/api/user-progress/:userId", async (req, res) => {
    try {
      const progress = await storage.getUserProgress(req.params.userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching user progress:", error);

      if (error instanceof Error) {
        console.error("Full error:", error);
        return res.status(500).json({
          message: "Failed to fetch user progress",
          error: error.message,
          stack: error.stack,
        });
      }

      return res.status(500).json({
        message: "Unknown error occurred",
        error: JSON.stringify(error),
      });
    }
  });

  app.post("/api/user-progress", async (req, res) => {
    try {
      const progressData = insertUserProgressSchema.parse(req.body);
      const progress = await storage.createUserProgress(progressData);
      res.json(progress);
    } catch (error) {
      console.error("Error creating user progress:", error);

      if (error instanceof Error) {
        console.error("Full error:", error);
        return res.status(500).json({
          message: "Failed to create user progress",
          error: error.message,
          stack: error.stack,
        });
      }

      return res.status(500).json({
        message: "Unknown error occurred",
        error: JSON.stringify(error),
      });
    }
  });

  app.patch("/api/user-progress/:userId/:moduleId", async (req, res) => {
    try {
      const progress = await storage.updateUserProgress(
        req.params.userId,
        req.params.moduleId,
        req.body
      );
      if (!progress) {
        return res.status(404).json({ message: "Progress not found" });
      }
      res.json(progress);
    } catch (error) {
      console.error("Error updating user progress:", error);

      if (error instanceof Error) {
        console.error("Full error:", error);
        return res.status(500).json({
          message: "Failed to update progress",
          error: error.message,
          stack: error.stack,
        });
      }

      return res.status(500).json({
        message: "Unknown error occurred",
        error: JSON.stringify(error),
      });
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
      console.error("Error fetching user stats:", error);

      if (error instanceof Error) {
        console.error("Full error:", error);
        return res.status(500).json({
          message: "Failed to fetch user stats",
          error: error.message,
          stack: error.stack,
        });
      }

      return res.status(500).json({
        message: "Unknown error occurred",
        error: JSON.stringify(error),
      });
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
        (startDate as string) || "2024-01-01",
        (endDate as string) || "2024-12-31"
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
