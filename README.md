<div align="center">

# 🚀 HawkBit Updater UI

**Modern Management UI for Eclipse HawkBit**

[![CI](https://github.com/rhkdguskim/hawkbit-updater-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/rhkdguskim/hawkbit-updater-ui/actions/workflows/ci.yml)
[![Deploy to GitHub Pages](https://github.com/rhkdguskim/hawkbit-updater-ui/actions/workflows/deploy.yml/badge.svg)](https://github.com/rhkdguskim/hawkbit-updater-ui/actions/workflows/deploy.yml)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Ant Design](https://img.shields.io/badge/Ant%20Design-6-0170FE?style=flat-square&logo=antdesign)](https://ant.design/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

*A beautiful, operation-friendly web interface for managing large-scale IoT devices and software distributions.*

[Key Features](#-key-features) • [Installation](#-quick-start) • [Architecture](#-architecture) • [Deployment](#-deployment) • [Advanced Usage](#-advanced-usage)

</div>

---

## 📖 Overview

**HawkBit Updater UI** is a specialized, headless management frontend for [Eclipse HawkBit](https://www.eclipse.org/hawkbit/). Unlike the default HawkBit UI, this project focuses on **Operational Efficiency**, **Scalability**, and **Modern UX**.

### 💡 Core Philosophy
- **Headless First**: Communicates purely via the `/rest/v1` Management API. Zero backend modifications required.
- **Developer & Operator Friendly**: Combines deep technical monitoring with intuitive management workflows.
- **Enterprise Ready**: Designed to handle thousands of targets with advanced filtering and bulk actions.

---

## ✨ Key Features

### 📊 Intelligence Dashboard
- **Health Summary**: Instant view of target connectivity and update success rates.
- **Action Required**: Proactive detection of failed updates or overdue installations.
- **Live Trends**: Visual representation of deployment progress over time.

### 🎯 Pro Target Management
- **RSQL Power Search**: Filter targets using complex queries (e.g., `status==online;name=~*bot*`).
- **Bulk Operations**: Assign distribution sets, update tags, or delete multiple targets in one click.
- **Detailed History**: Full audit trail of actions per target with detailed status logs.

### 📦 Optimized Distribution Flow
- **Categorized Modules**: Organize software by types (OS, App, Config) with color-coded tags.
- **Versioning**: Clear overview of distribution set hierarchies and metadata.
- **Artifact Management**: Intuitive upload and metadata editing.

### 🚀 Industrial Rollouts
- **Smart Strategies**: Support for group-based deployments with pause/resume capabilities.
- **Threshold Control**: Automate rollout pauses based on error percentage thresholds.
- **Drill-down Analysis**: Identify exactly which targets failed in a massive rollout and why.

---

## 🏗 Architecture & Design

The Updater UI is designed as a **Single Page Application (SPA)** that sits on top of a standard HawkBit installation.

### 🛡️ Headless Integration
```mermaid
graph LR
    User[Admin / Operator] -->|HTTPS| SPA[React Web App]
    SPA -->|REST / JSON| Proxy[Reverse Proxy / Nginx]
    Proxy -->|/rest/v1/*| HawkBit[Eclipse HawkBit]
    HawkBit <-->|JPA| DB[(Meta Data)]
    HawkBit -->|DDI API| Device[IoT Devices]
    
    style SPA fill:#6366f1,stroke:#4338ca,color:#fff
    style HawkBit fill:#3b82f6,stroke:#1d4ed8,color:#fff
```

### 🔄 Real-time Strategy (Polling)
Since HawkBit Management API is REST-based without WebSocket support, we implement an optimized **polling strategy** using React Query:
- **Global Metrics**: Every 30 seconds.
- **Target List**: Every 10 seconds (when active).
- **Ongoing Actions**: Every 3 seconds to provide a "live" feel to deployments.

---

## 🔄 IoT Communication Flow

Understanding how a command from the UI reaches the device:

```mermaid
sequenceDiagram
    autonumber
    participant UI as Updater UI
    participant HB as HawkBit Server
    participant Dev as IoT Device
    Note over UI, HB: Assignment Phase
    UI->>HB: POST /rest/v1/targets/.../assignedData
    HB-->>UI: 201 Created (Action Scheduled)
    Note over HB, Dev: Polling Phase (DDI)
    Dev->>HB: GET /ddi/v1/controller (Check update)
    HB->>Dev: 200 OK (Deployment Info + Links)
    Note over Dev: Execution Phase
    Dev->>HB: GET /resources/... (Download Artifact)
    Dev->>Dev: Install & Verify
    Note over HB, Dev: Feedback Phase
    Dev->>HB: POST /.../feedback (Status Update)
    Note over UI, HB: Result Phase
    HB-->>UI: Polling returns "FINISHED" status
    UI->>UI: Notification: Update Successful!
```

---

## 🛠 Tech Stack

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | **React 19** | Standard-setting UI framework with the latest performance features. |
| **Language** | **TypeScript 5** | Strong typing for complex IoT domain models. |
| **Styling** | **Ant Design 6** | Premium, enterprise-grade component library. |
| **State** | **Zustand 5** | Lightweight client-side state management (Auth, Theme). |
| **Data Fetching** | **TanStack Query 5** | Robust caching, polling, and synchronization engine. |
| **Code Gen** | **Orval** | Automatic API hook generation from HawkBit OpenAPI. |

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** v18 or newer
- **npm** v9 or newer
- Access to a **HawkBit Server**

### 2. Local Setup
```bash
# Clone the project with submodules
git clone --recurse-submodules https://github.com/rhkdguskim/hawkbit-updater-ui.git
cd hawkbit-updater-ui

# Install dependencies
npm install

# Start the dev server
npm run dev
```

**Note**: This project includes a hawkBit fork as a git submodule in `external/hawkbit`. See [hawkBit Submodule Guide](docs/HAWKBIT_SUBMODULE.md) for details.

### 3. Environment Configuration
Create a `.env` in the root (see `.env_template`):
```env
VITE_APP_TITLE=Updater UI
VITE_LOGIN_TITLE=Management Console
# Base URL if not using proxy
VITE_API_BASE_URL=http://your-hawkbit-server:8080
```

---

## 🐳 Deployment

### Using Docker (Recommended)
The project includes a multi-stage Dockerfile for optimized builds.

```bash
# Build the image
docker build -t hawkbit-updater-ui .

# Run the container
docker run -p 80:80 -d hawkbit-updater-ui
```

### With Docker Compose
```bash
# Start all services (UI, hawkBit, MySQL, RabbitMQ)
docker compose up --build

# Access the services
# - Updater UI: http://localhost:9100
# - hawkBit Server: http://localhost:9100/hawkbit (via nginx proxy)
# - RabbitMQ Management: http://localhost:15672
```

**Important**: The docker-compose.yml builds hawkBit from the local submodule source instead of using pre-built images. First build may take 5-10 minutes.

---

## 🔍 Advanced Usage

### RSQL/FIQL Filtering
The UI leverages HawkBit's powerful search syntax. You can use it in search bars:
- `name==my-device*`: Devices starting with "my-device".
- `status==online;tags==beta`: Online devices with a "beta" tag.
- `lastContacted=lt=1672531200`: Devices contacted before a specific timestamp.

### API Code Generation
Whenever the HawkBit API spec changes, sync the client:
1. Update `docs/api-spec/management/openapi.json`.
2. Run `npm run gen:api`.
3. The hooks in `src/api/generated` will be updated automatically.

---

## � Project Structure
```bash
src/
├── api/              # API Infrastructure
│   ├── generated/    # Auto-generated React Query hooks (Do not edit)
│   └── axios-instance.ts
├── components/       # Primitive UI elements
├── features/         # Domain-driven modules
│   ├── dashboard/    # Analytics & Summary
│   ├── targets/      # Device management
│   ├── distributions/# Software assets
│   ├── rollouts/     # Deployment orchestration
│   └── auth/         # Login & Security
├── stores/           # Zustand state (Auth, Theme, I18n)
├── theme/            # Ant Design theme tokens (Dark/Light)
└── i18n/             # Translations (JSON based)
```

---

## 🤝 Contributing

We welcome your contributions!
1. **Fork** the repository.
2. Create a **Feature Branch** (`git checkout -b feature/cool-feature`).
3. **Commit** your changes (`git commit -m 'Add cool feature'`).
4. **Push** to the branch (`git push origin feature/cool-feature`).
5. Open a **Pull Request**.

---

## 📄 License
This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

<div align="center">

**Built for the IoT Ecosystem with ❤️**

[Report Bug](https://github.com/rhkdguskim/hawkbit-updater-ui/issues) • [Request Feature](https://github.com/rhkdguskim/hawkbit-updater-ui/issues)

</div>


