# Next.js Project Manager

A lightweight internal tool to manage projects and tasks.

## Stack

- **Framework:** Next.js
- **Styling:** Tailwind CSS
- **Database:** SQLite via Prisma
- **Authentication:** JWT in Next.js Middleware
- **Drag‑and‑Drop:** react-sortablejs
- **Date Picker:** react-datepicker + date-fns
- **Theming:** next-themes (light/dark mode)

## Getting Started

1. **Clone & Install**
   ```bash
   git clone [<repo-url>](https://github.com/v1becheck/nextjs-project-manager.git)
   cd nextjs-project-manager
   npm install
   ```
2. Environment
   Copy .env.example → .env and set:
   ```bash
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your_jwt_secret"
   NODE_ENV="development"
   ```
3. Database setup
   ```bash
   npx prisma migrate dev --name init
   ```
4. Run
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

## Project Structure

app/ – Next.js App Router pages & API routes<br>
prisma/ – Schema & migrations<br>
components/ – UI components (ThemeToggle, etc.)<br>
tailwind.config.js – Tailwind setup<br>
.env – Environment variables<br>

## Deployed

Vercel
