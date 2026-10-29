const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, productController.getProducts);
router.get('/:sku', authenticate, productController.getProductBySku);

module.exports = router;
