# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application for managing vehicle plate installations across two companies (LW SIM and Binsat). It's a dashboard application that tracks installation progress and provides statistics using TypeScript, React, TanStack Query, and Drizzle ORM with a MySQL database.

## Development Commands

```bash
# Development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint the codebase
npm run lint

# Generate Drizzle migrations
npm run db:generate

# Run database migrations
npm run db:migrate

# Push schema changes to database
npm run db:push

# Open Drizzle Studio (database GUI)
npm run db:studio

# Generate password hash for user authentication
npm run generate-password <password>
```

## Architecture Overview

### Data Layer
- **Database**: MySQL with Drizzle ORM
- **Schema**: Located at `src/lib/db/schema.ts`
- **Configuration**: `drizzle.config.ts` in project root
- **Models**: Simple User model for authentication (mock data currently used)

### State Management
- **Global State**: React Context for authentication (`AuthContext`)
- **Server State**: TanStack Query for API data fetching and caching
- **Key Hooks**: 
  - `usePlacas(filtros)` - Filtered plate data with infinite scroll
  - `useEstatisticasGerais()` - Unfiltered statistics for dashboard cards

### UI Architecture
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS 4
- **Components**: Component-based architecture in `src/components/`
- **Key Components**:
  - `Dashboard.tsx` - Main dashboard with statistics and plate list
  - `InfiniteScrollList.tsx` - Infinite scrolling list implementation
  - `FiltrosPlacas.tsx` - Search and filter controls

### API Routes
- `/api/auth/*` - Authentication endpoints (login, logout, me)
- `/api/placas` - Plate data endpoints
- `/api/test` - Test endpoint

### Key Features
- **Infinite Scroll**: Implemented with TanStack Query and react-intersection-observer
- **Real-time Filtering**: Search by plate number/model, filter by company/status
- **Dual Statistics**: Separate queries for filtered list data vs. unfiltered dashboard statistics
- **Mock Authentication**: Currently uses localStorage with predefined users

### TypeScript Configuration
- Path aliases: `@/*` maps to `./src/*`
- Strict mode enabled
- Uses Next.js plugin for enhanced TypeScript support

### Data Flow
1. Dashboard loads unfiltered statistics via `useEstatisticasGerais()`
2. Filtered plate list uses `usePlacas(filtros)` with separate caching
3. Status updates use optimistic updates with TanStack Query mutations
4. Authentication state managed via React Context with localStorage persistence

## Important Implementation Notes

- The application uses Drizzle ORM to fetch real vehicle data from `sga_hinova_vehicles` table
- Authentication still uses mock data with localStorage-based sessions  
- Statistics cards always show total data regardless of applied filters
- The plate list respects all filters and implements infinite scrolling
- Database schema includes tables for clients, vehicles, and state management
- Vehicle data is mapped from database fields (`plate` → `numeroPlaca`, `model` → `modelo`, etc.)
- Database migrations are managed with `drizzle-kit` commands

## User Management

### Generating Password Hashes

To create or update user passwords, use the password generator:

```bash
# Generate a password hash
npm run generate-password myNewPassword123

# Example output:
# Password: myNewPassword123
# Hash: $2b$10$s4eaY8AvUlzv0SIexFhJAOdt1Fh9A6uPQ94HLhbWVNF7apuMMo/KG
```

**How to update user passwords:**

1. Run the password generator command
2. Copy the generated hash
3. Edit `src/lib/auth/users.ts`
4. Replace the password field for the target user with the new hash

**Authentication System:**
- Uses bcryptjs with 10 salt rounds (same as existing users)
- Compatible with JWT token generation
- Passwords are validated using `verifyPassword()` function
- Current users: admin, lwsim, binsat, tagpro, user

## Git Commit Guidelines

When creating git commits, follow these guidelines:

- **Do NOT include Claude Code attribution links** in commit messages
- **Do NOT add** `🤖 Generated with [Claude Code](https://claude.ai/code)` or similar references
- **Do NOT add** `Co-Authored-By: Claude <noreply@anthropic.com>` signatures
- Keep commit messages clean and focused on the actual changes
- Use conventional commit format: `type(scope): description`
- Examples of good commit messages:
  - `feat: add Excel export functionality for vehicle data`
  - `fix: correct status values to match database schema`
  - `docs: update README with new API endpoints`