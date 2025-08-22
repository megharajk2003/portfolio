import { storage } from "./server/storage";

const courseData = {
  courseTitle: "PG Program in Artificial Intelligence & Machine Learning",
  courseId: "ba1ddcc1-79ed-403-ada5-a4d70ca0b43c",
  modules: [
    {
      moduleId: "524aba4a-9785-42e6-ac7f-6ed27a30c433",
      moduleOrder: 1,
      title: "Introduction to AI and Machine Learning",
      description: "Foundation concepts and overview of AI/ML landscape",
      durationHours: 15,
      lessons: [
        {
          lessonOrder: 1,
          title: "What is Artificial Intelligence?",
          description:
            "A brief history, key concepts, and modern applications of AI.",
          durationMinutes: 45,
          content:
            "Artificial Intelligence (AI) is a broad field of computer science focused on creating systems that can perform tasks that typically require human intelligence...",
          videoUrl: "https://www.youtube.com/watch?v=ad79nYk2keg",
        },
        {
          lessonOrder: 2,
          title: "Machine Learning vs Traditional Programming",
          description:
            "Understanding the paradigm shift from rule-based systems to data-driven models.",
          durationMinutes: 60,
          content:
            "In traditional programming, a developer writes explicit, step-by-step rules for the computer to follow...",
          videoUrl: "https://www.youtube.com/watch?v=_k-e-8dD4M4",
        },
        {
          lessonOrder: 3,
          title: "Types of Machine Learning",
          description:
            "Exploring supervised, unsupervised, and reinforcement learning.",
          durationMinutes: 75,
          content:
            "Machine Learning is broadly divided into three main categories. The first is **Supervised Learning**...",
          videoUrl: "https://www.youtube.com/watch?v=z-EtmaFJieY",
        },
        {
          lessonOrder: 4,
          title: "The AI Landscape & Ethics",
          description:
            "Discussing the current state of AI and its ethical implications.",
          durationMinutes: 60,
          content:
            "The landscape of AI is vast and includes many specialized subfields beyond general machine learning...",
          videoUrl: "https://www.youtube.com/watch?v=S-w_z_5-b_A",
        },
      ],
    },
    {
      moduleId: "dcf77367-f7e7-4aba-ab05-101ebd4cee6f",
      moduleOrder: 2,
      title: "Python for Machine Learning",
      description: "Essential Python programming for ML applications",
      durationHours: 20,
      lessons: [
        {
          lessonOrder: 1,
          title: "Python Fundamentals Refresher",
          description: "Covering variables, data types, loops, and functions.",
          durationMinutes: 90,
          content:
            "Python has become the de facto language for machine learning due to its simple syntax...",
          videoUrl: "https://www.youtube.com/watch?v=rfscVS0vtbw",
        },
        {
          lessonOrder: 2,
          title: "NumPy for Numerical Computing",
          description:
            "Mastering arrays and mathematical operations for data science.",
          durationMinutes: 120,
          content:
            "NumPy (Numerical Python) is the cornerstone library for scientific computing in Python...",
          videoUrl: "https://www.youtube.com/watch?v=QUT1VHiLmmI",
        },
        {
          lessonOrder: 3,
          title: "Data Manipulation with Pandas",
          description:
            "Learning to use DataFrames for cleaning, transforming, and analyzing data.",
          durationMinutes: 150,
          content:
            "Pandas is the most important library for data manipulation and analysis in Python...",
          videoUrl: "https://www.youtube.com/watch?v=vmEHCJofslg",
        },
        {
          lessonOrder: 4,
          title: "Data Visualization with Matplotlib & Seaborn",
          description:
            "Creating insightful plots and charts to understand data.",
          durationMinutes: 120,
          content:
            "Data visualization is the art of representing data graphically to identify patterns...",
          videoUrl: "https://www.youtube.com/watch?v=a9UrKTVEeZA",
        },
      ],
    },
    {
      moduleId: "4f38f454-2df0-421f-b1a3-c4c679c295b0",
      moduleOrder: 3,
      title: "Supervised Learning Algorithms",
      description: "Linear regression, classification, and model evaluation",
      durationHours: 25,
      lessons: [
        {
          lessonOrder: 1,
          title: "Linear Regression",
          description:
            "Predicting continuous values and understanding model performance.",
          durationMinutes: 90,
          content:
            "Linear Regression is one of the simplest yet most powerful algorithms in supervised learning...",
          videoUrl: "https://www.youtube.com/watch?v=zaxB_a-C2m0",
        },
        {
          lessonOrder: 2,
          title: "Logistic Regression for Classification",
          description: "Solving binary classification problems.",
          durationMinutes: 90,
          content:
            "Despite its name, Logistic Regression is used for classification, not regression...",
          videoUrl: "https://www.youtube.com/watch?v=yIYKR4sgzI8",
        },
        {
          lessonOrder: 3,
          title: "Decision Trees and Random Forests",
          description:
            "Understanding tree-based models and the power of ensembles.",
          durationMinutes: 120,
          content:
            "A **Decision Tree** is an intuitive model that works by splitting the data into subsets...",
          videoUrl: "https://www.youtube.com/watch?v=g9c66TUylZ4",
        },
        {
          lessonOrder: 4,
          title: "Model Evaluation Metrics",
          description:
            "Assessing classification models with accuracy, precision, recall, and F1-score.",
          durationMinutes: 80,
          content:
            "How do we know if our classification model is any good? While **Accuracy** is a common metric...",
          videoUrl: "https://www.youtube.com/watch?v=Kdsp6soqA7o",
        },
      ],
    },
    {
      moduleOrder: 4,
      title: "Unsupervised Learning",
      description:
        "Discovering patterns in data with clustering and dimensionality reduction",
      durationHours: 20,
      lessons: [
        {
          lessonOrder: 1,
          title: "Introduction to Unsupervised Learning",
          description: "Understanding the goals of clustering and association.",
          durationMinutes: 60,
          content:
            "Welcome to the world of Unsupervised Learning, where we work with data that has no predefined labels...",
          videoUrl: "https://www.youtube.com/watch?v=Ev8Y4tBpo-I",
        },
        {
          lessonOrder: 2,
          title: "K-Means Clustering",
          description: "Grouping data points into K distinct clusters.",
          durationMinutes: 90,
          content:
            "K-Means is one of the most popular and straightforward clustering algorithms...",
          videoUrl: "https://www.youtube.com/watch?v=4b5d3muwGvQ",
        },
        {
          lessonOrder: 3,
          title: "Hierarchical Clustering",
          description:
            "Building a hierarchy of clusters to visualize data structure.",
          durationMinutes: 75,
          content:
            "Unlike K-Means, Hierarchical Clustering doesn't require you to pre-specify the number of clusters...",
          videoUrl: "https://www.youtube.com/watch?v=7xHsRkOdVwo",
        },
        {
          lessonOrder: 4,
          title: "Principal Component Analysis (PCA)",
          description: "A powerful technique for dimensionality reduction.",
          durationMinutes: 100,
          content:
            "Many datasets have a large number of features or variables (high dimensionality)...",
          videoUrl: "https://www.youtube.com/watch?v=FgakZw6K1QQ",
        },
      ],
    },
    {
      moduleOrder: 5,
      title: "Deep Learning - Neural Networks",
      description:
        "Diving into the architecture and application of neural networks.",
      durationHours: 30,
      lessons: [
        {
          lessonOrder: 1,
          title: "Deeper Dive into Neural Networks",
          description: "The foundational concepts of deep learning.",
          durationMinutes: 120,
          content:
            "Neural Networks are a class of models inspired by the structure of the human brain. They are the foundation of **Deep Learning**...",
          videoUrl: "https://www.youtube.com/watch?v=aircAruvnKk",
        },
        {
          lessonOrder: 2,
          title: "Convolutional Neural Networks (CNNs)",
          description:
            "Understanding the architecture of CNNs for image recognition tasks.",
          durationMinutes: 150,
          content:
            "Convolutional Neural Networks (CNNs) are a specialized type of neural network designed for processing grid-like data, such as images. They use special layers called convolutional layers to automatically and adaptively learn spatial hierarchies of features from input images.",
          videoUrl: "https://www.youtube.com/watch?v=z-gWb_V_I-k",
        },
        {
          lessonOrder: 3,
          title: "Recurrent Neural Networks (RNNs)",
          description:
            "Exploring RNNs for handling sequential data like text and time series.",
          durationMinutes: 150,
          content:
            "Recurrent Neural Networks (RNNs) are designed to work with sequential data. They have 'memory' which allows them to persist information from previous inputs in the sequence to influence the current input and output. This makes them ideal for tasks like language translation and stock market prediction.",
          videoUrl: "https://www.youtube.com/watch?v=UNmqTiOnRfg",
        },
        {
          lessonOrder: 4,
          title: "Building a Neural Network with TensorFlow/Keras",
          description:
            "A practical hands-on session to build and train a neural network.",
          durationMinutes: 180,
          content:
            "In this hands-on lesson, we will use Keras, a high-level API for TensorFlow, to build our first neural network. We will walk through the process of defining the model architecture, compiling it, and training it on a real-world dataset.",
          videoUrl: "https://www.youtube.com/watch?v=qFJeN9V1A50",
        },
      ],
    },
    {
      moduleOrder: 6,
      title: "Natural Language Processing (NLP)",
      description:
        "Techniques for teaching computers to understand and process human language.",
      durationHours: 25,
      lessons: [
        {
          lessonOrder: 1,
          title: "Introduction to NLP",
          description:
            "Understanding the fundamentals and applications of NLP.",
          durationMinutes: 90,
          content:
            "Natural Language Processing (NLP) is a field of AI that gives machines the ability to read, understand, and derive meaning from human languages. This lesson covers the core concepts and common applications like machine translation and chatbots.",
          videoUrl: "https://www.youtube.com/watch?v=fOvTtapxa9c",
        },
        {
          lessonOrder: 2,
          title: "Text Preprocessing and Vectorization",
          description:
            "Cleaning text data and converting it into a numerical format for models.",
          durationMinutes: 120,
          content:
            "Machine learning models can't work with raw text. In this lesson, we'll learn essential text preprocessing techniques like tokenization and stop-word removal, and then convert text into numerical vectors using methods like Bag-of-Words and TF-IDF.",
          videoUrl: "https://www.youtube.com/watch?v=0kprg5_TzL4",
        },
        {
          lessonOrder: 3,
          title: "Word Embeddings (Word2Vec)",
          description:
            "Learning about dense vector representations of words that capture semantic meaning.",
          durationMinutes: 120,
          content:
            "Word Embeddings like Word2Vec represent words as dense vectors in a low-dimensional space. These representations capture the context and semantic relationships between words, leading to much better performance in NLP tasks.",
          videoUrl: "https://www.youtube.com/watch?v=ERibwqs9p38",
        },
        {
          lessonOrder: 4,
          title: "Sentiment Analysis Project",
          description:
            "A hands-on project to build a model that can determine the sentiment of a piece of text.",
          durationMinutes: 150,
          content:
            "In this project, we will apply our NLP knowledge to build a sentiment analysis classifier. We will take a dataset of movie reviews and train a model to predict whether a review is positive or negative.",
          videoUrl: "https://www.youtube.com/watch?v=QpzMWQk--oM",
        },
      ],
    },
    {
      moduleOrder: 7,
      title: "Model Deployment and MLOps",
      description:
        "Learning how to take a machine learning model from research to production.",
      durationHours: 20,
      lessons: [
        {
          lessonOrder: 1,
          title: "Introduction to MLOps",
          description:
            "Understanding the principles and practices of MLOps for managing the ML lifecycle.",
          durationMinutes: 90,
          content:
            "MLOps (Machine Learning Operations) is a set of practices that aims to deploy and maintain machine learning models in production reliably and efficiently. It combines ML, DevOps, and Data Engineering to manage the complete ML lifecycle.",
          videoUrl: "https://www.youtube.com/watch?v=06-AZXmH8kM",
        },
        {
          lessonOrder: 2,
          title: "Containerization with Docker",
          description:
            "Using Docker to package your ML application and dependencies into a portable container.",
          durationMinutes: 120,
          content:
            "Docker is a tool that allows you to package an application with all of its dependencies into a standardized unit called a container. This ensures that your ML model runs the same way regardless of the environment, simplifying deployment.",
          videoUrl: "https://www.youtube.com/watch?v=gAkwW2tuIqE",
        },
        {
          lessonOrder: 3,
          title: "Building a REST API with Flask",
          description:
            "Creating a web API to serve predictions from your trained model.",
          durationMinutes: 120,
          content:
            "To make your model accessible to other applications, you need to expose it through an API. We will use Flask, a lightweight Python web framework, to build a simple REST API that accepts data and returns model predictions.",
          videoUrl: "https://www.youtube.com/watch?v=s_ht4AKnWZg",
        },
      ],
    },
    {
      moduleOrder: 8,
      title: "Capstone Project",
      description: "Applying your knowledge to solve a real-world problem",
      durationHours: 30,
      lessons: [
        {
          lessonOrder: 1,
          title: "Project Briefing & Dataset Selection",
          description:
            "Understanding the project requirements and choosing a relevant dataset.",
          durationMinutes: 120,
          content:
            "The capstone project is your opportunity to apply everything you've learned to a real-world problem...",
          videoUrl: "https://www.youtube.com/watch?v=G4-w4a0-a-0",
        },
        {
          lessonOrder: 2,
          title: "Milestone 1: Exploratory Data Analysis",
          description: "Performing EDA and preparing the project data.",
          durationMinutes: 240,
          content:
            "Before you can train any models, you must deeply understand your data...",
          videoUrl: "https://www.youtube.com/watch?v=Wff_n_usg5w",
        },
        {
          lessonOrder: 3,
          title: "Milestone 2: Model Building and Evaluation",
          description: "Implementing and training a machine learning model.",
          durationMinutes: 360,
          content: "In this milestone, you will put theory into practice...",
          videoUrl: "https://www.youtube.com/watch?v=rBF2yVbDFZg",
        },
        {
          lessonOrder: 4,
          title: "Final Project Submission & Presentation",
          description:
            "Finalizing the project report and preparing a presentation.",
          durationMinutes: 180,
          content: "The final step is to communicate your work effectively...",
          videoUrl: "https://www.youtube.com/watch?v=Y5-mOq4L-aQ",
        },
      ],
    },
  ],
};

async function seedAICourseData() {
  try {
    console.log("🌱 Deleting existing course data...");
    try {
      await storage.deleteCourse(courseData.courseId);
      console.log("✅ Existing course data deleted.");
    } catch (error) {
      console.log("Could not delete course, it might not exist.");
    }

    console.log("🌱 Starting to seed AI course data...");

    // First, create the course
    const course = await storage.createCourse({
      id: courseData.courseId,
      title: courseData.courseTitle,
      subtitle:
        "Master the fundamentals and advanced concepts of AI and Machine Learning",
      description:
        "A comprehensive program covering all aspects of Artificial Intelligence and Machine Learning, from basic concepts to advanced neural networks and real-world deployment.",
      language: "English",
      level: "Intermediate",
      isFree: true,
      price: "0.00",
      durationMonths: 12,
      scheduleInfo: "Self-paced learning with weekly live sessions",
      whatYouWillLearn: [
        "Master fundamental AI and ML concepts",
        "Implement machine learning algorithms from scratch",
        "Build and deploy neural networks",
        "Work with real-world datasets",
        "Apply NLP techniques to text data",
        "Deploy models to production environments",
      ],
      skillsYouWillGain: [
        "Python Programming",
        "Machine Learning",
        "Deep Learning",
        "Natural Language Processing",
        "Data Science",
        "MLOps",
        "TensorFlow",
        "Scikit-learn",
        "Pandas",
        "NumPy",
      ],
      detailsToKnow: {
        certificate: true,
        assessments: 24,
        projects: 8,
        duration: "12 months",
      },
    });

    console.log("✅ Course created:", course.id);

    // Create modules and lessons
    for (const moduleData of courseData.modules) {
      console.log(`📚 Creating module: ${moduleData.title}`);

      const module = await storage.createModule({
        id: moduleData.moduleId || undefined, // Let the database generate ID if not provided
        courseId: courseData.courseId,
        title: moduleData.title,
        description: moduleData.description,
        moduleOrder: moduleData.moduleOrder,
        durationHours: moduleData.durationHours,
      });

      console.log(`✅ Module created: ${module.id}`);

      // Create lessons for this module
      for (const lessonData of moduleData.lessons) {
        console.log(`  📖 Creating lesson: ${lessonData.title}`);

        const lesson = await storage.createLesson({
          moduleId: module.id,
          title: lessonData.title,
          content: lessonData.content,
          videoUrl: lessonData.videoUrl,
          lessonOrder: lessonData.lessonOrder,
          durationMinutes: lessonData.durationMinutes,
        });

        console.log(`  ✅ Lesson created: ${lesson.id}`);
      }
    }

    console.log("🎉 AI course data seeded successfully!");
    console.log(`📊 Summary:`);
    console.log(`  - 1 course created`);
    console.log(`  - ${courseData.modules.length} modules created`);
    console.log(
      `  - ${courseData.modules.reduce(
        (total, module) => total + module.lessons.length,
        0
      )} lessons created`
    );
  } catch (error) {
    console.error("❌ Error seeding AI course data:", error);
    throw error;
  }
}

// Run the seeding function
seedAICourseData()
  .then(() => {
    console.log("✅ Seeding completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  });
