import { db } from "./db";
import {
  users,
  profiles,
  skills,
  projects,
  achievements,
  workExperience,
  learningModules,
  userStats,
} from "@shared/schema";

async function seedDatabase() {
  try {
    // Create sample user
    const [user] = await db
      .insert(users)
      .values({
        id: "user_sample_1",
        email: "megharaj@example.com",
        firstName: "Megharaj",
        lastName: "K",
        profileImageUrl: null,
      })
      .returning();

    console.log("Created user:", user.id);

    // Create sample profile
    await db.insert(profiles).values({
      userId: user.id,
      name: "Megharaj K",
      role: "Full Stack Developer",
      email: "megharaj@example.com",
      phone: "+91 12345 67890",
      location: "Tamil Nadu, India",
      summary:
        "Passionate full-stack developer with experience in MERN stack and modern web technologies.",
      portfolioTheme: "modern",
      isPublic: true,
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
      { name: "Leadership", level: 75, category: "soft" },
    ];

    for (const skill of skillsData) {
      await db.insert(skills).values({
        userId: user.id,
        name: skill.name,
        level: skill.level,
        category: skill.category,
        isVisible: true,
      });
    }

    // Create sample projects
    const projectsData = [
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

    for (const project of projectsData) {
      await db.insert(projects).values({
        userId: user.id,
        title: project.title,
        description: project.description,
        technologies: project.technologies,
        link: project.link,
        githubLink: project.githubLink,
        isVisible: true,
      });
    }

    // Create sample achievements
    const achievementsData = [
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

    for (const achievement of achievementsData) {
      await db.insert(achievements).values({
        userId: user.id,
        title: achievement.title,
        description: achievement.description,
        year: achievement.year,
        isVisible: true,
      });
    }

    // Create sample work experience
    await db.insert(workExperience).values({
      userId: user.id,
      title: "Software Developer Intern",
      company: "ABC Tech Solutions",
      startDate: "2024-06",
      endDate: "2024-12",
      description:
        "Developed REST APIs and optimized database queries. Built responsive web applications using React and Node.js.",
      isVisible: true,
    });

    // Initialize user stats
    await db.insert(userStats).values({
      userId: user.id,
      totalXp: 2847,
      currentStreak: 5,
      longestStreak: 12,
      lastActivityDate: new Date(),
      portfolioViews: 1234,
    });

    // Create real learning modules with comprehensive content
    const modulesData = [
      {
        title: "Complete Frontend Development",
        description: "Master modern frontend development from HTML/CSS basics to advanced React applications",
        category: "Frontend",
        xpReward: 250,
        lessons: [
          {
            title: "HTML5 Semantic Elements",
            content: "Learn proper HTML structure, semantic elements, accessibility features, and modern HTML5 APIs for building well-structured web pages",
            xp: 35,
          },
          {
            title: "CSS Grid & Flexbox",
            content: "Master modern CSS layout systems including Grid and Flexbox for responsive designs, with practical examples and browser compatibility",
            xp: 40,
          },
          {
            title: "JavaScript Fundamentals",
            content: "Core JavaScript concepts: variables, functions, objects, arrays, DOM manipulation, event handling, and ES6+ features",
            xp: 45,
          },
          {
            title: "React Components & JSX",
            content: "Build dynamic user interfaces with React components, understand JSX syntax, props, state management, and component lifecycle",
            xp: 50,
          },
          {
            title: "State Management & Hooks",
            content: "Advanced React patterns: useEffect, useState, custom hooks, context API, and state management solutions like Redux Toolkit",
            xp: 55,
          },
          {
            title: "API Integration & Testing",
            content: "Fetch data from APIs, handle loading states, error handling, and test React components using Jest and React Testing Library",
            xp: 45,
          },
        ],
        isActive: true,
      },
      {
        title: "Backend Development with Node.js",
        description: "Build scalable backend applications with Node.js, Express, databases, and modern deployment practices",
        category: "Backend",
        xpReward: 300,
        lessons: [
          {
            title: "Node.js Fundamentals",
            content: "Understanding Node.js runtime, modules system, npm ecosystem, asynchronous programming with callbacks, promises, and async/await",
            xp: 40,
          },
          {
            title: "Express.js Framework",
            content: "Building REST APIs with Express.js: routing, middleware, request/response handling, error handling, and security best practices",
            xp: 50,
          },
          {
            title: "Database Design & Integration",
            content: "Database fundamentals: SQL vs NoSQL, PostgreSQL/MongoDB integration, ORM/ODM usage, query optimization, and data modeling",
            xp: 55,
          },
          {
            title: "Authentication & Authorization",
            content: "Implement secure authentication using JWT, OAuth 2.0, session management, password hashing, and role-based access control",
            xp: 50,
          },
          {
            title: "API Security & Validation",
            content: "Input validation, rate limiting, CORS, helmet.js, data sanitization, and protection against common security vulnerabilities",
            xp: 45,
          },
          {
            title: "Testing & Documentation",
            content: "Unit testing with Jest, integration testing, API documentation with Swagger, logging, monitoring, and debugging techniques",
            xp: 40,
          },
        ],
        isActive: true,
      },
      {
        title: "Database Management & Design",
        description: "Master database design, SQL optimization, and modern database technologies for scalable applications",
        category: "Database",
        xpReward: 200,
        lessons: [
          {
            title: "Database Design Principles",
            content: "Normalization, entity-relationship modeling, schema design patterns, and choosing between SQL and NoSQL databases",
            xp: 40,
          },
          {
            title: "Advanced SQL Queries",
            content: "Complex joins, subqueries, window functions, stored procedures, triggers, and query optimization techniques for better performance",
            xp: 45,
          },
          {
            title: "PostgreSQL Advanced Features",
            content: "JSONB data types, full-text search, indexing strategies, partitioning, and PostgreSQL-specific optimization techniques",
            xp: 40,
          },
          {
            title: "NoSQL with MongoDB",
            content: "Document-based modeling, aggregation pipelines, indexing, sharding, and when to choose MongoDB over relational databases",
            xp: 35,
          },
          {
            title: "Database Performance Tuning",
            content: "Query optimization, index design, connection pooling, caching strategies, and monitoring database performance metrics",
            xp: 40,
          },
        ],
        isActive: true,
      },
      {
        title: "DevOps & Cloud Deployment",
        description: "Learn modern deployment practices, containerization, CI/CD pipelines, and cloud infrastructure management",
        category: "DevOps",
        xpReward: 275,
        lessons: [
          {
            title: "Git & Version Control",
            content: "Advanced Git workflows, branching strategies, code reviews, merge conflicts resolution, and collaborative development practices",
            xp: 35,
          },
          {
            title: "Docker Containerization",
            content: "Container concepts, Dockerfile creation, Docker Compose for multi-service applications, image optimization, and container best practices",
            xp: 50,
          },
          {
            title: "CI/CD Pipeline Setup",
            content: "Automated testing and deployment with GitHub Actions, Jenkins, or GitLab CI, environment management, and deployment strategies",
            xp: 55,
          },
          {
            title: "Cloud Platform Deployment",
            content: "Deploy applications on AWS, Google Cloud, or Azure: compute services, databases, storage, networking, and cost optimization",
            xp: 60,
          },
          {
            title: "Monitoring & Logging",
            content: "Application monitoring with tools like New Relic or DataDog, log aggregation, error tracking, and performance optimization",
            xp: 45,
          },
          {
            title: "Infrastructure as Code",
            content: "Terraform or CloudFormation for infrastructure management, configuration management, and automated environment provisioning",
            xp: 50,
          },
        ],
        isActive: true,
      },
      {
        title: "Mobile Development with React Native",
        description: "Build cross-platform mobile applications using React Native for iOS and Android platforms",
        category: "Mobile",
        xpReward: 225,
        lessons: [
          {
            title: "React Native Fundamentals",
            content: "Setting up development environment, understanding React Native architecture, navigation, and differences from web React",
            xp: 40,
          },
          {
            title: "Native Components & APIs",
            content: "Using platform-specific components, accessing device features like camera, GPS, storage, and handling platform differences",
            xp: 45,
          },
          {
            title: "State Management & Navigation",
            content: "Redux or Context API for state management, React Navigation for screen routing, and handling deep linking",
            xp: 40,
          },
          {
            title: "Performance Optimization",
            content: "Optimizing app performance, lazy loading, image optimization, memory management, and profiling mobile applications",
            xp: 35,
          },
          {
            title: "Testing & Deployment",
            content: "Unit testing React Native apps, end-to-end testing with Detox, app store deployment process, and continuous deployment",
            xp: 45,
          },
        ],
        isActive: true,
      },
      {
        title: "Data Science & Analytics",
        description: "Learn data analysis, visualization, and machine learning fundamentals using Python and modern tools",
        category: "Data Science",
        xpReward: 250,
        lessons: [
          {
            title: "Python for Data Analysis",
            content: "NumPy arrays, Pandas DataFrames, data cleaning, manipulation, and exploratory data analysis techniques",
            xp: 45,
          },
          {
            title: "Data Visualization",
            content: "Creating charts and graphs with Matplotlib, Seaborn, and Plotly for effective data storytelling and insights",
            xp: 40,
          },
          {
            title: "Statistical Analysis",
            content: "Descriptive statistics, hypothesis testing, correlation analysis, and interpreting statistical significance in data",
            xp: 45,
          },
          {
            title: "Machine Learning Basics",
            content: "Supervised and unsupervised learning, regression, classification, clustering with scikit-learn, and model evaluation",
            xp: 55,
          },
          {
            title: "Data Pipelines & APIs",
            content: "Building data pipelines, working with APIs, data warehousing concepts, and automating data collection and processing",
            xp: 40,
          },
        ],
        isActive: true,
      },
      {
        title: "Cybersecurity Fundamentals",
        description: "Essential cybersecurity knowledge for developers: secure coding, threat assessment, and protection strategies",
        category: "Security",
        xpReward: 200,
        lessons: [
          {
            title: "Secure Coding Practices",
            content: "Input validation, output encoding, secure authentication, session management, and preventing common vulnerabilities",
            xp: 45,
          },
          {
            title: "Web Application Security",
            content: "OWASP Top 10 vulnerabilities, XSS prevention, CSRF protection, SQL injection prevention, and security headers",
            xp: 50,
          },
          {
            title: "Cryptography Basics",
            content: "Encryption algorithms, hashing, digital signatures, PKI, TLS/SSL implementation, and key management practices",
            xp: 40,
          },
          {
            title: "Network Security",
            content: "Firewalls, VPNs, network monitoring, intrusion detection, and securing API endpoints and microservices",
            xp: 35,
          },
          {
            title: "Security Testing & Auditing",
            content: "Penetration testing basics, vulnerability scanning, security code review, and compliance requirements",
            xp: 40,
          },
        ],
        isActive: true,
      },
      {
        title: "AI & Machine Learning for Developers",
        description: "Practical machine learning and AI integration for software developers building intelligent applications",
        category: "AI/ML",
        xpReward: 300,
        lessons: [
          {
            title: "Machine Learning Fundamentals",
            content: "Understanding ML algorithms, training vs inference, data preprocessing, feature engineering, and model selection",
            xp: 50,
          },
          {
            title: "Deep Learning with TensorFlow",
            content: "Neural networks, TensorFlow/Keras basics, computer vision, natural language processing, and model deployment",
            xp: 60,
          },
          {
            title: "AI API Integration",
            content: "Integrating AI services like OpenAI, Google AI, AWS AI services into applications, prompt engineering, and cost optimization",
            xp: 45,
          },
          {
            title: "MLOps & Model Deployment",
            content: "Model versioning, CI/CD for ML, monitoring model performance, A/B testing ML models, and production considerations",
            xp: 55,
          },
          {
            title: "Ethical AI & Bias Detection",
            content: "Understanding AI bias, fairness in ML models, ethical considerations, privacy-preserving ML, and responsible AI development",
            xp: 40,
          },
        ],
        isActive: true,
      },
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
