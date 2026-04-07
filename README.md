# 🛡️ Envyx — Your Secret Vault

**Envyx** is a high-performance, ultra-secure environment variable management system. Built for modern development teams who prioritize security, speed, and a seamless developer experience.

![Envyx Dashboard](https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600&q=80)

---

## ✨ Features

- 🔐 **Military-Grade Encryption**: Every secret is encrypted using **AES-256-GCM** before touching the database. Even we can't see your data.
- 📦 **Project Isolation**: Group your variables by project. Each project has its own secure vault.
- 🚀 **Bulk Operations**: 
  - **Bulk Import**: Paste your entire `.env` file and we'll parse and encrypt everything instantly.
  - **Bulk Copy**: Copy all project variables in one click to your clipboard in `KEY=VALUE` format.
- 📜 **Audit History**: Track every change. Who created, updated, or deleted a secret, and when.
- 🔑 **Secure Authentication**: Powerered by **Better-Auth** with support for secure login and registration.
- 🌑 **Premium Dark UI**: A sleek, dark-mode first interface designed for high-focus development.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Auth**: [Better-Auth](https://www.better-auth.com/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State**: React Hooks & Context API

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/hasnain-tanoli/envyx.git
cd envyx
pnpm install
```

### 2. Configure Environment
Create a `.env` file in the root directory:
```env
DATABASE_URL=postgres://user:pass@localhost:5432/envyx
ENV_ENCRYPTION_KEY=your_32_character_hex_key
BETTER_AUTH_SECRET=your_auth_secret
BETTER_AUTH_URL=http://localhost:3000
```

### 3. Database Migration
```bash
pnpm db:push
```

### 4. Run Development Server
```bash
pnpm dev
```

## 🏗️ Project Structure

```text
src/
├── app/               # Next.js Routes (Backend & Frontend)
│   ├── (backend)/     # API Endpoints
│   └── (frontend)/    # Dashboard & Pages
├── components/        # Reusable UI Components
├── db/                # Database Schemas & Client
├── lib/               # Shared Utilities (Crypto, API, Auth)
├── types/             # TypeScript Definitions
└── styles/            # Global CSS & Tailwind Config
```

## 🔐 Security Information

Envyx uses a zero-knowledge approach for your secrets. The private encryption key exists only on your server environment. This ensures that even in the case of a database breach, your secrets remain unreadable without the specific server-side key.

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ by [Hasnain Tanoli](https://github.com/hasnain-tanoli)
