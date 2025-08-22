import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Import schema tables
import { 
  categories, 
  instructors, 
  courses, 
  courseCategories, 
  modules, 
  lessons 
} from './shared/schema.js';

// Database connection
const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString);
const db = drizzle(sql);

async function seedLearningData() {
  try {
    console.log('🌱 Starting to seed learning platform data...');

    // Insert categories
    console.log('📚 Seeding categories...');
    const categoryData = [
      { name: 'AI & Machine Learning' },
      { name: 'Data Science & Analytics' },
      { name: 'Generative AI' },
      { name: 'Management' },
      { name: 'Software & Tech' },
      { name: 'Cloud Computing' },
      { name: 'Design' },
      { name: 'Business' },
      { name: 'Marketing' },
      { name: 'Leadership' }
    ];

    const insertedCategories = await db.insert(categories).values(categoryData).returning();
    console.log(`✅ Inserted ${insertedCategories.length} categories`);

    // Insert instructors
    console.log('👨‍🏫 Seeding instructors...');
    const instructorData = [
      {
        fullName: 'Dr. Sarah Chen',
        bio: 'AI researcher with 15+ years experience in machine learning and neural networks.',
        profilePictureUrl: null
      },
      {
        fullName: 'Prof. Michael Rodriguez',
        bio: 'Data science expert and former Netflix data scientist.',
        profilePictureUrl: null
      },
      {
        fullName: 'Dr. Emily Johnson',
        bio: 'Leadership consultant and former McKinsey partner.',
        profilePictureUrl: null
      },
      {
        fullName: 'James Park',
        bio: 'Tech entrepreneur and cloud architecture specialist.',
        profilePictureUrl: null
      },
      {
        fullName: 'Dr. Amanda Foster',
        bio: 'Generative AI researcher at OpenAI.',
        profilePictureUrl: null
      }
    ];

    const insertedInstructors = await db.insert(instructors).values(instructorData).returning();
    console.log(`✅ Inserted ${insertedInstructors.length} instructors`);

    // Insert courses
    console.log('🎓 Seeding courses...');
    const courseData = [
      {
        title: 'PG Program in Artificial Intelligence & Machine Learning',
        subtitle: 'Comprehensive AI/ML program for working professionals',
        description: 'Master the fundamentals of AI and machine learning with hands-on projects and real-world applications.',
        language: 'English',
        level: 'Intermediate',
        isFree: false,
        price: '2999.00',
        durationMonths: 12,
        scheduleInfo: '10-12 hours per week, flexible schedule',
        whatYouWillLearn: [
          'Machine Learning algorithms and techniques',
          'Deep Learning and Neural Networks',
          'Natural Language Processing',
          'Computer Vision',
          'AI project implementation'
        ],
        skillsYouWillGain: [
          'Python Programming',
          'TensorFlow',
          'PyTorch',
          'Data Analysis',
          'AI Model Deployment'
        ],
        detailsToKnow: [
          'Industry-recognized certificate',
          'Hands-on projects',
          'Career support included',
          'Expert mentorship'
        ],
        instructorId: insertedInstructors[0].id
      },
      {
        title: 'Post Graduate Program in Data Science with Generative AI',
        subtitle: 'Advanced data science with cutting-edge GenAI techniques',
        description: 'Learn data science fundamentals combined with the latest generative AI technologies.',
        language: 'English',
        level: 'Advanced',
        isFree: false,
        price: '3499.00',
        durationMonths: 15,
        scheduleInfo: '12-15 hours per week, self-paced',
        whatYouWillLearn: [
          'Statistical analysis and data modeling',
          'Generative AI models (GPT, DALL-E, etc.)',
          'Advanced data visualization',
          'Big data technologies',
          'AI ethics and governance'
        ],
        skillsYouWillGain: [
          'Python',
          'R Programming',
          'SQL',
          'Generative AI',
          'Data Visualization'
        ],
        detailsToKnow: [
          'Capstone project',
          'Industry partnerships',
          'Job placement assistance',
          'Live sessions with experts'
        ],
        instructorId: insertedInstructors[1].id
      },
      {
        title: 'Post Graduate Diploma in Management (Online)',
        subtitle: 'Executive MBA equivalent program',
        description: 'Comprehensive management program designed for working professionals seeking leadership roles.',
        language: 'English',
        level: 'Intermediate',
        isFree: false,
        price: '4999.00',
        durationMonths: 24,
        scheduleInfo: '8-10 hours per week, weekend classes',
        whatYouWillLearn: [
          'Strategic management',
          'Financial analysis',
          'Operations management',
          'Leadership skills',
          'Digital transformation'
        ],
        skillsYouWillGain: [
          'Strategic Thinking',
          'Financial Planning',
          'Team Leadership',
          'Project Management',
          'Business Analytics'
        ],
        detailsToKnow: [
          'Alumni network access',
          'Business simulation projects',
          'Industry mentorship',
          'Global case studies'
        ],
        instructorId: insertedInstructors[2].id
      },
      {
        title: 'Cloud Computing Fundamentals with AWS',
        subtitle: 'Master cloud technologies and AWS services',
        description: 'Complete guide to cloud computing using Amazon Web Services.',
        language: 'English',
        level: 'Beginner',
        isFree: true,
        price: null,
        durationMonths: 3,
        scheduleInfo: '5-7 hours per week, self-paced',
        whatYouWillLearn: [
          'Cloud computing concepts',
          'AWS core services',
          'Cloud security best practices',
          'Cost optimization',
          'DevOps on AWS'
        ],
        skillsYouWillGain: [
          'AWS Services',
          'Cloud Architecture',
          'DevOps',
          'Linux',
          'Networking'
        ],
        detailsToKnow: [
          'AWS certification prep',
          'Hands-on labs',
          'Free tier usage',
          'Community support'
        ],
        instructorId: insertedInstructors[3].id
      },
      {
        title: 'Generative AI for Business Applications',
        subtitle: 'Apply GenAI to solve real business problems',
        description: 'Learn how to integrate generative AI into business workflows and processes.',
        language: 'English',
        level: 'Intermediate',
        isFree: false,
        price: '1999.00',
        durationMonths: 6,
        scheduleInfo: '6-8 hours per week, flexible',
        whatYouWillLearn: [
          'GenAI fundamentals',
          'Business use cases',
          'Prompt engineering',
          'AI integration strategies',
          'ROI measurement'
        ],
        skillsYouWillGain: [
          'Prompt Engineering',
          'AI Strategy',
          'Business Analysis',
          'API Integration',
          'Change Management'
        ],
        detailsToKnow: [
          'Real business projects',
          'Expert guest speakers',
          'Networking opportunities',
          'Certificate of completion'
        ],
        instructorId: insertedInstructors[4].id
      }
    ];

    const insertedCourses = await db.insert(courses).values(courseData).returning();
    console.log(`✅ Inserted ${insertedCourses.length} courses`);

    // Link courses to categories
    console.log('🔗 Linking courses to categories...');
    const courseCategoryLinks = [
      { courseId: insertedCourses[0].id, categoryId: insertedCategories[0].id }, // AI & ML
      { courseId: insertedCourses[1].id, categoryId: insertedCategories[1].id }, // Data Science
      { courseId: insertedCourses[1].id, categoryId: insertedCategories[2].id }, // GenAI
      { courseId: insertedCourses[2].id, categoryId: insertedCategories[3].id }, // Management
      { courseId: insertedCourses[3].id, categoryId: insertedCategories[5].id }, // Cloud Computing
      { courseId: insertedCourses[4].id, categoryId: insertedCategories[2].id }, // GenAI
    ];

    await db.insert(courseCategories).values(courseCategoryLinks);
    console.log(`✅ Created ${courseCategoryLinks.length} course-category links`);

    // Add sample modules and lessons for the first course
    console.log('📖 Adding sample modules and lessons...');
    const moduleData = [
      {
        courseId: insertedCourses[0].id,
        title: 'Introduction to AI and Machine Learning',
        description: 'Foundation concepts and overview of AI/ML landscape',
        moduleOrder: 1,
        durationHours: 15
      },
      {
        courseId: insertedCourses[0].id,
        title: 'Python for Machine Learning',
        description: 'Essential Python programming for ML applications',
        moduleOrder: 2,
        durationHours: 20
      },
      {
        courseId: insertedCourses[0].id,
        title: 'Supervised Learning Algorithms',
        description: 'Linear regression, classification, and model evaluation',
        moduleOrder: 3,
        durationHours: 25
      }
    ];

    const insertedModules = await db.insert(modules).values(moduleData).returning();
    console.log(`✅ Inserted ${insertedModules.length} modules`);

    // Add sample lessons for the first module
    const lessonData = [
      {
        moduleId: insertedModules[0].id,
        title: 'What is Artificial Intelligence?',
        content: 'Introduction to AI concepts, history, and applications',
        lessonOrder: 1,
        durationMinutes: 45
      },
      {
        moduleId: insertedModules[0].id,
        title: 'Machine Learning vs Traditional Programming',
        content: 'Understanding the paradigm shift from rule-based to data-driven programming',
        lessonOrder: 2,
        durationMinutes: 30
      },
      {
        moduleId: insertedModules[0].id,
        title: 'Types of Machine Learning',
        content: 'Supervised, unsupervised, and reinforcement learning explained',
        lessonOrder: 3,
        durationMinutes: 35
      }
    ];

    await db.insert(lessons).values(lessonData);
    console.log(`✅ Inserted ${lessonData.length} lessons`);

    console.log('🎉 Learning platform data seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding learning data:', error);
  } finally {
    await sql.end();
  }
}

// Run the seed function
seedLearningData();