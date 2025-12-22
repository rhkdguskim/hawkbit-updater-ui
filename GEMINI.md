# Project Context: Updater UI

## Overview
**Updater UI** is a specialized Management UI for **Eclipse HawkBit**. It is designed as a headless frontend that interacts directly with the HawkBit Management API (`/rest/v1`) without requiring modifications to the HawkBit server itself.

- **Goal**: Provide an operation-friendly, scalable Web UI for managing large-scale IoT targets and software distributions.
- **Backend**: Standard Eclipse HawkBit Server.
- **Frontend**: React Single Page Application (SPA).

## Architecture
- **Headless Integration**: The UI is decoupled from the backend, communicating purely via REST APIs.
- **Proxying**: In development, Vite proxies `/rest` requests to a running HawkBit server instance (configured in `vite.config.ts`).
- **Data Querying**: Uses **RSQL/FIQL** standards for advanced filtering of Targets and Distributions.
- **Real-time**: Implements **Polling** strategies (via React Query) to simulate real-time updates since HawkBit lacks WebSocket support for management events.

## Tech Stack

### Core
- **Framework**: React 19, TypeScript 5, Vite 7
- **UI Component Library**: Ant Design 6
- **Styling**: Styled Components (Dynamic theming)
- **Icons**: React Icons

### State & Data
- **Server State**: TanStack Query (React Query) v5 - Handles caching, polling, and API sync.
- **Client State**: Zustand v5 - Handles auth, theme, and language preferences.
- **API Client**: Axios - Custom instance with Basic Auth and standardized error handling (`src/api/axios-instance.ts`).
- **Code Generation**: Orval - Generates React Query hooks and TypeScript types from HawkBit OpenAPI specs.

### Internationalization
- **Library**: i18next, react-i18next
- **Languages**: English (en), Korean (ko)

## Project Structure
```
src/
├── api/
│   ├── generated/          # Auto-generated API hooks (Do not edit directly)
│   └── axios-instance.ts   # Axios setup with Interceptors & Auth
├── assets/                 # Static assets
├── components/             # Shared UI components
├── features/               # Feature-based modules
│   ├── actions/            # Action History & Details
│   ├── auth/               # Login & Guard logic
│   ├── dashboard/          # Main dashboard widgets
│   ├── distributions/      # Distribution Sets & Software Modules
│   ├── rollouts/           # Rollout Management
│   └── targets/            # Target Management
├── i18n/                   # Translation files (locales)
├── stores/                 # Global Zustand stores (Auth, Theme, Language)
├── theme/                  # Theme configuration (AntD Tokens)
└── utils/                  # Utilities (FIQL builder, Formatters)
```

## Development Workflow

### 1. Setup & Run
```bash
npm install
npm run dev
```
Access the application at `http://localhost:5173`.

### 2. API Generation
This project uses **Orval** to generate API clients. If the HawkBit API spec changes (`docs/api-spec/management/openapi.json`), regenerate the code:
```bash
npm run gen:api
```
*Note: The generator is configured in `orval.config.ts` to output to `src/api/generated` using the custom axios instance.*

### 3. Authentication
- Development uses **Basic Authentication**.
- The token is stored in the Zustand `useAuthStore` and injected into every request header via the axios interceptor.

### 4. Coding Conventions
- **Naming**: PascalCase for Components, camelCase for functions/vars.
- **Querying**: Use the `fiql.ts` utility to construct RSQL strings for filtering API lists.
- **Error Handling**: API errors are caught in the global axios interceptor (`src/api/axios-instance.ts`) and displayed using Ant Design's `message` component, with fallback to i18n keys.

## Key Documentation
- `docs/TECH.md`: Detailed architectural decisions and implementation plans.
- `docs/api-spec/`: OpenAPI specifications for the backend.
