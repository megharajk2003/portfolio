import { db } from "./server/db";
import { badges } from "./shared/schema";

async function seedBadges() {
  console.log("🏆 Seeding badge data...");
  
  try {
    // Delete existing badges
    await db.delete(badges);
    console.log("✅ Existing badges cleared");

    const badgeData = [
      // Course Completion Badges
      {
        title: "AI Pioneer",
        description: "Completed your first AI & Machine Learning course",
        icon: "Zap",
        color: "purple",
        type: "course_completion" as const,
        criteria: { courseType: "AI & Machine Learning" },
        xpReward: 100,
        rarity: "rare" as const,
      },
      {
        title: "Data Scientist",
        description: "Mastered Data Science fundamentals",
        icon: "Trophy",
        color: "blue",
        type: "course_completion" as const,
        criteria: { courseType: "Data Science" },
        xpReward: 150,
        rarity: "epic" as const,
      },
      
      // Milestone Badges
      {
        title: "Fast Learner",
        description: "Completed first course in under 30 days",
        icon: "Flame",
        color: "orange",
        type: "milestone" as const,
        criteria: { timeLimit: 30 },
        xpReward: 75,
        rarity: "rare" as const,
      },
      {
        title: "Streak Master",
        description: "Maintained a 7-day learning streak",
        icon: "Calendar",
        color: "green",
        type: "streak" as const,
        criteria: { streakDays: 7 },
        xpReward: 50,
        rarity: "common" as const,
      },
      {
        title: "Knowledge Seeker",
        description: "Completed 5 courses",
        icon: "BookOpen",
        color: "indigo",
        type: "milestone" as const,
        criteria: { coursesCompleted: 5 },
        xpReward: 200,
        rarity: "epic" as const,
      },
      
      // Achievement Badges
      {
        title: "Perfect Score",
        description: "Achieved 100% on a final exam",
        icon: "Star",
        color: "yellow",
        type: "achievement" as const,
        criteria: { examScore: 100 },
        xpReward: 100,
        rarity: "rare" as const,
      },
      {
        title: "Learning Champion",
        description: "Completed 10 courses with distinction",
        icon: "Crown",
        color: "gold",
        type: "milestone" as const,
        criteria: { coursesCompleted: 10, grade: "distinction" },
        xpReward: 500,
        rarity: "legendary" as const,
      },
      {
        title: "First Steps",
        description: "Welcome to your learning journey!",
        icon: "Gift",
        color: "pink",
        type: "milestone" as const,
        criteria: { firstLogin: true },
        xpReward: 25,
        rarity: "common" as const,
      },
      {
        title: "XP Collector",
        description: "Earned 1000 total XP points",
        icon: "Target",
        color: "emerald",
        type: "milestone" as const,
        criteria: { totalXp: 1000 },
        xpReward: 100,
        rarity: "rare" as const,
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