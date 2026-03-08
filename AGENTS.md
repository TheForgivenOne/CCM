# AGENTS.md - Developer Guidelines for CCM

This file contains guidelines for agentic coding agents working on the Calculated Cash Management (CCM) project.

---

## 1. Build, Lint & Development Commands

### Core Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Running a Single Test
This project does not currently have a test framework configured. If adding tests:
```bash
# Jest (if added)
npm test                    # Run all tests
npm test -- --testNamePattern="login"  # Run single test

# Vitest (if added)
npm vitest run --test-name-pattern="login"
```

### Environment Variables
Create `.env.local` for local development:
```bash
MISTRAL_API_KEY=your_api_key_here
JWT_SECRET=your_secret_key
```

---

## 2. Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, register)
│   ├── (dashboard)/       # Protected pages
│   ├── api/               # API routes
│   │   ├── auth/          # Auth endpoints
│   │   ├── transactions/  # Transaction CRUD
│   │   ├── settings/      # User settings
│   │   └── ai/            # AI insights
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # Reusable UI components
│   ├── layout/             # Layout components (Sidebar, TopBar)
│   ├── dashboard/         # Dashboard-specific components
│   ├── transactions/      # Transaction components
│   ├── insights/          # AI insight components
│   └── theme/             # Theme toggle
├── lib/
│   ├── db.ts              # SQLite database operations
│   ├── auth.ts            # JWT utilities
│   └── auth/              # Auth context provider
├── types/                 # TypeScript type definitions
└── data/                  # Database schema
```

---

## 3. Code Style Guidelines

### Imports
- Use absolute imports with `@/` prefix
- Order: external → internal → relative
- Group: React imports → other imports → types

```typescript
// ✅ Correct
import { useState } from 'react';
import { NextRequest, NextResponse } from 'next/server';
import Button from '@/components/ui/Button';
import { verifyToken } from '@/lib/auth';

// ❌ Avoid
import Button from '../../components/ui/Button';
```

### Naming Conventions
- **Components**: PascalCase (`TransactionList.tsx`, `WaterLine.tsx`)
- **Files**: kebab-case (`auth-context.tsx`, `theme-toggle.tsx`)
- **Functions**: camelCase (`handleSubmit`, `fetchTransactions`)
- **Types/Interfaces**: PascalCase (`Transaction`, `UserSettings`)
- **Constants**: UPPER_SNAKE_CASE (if truly constant)

### TypeScript Guidelines
- Always define explicit return types for API routes
- Use interfaces for object shapes
- Avoid `any` - use `unknown` or proper generics

```typescript
// ✅ Good
interface Transaction {
  id: number;
  amount: number;
  type: 'income' | 'expense';
}

export async function GET(): Promise<NextResponse> {
  // ...
}

// ❌ Avoid
interface Transaction {
  [key: string]: any;
}
```

### React Components
- Use `'use client'` directive for client components
- Use `forwardRef` for reusable components that need ref forwarding
- Define prop interfaces even for internal components
- Use functional components exclusively

```typescript
// ✅ Good
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', children }, ref) => {
    return <button ref={ref} {...}>{children}</button>;
  }
);
Button.displayName = 'Button';

export default Button;
```

### Error Handling
- Always wrap API routes in try/catch
- Log errors with `console.error`
- Return proper HTTP status codes
- Never expose internal error details to client

```typescript
// ✅ Good
export async function POST(request: NextRequest) {
  try {
    // logic
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Create transaction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### CSS & Styling (Tailwind CSS v4)
- Use CSS variables for colors (defined in `globals.css`)
- Follow mobile-first approach with `lg:` breakpoints
- Use `dark:` modifier for dark mode styles
- Avoid hardcoded colors - use design tokens

```typescript
// ✅ Good
<div className="bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white">
// ❌ Avoid
<div className="bg-gray-50" style={{ backgroundColor: '#fff' }}>
```

### Database (SQLite)
- Use prepared statements for all queries
- Never interpolate user input into SQL
- Initialize database schema in `lib/db.ts`

---

## 4. Color Palette (Design Tokens)

| Role | Color | Hex |
|------|-------|-----|
| Primary | Ocean Blue | `#0EA5E9` |
| Gains/Income | Neon Green | `#10B981` |
| Losses/Expenses | Neon Red | `#F43F5E` |
| Warning | Amber | `#F59E0B` |
| Background Light | White | `#FFFFFF` |
| Background Dark | Deep Black | `#0A0A0A` |

### Typography
- Headings: **DM Serif Display**
- Body: **IBM Plex Sans**
- Numbers/Code: **JetBrains Mono**

---

## 5. API Design Patterns

### Response Format
```typescript
// Success
{ "data": {...} }

// Error
{ "error": "User-friendly message" }
```

### Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

---

## 6. Commit & Workflow

- Create feature branches from `main`
- Run `npm run lint` before committing
- Run `npm run build` to verify production build
- No need to commit - user will handle commits

---

## 7. Important Notes

- This project uses **Next.js 16.1.6** with App Router
- Authentication is **JWT-based** with cookies
- Database is **SQLite** (file-based, auto-created)
- AI integration uses **Mistral AI** API
- Theme supports **auto light/dark** based on system preference
- Mobile-first responsive design with bottom nav on mobile

---

## 8. Adding New Features

### Adding a New Page
1. Create route in `src/app/(dashboard)/[page]/page.tsx`
2. Add navigation link in `Sidebar.tsx` and `MobileNav.tsx`
3. Add API route in `src/app/api/[feature]/route.ts`

### Adding a New Component
1. Place in appropriate `components/` subdirectory
2. Export as default
3. Add TypeScript interface for props

### Adding a New Database Table
1. Update `src/data/schema.sql`
2. Add functions to `src/lib/db.ts`
3. Create API routes for CRUD

---

*Last Updated: 2026-03-08*
