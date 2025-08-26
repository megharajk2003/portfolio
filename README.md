# 🎓 SkillStream - Comprehensive Learning Management & Portfolio Platform

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-v20.19.3-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-Production_Ready-green.svg)

**SkillStream** is a modern, full-stack learning management and portfolio platform that combines gamified learning experiences with professional portfolio management. Built with React, TypeScript, Express.js, and PostgreSQL, it offers a comprehensive solution for learners to track progress, build skills, and showcase their achievements.

## 🌟 Key Features

### 🎯 **Gamified Learning System**
- **Interactive Courses**: Structured learning modules with lessons and progress tracking
- **Achievement Badges**: 110+ unique badges across 8 categories
- **XP System**: Experience points for completed activities and milestones
- **Streak Tracking**: Daily learning consistency rewards
- **Progress Analytics**: Detailed learning statistics and insights

### 📊 **Advanced Portfolio Management**
- **Dynamic Portfolios**: Comprehensive profile builder with multiple sections
- **Public Showcases**: Shareable portfolio URLs for professional networking
- **Visibility Controls**: Granular privacy settings for each portfolio section
- **Professional Themes**: Multiple layout options and customizable designs
- **Resume Export**: Generate PDF resumes from portfolio data

### 🎯 **Smart Goal Tracking**
- **Hierarchical Goals**: Goals → Categories → Topics → Subtopics structure
- **Progress Visualization**: Interactive charts and completion metrics
- **Achievement Milestones**: Bronze, Silver, Gold, Platinum goal completion tiers
- **Custom Categories**: Personalized learning paths and objectives

### 🤖 **AI-Powered Career Tools**
- **Career Chat**: Interactive AI career advisor
- **Resume Generator**: Intelligent resume creation and optimization
- **Career Timeline**: Professional growth tracking and planning
- **Skills Assessment**: AI-driven skill evaluation and recommendations

### 🏆 **Comprehensive Badge System**
- **8 Badge Categories**: Onboarding, Learning, Skills, Goals, Projects, Streaks, Community, Career
- **4 Rarity Levels**: Common, Rare, Epic, Legendary
- **110+ Unique Badges**: From "First Steps" to "SkillStream Superstar"
- **Profile Completion Rewards**: 10 badges for building complete profiles

## 🛠️ Technology Stack

### **Frontend**
- **React 18** with TypeScript for modern UI development
- **Vite** for fast development and optimized builds
- **Wouter** for lightweight client-side routing
- **TanStack Query** for server state management
- **Tailwind CSS** for utility-first styling
- **Shadcn/ui** for beautiful, accessible components
- **Framer Motion** for smooth animations
- **Recharts** for data visualization

### **Backend**
- **Express.js** with TypeScript for RESTful APIs
- **Drizzle ORM** for type-safe database operations
- **PostgreSQL** with Neon serverless deployment
- **Passport.js** for authentication
- **Express Sessions** for user state management
- **WebSocket** support for real-time features

### **Development & Deployment**
- **Replit** for development environment
- **TypeScript** for type safety across the stack
- **ESBuild** for fast bundling
- **Drizzle Kit** for database migrations
- **Cross-env** for environment management

## 📁 Project Structure

```
skillstream/
├── 📁 client/                    # Frontend React application
│   ├── 📁 src/
│   │   ├── 📁 components/       # Reusable UI components
│   │   ├── 📁 hooks/           # Custom React hooks
│   │   ├── 📁 lib/             # Utility functions and configurations
│   │   ├── 📁 pages/           # Route components
│   │   └── 📄 App.tsx          # Main application component
├── 📁 server/                   # Backend Express server
│   ├── 📄 index.ts             # Server entry point
│   ├── 📄 routes.ts            # API route definitions
│   ├── 📄 storage.ts           # Database operations and interface
│   └── 📄 vite.ts              # Vite development setup
├── 📁 shared/                   # Shared types and schemas
│   └── 📄 schema.ts            # Database schema and validation
├── 📄 drizzle.config.ts        # Database configuration
├── 📄 vite.config.ts           # Vite build configuration
└── 📄 package.json             # Project dependencies
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x or higher
- PostgreSQL database (or use Neon serverless)
- Git for version control

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/skillstream.git
cd skillstream
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
# Copy environment variables
cp .env.example .env

# Configure your database URL and other settings
DATABASE_URL=postgresql://username:password@localhost:5432/skillstream
SESSION_SECRET=your-secret-key-here
```

4. **Database Setup**
```bash
# Push database schema
npm run db:push
```

5. **Start Development Server**
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 📸 Application Screenshots

### 🏠 **Dashboard Overview**
*Main dashboard showing learning progress, recent activities, and quick stats*

### 🎓 **Learning Platform**
*Course catalog with filtering, search, and enrollment capabilities*

### 🏆 **Badge System**
*Achievement gallery with earned badges and progress tracking*

### 📊 **Goal Tracker**
*Interactive goal management with hierarchical structure*

### 👤 **Portfolio Builder**
*Comprehensive profile editor with real-time preview*

### 🤖 **AI Career Tools**
*Intelligent career advisor and resume generation*

## 🎮 Badge System Overview

SkillStream features an extensive badge system designed to motivate and reward user engagement:

### **Onboarding & Profile Completion (10 badges)**
- **Welcome Aboard**: Join SkillStream
- **Profile Pioneer**: Complete 25% of profile
- **Skill Starter**: Add first 5 skills
- **Portfolio Novice**: Add first project
- **Goal Setter**: Create first learning goal
- **Bio Builder**: Write personal biography
- **Picture Perfect**: Upload profile picture
- **Experience Enthusiast**: Add work experience
- **Education Expert**: Add educational background
- **Profile Pro**: Achieve 100% profile completion

### **Learning & Course Completion (25 badges)**
- **First Steps**: Complete first lesson
- **Course Starter**: Enroll in first course
- **Course Conqueror**: Complete first course
- **Module Master**: Complete first module
- **Weekend Warrior**: Complete course over weekend
- *...and 20 more learning milestones*

### **Goal Achievement (20 badges)**
- Bronze Tier: 1-20 goals completed
- Silver Tier: 25-60 goals completed
- Gold Tier: 75-175 goals completed
- Platinum Tier: 200-500 goals completed

### **Skill Mastery (15 badges)**
- **Skill Collector**: 10 skills added
- **Skill Hoarder**: 25 skills added
- **Skill Sensei**: 50 skills added
- *...and more skill-based achievements*

## 🔧 API Endpoints

### **Authentication**
```
POST   /api/register     # User registration
POST   /api/login        # User login
POST   /api/logout       # User logout
GET    /api/user         # Current user info
```

### **Profile Management**
```
GET    /api/profile/:userId           # Get user profile
POST   /api/profile                  # Create/update profile
GET    /api/work-experience/:userId   # Get work experience
POST   /api/work-experience          # Add work experience
GET    /api/education/:userId         # Get education
POST   /api/education                # Add education
GET    /api/skills/:userId            # Get skills
POST   /api/skills                   # Add skills
GET    /api/projects/:userId          # Get projects
POST   /api/projects                 # Add projects
```

### **Learning & Courses**
```
GET    /api/courses                  # List all courses
GET    /api/course/:id               # Get course details
POST   /api/enroll                   # Enroll in course
GET    /api/modules/:courseId        # Get course modules
GET    /api/lessons/:moduleId        # Get module lessons
POST   /api/lesson-progress          # Update lesson progress
```

### **Goals & Tracking**
```
GET    /api/goals/:userId            # Get user goals
POST   /api/goals                   # Create goal
GET    /api/goal-categories/:goalId  # Get goal categories
POST   /api/goal-categories         # Create category
GET    /api/topics/:categoryId      # Get category topics
POST   /api/topics                  # Create topic
```

### **Badge System**
```
GET    /api/badges                  # Get all badges
GET    /api/users/:userId/badges    # Get user badges
POST   /api/users/:userId/badges    # Award badge
```

## 🎯 Core Features Deep Dive

### **1. Intelligent Badge System**
- **Automatic Award**: Badges are automatically awarded based on user actions
- **Progress Tracking**: Real-time tracking of badge criteria completion
- **Rarity System**: Common to Legendary badge classifications
- **XP Rewards**: Each badge provides experience points for motivation

### **2. Portfolio Management**
- **Section-Based**: Organized into personal, contact, and professional sections
- **Visibility Control**: Public/private settings for each section
- **Theme Support**: Multiple portfolio layouts and designs
- **Export Options**: PDF resume generation from portfolio data

### **3. Goal Tracking System**
- **Hierarchical Structure**: Four-level goal organization
- **Progress Analytics**: Detailed completion statistics
- **Custom Categories**: User-defined learning paths
- **Achievement Tiers**: Bronze to Platinum completion levels

### **4. AI-Powered Tools**
- **Career Chat**: Intelligent career guidance and advice
- **Resume Generation**: AI-optimized resume creation
- **Skills Assessment**: Automated skill evaluation
- **Career Timeline**: Professional growth tracking

## 🔒 Security Features

- **Password Hashing**: bcrypt for secure password storage
- **Session Management**: Express sessions with PostgreSQL store
- **SQL Injection Protection**: Parameterized queries via Drizzle ORM
- **XSS Protection**: Input sanitization and validation
- **CSRF Protection**: Built-in Express security middleware
- **Environment Variables**: Secure configuration management

## 🌐 Database Schema

### **Key Tables**
- **users**: User authentication and basic info
- **profiles**: Comprehensive profile data (JSONB)
- **badges**: Badge definitions and criteria
- **user_badges**: User-badge relationships
- **courses**: Course catalog and metadata
- **user_progress**: Learning progress tracking
- **goals**: Hierarchical goal structure
- **lesson_progress**: Individual lesson completion

### **JSONB Advantages**
- **Flexible Schema**: Easy addition of new profile fields
- **Query Performance**: Efficient JSON querying with PostgreSQL
- **Data Integrity**: Schema validation with Zod
- **Scalability**: Handles complex nested data structures

## 📊 Performance Optimizations

- **React Query**: Intelligent caching and background updates
- **Code Splitting**: Lazy-loaded route components
- **Image Optimization**: Compressed assets and lazy loading
- **Database Indexing**: Optimized queries for large datasets
- **Fallback Storage**: In-memory backup for database failures
- **Connection Pooling**: Efficient database connection management

## 🧪 Testing Strategy

### **Frontend Testing**
- Component unit tests with React Testing Library
- Integration tests for user workflows
- E2E testing for critical user paths
- Performance testing with Lighthouse

### **Backend Testing**
- API endpoint testing with Supertest
- Database operation testing
- Authentication flow testing
- Badge system validation testing

## 📈 Future Roadmap

### **Phase 1: Enhanced Learning**
- [ ] Video lesson support
- [ ] Interactive coding challenges
- [ ] Peer-to-peer learning features
- [ ] Advanced analytics dashboard

### **Phase 2: Community Features**
- [ ] Discussion forums
- [ ] User-generated content
- [ ] Mentorship matching
- [ ] Study groups and collaboration

### **Phase 3: Enterprise Features**
- [ ] Organization accounts
- [ ] Bulk user management
- [ ] Custom branding options
- [ ] Advanced reporting tools

### **Phase 4: Mobile & Integrations**
- [ ] React Native mobile app
- [ ] Third-party integrations (GitHub, LinkedIn)
- [ ] API for external developers
- [ ] Webhook system for real-time updates

## 🤝 Contributing

We welcome contributions to SkillStream! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**: Follow our coding standards
4. **Add tests**: Ensure new features are tested
5. **Commit changes**: `git commit -m 'Add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**: Describe your changes clearly

### **Development Guidelines**
- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Write comprehensive tests for new features
- Update documentation for API changes
- Use conventional commit messages

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** for the excellent framework
- **Drizzle Team** for the amazing ORM
- **Shadcn** for beautiful UI components
- **Replit** for the development platform
- **Open Source Community** for inspiration and tools

## 📧 Support

For support, questions, or feedback:

- **GitHub Issues**: [Create an issue](https://github.com/yourusername/skillstream/issues)
- **Email**: support@skillstream.com
- **Documentation**: [Full documentation](https://docs.skillstream.com)
- **Discord**: [Join our community](https://discord.gg/skillstream)

---

**Made with ❤️ by the SkillStream Team**

*Empowering learners to achieve their goals through gamified education and professional portfolio management.*