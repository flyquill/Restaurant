# Restaurant Management System

A simple, modern, full-stack Restaurant Management System built with React (Vite + Tailwind CSS), Node.js (Express), and SQLite (sql.js).

## Key Features
1. **Takeaway Orders**: Horizontal categories bar on top, searchable item grid, and a rich cart on the right side. Clicking on any item automatically adds it to the cart. Basic cart operations (+/- quantity, delete, grand totals).
2. **Dine-in Tables Management**: Overview of tables (available/occupied), waiter assignment, table-specific ordering screen, and "Pay & Close" flow to settle bills.
3. **Admin Items Management**: CRUD (Create, Read, Update, Delete) operations for menu items, pricing, and categories.
4. **Orders History**: Logs of all completed orders (takeaway + dine-in) with comprehensive expanded item breakdown lists.
5. **Basic User Roles & JWT Authentication**: System login for both `admin` and `user` accounts with role-based navigation protections.
6. **Modern UI Aesthetics**: Designed with curated HSL color schemes, glassmorphism panel backdrops, card shadows, hover lifts, active click animations, and custom notification toasts.

---

## Technical Stack
- **Frontend**: React.js, Vite, Tailwind CSS v3, Axios, React Router v6, React Icons
- **Backend**: Node.js, Express, JWT, bcryptjs, sql.js (pure JS SQLite to prevent compile errors)
- **Database**: SQLite (saved to `server/restaurant.db`)

---

## How to Run the Project

### 1. Run the Backend Server
Open a terminal, go to the `server` directory, and start the API:
```bash
cd server
npm start
```
The database will be initialized automatically and seeded with sample menus, categories, tables, and waiters.
- Server URL: `http://localhost:5000`
- API Base URL: `http://localhost:5000/api`

### 2. Run the Frontend Client
Open another terminal, go to the `client` directory, and start the React app:
```bash
cd client
npm run dev
```
Open your browser and navigate to the local URL (usually `http://localhost:5173`).

---

## Demo Accounts
- **Admin**: Username: `admin` / Password: `admin123`
- **User**: Username: `user` / Password: `user123`
"# Restaurant" 
