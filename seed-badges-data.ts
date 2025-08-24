import { db } from "./server/db";
import { badges } from "./shared/schema";

async function seedBadges() {
  console.log("🏆 Seeding badge data...");
  
  try {
    // Delete existing badges
    await db.delete(badges);
    console.log("✅ Existing badges cleared");

    const badgeData = [
      // Onboarding & Profile Completion (10)
      {
        title: "Welcome Aboard",
        description: "Joined SkillStream",
        icon: "Gift",
        color: "blue",
        type: "achievement" as const,
        criteria: { firstLogin: true },
        xpReward: 25,
        rarity: "common" as const,
      },
      {
        title: "Profile Pioneer",
        description: "Filled out basic profile information",
        icon: "User",
        color: "green",
        type: "achievement" as const,
        criteria: { profileCompleted: 25 },
        xpReward: 50,
        rarity: "common" as const,
      },
      {
        title: "Skill Starter",
        description: "Added your first 5 skills",
        icon: "Zap",
        color: "purple",
        type: "achievement" as const,
        criteria: { skillsAdded: 5 },
        xpReward: 75,
        rarity: "common" as const,
      },
      {
        title: "Portfolio Novice",
        description: "Added your first project",
        icon: "Briefcase",
        color: "indigo",
        type: "achievement" as const,
        criteria: { projectsAdded: 1 },
        xpReward: 50,
        rarity: "common" as const,
      },
      {
        title: "Goal Setter",
        description: "Created your first learning goal",
        icon: "Target",
        color: "orange",
        type: "achievement" as const,
        criteria: { goalsCreated: 1 },
        xpReward: 50,
        rarity: "common" as const,
      },
      {
        title: "Bio Builder",
        description: "Wrote a personal biography",
        icon: "FileText",
        color: "cyan",
        type: "achievement" as const,
        criteria: { bioAdded: true },
        xpReward: 50,
        rarity: "common" as const,
      },
      {
        title: "Picture Perfect",
        description: "Uploaded a profile picture",
        icon: "Camera",
        color: "pink",
        type: "achievement" as const,
        criteria: { profilePicture: true },
        xpReward: 25,
        rarity: "common" as const,
      },
      {
        title: "Experience Enthusiast",
        description: "Added your first work experience",
        icon: "Building",
        color: "slate",
        type: "achievement" as const,
        criteria: { workExperienceAdded: 1 },
        xpReward: 75,
        rarity: "common" as const,
      },
      {
        title: "Education Expert",
        description: "Added your educational background",
        icon: "GraduationCap",
        color: "emerald",
        type: "achievement" as const,
        criteria: { educationAdded: 1 },
        xpReward: 75,
        rarity: "common" as const,
      },
      {
        title: "Profile Pro",
        description: "Achieved 100% profile completion",
        icon: "CheckCircle",
        color: "gold",
        type: "achievement" as const,
        criteria: { profileCompleted: 100 },
        xpReward: 200,
        rarity: "rare" as const,
      },

      // Learning & Course Completion (25)
      {
        title: "First Steps",
        description: "Completed your first lesson",
        icon: "PlayCircle",
        color: "green",
        type: "milestone" as const,
        criteria: { lessonsCompleted: 1 },
        xpReward: 25,
        rarity: "common" as const,
      },
      {
        title: "Course Starter",
        description: "Enrolled in your first course",
        icon: "BookOpen",
        color: "blue",
        type: "achievement" as const,
        criteria: { coursesEnrolled: 1 },
        xpReward: 50,
        rarity: "common" as const,
      },
      {
        title: "Course Conqueror",
        description: "Completed your first course",
        icon: "Trophy",
        color: "gold",
        type: "course_completion" as const,
        criteria: { coursesCompleted: 1 },
        xpReward: 100,
        rarity: "rare" as const,
      },
      {
        title: "Module Master",
        description: "Completed your first module",
        icon: "CheckCircle2",
        color: "emerald",
        type: "milestone" as const,
        criteria: { modulesCompleted: 1 },
        xpReward: 50,
        rarity: "common" as const,
      },
      {
        title: "Weekend Warrior",
        description: "Completed a course over a weekend",
        icon: "Calendar",
        color: "orange",
        type: "achievement" as const,
        criteria: { weekendCompletion: true },
        xpReward: 150,
        rarity: "rare" as const,
      },
      {
        title: "Five-Course Finisher",
        description: "Completed 5 courses",
        icon: "Award",
        color: "purple",
        type: "milestone" as const,
        criteria: { coursesCompleted: 5 },
        xpReward: 250,
        rarity: "rare" as const,
      },
      {
        title: "Ten-Course Titan",
        description: "Completed 10 courses",
        icon: "Crown",
        color: "gold",
        type: "milestone" as const,
        criteria: { coursesCompleted: 10 },
        xpReward: 500,
        rarity: "epic" as const,
      },
      {
        title: "Twenty-Five-Course Champion",
        description: "Completed 25 courses",
        icon: "Star",
        color: "yellow",
        type: "milestone" as const,
        criteria: { coursesCompleted: 25 },
        xpReward: 1000,
        rarity: "epic" as const,
      },
      {
        title: "Fifty-Course Legend",
        description: "Completed 50 courses",
        icon: "Flame",
        color: "red",
        type: "milestone" as const,
        criteria: { coursesCompleted: 50 },
        xpReward: 2000,
        rarity: "legendary" as const,
      },

      // Goal Achievement (20 - representing the tier structure)
      {
        title: "Goal Starter",
        description: "Complete 1 goal",
        icon: "Target",
        color: "bronze",
        type: "milestone" as const,
        criteria: { goalsCompleted: 1 },
        xpReward: 50,
        rarity: "common" as const,
      },
      {
        title: "Goal Getter",
        description: "Complete 5 goals",
        icon: "Crosshair",
        color: "bronze",
        type: "milestone" as const,
        criteria: { goalsCompleted: 5 },
        xpReward: 150,
        rarity: "common" as const,
      },
      {
        title: "Persistent Player",
        description: "Complete 10 goals",
        icon: "CheckCircle",
        color: "bronze",
        type: "milestone" as const,
        criteria: { goalsCompleted: 10 },
        xpReward: 250,
        rarity: "common" as const,
      },
      {
        title: "Ambitious Achiever",
        description: "Complete 15 goals",
        icon: "TrendingUp",
        color: "bronze",
        type: "milestone" as const,
        criteria: { goalsCompleted: 15 },
        xpReward: 350,
        rarity: "common" as const,
      },
      {
        title: "Dedicated Doer",
        description: "Complete 20 goals",
        icon: "Heart",
        color: "bronze",
        type: "milestone" as const,
        criteria: { goalsCompleted: 20 },
        xpReward: 450,
        rarity: "common" as const,
      },
      {
        title: "Goal Guardian",
        description: "Complete 25 goals",
        icon: "Shield",
        color: "silver",
        type: "milestone" as const,
        criteria: { goalsCompleted: 25 },
        xpReward: 600,
        rarity: "rare" as const,
      },
      {
        title: "Goal Guru",
        description: "Complete 50 goals",
        icon: "Crown",
        color: "silver",
        type: "milestone" as const,
        criteria: { goalsCompleted: 50 },
        xpReward: 1200,
        rarity: "rare" as const,
      },
      {
        title: "Goal Grandmaster",
        description: "Complete 100 goals",
        icon: "Trophy",
        color: "gold",
        type: "milestone" as const,
        criteria: { goalsCompleted: 100 },
        xpReward: 2500,
        rarity: "epic" as const,
      },
      {
        title: "Platinum Planner",
        description: "Complete 200 goals",
        icon: "Calendar",
        color: "platinum",
        type: "milestone" as const,
        criteria: { goalsCompleted: 200 },
        xpReward: 5000,
        rarity: "legendary" as const,
      },
      {
        title: "SkillStream Sovereign",
        description: "Complete 500 goals",
        icon: "Infinity",
        color: "rainbow",
        type: "milestone" as const,
        criteria: { goalsCompleted: 500 },
        xpReward: 15000,
        rarity: "legendary" as const,
      },

      // Skill Mastery (15)
      {
        title: "Skill Collector",
        description: "Added 10 skills to your profile",
        icon: "Database",
        color: "blue",
        type: "milestone" as const,
        criteria: { skillsAdded: 10 },
        xpReward: 200,
        rarity: "common" as const,
      },
      {
        title: "Skill Hoarder",
        description: "Added 25 skills to your profile",
        icon: "Archive",
        color: "purple",
        type: "milestone" as const,
        criteria: { skillsAdded: 25 },
        xpReward: 500,
        rarity: "rare" as const,
      },
      {
        title: "Skill Sensei",
        description: "Added 50 skills to your profile",
        icon: "Award",
        color: "gold",
        type: "milestone" as const,
        criteria: { skillsAdded: 50 },
        xpReward: 1000,
        rarity: "epic" as const,
      },

      // Project & Portfolio (5)
      {
        title: "Project Pro",
        description: "Added 5 projects to your portfolio",
        icon: "Folder",
        color: "blue",
        type: "milestone" as const,
        criteria: { projectsAdded: 5 },
        xpReward: 250,
        rarity: "common" as const,
      },
      {
        title: "Portfolio Powerhouse",
        description: "Added 10 projects to your portfolio",
        icon: "FolderOpen",
        color: "purple",
        type: "milestone" as const,
        criteria: { projectsAdded: 10 },
        xpReward: 500,
        rarity: "rare" as const,
      },
      {
        title: "Public Profile",
        description: "Made your portfolio public",
        icon: "Globe",
        color: "green",
        type: "achievement" as const,
        criteria: { publicPortfolio: true },
        xpReward: 100,
        rarity: "common" as const,
      },

      // Consistency & Streaks (10)
      {
        title: "Daily Dabbler",
        description: "Visited the platform 3 days in a row",
        icon: "Calendar",
        color: "green",
        type: "streak" as const,
        criteria: { streakDays: 3 },
        xpReward: 100,
        rarity: "common" as const,
      },
      {
        title: "Weekly Regular",
        description: "Visited every day for a week",
        icon: "CalendarDays",
        color: "blue",
        type: "streak" as const,
        criteria: { streakDays: 7 },
        xpReward: 200,
        rarity: "common" as const,
      },
      {
        title: "Monthly Mainstay",
        description: "Visited every day for a month",
        icon: "CalendarCheck",
        color: "purple",
        type: "streak" as const,
        criteria: { streakDays: 30 },
        xpReward: 1000,
        rarity: "rare" as const,
      },
      {
        title: "Streak Champion",
        description: "Maintained a 30-day learning streak",
        icon: "Flame",
        color: "orange",
        type: "streak" as const,
        criteria: { learningStreak: 30 },
        xpReward: 1500,
        rarity: "epic" as const,
      },

      // Community & Engagement (5)
      {
        title: "Forum First-Timer",
        description: "Made your first post in the forum",
        icon: "MessageSquare",
        color: "blue",
        type: "achievement" as const,
        criteria: { forumPosts: 1 },
        xpReward: 75,
        rarity: "common" as const,
      },
      {
        title: "Community Contributor",
        description: "Made 25 posts or replies in the forum",
        icon: "Users",
        color: "purple",
        type: "milestone" as const,
        criteria: { forumPosts: 25 },
        xpReward: 500,
        rarity: "rare" as const,
      },

      // Career Development (5)
      {
        title: "Resume Ready",
        description: "Generated your first resume",
        icon: "FileText",
        color: "green",
        type: "achievement" as const,
        criteria: { resumeGenerated: true },
        xpReward: 100,
        rarity: "common" as const,
      },
      {
        title: "Career Explorer",
        description: "Used the Career Advisor tool",
        icon: "Compass",
        color: "blue",
        type: "achievement" as const,
        criteria: { careerAdvisorUsed: true },
        xpReward: 150,
        rarity: "common" as const,
      },

      // Special Achievements & Meta-Badges (10)
      {
        title: "Badge Beginner",
        description: "Earned your first badge",
        icon: "Award",
        color: "blue",
        type: "milestone" as const,
        criteria: { badgesEarned: 1 },
        xpReward: 50,
        rarity: "common" as const,
      },
      {
        title: "Badge Collector",
        description: "Earned 10 badges",
        icon: "Package",
        color: "purple",
        type: "milestone" as const,
        criteria: { badgesEarned: 10 },
        xpReward: 300,
        rarity: "rare" as const,
      },
      {
        title: "Badge Enthusiast",
        description: "Earned 25 badges",
        icon: "Star",
        color: "gold",
        type: "milestone" as const,
        criteria: { badgesEarned: 25 },
        xpReward: 750,
        rarity: "epic" as const,
      },
      {
        title: "Badge Baron",
        description: "Earned 50 badges",
        icon: "Crown",
        color: "purple",
        type: "milestone" as const,
        criteria: { badgesEarned: 50 },
        xpReward: 1500,
        rarity: "epic" as const,
      },
      {
        title: "Badge Legend",
        description: "Earned 100 badges",
        icon: "Trophy",
        color: "gold",
        type: "milestone" as const,
        criteria: { badgesEarned: 100 },
        xpReward: 5000,
        rarity: "legendary" as const,
      },
      {
        title: "SkillStream Superstar",
        description: "Unlocked a secret, hard-to-get achievement",
        icon: "Sparkles",
        color: "rainbow",
        type: "achievement" as const,
        criteria: { secretAchievement: true },
        xpReward: 10000,
        rarity: "legendary" as const,
      },
    ];

    const insertedBadges = await db.insert(badges).values(badgeData).returning();
    console.log(`✅ Inserted ${insertedBadges.length} badges`);

    console.log("🎉 Badge seeding completed successfully!");
    console.log("📊 Badge Summary:");
    console.log(`  - ${insertedBadges.filter(b => b.rarity === 'common').length} Common badges`);
    console.log(`  - ${insertedBadges.filter(b => b.rarity === 'rare').length} Rare badges`);
    console.log(`  - ${insertedBadges.filter(b => b.rarity === 'epic').length} Epic badges`);
    console.log(`  - ${insertedBadges.filter(b => b.rarity === 'legendary').length} Legendary badges`);

    return insertedBadges;
  } catch (error) {
    console.error("Error seeding badges:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedBadges()
    .then(() => {
      console.log("✅ Badge seeding completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Badge seeding failed:", error);
      process.exit(1);
    });
}

export { seedBadges };