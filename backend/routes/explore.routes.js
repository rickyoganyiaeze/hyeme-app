const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.middleware');
const exploreController = require('../controllers/explore.controller');
const upload = require('../services/media.service');

router.get('/', protect, exploreController.getStatuses);
router.post('/create', protect, upload.array('media', 10), exploreController.createStatus);

module.exports = router;