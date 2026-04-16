const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.middleware');
const settingsController = require('../controllers/settings.controller');
const upload = require('../services/media.service');

router.get('/', protect, settingsController.getSettings);
router.put('/profile', protect, upload.single('avatar'), settingsController.updateProfile);
router.put('/theme', protect, settingsController.updateTheme);
router.put('/privacy', protect, settingsController.updatePrivacy);

module.exports = router;