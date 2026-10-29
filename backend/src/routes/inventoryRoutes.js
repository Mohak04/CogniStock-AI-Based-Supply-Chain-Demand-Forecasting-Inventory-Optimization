const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticate } = require('../middleware/auth');

router.get('/overview', authenticate, inventoryController.getInventoryOverview);
router.patch('/products/:sku', authenticate, inventoryController.updateProductInventory);

module.exports = router;
