import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { AICareerService } from "./ai-service";
import {
  insertUserSchema,
  insertProfileSchema,
  comprehensiveProfileSchema,
  insertUserProgressSchema,
  insertDailyActivitySchema,
  insertSectionSettingsSchema,
  insertWorkExperienceSchema,
  insertEducationSchema,
  educationWithUserSchema,
  workExperienceWithUserSchema,
  insertSkillSchema,
  insertProjectSchema,
  insertCertificationSchema,
  insertAchievementSchema,
  insertPublicationSchema,
  insertOrganizationSchema,
  insertVolunteerSchema,
  insertWorkExperienceTableSchema,
  insertCareerAdvisorySchema,
  insertCareerTimelineSchema,
  insertGeneratedResumeSchema,
  insertChatSessionSchema,
  insertForumPostSchema,
  insertForumReplySchema,
  insertForumLikeSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Profile routes
  app.get("/api/profile/:userId", async (req, res) => {
    try {
      const userIdStr = req.params.userId;

      // Validate userId is a number
      const userId = parseInt(userIdStr);
      if (isNaN(userId)) {
        return res.status(400).json({
          message: "Invalid user ID format. User ID must be a number.",
        });
      }

      const profile = await storage.getProfile(userId.toString());
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

  // Upsert profile endpoint - create or update existing profile
  app.put("/api/profile", async (req, res) => {
    try {
      const profileData = insertProfileSchema.parse(req.body);
      const profile = await storage.createProfile(profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error upserting profile:", error);

      if (error instanceof Error) {
        console.error("Full error:", error);
        return res.status(500).json({
          message: "Failed to upsert profile",
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
      const userId = req.params.userId;
      const profile = await storage.updateProfile(userId, req.body);
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
      console.log(`💼 GET /api/work-experience/${req.params.userId} - Starting request`);
      const userId = parseInt(req.params.userId);
      const experiences = await storage.getWorkExperience(userId.toString());
      
      // Normalize field names to support both database (company/position) and frontend (organization/roleOrPosition) expectations
      const normalizedExperiences = experiences.map((exp: any) => ({
        ...exp,
        // Add frontend-expected field names if they don't exist
        organization: exp.organization || exp.company,
        roleOrPosition: exp.roleOrPosition || exp.position,
        // Keep original field names for backward compatibility
        company: exp.company || exp.organization,
        position: exp.position || exp.roleOrPosition,
      }));
      
      console.log(`💼 GET /api/work-experience/${req.params.userId} - Retrieved ${normalizedExperiences.length} records`);
      res.json(normalizedExperiences);
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
      console.log('💼 POST /api/work-experience - Starting request with data:', req.body);
      
      // Handle both field name variations (company/position vs organization/roleOrPosition)
      const normalizedBody = {
        ...req.body,
        company: req.body.company || req.body.organization,
        position: req.body.position || req.body.roleOrPosition,
      };
      
      console.log('💼 POST /api/work-experience - Normalized data:', normalizedBody);
      const experienceData = insertWorkExperienceSchema.parse(normalizedBody);
      console.log('💼 POST /api/work-experience - Parsed data:', experienceData);
      const experience = await storage.createWorkExperience(experienceData);
      console.log('💼 POST /api/work-experience - Created record:', experience);
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
      console.log(`💼 PATCH /api/work-experience/${req.params.id} - Starting request with data:`, req.body);
      
      // Handle both field name variations (company/position vs organization/roleOrPosition)
      const normalizedBody = {
        ...req.body,
        company: req.body.company || req.body.organization,
        position: req.body.position || req.body.roleOrPosition,
        userId: req.body.userId,
      };
      
      console.log(`💼 PATCH /api/work-experience/${req.params.id} - Normalized data:`, normalizedBody);
      const experience = await storage.updateWorkExperience(
        req.params.id,
        normalizedBody
      );
      if (!experience) {
        return res.status(404).json({ message: "Work experience not found" });
      }
      
      // Also normalize the response for frontend compatibility
      const normalizedResponse = {
        ...experience,
        organization: experience.organization || experience.company,
        roleOrPosition: experience.roleOrPosition || experience.position,
        company: experience.company || experience.organization,
        position: experience.position || experience.roleOrPosition,
      };
      
      console.log(`💼 PATCH /api/work-experience/${req.params.id} - Updated record:`, normalizedResponse);
      res.json(normalizedResponse);
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
      console.log(`🎓 GET /api/education/${req.params.userId} - Starting request`);
      const education = await storage.getEducation(req.params.userId);
      console.log(`🎓 GET /api/education/${req.params.userId} - Retrieved ${education.length} records`);
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
      console.log('🎓 POST /api/education - Starting request with data:', req.body);
      const educationData = insertEducationSchema.parse(req.body);
      console.log('🎓 POST /api/education - Parsed data:', educationData);
      const education = await storage.createEducation(educationData);
      console.log('🎓 POST /api/education - Created record:', education);
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
      console.log(`🎓 PATCH /api/education/${req.params.id} - Starting request with data:`, req.body);
      const updateData = { ...req.body, userId: req.body.userId };
      console.log(`🎓 PATCH /api/education/${req.params.id} - Update data:`, updateData);
      const education = await storage.updateEducation(
        req.params.id,
        updateData
      );
      console.log(`🎓 PATCH /api/education/${req.params.id} - Updated record:`, education);
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
      console.log(`🎓 DELETE /api/education/${req.params.id} - Starting request`);
      const deleted = await storage.deleteEducation(req.params.id);
      console.log(`🎓 DELETE /api/education/${req.params.id} - Deleted:`, deleted);
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
      console.log(`🎨 GET /api/skills/${req.params.userId} - Starting request`);
      const skills = await storage.getSkills(req.params.userId);
      console.log(`🎨 GET /api/skills/${req.params.userId} - Retrieved ${skills.length} records`);
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
      console.log('🎨 POST /api/skills - Starting request with data:', req.body);
      const skillData = insertSkillSchema.parse(req.body);
      console.log('🎨 POST /api/skills - Parsed data:', skillData);
      const skill = await storage.createSkill(skillData);
      console.log('🎨 POST /api/skills - Created record:', skill);
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
      console.log("API GET /api/projects/:userId - userId:", req.params.userId);
      const projects = await storage.getProjects(req.params.userId);
      console.log(
        "API GET /api/projects/:userId - projects from storage:",
        projects
      );
      console.log(
        "API GET /api/projects/:userId - projects count:",
        projects.length
      );
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
      console.log(
        "Project creation request body:",
        JSON.stringify(req.body, null, 2)
      );
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
      console.log(
        "API GET /api/achievements/:userId - userId:",
        req.params.userId
      );
      const achievements = await storage.getAchievements(req.params.userId);
      console.log(
        "API GET /api/achievements/:userId - achievements from storage:",
        achievements
      );
      console.log(
        "API GET /api/achievements/:userId - achievements count:",
        achievements.length
      );
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

  // Publications routes
  app.get("/api/publications/:userId", async (req, res) => {
    try {
      const publications = await storage.getPublications(req.params.userId);
      res.json(publications);
    } catch (error) {
      console.error("Error fetching publications:", error);
      if (error instanceof Error) {
        return res.status(500).json({
          message: "Failed to fetch publications",
          error: error.message,
        });
      }
      return res.status(500).json({ message: "Unknown error occurred" });
    }
  });

  app.post("/api/publications", async (req, res) => {
    try {
      console.log('📚 POST /api/publications - Starting request with data:', req.body);
      
      // Handle field name variations (journal vs journalOrPlatform)
      const normalizedBody = {
        ...req.body,
        journal: req.body.journal || req.body.journalOrPlatform,
        journalOrPlatform: req.body.journalOrPlatform || req.body.journal,
      };
      
      console.log('📚 POST /api/publications - Normalized data:', normalizedBody);
      const publicationData = insertPublicationSchema.parse(normalizedBody);
      console.log('📚 POST /api/publications - Parsed data:', publicationData);
      const publication = await storage.createPublication(publicationData);
      console.log('📚 POST /api/publications - Created record:', publication);
      res.json(publication);
    } catch (error) {
      console.error("Error creating publication:", error);
      if (error instanceof Error) {
        return res.status(500).json({
          message: "Failed to create publication",
          error: error.message,
        });
      }
      return res.status(500).json({ message: "Unknown error occurred" });
    }
  });

  app.patch("/api/publications/:id", async (req, res) => {
    try {
      const updateData = { ...req.body, userId: req.body.userId };
      const publication = await storage.updatePublication(
        req.params.id,
        updateData
      );
      if (!publication) {
        return res.status(404).json({ message: "Publication not found" });
      }
      res.json(publication);
    } catch (error) {
      console.error("Error updating publication:", error);
      if (error instanceof Error) {
        return res.status(500).json({
          message: "Failed to update publication",
          error: error.message,
        });
      }
      return res.status(500).json({ message: "Unknown error occurred" });
    }
  });

  app.delete("/api/publications/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePublication(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Publication not found" });
      }
      res.json({ message: "Publication deleted" });
    } catch (error) {
      console.error("Error deleting publication:", error);
      if (error instanceof Error) {
        return res.status(500).json({
          message: "Failed to delete publication",
          error: error.message,
        });
      }
      return res.status(500).json({ message: "Unknown error occurred" });
    }
  });

  // Organizations routes
  app.get("/api/organizations/:userId", async (req, res) => {
    try {
      const organizations = await storage.getOrganizations(req.params.userId);
      res.json(organizations);
    } catch (error) {
      console.error("Error fetching organizations:", error);
      if (error instanceof Error) {
        return res.status(500).json({
          message: "Failed to fetch organizations",
          error: error.message,
        });
      }
      return res.status(500).json({ message: "Unknown error occurred" });
    }
  });

  app.post("/api/organizations", async (req, res) => {
    try {
      const organizationData = insertOrganizationSchema.parse(req.body);
      const organization = await storage.createOrganization(organizationData);
      res.json(organization);
    } catch (error) {
      console.error("Error creating organization:", error);
      if (error instanceof Error) {
        return res.status(500).json({
          message: "Failed to create organization",
          error: error.message,
        });
      }
      return res.status(500).json({ message: "Unknown error occurred" });
    }
  });

  app.patch("/api/organizations/:id", async (req, res) => {
    try {
      const updateData = { ...req.body, userId: req.body.userId };
      const organization = await storage.updateOrganization(
        req.params.id,
        updateData
      );
      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }
      res.json(organization);
    } catch (error) {
      console.error("Error updating organization:", error);
      if (error instanceof Error) {
        return res.status(500).json({
          message: "Failed to update organization",
          error: error.message,
        });
      }
      return res.status(500).json({ message: "Unknown error occurred" });
    }
  });

  app.delete("/api/organizations/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteOrganization(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Organization not found" });
      }
      res.json({ message: "Organization deleted" });
    } catch (error) {
      console.error("Error deleting organization:", error);
      if (error instanceof Error) {
        return res.status(500).json({
          message: "Failed to delete organization",
          error: error.message,
        });
      }
      return res.status(500).json({ message: "Unknown error occurred" });
    }
  });

  // Volunteer Experience routes
  app.get("/api/volunteer-experience/:userId", async (req, res) => {
    try {
      const volunteerExperience = await storage.getVolunteerExperience(
        req.params.userId
      );
      res.json(volunteerExperience);
    } catch (error) {
      console.error("Error fetching volunteer experience:", error);
      if (error instanceof Error) {
        return res.status(500).json({
          message: "Failed to fetch volunteer experience",
          error: error.message,
        });
      }
      return res.status(500).json({ message: "Unknown error occurred" });
    }
  });

  app.post("/api/volunteer-experience", async (req, res) => {
    try {
      const volunteerData = insertVolunteerSchema.parse(req.body);
      const volunteer = await storage.createVolunteerExperience(volunteerData);
      res.json(volunteer);
    } catch (error) {
      console.error("Error creating volunteer experience:", error);
      if (error instanceof Error) {
        return res.status(500).json({
          message: "Failed to create volunteer experience",
          error: error.message,
        });
      }
      return res.status(500).json({ message: "Unknown error occurred" });
    }
  });

  app.patch("/api/volunteer-experience/:id", async (req, res) => {
    try {
      const updateData = { ...req.body, userId: req.body.userId };
      const volunteer = await storage.updateVolunteerExperience(
        req.params.id,
        updateData
      );
      if (!volunteer) {
        return res
          .status(404)
          .json({ message: "Volunteer experience not found" });
      }
      res.json(volunteer);
    } catch (error) {
      console.error("Error updating volunteer experience:", error);
      if (error instanceof Error) {
        return res.status(500).json({
          message: "Failed to update volunteer experience",
          error: error.message,
        });
      }
      return res.status(500).json({ message: "Unknown error occurred" });
    }
  });

  app.delete("/api/volunteer-experience/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteVolunteerExperience(req.params.id);
      if (!deleted) {
        return res
          .status(404)
          .json({ message: "Volunteer experience not found" });
      }
      res.json({ message: "Volunteer experience deleted" });
    } catch (error) {
      console.error("Error deleting volunteer experience:", error);
      if (error instanceof Error) {
        return res.status(500).json({
          message: "Failed to delete volunteer experience",
          error: error.message,
        });
      }
      return res.status(500).json({ message: "Unknown error occurred" });
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

  // New learning platform API routes
  // Courses
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get("/api/courses/:id", async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  app.post("/api/courses", async (req, res) => {
    try {
      const course = await storage.createCourse(req.body);
      res.json(course);
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const category = await storage.createCategory(req.body);
      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Instructors
  app.get("/api/instructors", async (req, res) => {
    try {
      const instructors = await storage.getInstructors();
      res.json(instructors);
    } catch (error) {
      console.error("Error fetching instructors:", error);
      res.status(500).json({ message: "Failed to fetch instructors" });
    }
  });

  app.post("/api/instructors", async (req, res) => {
    try {
      const instructor = await storage.createInstructor(req.body);
      res.json(instructor);
    } catch (error) {
      console.error("Error creating instructor:", error);
      res.status(500).json({ message: "Failed to create instructor" });
    }
  });

  // Modules
  app.get("/api/courses/:courseId/modules", async (req, res) => {
    try {
      const modules = await storage.getCourseModules(req.params.courseId);
      res.json(modules);
    } catch (error) {
      console.error("Error fetching course modules:", error);
      res.status(500).json({ message: "Failed to fetch course modules" });
    }
  });

  app.post("/api/modules", async (req, res) => {
    try {
      const module = await storage.createModule(req.body);
      res.json(module);
    } catch (error) {
      console.error("Error creating module:", error);
      res.status(500).json({ message: "Failed to create module" });
    }
  });

  // Lessons
  app.get("/api/modules/:moduleId/lessons", async (req, res) => {
    try {
      const lessons = await storage.getModuleLessons(req.params.moduleId);
      res.json(lessons);
    } catch (error) {
      console.error("Error fetching module lessons:", error);
      res.status(500).json({ message: "Failed to fetch module lessons" });
    }
  });

  app.post("/api/lessons", async (req, res) => {
    try {
      const lesson = await storage.createLesson(req.body);
      res.json(lesson);
    } catch (error) {
      console.error("Error creating lesson:", error);
      res.status(500).json({ message: "Failed to create lesson" });
    }
  });

  // Enrollments
  app.get("/api/users/:userId/enrollments", async (req, res) => {
    try {
      const enrollments = await storage.getUserEnrollments(parseInt(req.params.userId));
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching user enrollments:", error);
      res.status(500).json({ message: "Failed to fetch user enrollments" });
    }
  });

  app.post("/api/enrollments", async (req, res) => {
    try {
      // Convert enrollmentDate string to Date object if provided
      const enrollmentData = {
        ...req.body,
        enrollmentDate: req.body.enrollmentDate ? new Date(req.body.enrollmentDate) : new Date()
      };
      
      const enrollment = await storage.createEnrollment(enrollmentData);
      res.json(enrollment);
    } catch (error) {
      console.error("Error creating enrollment:", error);
      res.status(500).json({ message: "Failed to create enrollment" });
    }
  });

  // Reviews
  app.get("/api/courses/:courseId/reviews", async (req, res) => {
    try {
      const reviews = await storage.getCourseReviews(req.params.courseId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching course reviews:", error);
      res.status(500).json({ message: "Failed to fetch course reviews" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const review = await storage.createReview(req.body);
      res.json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // User progress routes
  app.get("/api/user-progress/:userId", async (req, res) => {
    try {
      const progress = await storage.getUserProgress(
        parseInt(req.params.userId)
      );
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
        parseInt(req.params.userId),
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
      const stats = await storage.getUserStats(parseInt(req.params.userId));
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
      const stats = await storage.updateUserStats(
        parseInt(req.params.userId),
        req.body
      );
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
        parseInt(req.params.userId),
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

  // Enhanced lesson progress routes
  app.get("/api/user-progress/:userId/:moduleId", async (req, res) => {
    try {
      const { userId, moduleId } = req.params;
      const progress = await storage.getUserProgressForModule(parseInt(userId), moduleId);
      res.json(progress || { currentLesson: 0, isCompleted: false, xpEarned: 0 });
    } catch (error) {
      console.error("Error fetching module progress:", error);
      res.status(500).json({ message: "Failed to fetch module progress" });
    }
  });

  app.get("/api/lesson-progress/:userId/:moduleId", async (req, res) => {
    try {
      const { userId, moduleId } = req.params;
      const progress = await storage.getLessonProgress(parseInt(userId), moduleId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching lesson progress:", error);
      res.status(500).json({ message: "Failed to fetch lesson progress" });
    }
  });

  app.post("/api/lesson-progress/complete", async (req, res) => {
    try {
      const { userId, moduleId, lessonIndex } = req.body;
      const progress = await storage.completeLessonProgress(parseInt(userId), moduleId, lessonIndex);
      res.json(progress);
    } catch (error) {
      console.error("Error completing lesson:", error);
      res.status(500).json({ message: "Failed to complete lesson" });
    }
  });

  // Quiz routes
  app.get("/api/quiz-questions/:moduleId/:lessonIndex", async (req, res) => {
    try {
      const { moduleId, lessonIndex } = req.params;
      // TODO: Implement quiz questions functionality when needed
      const questions: any[] = [];
      res.json(questions);
    } catch (error) {
      console.error("Error fetching quiz questions:", error);
      res.status(500).json({ message: "Failed to fetch quiz questions" });
    }
  });

  app.post("/api/quiz/submit", async (req, res) => {
    try {
      const { userId, moduleId, lessonIndex, answers } = req.body;
      // TODO: Implement quiz submission functionality when needed
      const result = { score: 0, totalQuestions: 0, passed: false };
      res.json(result);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      res.status(500).json({ message: "Failed to submit quiz" });
    }
  });

  // Section settings routes
  app.get("/api/section-settings/:userId/:sectionName", async (req, res) => {
    try {
      const settings = await storage.getSectionSettings(
        parseInt(req.params.userId),
        req.params.sectionName
      );
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch section settings" });
    }
  });

  app.patch("/api/section-settings/:userId/:sectionName", async (req, res) => {
    try {
      const settings = await storage.upsertSectionSettings({
        userId: parseInt(req.params.userId),
        sectionName: req.params.sectionName,
        ...req.body,
      });
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to update section settings" });
    }
  });

  // AI Career Features Routes
  
  // Authentication middleware for AI routes
  const requireAuth = (req: any, res: any, next: any) => {
    console.log('🔐 [AUTH-MIDDLEWARE] Checking authentication for:', req.path);
    console.log('🔐 [AUTH-MIDDLEWARE] User authenticated:', req.isAuthenticated());
    console.log('🔐 [AUTH-MIDDLEWARE] User object:', req.user);
    if (!req.isAuthenticated()) {
      console.log('❌ [AUTH-MIDDLEWARE] Authentication failed - returning 401');
      return res.status(401).json({ message: 'Authentication required' });
    }
    console.log('✅ [AUTH-MIDDLEWARE] Authentication successful, proceeding...');
    next();
  };

  // Personal Career Advisor
  app.get("/api/career-advice/:userId", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const advisories = await storage.getCareerAdvisories(userId);
      res.json(advisories);
    } catch (error) {
      console.error("Error fetching career advisories:", error);
      res.status(500).json({ message: "Failed to fetch career advisories" });
    }
  });

  app.post("/api/career-advice", requireAuth, async (req, res) => {
    try {
      console.log('🎯 [SERVER] POST /api/career-advice called');
      console.log('🎯 [SERVER] Request body:', req.body);
      const { userId, targetRole, careerGoals, currentLevel } = req.body;
      
      // Fetch user's profile data for AI analysis
      const profile = await storage.getProfile(userId);
      const workExperience = await storage.getWorkExperience(userId);
      const education = await storage.getEducation(userId);
      const skills = await storage.getSkills(userId);
      const projects = await storage.getProjects(userId);
      const certifications = await storage.getCertifications(userId);
      
      const userData = {
        personalDetails: profile?.personalDetails,
        workExperience,
        education,
        skills,
        projects,
        certifications,
      };

      console.log('🎯 [SERVER] User data collected for AI:', userData);
      console.log('🎯 [SERVER] Calling AI service for advice generation...');
      // Generate AI advice
      const aiAdvice = await AICareerService.generateCareerAdvice(userData, targetRole);
      console.log('🎯 [SERVER] AI advice generated:', aiAdvice);
      
      // Save to database
      const advisoryData = {
        userId: parseInt(userId),
        advice: aiAdvice.advice,
        recommendations: aiAdvice.recommendations,
        skillGaps: aiAdvice.skillGaps,
        nextSteps: aiAdvice.nextSteps,
        currentLevel: aiAdvice.currentLevel,
        careerGoals,
        targetRole,
      };
      
      const advisory = await storage.createCareerAdvisory(advisoryData);
      res.json(advisory);
    } catch (error) {
      console.error("❌ [SERVER] Error generating career advice:", error);
      console.error("❌ [SERVER] Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      res.status(500).json({ message: "Failed to generate career advice", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Career Timeline
  app.get("/api/career-timeline/:userId", requireAuth, async (req, res) => {
    try {
      console.log('🌐 [SERVER] GET /api/career-timeline called');
      console.log('🌐 [SERVER] Requested userId:', req.params.userId);
      console.log('🌐 [SERVER] Request user (auth):', req.user);
      const userId = parseInt(req.params.userId);
      console.log('🌐 [SERVER] Fetching timelines for userId:', userId);
      const timelines = await storage.getCareerTimelines(userId);
      console.log('✅ [SERVER] Timelines fetched:', timelines);
      res.json(timelines);
    } catch (error) {
      console.error("❌ [SERVER] Error fetching career timelines:", error);
      console.error("❌ [SERVER] Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      res.status(500).json({ message: "Failed to fetch career timelines" });
    }
  });

  app.post("/api/career-timeline", requireAuth, async (req, res) => {
    try {
      console.log('🌐 [SERVER] POST /api/career-timeline called');
      console.log('🌐 [SERVER] Request body:', req.body);
      const { userId, targetRole } = req.body;
      
      // Fetch user data for AI analysis
      const profile = await storage.getProfile(userId);
      const workExperience = await storage.getWorkExperience(userId);
      const education = await storage.getEducation(userId);
      const skills = await storage.getSkills(userId);
      const projects = await storage.getProjects(userId);
      const userProgress = await storage.getUserProgress(parseInt(userId));
      
      const userData = {
        personalDetails: profile?.personalDetails,
        workExperience,
        education,
        skills,
        projects,
        learningProgress: userProgress,
      };

      console.log('🌐 [SERVER] Calling AI service for timeline generation');
      // Generate AI timeline
      const aiTimeline = await AICareerService.generateCareerTimeline(userData, targetRole);
      
      console.log('🌐 [SERVER] AI timeline generated, saving to database');
      // Save to database
      const timelineData = {
        userId: parseInt(userId),
        title: aiTimeline.title,
        timeline: aiTimeline.timeline,
        targetRole,
        estimatedDuration: aiTimeline.estimatedDuration,
      };
      
      const timeline = await storage.createCareerTimeline(timelineData);
      console.log('✅ [SERVER] Timeline saved successfully:', timeline);
      res.json(timeline);
    } catch (error) {
      console.error("❌ [SERVER] Error generating career timeline:", error);
      console.error("❌ [SERVER] Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      res.status(500).json({ message: "Failed to generate career timeline" });
    }
  });

  app.delete("/api/career-timeline/:id", requireAuth, async (req, res) => {
    try {
      console.log('🌐 [SERVER] DELETE /api/career-timeline called');
      console.log('🌐 [SERVER] Timeline ID to delete:', req.params.id);
      const deleted = await storage.deleteCareerTimeline(req.params.id);
      if (!deleted) {
        console.log('❌ [SERVER] Timeline not found:', req.params.id);
        return res.status(404).json({ message: "Career timeline not found" });
      }
      console.log('✅ [SERVER] Timeline deleted successfully');
      res.json({ message: "Career timeline deleted" });
    } catch (error) {
      console.error("❌ [SERVER] Error deleting career timeline:", error);
      console.error("❌ [SERVER] Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      res.status(500).json({ message: "Failed to delete career timeline" });
    }
  });

  // Resume Generator
  app.get("/api/resumes/:userId", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const resumes = await storage.getGeneratedResumes(userId);
      res.json(resumes);
    } catch (error) {
      console.error("Error fetching resumes:", error);
      res.status(500).json({ message: "Failed to fetch resumes" });
    }
  });

  app.post("/api/resumes", requireAuth, async (req, res) => {
    try {
      console.log('📄 [SERVER] POST /api/resumes called');
      console.log('📄 [SERVER] Request body:', req.body);
      const { userId, title, targetRole, template } = req.body;
      
      // Fetch user data for AI analysis
      const profile = await storage.getProfile(userId);
      const workExperience = await storage.getWorkExperience(userId);
      const education = await storage.getEducation(userId);
      const skills = await storage.getSkills(userId);
      const projects = await storage.getProjects(userId);
      const certifications = await storage.getCertifications(userId);
      
      const userData = {
        personalDetails: profile?.personalDetails,
        contactDetails: profile?.contactDetails,
        workExperience,
        education,
        skills,
        projects,
        certifications,
      };

      console.log('📄 [SERVER] User data collected for AI:', userData);
      console.log('📄 [SERVER] Calling AI service for resume generation...');
      // Generate AI resume
      const aiResume = await AICareerService.generateResume(userData, targetRole);
      console.log('📄 [SERVER] AI resume generated:', aiResume);
      
      // Save to database
      const resumeData = {
        userId: parseInt(userId),
        title,
        content: aiResume,
        targetRole,
        template: template || 'professional',
      };
      
      const resume = await storage.createGeneratedResume(resumeData);
      res.json(resume);
    } catch (error) {
      console.error("❌ [SERVER] Error generating resume:", error);
      console.error("❌ [SERVER] Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      res.status(500).json({ message: "Failed to generate resume", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.patch("/api/resumes/:id", requireAuth, async (req, res) => {
    try {
      const resume = await storage.updateGeneratedResume(req.params.id, req.body);
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      res.json(resume);
    } catch (error) {
      console.error("Error updating resume:", error);
      res.status(500).json({ message: "Failed to update resume" });
    }
  });

  app.delete("/api/resumes/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteGeneratedResume(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Resume not found" });
      }
      res.json({ message: "Resume deleted" });
    } catch (error) {
      console.error("Error deleting resume:", error);
      res.status(500).json({ message: "Failed to delete resume" });
    }
  });

  // AI Chat Assistant
  app.get("/api/chat-sessions/:userId", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const sessions = await storage.getChatSessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      res.status(500).json({ message: "Failed to fetch chat sessions" });
    }
  });

  app.get("/api/chat-sessions/session/:sessionId", requireAuth, async (req, res) => {
    try {
      const session = await storage.getChatSession(req.params.sessionId);
      if (!session) {
        return res.status(404).json({ message: "Chat session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error("Error fetching chat session:", error);
      res.status(500).json({ message: "Failed to fetch chat session" });
    }
  });

  app.post("/api/chat-sessions", requireAuth, async (req, res) => {
    try {
      const { userId, title } = req.body;
      const sessionData = {
        userId: parseInt(userId),
        title: title || 'New Career Chat',
        messages: [],
        isActive: true,
      };
      
      const session = await storage.createChatSession(sessionData);
      res.json(session);
    } catch (error) {
      console.error("Error creating chat session:", error);
      res.status(500).json({ message: "Failed to create chat session" });
    }
  });

  app.post("/api/chat-sessions/:sessionId/message", requireAuth, async (req, res) => {
    try {
      console.log('💬 [SERVER] POST /api/chat-sessions/:sessionId/message called');
      console.log('💬 [SERVER] Request body:', req.body);
      console.log('💬 [SERVER] Session ID:', req.params.sessionId);
      const { message } = req.body;
      const sessionId = req.params.sessionId;
      
      // Get existing session
      const session = await storage.getChatSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Chat session not found" });
      }

      // Add user message
      const updatedMessages = [
        ...(session.messages || []),
        {
          role: 'user' as const,
          content: message,
          timestamp: new Date().toISOString(),
        }
      ];

      // Get user context for AI
      const profile = await storage.getProfile(session.userId.toString());
      const workExperience = await storage.getWorkExperience(session.userId.toString());
      const education = await storage.getEducation(session.userId.toString());
      const skills = await storage.getSkills(session.userId.toString());
      const projects = await storage.getProjects(session.userId.toString());
      const userProgress = await storage.getUserProgress(session.userId);
      
      const userContext = {
        personalDetails: profile?.personalDetails,
        workExperience,
        education,
        skills,
        projects,
        learningProgress: userProgress,
      };

      console.log('💬 [SERVER] User context for AI:', userContext);
      console.log('💬 [SERVER] Messages for AI:', updatedMessages);
      console.log('💬 [SERVER] Calling AI service for chat response...');
      // Generate AI response
      const aiResponse = await AICareerService.generateChatResponse(
        updatedMessages.map(m => ({ role: m.role, content: m.content })),
        userContext
      );
      console.log('💬 [SERVER] AI response generated:', aiResponse);

      // Add AI response
      const finalMessages = [
        ...updatedMessages,
        {
          role: 'assistant' as const,
          content: aiResponse,
          timestamp: new Date().toISOString(),
        }
      ];

      // Update session
      const updatedSession = await storage.updateChatSession(sessionId, {
        messages: finalMessages,
        updatedAt: new Date(),
      });

      res.json(updatedSession);
    } catch (error) {
      console.error("Error processing chat message:", error);
      res.status(500).json({ message: "Failed to process message" });
    }
  });

  // Forum Routes
  app.get("/api/forum/posts", async (req, res) => {
    try {
      const posts = await storage.getForumPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching forum posts:", error);
      res.status(500).json({ message: "Failed to fetch forum posts" });
    }
  });

  app.get("/api/forum/posts/:postId", async (req, res) => {
    try {
      const post = await storage.getForumPost(req.params.postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching forum post:", error);
      res.status(500).json({ message: "Failed to fetch forum post" });
    }
  });

  app.post("/api/forum/posts", requireAuth, async (req, res) => {
    try {
      const postData = insertForumPostSchema.parse(req.body);
      const post = await storage.createForumPost(postData);
      res.json(post);
    } catch (error) {
      console.error("Error creating forum post:", error);
      res.status(500).json({ message: "Failed to create forum post" });
    }
  });

  app.get("/api/forum/posts/:postId/replies", async (req, res) => {
    try {
      const replies = await storage.getForumReplies(req.params.postId);
      res.json(replies);
    } catch (error) {
      console.error("Error fetching forum replies:", error);
      res.status(500).json({ message: "Failed to fetch forum replies" });
    }
  });

  app.post("/api/forum/posts/:postId/replies", requireAuth, async (req, res) => {
    try {
      const replyData = insertForumReplySchema.parse({
        ...req.body,
        postId: req.params.postId,
      });
      const reply = await storage.createForumReply(replyData);
      res.json(reply);
    } catch (error) {
      console.error("Error creating forum reply:", error);
      res.status(500).json({ message: "Failed to create forum reply" });
    }
  });

  app.post("/api/forum/like", requireAuth, async (req, res) => {
    try {
      const likeData = insertForumLikeSchema.parse(req.body);
      const result = await storage.toggleForumLike(likeData);
      res.json(result);
    } catch (error) {
      console.error("Error toggling forum like:", error);
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  app.get("/api/forum/like/:userId", requireAuth, async (req, res) => {
    try {
      const { userId } = req.params;
      const { postId, replyId } = req.query;
      const like = await storage.getForumLike(
        parseInt(userId),
        postId as string,
        replyId as string
      );
      res.json({ liked: !!like });
    } catch (error) {
      console.error("Error fetching forum like:", error);
      res.status(500).json({ message: "Failed to fetch like status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
