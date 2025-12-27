const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const testActivityController = require('../controllers/testActivityController');

// Get user's test activities
router.get('/', authenticate, testActivityController.getUserTestActivities);

// Get specific test activity
router.get('/:id', authenticate, testActivityController.getTestActivity);

// Start test activity
router.post('/start', authenticate, testActivityController.startTestActivity);

// Update test progress
router.put('/:id/progress', authenticate, testActivityController.updateTestProgress);

// Complete test activity
router.put('/:id/complete', authenticate, testActivityController.completeTestActivity);

// Lock test activity (admin/manager only)
router.put('/:id/lock', authenticate, testActivityController.lockTestActivity);

module.exports = router;