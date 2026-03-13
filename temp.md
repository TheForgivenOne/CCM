# CCM Codebase Analysis

## 1. Tech Stack
- **Framework:** Next.js 16.1.6 (App Router)
- **Database:** PostgreSQL (via `pg` library)
- **Auth:** JWT with cookies (`jsonwebtoken`, `bcryptjs`)
- **AI:** Mistral AI (`@mistralai/mistralai`)
- **Styling:** Tailwind CSS v4
- **Charts:** Recharts
- **Other:** Convex (appears unused), better-sqlite3 (appears unused)

## 2. Features Implemented
- **Authentication:** Login/Register with JWT cookies, password hashing
- **Transactions:** CRUD operations, recurring transactions (daily/weekly/biweekly/monthly/yearly)
- **Dashboard:** Balance display, balance chart (recharts), stat cards, "water line" indicator
- **Settings:** Custom income/expense categories, savings target, warning threshold
- **AI Insights:** Mistral-powered financial insights (4 categories)
- **UI Components:** Button, Input, Card, Modal, Select, Toast, Badge
- **Layout:** Sidebar, TopBar, MobileNav, theme toggle

## 3. File Structure
```
src/
├── app/
│   ├── (auth)/        # login, register
│   ├── (dashboard)/   # dashboard, transactions, insights, settings, profile
│   └── api/           # auth/, transactions/, settings/, ai/insights/
├── components/
│   ├── ui/            # Reusable UI components
│   ├── layout/        # Sidebar, TopBar, MobileNav
│   ├── dashboard/     # BalanceDisplay, BalanceChart, StatCard, WaterLine
│   ├── insights/      # InsightCard
│   ├── transactions/  # TransactionList, TransactionForm
│   └── theme/         # toggle
├── lib/
│   ├── db.ts          # PostgreSQL queries
│   ├── auth.ts        # JWT utilities
│   └── auth/context.tsx
├── types/
└── data/schema.sql
```

## 4. Known Issues

### Build Errors
- `src/app/api/auth/login/route.ts:17` - Missing `await` on `getUserByEmail()`
- `src/app/api/auth/register/route.ts:17,26,28,30` - Missing `await` on multiple DB calls
- `src/app/api/ai/insights/route.ts:21-26` - Missing `await` on DB calls (build fails)

### ESLint Warnings (12 total)
- Unused variables in: dashboard/page.tsx, settings/page.tsx, layout.tsx, page.tsx, insightCard.tsx, transactionForm.tsx
- Unused function parameters in API routes

### Other Observations
- `middleware.ts` uses deprecated "middleware" convention (Next.js 16 warning)
- Two DB libraries present: `pg` (used) and `better-sqlite3` (unused)
- Convex dependency appears unused

## 5. Pending/Incomplete
- **Build is broken** - Cannot deploy due to missing `await` statements in API routes
- No error boundaries or loading states visible in some components
- No tests configured
