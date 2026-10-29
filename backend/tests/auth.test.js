const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const { connectDB, closeDB } = require('../src/config/db');
const User = require('../src/models/User');
const Company = require('../src/models/Company');

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await closeDB();
});

describe('Authentication & Tenancy Security Tests', () => {
  const testEmail = `test_user_${Date.now()}@testcompany.demo`;
  let authToken = '';

  test('POST /api/v1/auth/register creates new company and user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        companyName: 'Acme Test Corp',
        name: 'Alice Tester',
        email: testEmail,
        password: 'Password123!',
        role: 'company_admin'
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testEmail);
    expect(res.body.user.role).toBe('company_admin');
    authToken = res.body.token;
  });

  test('POST /api/v1/auth/register fails on duplicate email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        companyName: 'Duplicate Corp',
        name: 'Bob',
        email: testEmail,
        password: 'Password123!'
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already exists/i);
  });

  test('POST /api/v1/auth/login succeeds with correct credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testEmail,
        password: 'Password123!'
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testEmail);
  });

  test('POST /api/v1/auth/login fails with invalid password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testEmail,
        password: 'WrongPassword999!'
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid email or password/i);
  });

  test('GET /api/v1/auth/me returns current session user', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(testEmail);
    expect(res.body.user.companyName).toBe('Acme Test Corp');
  });

  test('GET /api/v1/auth/me rejects request with invalid or missing token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer invalid_token_xyz');

    expect(res.status).toBe(401);
  });
});
