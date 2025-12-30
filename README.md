<div align="center">

# 🚀 HawkBit Updater UI

**Modern Management UI for Eclipse HawkBit**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Ant Design](https://img.shields.io/badge/Ant%20Design-6-0170FE?style=flat-square&logo=antdesign)](https://ant.design/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

*A beautiful, operation-friendly web interface for managing large-scale IoT devices and software distributions*

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📖 Overview

**HawkBit Updater UI** is a specialized Management UI for [Eclipse HawkBit](https://www.eclipse.org/hawkbit/). It is designed as a **headless frontend** that interacts directly with the HawkBit Management API (`/rest/v1`) without requiring modifications to the backend server.

### Why HawkBit Updater UI?

- 🎯 **Operation-Friendly** - Intuitive interface designed for daily operations
- 📱 **Responsive Design** - Works seamlessly on desktop and tablet
- 🌙 **Dark Mode** - Easy on the eyes during extended use
- 🌐 **Multilingual** - English and Korean language support
- ⚡ **Fast & Modern** - Built with latest React and TypeScript

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 📊 Dashboard
Real-time overview of your IoT fleet with:
- Target statistics & connectivity status
- Distribution deployment progress
- Active rollout monitoring
- Quick action shortcuts

</td>
<td width="50%">

### 🎯 Target Management
Comprehensive device management:
- Advanced RSQL/FIQL filtering
- Bulk operations
- Tag & type organization
- Assignment tracking

</td>
</tr>
<tr>
<td width="50%">

### 📦 Distribution Management
Software distribution control:
- Distribution set creation
- Software module management
- Version tracking
- Type configuration

</td>
<td width="50%">

### 🚀 Rollout Management
Deployment orchestration:
- Group-based rollout strategies
- Progress monitoring
- Threshold configuration
- Pause/Resume control

</td>
</tr>
</table>

---

## 🛠 Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | React 19, TypeScript 5, Vite 7 |
| **UI Library** | Ant Design 6, Styled Components |
| **State Management** | TanStack Query v5, Zustand v5 |
| **API** | Axios, Orval (OpenAPI code generation) |
| **Internationalization** | i18next, react-i18next |
| **Icons** | React Icons |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18 or higher
- **npm** or **yarn**
- Running **HawkBit server** instance

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

The application will be available at **http://localhost:5173**

### Environment Configuration

Create a `.env` file in the project root:

```env
# Application titles
VITE_APP_TITLE=Updater UI
VITE_LOGIN_TITLE=Updater UI

# API URL (optional, uses proxy in development)
API_URL=
```

---

## 📁 Project Structure

```
src/
├── 📂 api/
│   ├── generated/          # Auto-generated API hooks (Orval)
│   └── axios-instance.ts   # Axios configuration
├── 📂 components/          # Shared UI components
├── 📂 features/            # Feature modules
│   ├── actions/            # Action history
│   ├── auth/               # Authentication
│   ├── dashboard/          # Dashboard widgets
│   ├── distributions/      # Distribution management
│   ├── rollouts/           # Rollout management
│   ├── system/             # System configuration
│   └── targets/            # Target management
├── 📂 i18n/                # Translations (en, ko)
├── 📂 stores/              # Zustand stores
├── 📂 theme/               # AntD theme tokens
└── 📂 utils/               # Utilities
```

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run gen:api` | Generate API client from OpenAPI specs |

---

## 🏗 Architecture

### Headless Integration
The UI communicates with HawkBit purely via REST APIs, making it easily deployable alongside any standard HawkBit installation.

### Data Querying
Uses **RSQL/FIQL** standards for advanced filtering, enabling powerful search capabilities across targets and distributions.

### Real-time Updates
Implements **polling strategies** via React Query, providing near real-time updates without requiring WebSocket modifications to HawkBit.

### Authentication
Supports **Basic Authentication** with token management via Zustand store and Axios interceptors.

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [`docs/TECH.md`](docs/TECH.md) | Architecture decisions & implementation details |
| [`docs/api-spec/`](docs/api-spec/) | HawkBit OpenAPI specifications |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🔗 Related Projects

- [Eclipse HawkBit](https://www.eclipse.org/hawkbit/) - IoT Update Management Server
- [HawkBit Examples](https://github.com/eclipse/hawkbit-examples) - Official examples

---

<div align="center">

**Made with ❤️ for the IoT community**

⭐ Star this repository if you find it helpful!

</div>
