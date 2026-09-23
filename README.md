# Avtar Aromas - Fullstack Web Application

Production-grade monorepo containing the **Avtar Aromas** React/Vite frontend application and Node.js/Express backend API backed by Supabase.

---

## 📁 Repository Structure

```
avtar_aromas/
├── frontend/             # React + Vite Frontend Application
│   ├── src/              # React components, pages, routes & state management
│   ├── public/           # Static assets
│   ├── index.html        # Main HTML entry file
│   ├── vite.config.ts    # Vite bundler configuration
│   └── package.json      # Frontend package dependencies & scripts
│
├── backend/              # Node.js + Express API Backend
│   ├── src/              # API routes, controllers & middleware
│   ├── supabase/         # SQL schema & database migrations
│   ├── tsconfig.json     # TypeScript configuration
│   └── package.json      # Backend package dependencies & scripts
│
├── pnpm-workspace.yaml   # Monorepo workspace configuration
├── package.json          # Root workspace scripts
└── README.md             # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **pnpm**: `v8.0.0` or higher

---

## 💻 Running the Application

### 1. Install Dependencies
Run the workspace installation from the root directory:
```bash
pnpm install
```

### 2. Configure Environment Variables

**Frontend (`frontend/.env`)**:
```env
VITE_API_BASE_URL=http://localhost:4001
```

**Backend (`backend/.env`)**:
```env
PORT=4001
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Database Setup (Supabase)
Run the SQL script located in `backend/supabase/schema.sql` inside your Supabase SQL Editor to initialize required database tables and security policies.

---

## 🏃 Running Development Servers

From the root directory:

- **Run Frontend**:
  ```bash
  pnpm dev:frontend
  ```

- **Run Backend**:
  ```bash
  pnpm dev:backend
  ```

- **Run Both Simultaneously**:
  ```bash
  pnpm dev
  ```

---

## 🏗️ Production Build

To compile TypeScript and build production artifacts for both applications:
```bash
pnpm build
```

- Frontend build output: `frontend/dist/`
- Backend build output: `backend/dist/`