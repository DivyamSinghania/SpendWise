const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5001;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  const initialData = {
    expenses: [],
    budget: { monthly: 0 },
    users: [],
    session: { currentUserId: null }
  };
  fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
}

const readData = () => {
  const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  if (!Array.isArray(parsed.expenses)) parsed.expenses = [];
  if (!parsed.budget || typeof parsed.budget !== 'object') parsed.budget = { monthly: 0 };
  if (!Array.isArray(parsed.users)) parsed.users = [];
  if (!parsed.session || typeof parsed.session !== 'object') {
    parsed.session = { currentUserId: null };
  }
  return parsed;
};
const writeData = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
const hashPassword = (password) => crypto.createHash('sha256').update(password).digest('hex');
const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt
});
const getCurrentUser = (data) =>
  data.users.find((user) => user.id === data.session.currentUserId) || null;

// AUTH
app.get('/api/auth/me', (req, res) => {
  const data = readData();
  const user = getCurrentUser(data);
  res.json({ user: user ? sanitizeUser(user) : null });
});

app.post('/api/auth/signup', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }

  const trimmedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();
  if (!trimmedName || !normalizedEmail) {
    return res.status(400).json({ error: 'Invalid signup details' });
  }

  const data = readData();
  if (data.users.some((user) => user.email === normalizedEmail)) {
    return res.status(409).json({ error: 'User already exists with this email' });
  }

  const newUser = {
    id: uuidv4(),
    name: trimmedName,
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString()
  };

  data.users.push(newUser);
  data.session.currentUserId = newUser.id;
  writeData(data);
  res.status(201).json({ user: sanitizeUser(newUser) });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const data = readData();
  const user = data.users.find((entry) => entry.email === normalizedEmail);

  if (!user || user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  data.session.currentUserId = user.id;
  writeData(data);
  res.json({ user: sanitizeUser(user) });
});

app.post('/api/auth/logout', (req, res) => {
  const data = readData();
  data.session.currentUserId = null;
  writeData(data);
  res.json({ message: 'Logged out' });
});

// GET all expenses
app.get('/api/expenses', (req, res) => {
  const data = readData();
  let expenses = data.expenses;

  if (req.query.category && req.query.category !== 'All') {
    expenses = expenses.filter(e => e.category === req.query.category);
  }
  if (req.query.month) {
    expenses = expenses.filter(e => e.date.startsWith(req.query.month));
  }

  res.json(expenses);
});

// POST add expense
app.post('/api/expenses', (req, res) => {
  const { title, amount, category, date, note } = req.body;
  if (!title || !amount || !category || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const data = readData();
  const newExpense = {
    id: uuidv4(),
    title,
    amount: parseFloat(amount),
    category,
    date,
    note: note || '',
    createdAt: new Date().toISOString()
  };
  data.expenses.unshift(newExpense);
  writeData(data);
  res.status(201).json(newExpense);
});

// DELETE expense
app.delete('/api/expenses/:id', (req, res) => {
  const data = readData();
  const index = data.expenses.findIndex(e => e.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Expense not found' });
  data.expenses.splice(index, 1);
  writeData(data);
  res.json({ message: 'Deleted successfully' });
});

// GET budget
app.get('/api/budget', (req, res) => {
  const data = readData();
  res.json(data.budget);
});

// PUT update budget
app.put('/api/budget', (req, res) => {
  const { monthly } = req.body;
  const data = readData();
  data.budget.monthly = parseFloat(monthly) || 0;
  writeData(data);
  res.json(data.budget);
});

// GET summary stats
app.get('/api/summary', (req, res) => {
  const data = readData();
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const monthlyExpenses = data.expenses.filter(e => e.date.startsWith(currentMonth));
  const totalThisMonth = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalAll = data.expenses.reduce((sum, e) => sum + e.amount, 0);

  const byCategory = monthlyExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  // Last 6 months trend
  const trend = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthName = d.toLocaleString('default', { month: 'short' });
    const total = data.expenses
      .filter(e => e.date.startsWith(monthKey))
      .reduce((sum, e) => sum + e.amount, 0);
    trend.push({ month: monthName, amount: total });
  }

  res.json({
    totalThisMonth,
    totalAll,
    count: data.expenses.length,
    budget: data.budget.monthly,
    byCategory,
    trend
  });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
