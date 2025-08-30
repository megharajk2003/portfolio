
ALTER TABLE "daily_activity" ADD COLUMN "lessons_completed" integer DEFAULT 0;

-- Update existing records to have lessons_completed = 1 where xp_earned > 0
UPDATE "daily_activity" SET "lessons_completed" = CASE 
  WHEN "xp_earned" > 0 THEN 1 
  ELSE 0 
END WHERE "lessons_completed" IS NULL;
