
-- Fix all timestamp columns to use timezone
ALTER TABLE "users" 
  ALTER COLUMN "created_at" TYPE timestamp with time zone,
  ALTER COLUMN "updated_at" TYPE timestamp with time zone;

ALTER TABLE "profiles" 
  ALTER COLUMN "created_at" TYPE timestamp with time zone,
  ALTER COLUMN "updated_at" TYPE timestamp with time zone;

ALTER TABLE "user_stats" 
  ALTER COLUMN "last_activity_date" TYPE timestamp with time zone;

ALTER TABLE "user_progress" 
  ALTER COLUMN "completed_at" TYPE timestamp with time zone;

ALTER TABLE "lesson_progress" 
  ALTER COLUMN "completed_at" TYPE timestamp with time zone;

ALTER TABLE "quiz_attempts" 
  ALTER COLUMN "completed_at" TYPE timestamp with time zone;

ALTER TABLE "daily_activity" 
  ALTER COLUMN "created_at" TYPE timestamp with time zone DEFAULT now(),
  ALTER COLUMN "updated_at" TYPE timestamp with time zone DEFAULT now();

ALTER TABLE "education" 
  ALTER COLUMN "created_at" TYPE timestamp with time zone,
  ALTER COLUMN "updated_at" TYPE timestamp with time zone;

ALTER TABLE "skills" 
  ALTER COLUMN "created_at" TYPE timestamp with time zone,
  ALTER COLUMN "updated_at" TYPE timestamp with time zone;

ALTER TABLE "projects" 
  ALTER COLUMN "created_at" TYPE timestamp with time zone,
  ALTER COLUMN "updated_at" TYPE timestamp with time zone;

ALTER TABLE "certifications" 
  ALTER COLUMN "created_at" TYPE timestamp with time zone,
  ALTER COLUMN "updated_at" TYPE timestamp with time zone;

ALTER TABLE "achievements" 
  ALTER COLUMN "created_at" TYPE timestamp with time zone,
  ALTER COLUMN "updated_at" TYPE timestamp with time zone;

ALTER TABLE "work_experience" 
  ALTER COLUMN "created_at" TYPE timestamp with time zone,
  ALTER COLUMN "updated_at" TYPE timestamp with time zone;

ALTER TABLE "volunteer_experience" 
  ALTER COLUMN "created_at" TYPE timestamp with time zone,
  ALTER COLUMN "updated_at" TYPE timestamp with time zone;

ALTER TABLE "publications" 
  ALTER COLUMN "created_at" TYPE timestamp with time zone,
  ALTER COLUMN "updated_at" TYPE timestamp with time zone;

ALTER TABLE "organizations" 
  ALTER COLUMN "created_at" TYPE timestamp with time zone,
  ALTER COLUMN "updated_at" TYPE timestamp with time zone;

ALTER TABLE "career_advisories" 
  ALTER COLUMN "created_at" TYPE timestamp with time zone;

ALTER TABLE "career_timelines" 
  ALTER COLUMN "created_at" TYPE timestamp with time zone;

ALTER TABLE "generated_resumes" 
  ALTER COLUMN "created_at" TYPE timestamp with time zone,
  ALTER COLUMN "updated_at" TYPE timestamp with time zone;

ALTER TABLE "chat_sessions" 
  ALTER COLUMN "created_at" TYPE timestamp with time zone,
  ALTER COLUMN "updated_at" TYPE timestamp with time zone;

ALTER TABLE "forum_posts" 
  ALTER COLUMN "created_at" TYPE timestamp with time zone,
  ALTER COLUMN "updated_at" TYPE timestamp with time zone;

ALTER TABLE "forum_replies" 
  ALTER COLUMN "created_at" TYPE timestamp with time zone,
  ALTER COLUMN "updated_at" TYPE timestamp with time zone;

ALTER TABLE "forum_likes" 
  ALTER COLUMN "created_at" TYPE timestamp with time zone;

ALTER TABLE "badges" 
  ALTER COLUMN "created_at" TYPE timestamp with time zone;

ALTER TABLE "user_badges" 
  ALTER COLUMN "earned_at" TYPE timestamp with time zone;

ALTER TABLE "goals" 
  ALTER COLUMN "created_at" TYPE timestamp with time zone,
  ALTER COLUMN "updated_at" TYPE timestamp with time zone,
  ALTER COLUMN "completed_at" TYPE timestamp with time zone;

ALTER TABLE "goal_categories" 
  ALTER COLUMN "created_at" TYPE timestamp with time zone;

ALTER TABLE "goal_topics" 
  ALTER COLUMN "created_at" TYPE timestamp with time zone,
  ALTER COLUMN "updated_at" TYPE timestamp with time zone;

ALTER TABLE "goal_subtopics" 
  ALTER COLUMN "due_date" TYPE timestamp with time zone,
  ALTER COLUMN "completed_at" TYPE timestamp with time zone,
  ALTER COLUMN "created_at" TYPE timestamp with time zone,
  ALTER COLUMN "updated_at" TYPE timestamp with time zone;

ALTER TABLE "notifications" 
  ALTER COLUMN "created_at" TYPE timestamp with time zone;
