const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/tenancy');

router.get('/', authenticate, companyController.getCompany);
router.patch('/', authenticate, requireRole(['company_admin']), companyController.updateCompany);

module.exports = router;
