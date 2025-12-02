# QSecureX - Offline Privacy Vault Application

## Overview

QSecureX is a security-focused desktop application offering offline encrypted file storage and secure messaging. The application emphasizes privacy-first design with military-grade AES-256 encryption that operates entirely on the user's device without cloud storage or tracking. It features a three-tier pricing model (Personal, Pro, Enterprise) with one-time payment licensing rather than subscriptions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool and development server.

**UI Component System**: Radix UI primitives with shadcn/ui component library following the "new-york" style variant. Components are built with a dark-mode-first approach using CSS variables for theming.

**Styling Strategy**: Tailwind CSS with custom design tokens. The design system draws inspiration from Stripe (professional dashboards), Signal/ProtonMail (privacy-focused visual language), Linear (modern typography), and Supabase (developer-friendly design). Key fonts are Inter for body text and Space Grotesk for headings/technical data.

**State Management**: TanStack Query (React Query) for server state management with custom query client configuration. Authentication state is managed through a React Context (`AuthContext`) that persists user sessions.

**Routing**: Wouter for client-side routing with protected route wrappers for authenticated and admin-only pages.

**Form Handling**: React Hook Form with Zod schema validation using `@hookform/resolvers` for type-safe form validation.

### Backend Architecture

**Runtime**: Node.js with Express.js web framework.

**API Design**: RESTful API architecture with session-based authentication. Routes are organized in a single registration function that sets up all endpoints.

**Session Management**: Express sessions with PostgreSQL session store (`connect-pg-simple`). Sessions persist for 30 days with HTTP-only cookies.

**Authentication**: Custom implementation using bcrypt for password hashing. No third-party authentication providers. Role-based access control with 'user' and 'admin' roles.

**Business Logic**: License key generation using random UUID segments formatted as `XXXX-XXXX-XXXX-XXXX`. Three-tier pricing system (Personal/Pro/Enterprise) with different device limits and feature access.

### Data Storage

**Database**: PostgreSQL using Neon serverless driver (`@neondatabase/serverless`) with WebSocket connections.

**ORM**: Drizzle ORM for type-safe database queries and schema management. Schema definitions are shared between client and server via the `/shared` directory.

**Database Schema**:
- `users`: User accounts with email, hashed password, name, role
- `licenses`: License keys tied to users with plan type, status, device limits, expiry
- `purchases`: Purchase records linking users to licenses with payment details
- `contactMessages`: Contact form submissions with status tracking
- `user_sessions`: Session storage (auto-created by connect-pg-simple)

**Data Access Layer**: Repository pattern implemented via `IStorage` interface with `DatabaseStorage` implementation providing methods for CRUD operations on all entities.

### Build System

**Client Build**: Vite bundles the React application with path aliases for clean imports (`@/`, `@shared/`, `@assets/`). Output goes to `dist/public`.

**Server Build**: esbuild bundles the server code with selective external dependencies. Specific high-usage packages are bundled to reduce file system calls and improve cold start times.

**Development**: Custom Vite middleware setup for HMR in development. The server proxies requests to Vite's dev server for client assets.

**Production**: Single bundled server file (`dist/index.cjs`) serves static client files from `dist/public`.

## External Dependencies

### Third-Party Services

**Database Hosting**: Configured for Neon Postgres (serverless PostgreSQL). Connection string expected via `DATABASE_URL` environment variable.

**Email**: Contact form submissions stored in database; no external email service integration in current implementation (qsecurexapp@gmail.com used for support contact).

### Authentication & Security

- **bcryptjs**: Password hashing (no external auth provider)
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

### UI Component Libraries

- **Radix UI**: Headless accessible component primitives (accordion, dialog, dropdown, etc.)
- **shadcn/ui**: Pre-styled component implementations
- **Tailwind CSS**: Utility-first CSS framework with custom theme configuration
- **Lucide React**: Icon library

### Development Tools

- **Replit Plugins**: Development banner, cartographer, runtime error overlay (dev environment only)
- **TypeScript**: Type safety across full stack
- **Drizzle Kit**: Database migrations and schema management

### Font Loading

- **Google Fonts**: Inter and Space Grotesk loaded via CDN (preconnect optimization)

### Notable Absence

No cloud storage providers, analytics services, payment processors (Stripe listed in dependencies but not implemented), or external API integrations for core functionality. The application is designed to function entirely offline after installation.