const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, reportController.getReports);
router.post('/', authenticate, reportController.generateReport);
router.get('/:id', authenticate, reportController.getReportById);
router.get('/:id/download', authenticate, reportController.downloadReport);

module.exports = router;
