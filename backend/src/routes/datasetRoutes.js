const express = require('express');
const router = express.Router();
const datasetController = require('../controllers/datasetController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', authenticate, datasetController.getDatasets);
router.post('/upload', authenticate, upload.single('file'), datasetController.uploadFile);
router.post('/validate', authenticate, datasetController.validateMapping);
router.post('/import', authenticate, datasetController.confirmImport);
router.get('/quality', authenticate, datasetController.getDataQuality);
router.get('/:id', authenticate, datasetController.getDatasetById);
router.patch('/:id/archive', authenticate, datasetController.archiveDataset);

module.exports = router;
