// ─────────────────────────────────────────────────────────
//  Expensio — API Tests
//  These run in Jenkins Stage 3 (Test)
// ─────────────────────────────────────────────────────────

const request = require('supertest');
const app     = require('./server');

describe('Expensio API Tests', () => {

  // Test 1: Health check endpoint
  test('GET /api/health should return OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('OK');
  });

  // Test 2: Get all transactions
  test('GET /api/transactions should return array', async () => {
    const res = await request(app).get('/api/transactions');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // Test 3: Create a new transaction
  test('POST /api/transactions should create transaction', async () => {
    const newTxn = {
      desc:     'Test Salary',
      amount:   10000,
      type:     'income',
      category: '💼 Salary',
      date:     '2026-01-01'
    };
    const res = await request(app).post('/api/transactions').send(newTxn);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.desc).toBe('Test Salary');
  });

  // Test 4: Validation — missing fields
  test('POST /api/transactions should fail without required fields', async () => {
    const res = await request(app).post('/api/transactions').send({ desc: 'Incomplete' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // Test 5: Stats endpoint
  test('GET /api/stats should return summary stats', async () => {
    const res = await request(app).get('/api/stats');
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('totalIncome');
    expect(res.body.data).toHaveProperty('totalExpense');
    expect(res.body.data).toHaveProperty('netBalance');
  });

  // Test 6: Delete non-existent transaction
  test('DELETE /api/transactions/:id should return 404 for unknown id', async () => {
    const res = await request(app).delete('/api/transactions/nonexistent999');
    expect(res.statusCode).toBe(404);
  });

});
