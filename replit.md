# PetCare Pro - Veterinary Health Management Platform

## Overview

PetCare Pro is a comprehensive veterinary health management platform built with a modern full-stack architecture. The system provides pet owners with digital health records, QR code pet identification, provider discovery, insurance integration, and a quality-graded provider network. It also includes a provider portal for veterinarians to access authorized pet records through a subscription-based model.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom design tokens and dark mode support
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Management**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **File Uploads**: Multer middleware for handling medical record attachments

### Key Components

#### Database Schema
- **Users**: Core user management with role-based access (pet_owner, veterinarian, groomer, trainer)
- **Pets**: Pet profiles with comprehensive medical information
- **Medical Records**: Digital health records with file attachments
- **Service Providers**: Veterinary provider directory with quality metrics
- **Quality Metrics**: Provider grading system with performance tracking
- **Insurance Integration**: Pet insurance policies and claims management
- **Subscription System**: Provider access subscriptions with tiered pricing

#### Authentication & Authorization
- **Provider**: Replit Auth using OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions for security
- **Role-Based Access**: Different user types with appropriate permissions
- **Provider Subscriptions**: Paid access model for veterinarians

#### External Integrations
- **Google Places API**: Enhanced provider discovery and validation
- **QR Code Generation**: Pet identification system for emergencies
- **File Storage**: Medical record document management

## Data Flow

1. **User Authentication**: Users authenticate via Replit Auth, creating sessions in PostgreSQL
2. **Pet Management**: Pet owners create and manage pet profiles with medical histories
3. **Provider Discovery**: Integration with Google Places API for comprehensive provider listings
4. **Quality Metrics**: Automated provider grading based on performance data
5. **Medical Records**: Upload and management of veterinary documents with file attachments
6. **Provider Access**: Subscription-based access for veterinarians to view authorized pet records
7. **Insurance Integration**: Health score calculation and insurance claim processing

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver
- **drizzle-orm**: Type-safe database ORM with PostgreSQL support
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/react-***: Accessible UI primitive components
- **react-hook-form**: Form state management and validation
- **zod**: TypeScript-first schema validation

### Development Tools
- **Vite**: Fast build tool with HMR support
- **TypeScript**: Type safety across the stack
- **Tailwind CSS**: Utility-first CSS framework
- **ESLint/Prettier**: Code formatting and linting

### External APIs
- **Google Places API**: Provider discovery and location services
- **Replit Auth**: Authentication and user management
- **QR Code Libraries**: Pet identification generation

## Deployment Strategy

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: ESBuild bundles server code for Node.js deployment
- **Database**: Drizzle migrations manage schema changes
- **Environment**: Production mode with optimized configurations

### Development Environment
- **Hot Module Replacement**: Vite provides instant feedback during development
- **Database Seeding**: Demo data generation for testing and development
- **Error Handling**: Runtime error overlays and comprehensive logging
- **Session Management**: Secure session handling with PostgreSQL storage

### Environment Configuration
- **DATABASE_URL**: Neon PostgreSQL connection string
- **SESSION_SECRET**: Secure session encryption key
- **GOOGLE_PLACES_API_KEY**: API key for location services
- **REPLIT_AUTH**: OpenID Connect configuration

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- July 05, 2025. Initial setup
- July 05, 2025. Complete dark theme implementation with strengthened CSS overrides to eliminate white backgrounds and improve text contrast. Added comprehensive dark mode styling for all component variants, forms, tables, and popover elements.
- July 05, 2025. Replaced all brown, yellow, and orange colors in backend pages with gradient blue colors (cyan-to-blue, blue-to-indigo) to match the sophisticated color scheme from the landing page. Updated star ratings, icons, badges, and background colors across Dashboard, Records, Providers, ProviderGrading, and Insurance pages.