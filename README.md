# SpendWise — Expense Tracker

A full-stack expense tracker built with **React.js** (frontend) + **Express.js** (backend) + **JSON file storage**.

---

## 📁 Project Structure

```
expense-tracker/
├── server/           ← Express backend
│   ├── server.js
│   ├── data.json     ← Expenses stored here
│   └── package.json
└── client/           ← React frontend
    ├── src/
    │   ├── App.js
    │   ├── App.css
    │   └── components/
    │       ├── Dashboard.js
    │       ├── ExpenseList.js
    │       ├── AddExpense.js
    │       └── BudgetSettings.js
    └── package.json
```

---

## 🚀 Setup & Run

### 1. Start the Backend (Express)

```bash
cd server
npm install
npm start          # runs on http://localhost:5000
# or for dev with auto-reload:
npm run dev
```

### 2. Start the Frontend (React)

```bash
cd client
npm install
npm start          # runs on http://localhost:3000
```

> Both must run simultaneously. React proxies API calls to Express via `"proxy": "http://localhost:5000"` in `client/package.json`.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Add Expense** | Title, amount, category, date, optional note |
| **Delete Expense** | Remove any expense with one click |
| **Categories** | Food, Transport, Entertainment, Shopping, Health, Education, Other |
| **Filters** | Filter by category and/or month |
| **Charts** | Area chart (6-month trend) + Pie chart (by category) |
| **Monthly Budget** | Set a budget, see usage bar + alerts |
| **Dashboard** | Stats overview with all KPIs |
| **JSON Storage** | All data persisted in `server/data.json` |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/expenses` | Get all expenses (supports `?category=&month=` filters) |
| POST | `/api/expenses` | Add new expense |
| DELETE | `/api/expenses/:id` | Delete expense by ID |
| GET | `/api/budget` | Get budget |
| PUT | `/api/budget` | Update monthly budget |
| GET | `/api/summary` | Get stats, trends, category breakdown |
