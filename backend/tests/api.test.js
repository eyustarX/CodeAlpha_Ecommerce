const request = require('supertest');
const app = require('../src/app');

// Increase timeout for remote Neon queries
jest.setTimeout(25000);

describe('Alpha Store API - Automated Test Suite', () => {
  let authToken = '';
  let testUserId = '';
  const testEmail = `testuser_${Date.now()}@example.com`;

  // 1. Health check verification
  test('GET /health returns 200 and healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('Alpha Store');
  });

  // 2. Product Catalog verification
  test('GET /api/v1/products returns paginated products', async () => {
    const res = await request(app).get('/api/v1/products?page=1&limit=3');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toHaveProperty('totalItems');
    expect(res.body.meta).toHaveProperty('totalPages');
  });

  // 3. User Registration verification
  test('POST /api/v1/auth/register registers a new user and returns JWT', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Test Runner',
        email: testEmail,
        password: 'password123',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user.email).toBe(testEmail);

    authToken = res.body.data.token;
    testUserId = res.body.data.user.id;
  });

  // 4. Duplicate registration prevention
  test('POST /api/v1/auth/register rejects duplicate email with 409', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Test Runner 2',
        email: testEmail,
        password: 'password123',
      });

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  // 5. User Login verification
  test('POST /api/v1/auth/login authenticates valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testEmail,
        password: 'password123',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
  });

  // 6. Protected Route with Auth Token
  test('GET /api/v1/auth/me returns profile when authenticated', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.email).toBe(testEmail);
  });

  // 7. Protected Route rejects unauthorized access
  test('GET /api/v1/cart rejects unauthenticated request with 401', async () => {
    const res = await request(app).get('/api/v1/cart');
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // 8. Role-based authorization test
  test('POST /api/v1/products rejects customer attempt to create product with 403', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Hacker Product',
        description: 'Unauthorized creation',
        price: 10,
        category: 'Test',
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
