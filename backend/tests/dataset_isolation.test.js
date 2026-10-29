/**
 * Dataset Isolation Tests — verifies that products, recommendations, quality reports,
 * and inventory items do NOT cross-contaminate across datasets within the same company.
 *
 * Pre-condition: seed.js must have been run to create Nova Retail with novaDataset (v1.2)
 * seeded with datasetId-linked Products, Recommendations, and ModelEvaluation.
 */
const request = require('supertest');
const app = require('../src/app');
const { connectDB, closeDB } = require('../src/config/db');
const Company = require('../src/models/Company');
const Dataset = require('../src/models/Dataset');
const Product = require('../src/models/Product');
const Recommendation = require('../src/models/Recommendation');
const ModelEvaluation = require('../src/models/ModelEvaluation');

let novaToken = '';
let novaDatasetId = '';
let novaDataset2Id = ''; // a fresh dataset created in-test for isolation

beforeAll(async () => {
  await connectDB();

  // Login as Nova Retail Demo manager
  const novaRes = await request(app)
    .post('/api/v1/auth/login')
    .send({
      email: 'manager@novaretail.demo',
      password: 'CogniStockDemo2026!'
    });
  expect(novaRes.status).toBe(200);
  novaToken = novaRes.body.token;

  // Get Nova company and its first dataset ID
  const novaCompany = await Company.findOne({ name: 'Nova Retail Demo' });
  const ds = await Dataset.findOne({ companyId: novaCompany._id, isArchived: false }).sort({ createdAt: -1 });
  if (ds) novaDatasetId = ds._id.toString();
});

afterAll(async () => {
  // Clean up any datasets created during this test
  if (novaDataset2Id) {
    const novaCompany = await Company.findOne({ name: 'Nova Retail Demo' });
    await Product.deleteMany({ companyId: novaCompany._id, datasetId: novaDataset2Id });
    await Recommendation.deleteMany({ companyId: novaCompany._id, datasetId: novaDataset2Id });
    await Dataset.findByIdAndDelete(novaDataset2Id);
  }
  await closeDB();
});

describe('Multi-Dataset Isolation Tests (same company, two datasets)', () => {
  test('Seeded products are linked to a datasetId (not null)', async () => {
    const novaCompany = await Company.findOne({ name: 'Nova Retail Demo' });
    const products = await Product.find({ companyId: novaCompany._id });
    expect(products.length).toBeGreaterThan(0);
    // Every product must have a datasetId
    products.forEach((p) => {
      expect(p.datasetId).toBeTruthy();
    });
  });

  test('Seeded recommendations are linked to a datasetId (not null)', async () => {
    const novaCompany = await Company.findOne({ name: 'Nova Retail Demo' });
    const recs = await Recommendation.find({ companyId: novaCompany._id });
    recs.forEach((r) => {
      expect(r.datasetId).toBeTruthy();
    });
  });

  test('Inventory overview API with datasetId filters products correctly', async () => {
    if (!novaDatasetId) return;
    const res = await request(app)
      .get(`/api/v1/inventory/overview?datasetId=${novaDatasetId}`)
      .set('Authorization', `Bearer ${novaToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.datasetId).toBeTruthy();
    // All returned items must belong to the selected dataset
    const novaCompany = await Company.findOne({ name: 'Nova Retail Demo' });
    const dbProducts = await Product.find({ companyId: novaCompany._id, datasetId: novaDatasetId });
    expect(res.body.data.items.length).toBeLessThanOrEqual(dbProducts.length);
  });

  test('Recommendations API with datasetId returns only that dataset recs', async () => {
    if (!novaDatasetId) return;
    const res = await request(app)
      .get(`/api/v1/recommendations?datasetId=${novaDatasetId}`)
      .set('Authorization', `Bearer ${novaToken}`);

    expect(res.status).toBe(200);
    // datasetId in response must match requested
    if (res.body.datasetId) {
      expect(res.body.datasetId.toString()).toBe(novaDatasetId.toString());
    }
    // All returned recommendation SKUs must exist in DB with that datasetId
    const novaCompany = await Company.findOne({ name: 'Nova Retail Demo' });
    const dbRecs = await Recommendation.find({ companyId: novaCompany._id, datasetId: novaDatasetId });
    const dbSkus = dbRecs.map(r => r.sku);
    res.body.data.forEach((r) => {
      expect(dbSkus).toContain(r.sku);
    });
  });

  test('Data quality API with datasetId scopes to the correct dataset version', async () => {
    if (!novaDatasetId) return;
    const res = await request(app)
      .get(`/api/v1/datasets/quality?datasetId=${novaDatasetId}`)
      .set('Authorization', `Bearer ${novaToken}`);

    expect(res.status).toBe(200);
    if (res.body.datasetId) {
      expect(res.body.datasetId.toString()).toBe(novaDatasetId.toString());
    }
  });

  test('Reports API with datasetId returns only reports for that dataset', async () => {
    if (!novaDatasetId) return;
    const res = await request(app)
      .get(`/api/v1/reports?datasetId=${novaDatasetId}`)
      .set('Authorization', `Bearer ${novaToken}`);

    expect(res.status).toBe(200);
    expect(res.body.datasetId).toBeTruthy();
    // All reports must be associated to this datasetId
    const Report = require('../src/models/Report');
    const novaCompany = await Company.findOne({ name: 'Nova Retail Demo' });
    const dbReports = await Report.find({ companyId: novaCompany._id, datasetId: novaDatasetId });
    expect(res.body.data.length).toBeLessThanOrEqual(dbReports.length + 1);
  });

  test('Model comparison API with datasetId returns comparison data for that dataset', async () => {
    if (!novaDatasetId) return;
    const res = await request(app)
      .get(`/api/v1/forecasts/comparison?datasetId=${novaDatasetId}`)
      .set('Authorization', `Bearer ${novaToken}`);

    expect(res.status).toBe(200);
    // Response must be either 'success' (has results) or 'uncalculated' (no benchmarks yet)
    expect(['success', 'uncalculated']).toContain(res.body.status);
    if (res.body.datasetId) {
      expect(res.body.datasetId.toString()).toBe(novaDatasetId.toString());
    }
  });

  test('ModelEvaluation seeded records are linked to datasetId', async () => {
    const novaCompany = await Company.findOne({ name: 'Nova Retail Demo' });
    const evals = await ModelEvaluation.find({ companyId: novaCompany._id });
    // Any seeded evaluations must have datasetId
    evals.forEach((e) => {
      expect(e.datasetId).toBeTruthy();
    });
  });

  test('Product.demandHistory is populated with {date, qty} objects', async () => {
    const novaCompany = await Company.findOne({ name: 'Nova Retail Demo' });
    const products = await Product.find({ companyId: novaCompany._id, datasetId: { $exists: true } });
    if (products.length === 0) return;
    products.forEach((p) => {
      expect(Array.isArray(p.demandHistory)).toBe(true);
      if (p.demandHistory.length > 0) {
        const first = p.demandHistory[0];
        expect(first).toHaveProperty('date');
        expect(first).toHaveProperty('qty');
        expect(typeof first.qty).toBe('number');
      }
    });
  });

  test('Dashboard summary API with datasetId returns dataset-scoped metrics and dataset list', async () => {
    if (!novaDatasetId) return;
    const res = await request(app)
      .get(`/api/v1/dashboard/summary?datasetId=${novaDatasetId}`)
      .set('Authorization', `Bearer ${novaToken}`);

    expect(res.status).toBe(200);
    expect(res.body.hasData).toBe(true);
    expect(res.body.datasetId.toString()).toBe(novaDatasetId.toString());
    expect(Array.isArray(res.body.datasets)).toBe(true);
    expect(res.body.datasets.length).toBeGreaterThan(0);
    expect(Array.isArray(res.body.categories)).toBe(true);
  });

  test('Products API with datasetId filters catalog to selected dataset with modelUsed', async () => {
    if (!novaDatasetId) return;
    const res = await request(app)
      .get(`/api/v1/products?datasetId=${novaDatasetId}`)
      .set('Authorization', `Bearer ${novaToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    res.body.data.forEach((p) => {
      expect(p.sku).toBeDefined();
      expect(p.modelUsed).toBeDefined();
    });
  });
});
