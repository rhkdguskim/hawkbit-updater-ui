# Updater UI

> HawkBit Management UI - A modern, operation-friendly web interface for Eclipse hawkBit

## Overview

**Updater UI** is a specialized Management UI for **Eclipse HawkBit**. It is designed as a headless frontend that interacts directly with the HawkBit Management API (`/rest/v1`) without requiring modifications to the HawkBit server itself.

- **Goal**: Provide an operation-friendly, scalable Web UI for managing large-scale IoT targets and software distributions.
- **Backend**: Standard Eclipse HawkBit Server.
- **Frontend**: React Single Page Application (SPA).

## Features

- 📊 **Dashboard** - Real-time overview of targets, distributions, and rollouts
- 🎯 **Target Management** - Manage IoT devices with advanced filtering (RSQL/FIQL)
- 📦 **Distribution Management** - Create and manage distribution sets and software modules
- 🚀 **Rollout Management** - Deploy software updates with group-based rollout strategies
- ⚙️ **System Configuration** - Configure tenant settings and policies
- 🌐 **Internationalization** - Support for English and Korean languages
- 🌙 **Dark Mode** - Theme support for comfortable viewing

## Tech Stack

### Core
- **Framework**: React 19, TypeScript 5, Vite 7
- **UI Component Library**: Ant Design 6
- **Styling**: Styled Components (Dynamic theming)
- **Icons**: React Icons

### State & Data
- **Server State**: TanStack Query (React Query) v5
- **Client State**: Zustand v5
- **API Client**: Axios with Basic Auth
- **Code Generation**: Orval (from OpenAPI specs)

### Internationalization
- **Library**: i18next, react-i18next
- **Languages**: English (en), Korean (ko)

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Running HawkBit server instance

### Installation

```bash
# Clone the repository
git clone https://github.com/rhkdguskim/hawkbit-updater-ui.git
cd hawkbit-updater-ui

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`.

### Environment Variables

Create a `.env` file in the project root:

```env
# API URL (optional, defaults to proxy in development)
API_URL=

# Application titles
VITE_APP_TITLE=Updater UI
VITE_LOGIN_TITLE=Updater UI
```

## Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Generate API client from OpenAPI specs
npm run gen:api
```

### Project Structure

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

### API Generation

This project uses **Orval** to generate API clients from HawkBit OpenAPI specs:

```bash
npm run gen:api
```

The generated code is placed in `src/api/generated/`.

## Architecture

### Headless Integration
The UI is decoupled from the backend, communicating purely via REST APIs.

### Data Querying
Uses **RSQL/FIQL** standards for advanced filtering of Targets and Distributions.

### Real-time Updates
Implements **Polling** strategies via React Query since HawkBit lacks WebSocket support for management events.

### Authentication
- Development uses **Basic Authentication**
- Token is stored in Zustand store and injected into requests via Axios interceptor

## Documentation

- `docs/TECH.md` - Detailed architectural decisions and implementation plans
- `docs/api-spec/` - OpenAPI specifications for the backend

## License

This project is open source and available under the [MIT License](LICENSE).

## Related Projects

- [Eclipse HawkBit](https://www.eclipse.org/hawkbit/) - IoT Update Management Server
