const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.middleware');
const userController = require('../controllers/user.controller');
const upload = require('../services/media.service'); // Import Multer

// ENABLE UPLOAD FOR ONBOARDING
router.put('/onboard', protect, upload.single('avatar'), userController.completeOnboarding); 

router.get('/search', protect, userController.searchUsers);
router.get('/notifications', protect, userController.getFriendRequests);
router.post('/connect', protect, userController.sendFriendRequest);
router.post('/connect/handle', protect, userController.handleFriendRequest);
router.post('/disconnect', protect, userController.disconnectUser);
router.get('/relationship/:id', protect, userController.checkRelationship);
router.get('/:id', protect, userController.getUserProfile);

module.exports = router;