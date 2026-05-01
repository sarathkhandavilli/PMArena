# PM Arena

**LeetCode for Product Managers** 🚀

PM Arena is a modern, scalable web application designed to help Product Managers practice real-world product scenarios, improve their PM thinking, and receive expert feedback. Built with a focus on seamless user experience, beautiful design, and robust security.

## 🌟 Features

- **Role-Based Access Control (RBAC):**
  - `SUPER_ADMIN`: Global access to manage all tenants, users, and problems.
  - `ADMIN`: Tenant-level access to manage their organization's employees.
  - `EMPLOYEE`: Access to browse, filter, and solve PM problems.
- **Multi-Tenancy Architecture:** Organization-based grouping with built-in seat limits (`max_users`).
- **Dynamic Problem Navigation:** SEO-friendly, slug-based routing for individual problem details.
- **Secure Authentication:** Powered by Supabase Auth with protected routes guarding private dashboards.
- **Beautiful UI/UX:** Built with Tailwind CSS and Shadcn UI components (Radix primitives) featuring dynamic layouts, glassmorphism, and responsive sidebars.

## 💻 Tech Stack

- **Frontend:** React (Vite), TypeScript, Tailwind CSS
- **Routing:** React Router v7
- **UI Components:** Shadcn UI, Lucide React (Icons)
- **Backend & Database:** Supabase (PostgreSQL, Row Level Security, Auth)
- **State Management:** React Context API + Custom Hooks

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js and npm installed. You also need a Supabase project set up.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/pm-arena.git
   cd pm-arena
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## 🔒 Database & Security
The application relies heavily on **Supabase Row Level Security (RLS)** to enforce multi-tenancy and role access. 

Example Data Models:
- `users`: Tracks role, tenant_id, and profile data.
- `tenants`: Tracks organization names and user limits.
- `problems`: Houses PM case studies, severity/difficulty levels, and company tags.

All sensitive reads and writes are protected by Postgres RLS policies and `SECURITY DEFINER` functions to prevent unauthorized data access.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!

## 📄 License
This project is proprietary and confidential. All rights reserved.
