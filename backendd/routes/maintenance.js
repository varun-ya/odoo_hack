const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getMaintenanceRequests,
  getKanbanData,
  getEquipmentMaintenance,
  getCalendarData,
  createMaintenanceRequest,
  updateRequestStatus,
  assignTechnician,
  updateRepairDuration
} = require('../controllers/maintenanceController');
const TestActivity = require('../models/TestActivity');
const MaintenanceRequest = require('../models/MaintenanceRequest');

// Get all maintenance requests (role-based filtering)
router.get('/', authenticate, getMaintenanceRequests);

// Get kanban board data
router.get('/kanban', authenticate, getKanbanData);

// Get maintenance requests for specific equipment
router.get('/equipment/:equipmentId', authenticate, getEquipmentMaintenance);

// Get calendar data for preventive maintenance
router.get('/calendar', authenticate, getCalendarData);

// Create maintenance request (all roles can create)
router.post('/', authenticate, authorize(['admin', 'manager', 'user']), createMaintenanceRequest);

// Update maintenance request status (managers and technicians)
router.put('/:id/status', authenticate, authorize(['admin', 'manager', 'technician']), updateRequestStatus);

// Assign technician (managers only)
router.put('/:id/assign', authenticate, authorize(['admin', 'manager']), assignTechnician);

// Update repair duration (technicians only)
router.put('/:id/duration', authenticate, authorize(['admin', 'technician']), updateRepairDuration);

// Get single maintenance request by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const request = await MaintenanceRequest.findById(req.params.id)
      .populate('equipment')
      .populate('team')
      .populate('createdBy', 'name email')
      .populate('assignedTechnician', 'name email');
    
    if (!request) {
      return res.status(404).json({ error: 'Maintenance request not found' });
    }
    
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete maintenance request
router.delete('/:id', authenticate, authorize(['admin', 'manager']), async (req, res) => {
  try {
    const request = await MaintenanceRequest.findByIdAndDelete(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Maintenance request not found' });
    }
    res.json({ message: 'Maintenance request deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update maintenance request
router.put('/:id', authenticate, async (req, res) => {
  try {
    const updatedRequest = await MaintenanceRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate(['equipment', 'team', 'assignedTechnician']);
    
    if (!updatedRequest) {
      return res.status(404).json({ error: 'Maintenance request not found' });
    }
    
    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test Activity lifecycle endpoint
router.post('/test-activity', authenticate, async (req, res) => {
  try {
    const { action } = req.body;
    const userId = req.user.id;
    
    switch (action) {
      case 'access':
        const activityState = await getTestActivityState(userId);
        res.json(activityState);
        break;
        
      case 'start':
        const startedActivity = await startTestActivity(userId);
        res.json(startedActivity);
        break;
        
      case 'complete':
        const completedActivity = await completeTestActivity(userId);
        res.json(completedActivity);
        break;
        
      default:
        res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save test progress
router.post('/test-activity/progress', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const progressData = req.body;
    
    await saveTestProgress(userId, progressData);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper functions for test activity lifecycle
async function getTestActivityState(userId) {
  const existingActivity = await TestActivity.findOne({ user: userId });
  
  if (!existingActivity) {
    const sampleRequest = await MaintenanceRequest.findOne().populate(['equipment', 'team']);
    return {
      status: 'not_started',
      request: sampleRequest,
      allowedActions: ['start'],
      metadata: {}
    };
  }
  
  if (existingActivity.status === 'completed') {
    return {
      status: 'completed',
      request: existingActivity.request,
      allowedActions: ['view'],
      metadata: {
        completedAt: existingActivity.completedAt,
        results: existingActivity.results
      }
    };
  }
  
  if (existingActivity.status === 'in_progress') {
    return {
      status: 'in_progress',
      request: existingActivity.request,
      allowedActions: ['resume', 'complete'],
      metadata: {
        progress: existingActivity.progress,
        startedAt: existingActivity.startedAt
      }
    };
  }
  
  return {
    status: 'locked',
    request: null,
    allowedActions: [],
    metadata: { lockReason: 'Test unavailable' }
  };
}

async function startTestActivity(userId) {
  const sampleRequest = await MaintenanceRequest.findOne().populate(['equipment', 'team']);
  
  const testActivity = new TestActivity({
    user: userId,
    request: sampleRequest._id,
    status: 'in_progress',
    startedAt: new Date(),
    progress: 0
  });
  
  await testActivity.save();
  
  return {
    success: true,
    testContent: {
      instructions: 'Complete the maintenance request form',
      steps: ['Fill in notes', 'Set priority', 'Submit']
    }
  };
}

async function completeTestActivity(userId) {
  const activity = await TestActivity.findOne({ user: userId, status: 'in_progress' });
  
  if (!activity) {
    throw new Error('No active test found');
  }
  
  activity.status = 'completed';
  activity.completedAt = new Date();
  activity.progress = 100;
  activity.results = { score: 95, passed: true };
  
  await activity.save();
  
  return {
    success: true,
    results: activity.results,
    completedAt: activity.completedAt
  };
}

async function saveTestProgress(userId, progressData) {
  await TestActivity.findOneAndUpdate(
    { user: userId, status: 'in_progress' },
    { 
      progress: progressData.progress || 50,
      notes: progressData.notes,
      lastActivity: new Date()
    }
  );
}

module.exports = router;