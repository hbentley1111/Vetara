# Vetara Health - Veterinary Health Management Platform

## Overview

Vetara Health is a comprehensive veterinary health management platform built with a modern full-stack architecture. The system provides pet owners with digital health records, QR code pet identification, provider discovery, insurance integration, and a quality-graded provider network. It also includes a provider portal for veterinarians to access authorized pet records through a subscription-based model.

## System Architecture

### Frontend Architecture
- **Web Framework**: React with TypeScript
- **Mobile Framework**: React Native with TypeScript for iOS and Android
- **Build Tool**: Vite for fast development and optimized builds
- **UI Components**: Radix UI primitives with shadcn/ui component library (web), custom mobile components
- **Styling**: Tailwind CSS with custom design tokens and dark mode support (web), styled-components approach for mobile
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing (web), React Navigation for mobile
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

#### Mobile Application
- **React Native**: Cross-platform mobile development for iOS and Android
- **Native Features**: Camera integration, QR code scanning, location services, push notifications
- **Offline Support**: Local data caching with AsyncStorage and React Query
- **Biometric Auth**: Touch ID/Face ID integration for secure access
- **Native UI**: Platform-specific design patterns with dark theme consistency

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
- **@radix-ui/react-***: Accessible UI primitive components (web)
- **react-hook-form**: Form state management and validation
- **zod**: TypeScript-first schema validation

### Mobile Dependencies
- **react-native**: Cross-platform mobile framework
- **@react-navigation/native**: Mobile navigation library
- **react-native-vector-icons**: Icon library for mobile
- **react-native-linear-gradient**: Gradient styling support
- **react-native-image-picker**: Camera and photo library integration
- **react-native-qrcode-scanner**: QR code scanning functionality
- **react-native-permissions**: Device permission management
- **@react-native-async-storage/async-storage**: Local data persistence

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

### Mobile Development
- **React Native CLI**: Mobile development toolchain
- **Xcode**: iOS development and deployment
- **Android Studio**: Android development and deployment
- **Metro Bundler**: JavaScript bundling for React Native

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- July 05, 2025. Initial setup
- July 05, 2025. Complete dark theme implementation with strengthened CSS overrides to eliminate white backgrounds and improve text contrast. Added comprehensive dark mode styling for all component variants, forms, tables, and popover elements.
- July 05, 2025. Replaced all brown, yellow, and orange colors in backend pages with gradient blue colors (cyan-to-blue, blue-to-indigo) to match the sophisticated color scheme from the landing page. Updated star ratings, icons, badges, and background colors across Dashboard, Records, Providers, ProviderGrading, and Insurance pages.
- July 31, 2025. Comprehensive mobile app development implementation with React Native for iOS and Android. Created complete mobile project structure with TypeScript, dark theme consistency, authentication system, navigation, API services, and core UI components. Implemented key screens including Welcome, Login, Dashboard, and Pets with native mobile UX patterns. Added camera integration, QR code scanning, location services, and offline support capabilities.
- July 31, 2025. Fixed landing page navigation system by replacing HTML anchor tags with proper client-side smooth scrolling navigation. Added comprehensive section IDs (features-section, providers-section, insurance-section, qr-section, analytics-section) and created dedicated content sections for Provider Network, Insurance Integration, QR Protection Technology, and Advanced Analytics. Updated footer links to use scroll navigation instead of href links. All navigation buttons now work properly with smooth scrolling behavior.
- March 10, 2026. Major backend improvements: Replaced all hardcoded mock data routes with real database queries for GET /api/pets, GET /api/medical-records, GET /api/appointments, GET /api/dashboard/stats, GET /api/service-providers/top-rated, GET /api/providers/top-rated, and GET /api/providers/search-by-quality. Added DELETE /api/medical-records/:id endpoint. Fixed Records page data mapping to handle Drizzle join format. Added Share button functionality (copies record summary to clipboard). Made navigation dropdown items (Profile Settings, Account Settings, Help & Support) responsive with toast feedback. Removed duplicate seed-demo-data route.
- March 11, 2026. Fixed OIDC login domain mismatch by forcing login through the canonical domain from REPLIT_DOMAINS. Added insurance partner auto-seeding (6 partners) on startup. Added upcoming appointment demo data with auto-seeding for existing pets. Fixed Drizzle join format mapping for appointments route. Updated Dashboard appointment cards with dark theme styling and status badges.
- March 11, 2026. Added Veterinary Medical Search page (`/medical-search`) that proxies PubMed's E-utilities API via `/api/medical-search` endpoint. Allows pet owners to search peer-reviewed veterinary research with quick search badges for common topics, article cards with author/journal/date info, and links to full PubMed articles. Added to navigation bar.