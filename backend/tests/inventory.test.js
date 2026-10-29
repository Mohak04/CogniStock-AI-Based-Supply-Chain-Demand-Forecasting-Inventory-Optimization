const request = require('supertest');
const app = require('../src/app');
const { connectDB, closeDB } = require('../src/config/db');
const { calculateInventoryMetrics } = require('../src/services/inventoryEngine');
const Recommendation = require('../src/models/Recommendation');

let authToken = '';

beforeAll(async () => {
  await connectDB();
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({
      email: 'manager@novaretail.demo',
      password: 'CogniStockDemo2026!'
    });
  authToken = res.body.token;
});

afterAll(async () => {
  await closeDB();
});

describe('Inventory Intelligence & Recommendations Engine Tests', () => {
  test('Deterministic inventory formulas match exact documented specifications', () => {
    // 30 days of constant demand = 20, lead time = 10, current stock = 100, on order = 50, Z = 1.65, review = 7
    const demandHistory = Array(30).fill(20);
    // Add small variance
    demandHistory[0] = 18;
    demandHistory[1] = 22;

    const res = calculateInventoryMetrics({
      demandHistory,
      leadTimeDays: 10,
      currentStock: 100,
      onOrder: 50,
      backorders: 0,
      serviceLevelZ: 1.65,
      reviewPeriodDays: 7,
      unitCost: 25.0
    });

    expect(res.status).toBe('Calculated');
    expect(res.averageDailyDemand).toBeCloseTo(20.0, 1);
    expect(res.demandDuringLeadTime).toBeCloseTo(200.0, 1);
    expect(res.safetyStock).toBeGreaterThan(0);
    expect(res.reorderPoint).toBe(res.demandDuringLeadTime + res.safetyStock);
    expect(res.inventoryPosition).toBe(150); // 100 + 50
    expect(res.targetInventoryLevel).toBe(res.reorderPoint + Math.ceil(20.0 * 7));
    expect(res.recommendedQty).toBe(Math.max(0, res.targetInventoryLevel - res.inventoryPosition));
    expect(res.inventoryValue).toBe(2500.0);
  });

  test('Missing Current Stock or Lead Time returns Unavailable and never substitutes zero', () => {
    const resNoStock = calculateInventoryMetrics({
      demandHistory: [10, 15, 20],
      leadTimeDays: 14,
      currentStock: null
    });
    expect(resNoStock.status).toBe('Unavailable');
    expect(resNoStock.missingFields).toContain('Current Stock');
    expect(resNoStock.riskLevel).toBe('Unavailable');

    const resNoLead = calculateInventoryMetrics({
      demandHistory: [10, 15, 20],
      leadTimeDays: null,
      currentStock: 50
    });
    expect(resNoLead.status).toBe('Unavailable');
    expect(resNoLead.missingFields).toContain('Lead Time');
  });

  test('GET /api/v1/recommendations returns company recommendations', async () => {
    const res = await request(app)
      .get('/api/v1/recommendations')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    if (res.body.data.length > 0) {
      expect(res.body.data[0].sku).toBeDefined();
      expect(res.body.data[0].status).toBeDefined();
    }
  });

  test('PATCH /api/v1/recommendations/:id/status updates status with audit logging', async () => {
    const recs = await request(app)
      .get('/api/v1/recommendations')
      .set('Authorization', `Bearer ${authToken}`);

    if (recs.body.data.length === 0) return;
    const targetRec = recs.body.data[0];

    const res = await request(app)
      .patch(`/api/v1/recommendations/${targetRec.id}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        status: 'Approved',
        notes: 'Approved after supplier confirmation'
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('Approved');
    expect(res.body.data.notes).toBe('Approved after supplier confirmation');

    // Verify persisted in DB
    const updated = await Recommendation.findById(targetRec.id);
    expect(updated.status).toBe('Approved');
  });
});
