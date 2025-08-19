# knowme - Portfolio and Learning Management System

## Overview

knowme is a comprehensive portfolio and career development platform that combines portfolio management with gamified learning experiences. The application allows users to create and manage professional portfolios while progressing through skill-building modules to earn experience points (XP) and track their learning journey.

The system serves both personal portfolio management and public portfolio showcase needs, featuring sections for work experience, education, skills, projects, and certifications, all with customizable visibility settings.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

- **React with TypeScript**: Modern component-based UI using functional components and hooks
- **Vite**: Fast development server and build tool with hot module replacement
- **Wouter**: Lightweight client-side routing library for navigation
- **TanStack Query**: Server state management for API data fetching, caching, and synchronization
- **Shadcn/ui Components**: Pre-built accessible UI components based on Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens and dark mode support

### Backend Architecture

- **Express.js**: RESTful API server with TypeScript support
- **In-Memory Storage**: Currently using an in-memory storage interface with plans for database integration
- **Modular Route Structure**: Organized API endpoints for authentication, profiles, and portfolio sections
- **Middleware Integration**: Request logging, JSON parsing, and error handling

### Data Storage Solutions

- **Drizzle ORM**: Type-safe database ORM configured for PostgreSQL
- **Schema-First Design**: Centralized database schema with Zod validation
- **Migration Support**: Database versioning through Drizzle Kit
- **Prepared for Neon Database**: Configuration ready for serverless PostgreSQL deployment

### Authentication and Authorization

- **Basic Authentication**: Email/password login system
- **Session-Based**: User sessions managed through the application state
- **Profile-Based Access**: User-specific data access patterns

### Gamification System

- **XP Tracking**: Experience points system for learning activities
- **Learning Modules**: Structured educational content with progress tracking
- **Achievement System**: Badges and certifications for completed milestones
- **Activity Calendar**: Visual representation of daily learning engagement
- **Streak Tracking**: Consecutive day learning motivation system

### Portfolio Management

- **Section-Based Organization**: Modular portfolio sections (experience, education, skills, projects, certifications)
- **Visibility Controls**: Per-section visibility settings for public portfolios
- **Theme Support**: Customizable portfolio themes and layouts
- **PDF Export**: Resume generation functionality for traditional formats
- **Public Portfolio URLs**: Shareable portfolio links with custom usernames

## External Dependencies

### UI and Styling

- **Radix UI**: Accessible component primitives for complex UI elements
- **Tailwind CSS**: Utility-first styling with custom color schemes and responsive design
- **Lucide React**: Icon library for consistent visual elements
- **Class Variance Authority**: Type-safe CSS class composition

### Data Management

- **Drizzle ORM**: Database toolkit with TypeScript integration
- **Drizzle Zod**: Schema validation and type inference
- **@neondatabase/serverless**: Serverless PostgreSQL database driver

### Development and Build Tools

- **Vite**: Build tool with development server and optimization
- **TypeScript**: Static type checking and enhanced developer experience
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind CSS integration

### Form and Date Handling

- **React Hook Form**: Form state management with validation
- **@hookform/resolvers**: Validation resolvers for form schemas
- **Date-fns**: Date manipulation and formatting utilities

### State Management and APIs

- **TanStack React Query**: Server state management and caching
- **Wouter**: Lightweight routing solution
- **Express**: Node.js web framework for API development

### Database and Session Management

- **connect-pg-simple**: PostgreSQL session store integration
- **Crypto**: Built-in Node.js module for UUID generation and security

### Development Environment

- **Replit Integration**: Development environment optimizations and tooling
- **Runtime Error Overlay**: Enhanced error reporting for development
- **Cartographer Plugin**: Replit-specific development enhancements
