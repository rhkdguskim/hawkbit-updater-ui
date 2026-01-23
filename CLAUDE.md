# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React 19 + TypeScript SPA that provides a modern management UI for Eclipse HawkBit. It communicates with HawkBit purely via the `/rest/v1` Management API - no backend modifications are required. The application is designed for large-scale IoT device management with features like bulk operations, RSQL filtering, and rollout orchestration.

## Development Commands

### Core Development
```bash
npm run dev              # Start Vite dev server with HMR (proxies /rest to localhost:9100)
npm run build            # TypeScript build + production bundle
npm run preview          # Serve production build locally
npm run lint             # Run ESLint
```

### API Code Generation
```bash
npm run gen:api          # Regenerate API client from OpenAPI spec using Orval
```

After HawkBit API changes:
1. Update `docs/api-spec/mm/openapi.json`
2. Run `npm run gen:api`
3. Generated hooks appear in `src/api/generated/` (DO NOT EDIT manually)

### Testing
```bash
npm test                 # Run Vitest tests
npm run test:ui          # Run Vitest with UI
npm run test:coverage    # Generate coverage report
```

Test configuration:
- Tests use `happy-dom` environment
- Setup file: `src/test/setup.ts`
- Generated API files (`src/api/generated/**`) are excluded from coverage

### Local Environment
```bash
docker-compose up        # Start full stack: UI, HawkBit, MySQL, RabbitMQ, nginx gateway
```

Access points:
- UI: http://localhost:9100
- HawkBit API: http://localhost:9100/rest/v1
- RabbitMQ Management: http://localhost:15672

Default credentials: `admin` / `admin`

## Architecture

### Tech Stack
- **React 19** with **TypeScript 5.9**
- **Vite 7** for build/dev tooling
- **Ant Design 6** for UI components
- **TanStack Query 5** for server state (5 min stale time, 1 retry, no window refocus)
- **Zustand 5** for client state (auth, theme, notifications, filters)
- **React Router 7** for routing
- **i18next** for i18n (en, ko, zh locales)
- **styled-components** for custom styling
- **Orval** for API client generation from OpenAPI

### Directory Structure

```
src/
├── api/
│   ├── generated/        # Auto-generated React Query hooks (DO NOT EDIT)
│   └── axios-instance.ts # Axios config with auth interceptor
├── app/
│   ├── providers/        # QueryClient, ThemeProvider
│   └── router/           # Route definitions (routes.ts)
├── components/           # Shared UI primitives
│   ├── common/           # Reusable components
│   └── layout/           # AppHeader, MainLayout, Sidebar
├── features/             # Feature-based modules
│   ├── actions/          # Action history and details
│   ├── auth/             # Login flow
│   ├── dashboard/        # Analytics dashboard
│   ├── distributions/    # Distribution sets and software modules
│   ├── rollouts/         # Rollout management
│   ├── search/           # Global search
│   ├── system/           # System configuration
│   └── targets/          # Target (device) management
├── stores/               # Zustand state stores
│   ├── useAuthStore.ts           # Auth (persisted to localStorage)
│   ├── useThemeStore.ts          # Theme switching
│   ├── useNotificationStore.ts   # Global notifications
│   ├── useListFilterStore.ts     # Saved filters
│   └── ...
├── theme/                # Ant Design theme tokens (darkTheme.ts, lightTheme.ts)
├── i18n/                 # Translation files (locales/{en,ko,zh}/*.json)
└── test/                 # Test setup
```

### Key Patterns

**Feature Organization**: Each domain in `src/features/` follows this structure:
```
features/targets/
├── Targets.tsx           # Main page component
├── TargetList.tsx        # List view
├── TargetDetail.tsx      # Detail view
├── components/           # Feature-specific components
├── tabs/                 # Detail page tabs
├── config/               # Table column configs
└── types/                # Target type management
```

**API Integration**:
- All API calls use auto-generated hooks from Orval
- Axios instance handles auth (Basic token from `useAuthStore`)
- Interceptors normalize HawkBit error codes to i18n keys
- Custom `skipGlobalError` flag to suppress toast notifications

**State Management**:
- Server state: TanStack Query (queries auto-invalidated on mutations)
- Client state: Zustand stores
- Auth state persisted to localStorage with key `updater-auth-storage`

**Routing**:
- Centralized routes in `src/app/router/routes.ts`
- Protected routes check `useAuthStore.isAuthenticated`
- Route constants exported as `ROUTES` object

**Theming**:
- Dark/Light themes defined in `src/theme/`
- Theme tokens use CSS variables for Ant Design
- Theme state managed by `useThemeStore`

**Internationalization**:
- Translation keys follow namespace pattern: `namespace:key.subkey`
- Common keys in `common.json`, feature keys in separate files
- API errors mapped via `common:apiErrors.{NORMALIZED_ERROR_CODE}`

### Authentication Flow

1. User submits credentials in `Login.tsx`
2. Base64 encode `username:password` → token
3. Store token + username in `useAuthStore` (persisted)
4. Axios interceptor adds `Authorization: Basic {token}` to all requests
5. On 401 response, interceptor calls `logout()` and redirects

Role mapping:
- Username `admin` → Admin role (full permissions)
- Other usernames → Operator role (limited permissions)

### Polling Strategy

Since HawkBit doesn't support WebSockets, TanStack Query handles polling:
- Dashboard metrics: Every 30s
- Target list: Every 10s (when page active)
- Active rollouts/actions: Every 3s (for "live" feel)

Configure via `refetchInterval` in query options.

## Styling & Components

- Use Ant Design components as primary UI library
- Custom styles via `styled-components` or inline Ant Design `styles` prop
- Theme uses CSS variables defined in `theme/constants.ts`
- Follow existing color palette (primary: `#6366f1`, success: `#10b981`, etc.)
- Components use 2-space indentation, semicolons, single quotes

## Environment Variables

Required in `.env` (see `.env_template`):
```env
API_URL=http://localhost/           # API base URL (empty string uses relative paths)
VITE_APP_TITLE=Updater UI           # Browser title
VITE_LOGIN_TITLE=Updater UI         # Login page title
```

Build-time globals (injected via `vite.config.ts`):
- `__APP_VERSION__` → from `package.json`
- `__APP_NAME__` → from `package.json`
- `__BUILD_TIME__` → build timestamp

## Proxy Configuration

Dev server (`npm run dev`) proxies `/rest` to `localhost:9100`:
- Handles HawkBit authentication
- Strips `WWW-Authenticate` header on 401 to prevent browser popup
- Allows UI and API on same origin for CORS

Production: Use nginx to reverse proxy both UI and `/rest` API.

## Code Style

- **TypeScript**: Strict mode enabled
- **React**: Functional components with hooks (no class components)
- **Imports**: Use `@/` alias for absolute imports (maps to `src/`)
- **Naming**:
  - Components: `PascalCase.tsx`
  - Hooks: `useCamelCase.ts`
  - Stores: `useCamelCaseStore.ts`
  - Types/Interfaces: `PascalCase`
- **Formatting**: 2-space indent, semicolons, single quotes
- Run `npm run lint` before committing

## Commit Conventions

Follow Conventional Commits:
- `feat:` new features
- `fix:` bug fixes
- `refactor:` code restructuring
- `chore:` maintenance tasks
- `docs:` documentation updates

Recent commit style:
```
feat: introduce common styling components and refine UI layouts and themes
feat: Implement UI settings modal and new sidebar layout
```

## Testing Guidelines

- Tests located next to source files: `*.test.ts(x)` or `*.spec.ts(x)`
- Use Vitest with React Testing Library
- Mock API calls by mocking generated hooks from `src/api/generated/`
- Avoid testing third-party library internals

## Important Notes

**DO NOT EDIT** files in `src/api/generated/` - they are auto-generated by Orval.

When adding user-facing text:
1. Add translation keys to `src/i18n/locales/{en,ko,zh}/*.json`
2. Use `useTranslation()` hook or `i18n.t()` function
3. Follow existing namespace pattern

When adding new features:
1. Create feature module under `src/features/`
2. Add route to `src/app/router/routes.ts`
3. Register route in `src/app/router/index.tsx`
4. Update sidebar navigation in `src/components/layout/Sidebar.tsx`

For HawkBit API changes:
1. Update OpenAPI spec in `docs/api-spec/mm/openapi.json`
2. Run `npm run gen:api`
3. Review diffs carefully (check breaking changes)
4. Update feature code if API contracts changed

## Docker Deployment

**Development** (docker-compose):
- Includes full stack: UI, HawkBit, MySQL, RabbitMQ, nginx
- Demo data enabled by default
- Artifacts stored in Docker volume `hawkbit-artifacts`

**Production** (Dockerfile):
- Multi-stage build: Node 22 → build, nginx:alpine → serve
- Copies `docker/nginx.conf` for production nginx config
- Exposes port 80 internally
- Image: `rhkdguskim/hawkbit-updater-ui`
