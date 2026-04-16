const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.middleware');
const groupController = require('../controllers/group.controller');

router.post('/create', protect, groupController.createGroup);
router.post('/:groupId/add-member', protect, groupController.addMember);
router.put('/:groupId/permissions', protect, groupController.updatePermissions);

module.exports = router;