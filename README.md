# Scalio Project

A modern frontend application built with **React**, **TypeScript**, and **Vite**. This project demonstrates a clean architecture, efficient state management, and strict type safety.

## 🚀 Features

- ⚡ **Fast Development**: Powered by Vite for instant HMR (Hot Module Replacement).
- 📐 **Strict Typing**: Full TypeScript integration for robust code quality.
- 🎨 **Responsive Design**: Mobile-first approach (Add your CSS framework here, e.g., Tailwind CSS).
- 🧩 **Component Architecture**: Reusable and modular component structure.
- ✅ **Code Quality**: Linting and formatting via ESLint.

## 🛠️ Tech Stack

**Frontend**

- **Core**: [React](https://react.dev/) (v18+)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: Tailwind CSS

**Backend**

- **Runtime**: [NodeJS](https://nodejs.org/)
- **Framework**: [Express.js](https://nodejs.org/)
- **ORM**: [Prisma](https://prisma.io/)
- **Database**: [Supabase](https://supabase.com/) using [PostgreSQL](https://www.postgresql.org/)

## 📦 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone [https://github.com/blckzr/Scalio.git](https://github.com/blckzr/Scalio.git)
   ```

2. **Setup the Client**

   ```bash
   cd client

   npm install

   npm run dev
   ```

   The server will run at http://localhost:5173.

3. **Setup the Server**

   ```bash
   cd server

   npm install

   npm run dev
   ```

   The server will run at http://localhost:5000.

## 🐙 Git Configuration

### 🔄 Basic Workflow

**1. Start a new task**
Make sure your local project is up to date, then create a new branch.

```bash
git pull
git checkout -b feature/my-new-feature
```

**2. Save your changes** Stage your file and create a commit.

```bash
git add .
git commit -m "[feat] add amazing new feature"
git push
```

**3. Create Pull Request**

1. Go to repository on GitHub
2. Click "Compare & pull request"
3. **IMPORTANT:** On the right sidebar, under **"Reviewers"**, you must select Kevin or Joshua as Reviewers.
4. Click "Create Pull Request".

### 📝 Git Commit Conventions

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification. This ensures a clean and readable history.

**Format:** `[type] <short description>`

| Type           | Description                                                                        |
| :------------- | :--------------------------------------------------------------------------------- |
| **`feat`**     | A new feature                                                                      |
| **`fix`**      | A bug fix                                                                          |
| **`docs`**     | Documentation only changes                                                         |
| **`style`**    | Changes that do not affect the meaning of the code (formatting, white-space, etc.) |
| **`refactor`** | A code change that neither fixes a bug nor adds a feature                          |
| **`perf`**     | A code change that improves performance                                            |
| **`test`**     | Adding missing tests or correcting existing tests                                  |
| **`chore`**    | Changes to the build process or auxiliary tools (e.g., updating `package.json`)    |

**Examples:**

```bash
git commit -m "[feat] implement job search filter"
git commit -m "[fix] resolve layout issue on mobile"
git commit -m "[chore] upgrade tailwindcss to v4"
```
