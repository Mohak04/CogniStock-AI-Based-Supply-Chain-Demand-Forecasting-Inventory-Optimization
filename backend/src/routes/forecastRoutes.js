const express = require('express');
const router = express.Router();
const forecastController = require('../controllers/forecastController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, forecastController.getForecastRuns);
router.post('/runs', authenticate, forecastController.triggerForecastRun);
router.post('/generate', authenticate, forecastController.triggerForecastRun);
router.get('/comparison', authenticate, forecastController.getModelComparison);
router.get('/:id', authenticate, forecastController.getForecastRunById);
router.get('/sku/:sku', authenticate, forecastController.getForecastBySku);

module.exports = router;
