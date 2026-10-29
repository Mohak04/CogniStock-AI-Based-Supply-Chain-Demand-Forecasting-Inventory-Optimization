const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, recommendationController.getRecommendations);
router.post('/generate', authenticate, recommendationController.generateRecommendations);
router.patch('/:id/status', authenticate, recommendationController.updateRecommendationStatus);

module.exports = router;
