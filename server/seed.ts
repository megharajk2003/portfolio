import { db } from "./db";
import { 
  users, profiles, skills, projects, achievements, workExperience, 
  learningModules, userStats 
} from "@shared/schema";

async function seedDatabase() {
  try {
    // Create sample user
    const [user] = await db.insert(users).values({
      username: "megharaj",
      email: "megharaj@example.com",
      password: "password123"
    }).returning();

    console.log("Created user:", user.id);

    // Create sample profile
    await db.insert(profiles).values({
      userId: user.id,
      name: "Megharaj K",
      role: "Full Stack Developer",
      email: "megharaj@example.com",
      phone: "+91 12345 67890",
      location: "Tamil Nadu, India",
      summary: "Passionate full-stack developer with experience in MERN stack and modern web technologies.",
      portfolioTheme: "modern",
      isPublic: true
    });

    // Create sample skills
    const skillsData = [
      { name: "JavaScript", level: 90, category: "technical" },
      { name: "React", level: 85, category: "technical" },
      { name: "Node.js", level: 80, category: "technical" },
      { name: "TypeScript", level: 75, category: "technical" },
      { name: "MongoDB", level: 70, category: "technical" },
      { name: "UI/UX Design", level: 65, category: "design" },
      { name: "Figma", level: 60, category: "design" },
      { name: "Communication", level: 85, category: "soft" },
      { name: "Problem Solving", level: 90, category: "soft" },
      { name: "Leadership", level: 75, category: "soft" }
    ];

    for (const skill of skillsData) {
      await db.insert(skills).values({
        userId: user.id,
        name: skill.name,
        level: skill.level,
        category: skill.category,
        isVisible: true
      });
    }

    // Create sample projects
    const projectsData = [
      {
        title: "Hospital Management System",
        description: "Full-stack web application for managing hospital operations with patient records, appointments, and staff management.",
        technologies: ["React", "Node.js", "MongoDB", "Express"],
        link: "https://hospital-demo.example.com",
        githubLink: "https://github.com/megharaj/hospital-management"
      },
      {
        title: "E-Commerce Platform",
        description: "Modern e-commerce solution with payment gateway integration and admin dashboard.",
        technologies: ["Next.js", "Stripe", "PostgreSQL", "Tailwind"],
        link: "https://ecommerce-demo.example.com",
        githubLink: "https://github.com/megharaj/ecommerce-platform"
      },
      {
        title: "Task Management App",
        description: "Collaborative task management tool with real-time updates and team collaboration features.",
        technologies: ["Vue.js", "Socket.io", "Redis", "Docker"],
        link: null,
        githubLink: "https://github.com/megharaj/task-manager"
      }
    ];

    for (const project of projectsData) {
      await db.insert(projects).values({
        userId: user.id,
        title: project.title,
        description: project.description,
        technologies: project.technologies,
        link: project.link,
        githubLink: project.githubLink,
        isVisible: true
      });
    }

    // Create sample achievements
    const achievementsData = [
      {
        title: "Smart India Hackathon Finalist",
        description: "Reached finals in national-level hackathon with innovative healthcare solution",
        year: "2024"
      },
      {
        title: "AWS Certified Developer",
        description: "Achieved AWS Developer Associate certification",
        year: "2024"
      },
      {
        title: "Open Source Contributor",
        description: "Active contributor to React ecosystem with 50+ contributions",
        year: "2023"
      }
    ];

    for (const achievement of achievementsData) {
      await db.insert(achievements).values({
        userId: user.id,
        title: achievement.title,
        description: achievement.description,
        year: achievement.year,
        isVisible: true
      });
    }

    // Create sample work experience
    await db.insert(workExperience).values({
      userId: user.id,
      title: "Software Developer Intern",
      company: "ABC Tech Solutions",
      startDate: "2024-06",
      endDate: "2024-12",
      description: "Developed REST APIs and optimized database queries. Built responsive web applications using React and Node.js.",
      isVisible: true
    });

    // Initialize user stats
    await db.insert(userStats).values({
      userId: user.id,
      totalXp: 2847,
      currentStreak: 5,
      longestStreak: 12,
      lastActivityDate: new Date(),
      portfolioViews: 1234
    });

    // Create sample learning modules
    const modulesData = [
      {
        title: "JavaScript ES6+",
        description: "Master modern JavaScript features and syntax",
        category: "Programming",
        xpReward: 150,
        lessons: [
          { title: "Arrow Functions", content: "Learn about arrow function syntax", xp: 30 },
          { title: "Destructuring", content: "Master object and array destructuring", xp: 30 },
          { title: "Async/Await", content: "Handle asynchronous operations", xp: 40 },
          { title: "Modules", content: "Import and export modules", xp: 25 },
          { title: "Classes", content: "Object-oriented programming in JS", xp: 25 }
        ],
        isActive: true,
      },
      {
        title: "React.js Advanced Patterns",
        description: "Learn advanced React patterns including hooks, context, and performance optimization",
        category: "Frontend",
        xpReward: 200,
        lessons: [
          { title: "Custom Hooks", content: "Create reusable custom hooks", xp: 40 },
          { title: "Context API", content: "State management with Context", xp: 40 },
          { title: "Performance Optimization", content: "Memo, useMemo, useCallback", xp: 50 },
          { title: "Error Boundaries", content: "Handle errors gracefully", xp: 35 },
          { title: "Testing", content: "Unit testing React components", xp: 35 }
        ],
        isActive: true,
      },
      {
        title: "Node.js & Express",
        description: "Build robust backend applications with Node.js and Express",
        category: "Backend",
        xpReward: 180,
        lessons: [
          { title: "Express Basics", content: "Setting up Express server", xp: 30 },
          { title: "Middleware", content: "Understanding middleware functions", xp: 35 },
          { title: "Authentication", content: "JWT and session management", xp: 45 },
          { title: "Database Integration", content: "Connect to databases", xp: 40 },
          { title: "API Design", content: "RESTful API best practices", xp: 30 }
        ],
        isActive: true,
      }
    ];

    for (const module of modulesData) {
      await db.insert(learningModules).values(module);
    }

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log("Seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}

export { seedDatabase };