// ─────────────────────────────────────────────────────────
//  Expensio — Backend API
//  Tech: Node.js + Express
//  Port: 3000
// ─────────────────────────────────────────────────────────

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false })); // Security headers
app.use(cors());                                   // Allow cross-origin requests
app.use(morgan('dev'));                             // Request logging
app.use(express.json());                           // Parse JSON request body

// ── Serve Frontend ────────────────────────────────────────
// This serves our HTML file when someone opens the browser
const frontendPath = process.env.FRONTEND_PATH || path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// ── In-Memory Database ────────────────────────────────────
// NOTE: In production, replace this with MongoDB or PostgreSQL
let transactions = [
  // Sample data so the app doesn't feel empty on first run
  {
    id: '1',
    desc: 'Monthly Salary',
    amount: 50000,
    type: 'income',
    category: '💼 Salary',
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: '2',
    desc: 'Grocery Shopping',
    amount: 2500,
    type: 'expense',
    category: '🍔 Food & Dining',
    date: new Date().toISOString().split('T')[0]
  }
];

// ── ROUTES ────────────────────────────────────────────────

// Health Check — Jenkins and Docker use this to verify app is alive
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status:    'OK',
    message:   'Expensio API is running!',
    uptime:    Math.floor(process.uptime()) + ' seconds',
    timestamp: new Date().toISOString(),
    version:   process.env.APP_VERSION || '1.0.0'
  });
});

// GET all transactions (with optional filters)
app.get('/api/transactions', (req, res) => {
  const { type, category } = req.query;

  let result = [...transactions];

  // Filter by type if provided: ?type=income or ?type=expense
  if (type)     result = result.filter(t => t.type === type);

  // Filter by category if provided: ?category=Food
  if (category) result = result.filter(t => t.category.includes(category));

  res.json({
    success: true,
    count:   result.length,
    data:    result
  });
});

// GET single transaction by ID
app.get('/api/transactions/:id', (req, res) => {
  const txn = transactions.find(t => t.id === req.params.id);

  if (!txn) {
    return res.status(404).json({ success: false, error: 'Transaction not found' });
  }

  res.json({ success: true, data: txn });
});

// POST — Create new transaction
app.post('/api/transactions', (req, res) => {
  const { desc, amount, type, category, date } = req.body;

  // Validation
  if (!desc || !amount || !type || !category || !date) {
    return res.status(400).json({
      success: false,
      error: 'All fields required: desc, amount, type, category, date'
    });
  }

  if (!['income', 'expense'].includes(type)) {
    return res.status(400).json({
      success: false,
      error: 'Type must be either "income" or "expense"'
    });
  }

  if (isNaN(amount) || parseFloat(amount) <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Amount must be a positive number'
    });
  }

  const newTxn = {
    id:       Date.now().toString(),
    desc:     desc.trim(),
    amount:   parseFloat(amount),
    type,
    category,
    date,
    createdAt: new Date().toISOString()
  };

  transactions.push(newTxn);

  res.status(201).json({ success: true, data: newTxn });
});

// DELETE — Remove a transaction
app.delete('/api/transactions/:id', (req, res) => {
  const index = transactions.findIndex(t => t.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Transaction not found' });
  }

  transactions.splice(index, 1);

  res.json({ success: true, message: 'Transaction deleted successfully' });
});

// GET stats — Summary for dashboard
app.get('/api/stats', (req, res) => {
  const income  = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Group expenses by category
  const byCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  res.json({
    success: true,
    data: {
      totalIncome:  income,
      totalExpense: expense,
      netBalance:   income - expense,
      savingsRate:  income > 0 ? ((income - expense) / income * 100).toFixed(1) + '%' : '0%',
      totalCount:   transactions.length,
      byCategory
    }
  });
});

// Catch-all: serve frontend for any unknown route
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ── Start Server ──────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('  💸 Expensio API Started!');
  console.log('  ─────────────────────────────');
  console.log(`  🌐 URL:    http://localhost:${PORT}`);
  console.log(`  🔧 API:    http://localhost:${PORT}/api`);
  console.log(`  ❤️  Health: http://localhost:${PORT}/api/health`);
  console.log(`  📦 Mode:   ${process.env.NODE_ENV || 'development'}`);
  console.log('');
});

module.exports = app; // Export for testing
