const request = require('supertest');
const app = require('../src/app');
const { connectDB, closeDB } = require('../src/config/db');
const Company = require('../src/models/Company');
const User = require('../src/models/User');
const Dataset = require('../src/models/Dataset');
const Product = require('../src/models/Product');
const Recommendation = require('../src/models/Recommendation');
const Report = require('../src/models/Report');

let novaToken = '';
let summitToken = '';
let summitDatasetId = '';
let summitProductId = '';
let summitRecId = '';
let summitReportId = '';

beforeAll(async () => {
  await connectDB();

  // Login as Nova Retail Demo manager
  const novaRes = await request(app)
    .post('/api/v1/auth/login')
    .send({
      email: 'manager@novaretail.demo',
      password: 'CogniStockDemo2026!'
    });
  novaToken = novaRes.body.token;

  // Login as Summit Supplies Demo manager
  const summitRes = await request(app)
    .post('/api/v1/auth/login')
    .send({
      email: 'manager@summitsupplies.demo',
      password: 'CogniStockDemo2026!'
    });
  summitToken = summitRes.body.token;

  // Obtain a Summit resource ID
  const summitCompany = await Company.findOne({ name: 'Summit Supplies Demo' });
  const sDataset = await Dataset.findOne({ companyId: summitCompany._id });
  if (sDataset) summitDatasetId = sDataset._id.toString();

  const sProduct = await Product.findOne({ companyId: summitCompany._id });
  if (sProduct) summitProductId = sProduct._id.toString();

  const sRec = await Recommendation.findOne({ companyId: summitCompany._id });
  if (sRec) summitRecId = sRec._id.toString();

  const sReport = await Report.findOne({ companyId: summitCompany._id });
  if (sReport) summitReportId = sReport._id.toString();
});

afterAll(async () => {
  await closeDB();
});

describe('Strict Tenant Isolation Verification Tests', () => {
  test('Company A cannot read Company B dataset list', async () => {
    const res = await request(app)
      .get('/api/v1/datasets')
      .set('Authorization', `Bearer ${novaToken}`);

    expect(res.status).toBe(200);
    // Every dataset returned must belong only to Nova Retail
    res.body.data.forEach((ds) => {
      expect(ds.name).not.toMatch(/Summit/i);
    });
  });

  test('Company A cannot read Company B specific dataset by ID', async () => {
    if (!summitDatasetId) return;
    const res = await request(app)
      .get(`/api/v1/datasets/${summitDatasetId}`)
      .set('Authorization', `Bearer ${novaToken}`);

    // Must return 404 because query is scoped to authenticated companyId
    expect(res.status).toBe(404);
  });

  test('Company A cannot read Company B products catalog', async () => {
    const res = await request(app)
      .get('/api/v1/products')
      .set('Authorization', `Bearer ${novaToken}`);

    expect(res.status).toBe(200);
    const skus = res.body.data.map(p => p.sku);
    // Summit products start with SUM-
    expect(skus).not.toContain('SUM-201');
    expect(skus).not.toContain('SUM-202');
  });

  test('Company A cannot read Company B specific product by SKU', async () => {
    const res = await request(app)
      .get('/api/v1/products/SUM-201')
      .set('Authorization', `Bearer ${novaToken}`);

    expect(res.status).toBe(404);
  });

  test('Company A cannot update Company B inventory', async () => {
    const res = await request(app)
      .patch('/api/v1/inventory/products/SUM-201')
      .set('Authorization', `Bearer ${novaToken}`)
      .send({ currentStock: 999 });

    expect(res.status).toBe(404);
  });

  test('Company A cannot update Company B recommendation status', async () => {
    if (!summitRecId) return;
    const res = await request(app)
      .patch(`/api/v1/recommendations/${summitRecId}/status`)
      .set('Authorization', `Bearer ${novaToken}`)
      .send({ status: 'Approved' });

    expect(res.status).toBe(404);
  });

  test('Company A cannot download Company B report PDF even with ID', async () => {
    if (!summitReportId) return;
    const res = await request(app)
      .get(`/api/v1/reports/${summitReportId}/download`)
      .set('Authorization', `Bearer ${novaToken}`);

    expect(res.status).toBe(404);
  });
});
