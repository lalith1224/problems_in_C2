# MediConnect: AI-Powered Healthcare Management System

## Overview

MediConnect is a comprehensive web-based healthcare management platform that connects patients, doctors, and pharmacies through a unified system. The application integrates an AI-powered assistant using the OpenRouter API to provide intelligent healthcare guidance and support. Built with modern web technologies, it features role-based access control, secure authentication, and real-time communication capabilities to streamline healthcare workflows and improve patient care coordination.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side application is built using React with TypeScript, leveraging Vite as the build tool for fast development and optimized production builds. The UI component system is based on shadcn/ui with Radix UI primitives, providing accessible and customizable components. Tailwind CSS handles styling with a custom design system that includes healthcare-specific role colors (patient: blue, doctor: green, pharmacy: orange). The application uses Wouter for lightweight client-side routing and React Hook Form with Zod for type-safe form validation.

### Backend Architecture
The server runs on Node.js with Express.js, providing a RESTful API architecture. The backend implements role-based authentication with session management using PostgreSQL session storage. API routes are organized by functionality and role-specific endpoints (patient, doctor, pharmacy). The server includes comprehensive error handling, request logging, and CORS configuration for secure cross-origin requests.

### Database Design
PostgreSQL serves as the primary database with Drizzle ORM providing type-safe database operations. The schema implements a role-based user system with separate tables for patients, doctors, and pharmacies, each containing role-specific information. Core entities include users, appointments, prescriptions, inventory items, and AI conversation history. The database uses UUIDs for primary keys and includes proper foreign key relationships and indexes for optimal performance.

### Authentication & Authorization
The system implements session-based authentication with bcrypt for password hashing. Role-based access control (RBAC) restricts functionality based on user roles (patient, doctor, pharmacy). Protected routes ensure users can only access appropriate features, with automatic logout handling and redirect mechanisms for unauthorized access attempts.

### AI Integration
OpenRouter API integration provides role-specific AI assistance with customized system prompts for each user type. The AI service offers symptom checking for patients, diagnostic support for doctors, and medication guidance for pharmacy staff. Conversation history is stored for continuity and improved user experience.

### State Management
TanStack Query (React Query) handles server state management with optimistic updates and automatic background refetching. The application implements custom hooks for authentication state and role-specific data fetching. Toast notifications provide user feedback for operations and error states.

## External Dependencies

### Core Framework Dependencies
- **React 18** with TypeScript for the frontend application
- **Express.js** for the Node.js backend server
- **Vite** for frontend build tooling and development server
- **Drizzle ORM** for type-safe database operations and migrations

### Database & Storage
- **PostgreSQL** as the primary database (configured through Neon)
- **@neondatabase/serverless** for serverless PostgreSQL connections
- **connect-pg-simple** for PostgreSQL session storage

### UI & Styling
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** component library built on Radix UI primitives
- **Radix UI** for accessible, unstyled UI components
- **Lucide React** for consistent iconography

### Form & Validation
- **React Hook Form** for performant form management
- **Zod** for runtime type validation and schema definition
- **@hookform/resolvers** for form validation integration

### Authentication & Security
- **bcrypt** for secure password hashing
- **Session-based authentication** with PostgreSQL storage

### AI Integration
- **OpenRouter API** for AI-powered healthcare assistance
- Custom service layer for role-specific AI interactions

### Development & Build Tools
- **TypeScript** for static type checking
- **ESBuild** for fast production builds
- **PostCSS** with Autoprefixer for CSS processing
- **tsx** for TypeScript execution in development

### Monitoring & Development
- **Replit development tools** for environment integration
- Custom logging middleware for API request monitoring
- Error boundary implementation for graceful error handling