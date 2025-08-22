import postgres from 'postgres';

// Database connection
const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString);

async function seedLearningData() {
  try {
    console.log('🌱 Starting to seed learning platform data...');

    // Insert categories
    console.log('📚 Seeding categories...');
    await sql`
      INSERT INTO categories (name) VALUES 
      ('AI & Machine Learning'),
      ('Data Science & Analytics'),
      ('Generative AI'),
      ('Management'),
      ('Software & Tech'),
      ('Cloud Computing'),
      ('Design'),
      ('Business'),
      ('Marketing'),
      ('Leadership')
      ON CONFLICT (name) DO NOTHING
    `;
    console.log('✅ Categories inserted');

    // Insert instructors
    console.log('👨‍🏫 Seeding instructors...');
    await sql`
      INSERT INTO instructors (full_name, bio) VALUES 
      ('Dr. Sarah Chen', 'AI researcher with 15+ years experience in machine learning and neural networks.'),
      ('Prof. Michael Rodriguez', 'Data science expert and former Netflix data scientist.'),
      ('Dr. Emily Johnson', 'Leadership consultant and former McKinsey partner.'),
      ('James Park', 'Tech entrepreneur and cloud architecture specialist.'),
      ('Dr. Amanda Foster', 'Generative AI researcher at OpenAI.')
    `;
    console.log('✅ Instructors inserted');

    // Get instructor IDs
    const instructors = await sql`SELECT instructor_id, full_name FROM instructors ORDER BY full_name`;
    const categories = await sql`SELECT category_id, name FROM categories ORDER BY name`;

    // Insert courses
    console.log('🎓 Seeding courses...');
    await sql`
      INSERT INTO courses (
        title, subtitle, description, language, level, is_free, price, 
        duration_months, schedule_info, what_you_will_learn, skills_you_will_gain, 
        details_to_know, instructor_id
      ) VALUES 
      (
        'PG Program in Artificial Intelligence & Machine Learning',
        'Comprehensive AI/ML program for working professionals',
        'Master the fundamentals of AI and machine learning with hands-on projects and real-world applications.',
        'English',
        'Intermediate',
        false,
        2999.00,
        12,
        '10-12 hours per week, flexible schedule',
        '["Machine Learning algorithms", "Deep Learning", "NLP", "Computer Vision", "AI implementation"]'::jsonb,
        '["Python Programming", "TensorFlow", "PyTorch", "Data Analysis", "AI Deployment"]'::jsonb,
        '["Industry certificate", "Hands-on projects", "Career support", "Expert mentorship"]'::jsonb,
        ${instructors[0].instructor_id}
      ),
      (
        'Post Graduate Program in Data Science with Generative AI',
        'Advanced data science with cutting-edge GenAI techniques',
        'Learn data science fundamentals combined with the latest generative AI technologies.',
        'English',
        'Advanced',
        false,
        3499.00,
        15,
        '12-15 hours per week, self-paced',
        '["Statistical analysis", "Generative AI models", "Data visualization", "Big data", "AI ethics"]'::jsonb,
        '["Python", "R Programming", "SQL", "Generative AI", "Data Visualization"]'::jsonb,
        '["Capstone project", "Industry partnerships", "Job placement", "Live sessions"]'::jsonb,
        ${instructors[1].instructor_id}
      ),
      (
        'Post Graduate Diploma in Management (Online)',
        'Executive MBA equivalent program',
        'Comprehensive management program designed for working professionals seeking leadership roles.',
        'English',
        'Intermediate',
        false,
        4999.00,
        24,
        '8-10 hours per week, weekend classes',
        '["Strategic management", "Financial analysis", "Operations", "Leadership", "Digital transformation"]'::jsonb,
        '["Strategic Thinking", "Financial Planning", "Team Leadership", "Project Management", "Business Analytics"]'::jsonb,
        '["Alumni network", "Business simulations", "Industry mentorship", "Global case studies"]'::jsonb,
        ${instructors[2].instructor_id}
      ),
      (
        'Cloud Computing Fundamentals with AWS',
        'Master cloud technologies and AWS services',
        'Complete guide to cloud computing using Amazon Web Services.',
        'English',
        'Beginner',
        true,
        NULL,
        3,
        '5-7 hours per week, self-paced',
        '["Cloud concepts", "AWS services", "Security", "Cost optimization", "DevOps on AWS"]'::jsonb,
        '["AWS Services", "Cloud Architecture", "DevOps", "Linux", "Networking"]'::jsonb,
        '["AWS certification prep", "Hands-on labs", "Free tier", "Community support"]'::jsonb,
        ${instructors[3].instructor_id}
      ),
      (
        'Generative AI for Business Applications',
        'Apply GenAI to solve real business problems',
        'Learn how to integrate generative AI into business workflows and processes.',
        'English',
        'Intermediate',
        false,
        1999.00,
        6,
        '6-8 hours per week, flexible',
        '["GenAI fundamentals", "Business use cases", "Prompt engineering", "AI integration", "ROI measurement"]'::jsonb,
        '["Prompt Engineering", "AI Strategy", "Business Analysis", "API Integration", "Change Management"]'::jsonb,
        '["Real projects", "Guest speakers", "Networking", "Certificate"]'::jsonb,
        ${instructors[4].instructor_id}
      )
    `;
    console.log('✅ Courses inserted');

    // Get course IDs for linking to categories
    const courses = await sql`SELECT course_id, title FROM courses`;

    // Link courses to categories
    console.log('🔗 Linking courses to categories...');
    const aiCategory = categories.find(c => c.name === 'AI & Machine Learning');
    const dataCategory = categories.find(c => c.name === 'Data Science & Analytics');
    const genAiCategory = categories.find(c => c.name === 'Generative AI');
    const mgmtCategory = categories.find(c => c.name === 'Management');
    const cloudCategory = categories.find(c => c.name === 'Cloud Computing');

    const aiCourse = courses.find(c => c.title.includes('Artificial Intelligence'));
    const dataCourse = courses.find(c => c.title.includes('Data Science'));
    const mgmtCourse = courses.find(c => c.title.includes('Management'));
    const cloudCourse = courses.find(c => c.title.includes('Cloud Computing'));
    const genAiCourse = courses.find(c => c.title.includes('Generative AI for Business'));

    if (aiCourse && aiCategory) {
      await sql`INSERT INTO course_categories (course_id, category_id) VALUES (${aiCourse.course_id}, ${aiCategory.category_id}) ON CONFLICT DO NOTHING`;
    }
    if (dataCourse && dataCategory) {
      await sql`INSERT INTO course_categories (course_id, category_id) VALUES (${dataCourse.course_id}, ${dataCategory.category_id}) ON CONFLICT DO NOTHING`;
    }
    if (dataCourse && genAiCategory) {
      await sql`INSERT INTO course_categories (course_id, category_id) VALUES (${dataCourse.course_id}, ${genAiCategory.category_id}) ON CONFLICT DO NOTHING`;
    }
    if (mgmtCourse && mgmtCategory) {
      await sql`INSERT INTO course_categories (course_id, category_id) VALUES (${mgmtCourse.course_id}, ${mgmtCategory.category_id}) ON CONFLICT DO NOTHING`;
    }
    if (cloudCourse && cloudCategory) {
      await sql`INSERT INTO course_categories (course_id, category_id) VALUES (${cloudCourse.course_id}, ${cloudCategory.category_id}) ON CONFLICT DO NOTHING`;
    }
    if (genAiCourse && genAiCategory) {
      await sql`INSERT INTO course_categories (course_id, category_id) VALUES (${genAiCourse.course_id}, ${genAiCategory.category_id}) ON CONFLICT DO NOTHING`;
    }

    console.log('✅ Course-category links created');

    console.log('🎉 Learning platform data seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding learning data:', error);
  } finally {
    await sql.end();
  }
}

// Run the seed function
seedLearningData();