# Basalt CMS

A Next.js 16 + React 19 Monolithic CRM & CMS application.

## 🚀 Key Features

-   **CRM:** Accounts, Contacts, Leads, Opportunities management.
-   **CMS:** Blog, Media Library, Dynamic Pages.
-   **AI Integration:** Deep integration with OpenAI, Azure AI, and AWS Bedrock/Connect.
-   **Communications:** Sustainability-focused Email (Gmail/SES), Voice (AWS Connect/Chime), SMS (Pinpoint).
-   **Multi-Tenancy:** Team-based data isolation.

## 🛠️ Tech Stack

-   **Framework:** Next.js 16 (App Router)
-   **Language:** TypeScript
-   **Database:** MongoDB (via Prisma ORM)
-   **Auth:** NextAuth.js
-   **Styling:** Tailwind CSS + Radix UI / Shadcn
-   **Infrastructure:** Vercel (Frontend), AWS (Voice/Email), Azure (AI)

## 🚦 Getting Started

### Prerequisites

-   Node.js 20+
-   MongoDB Instance (Atlas or Local)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repo-url>
    cd basalt-cms
    ```

2.  **Install dependencies:**
    ```bash
    npm install --force # Due to React 19 alpha peer deps
    ```

3.  **Environment Setup:**
    Duplicate `.env.local.example` to `.env.local` and fill in the required keys.
    ```bash
    cp .env.local.example .env.local
    ```
    **Critical:** You MUST set `API_KEY_ENCRYPTION_KEY` in `.env.local` for the app to start securely.

4.  **Database Setup:**
    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **Run Development Server:**
    ```bash
    npm run dev
    ```

## 🔒 Security

-   **Auth:** `/cms` routes are protected by Global Auth Middleware.
-   **Secrets:** API keys stored in the database are encrypted using AES-256-CBC.
-   **Isolation:** Data is isolated by `team_id`.

## 🧪 Testing

-   **Unit Tests:** Run `npm run test` (Vitest)
-   **E2E Tests:** Cypress (in `cypress/`)

## 📂 Project Structure

-   `app/`: Next.js App Router (pages & API)
-   `components/`: React components
-   `lib/`: Utilities, helpers, and shared logic
-   `prisma/`: Database schema and seeds
-   `scripts/`: Build and maintenance scripts
