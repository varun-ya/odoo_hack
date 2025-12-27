const TestActivity = require('../models/TestActivity');
const MaintenanceRequest = require('../models/MaintenanceRequest');

// Get user's test activities
exports.getUserTestActivities = async (req, res) => {
  try {
    const activities = await TestActivity.find({ user: req.user._id })
      .populate('request', 'subject equipment')
      .populate({
        path: 'request',
        populate: { path: 'equipment', select: 'name' }
      })
      .sort({ lastActivity: -1 });
    
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get specific test activity
exports.getTestActivity = async (req, res) => {
  try {
    const activity = await TestActivity.findById(req.params.id)
      .populate('request')
      .populate('user', 'name email');
    
    if (!activity) {
      return res.status(404).json({ error: 'Test activity not found' });
    }
    
    // Check if user has access
    if (activity.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Start test activity
exports.startTestActivity = async (req, res) => {
  try {
    const { requestId } = req.body;
    
    // Check if test already exists for this user and request
    let activity = await TestActivity.findOne({ 
      user: req.user._id, 
      request: requestId 
    });
    
    if (activity) {
      if (activity.status === 'completed' || activity.status === 'locked') {
        return res.status(400).json({ error: 'Test already completed or locked' });
      }
      
      // Update existing activity
      activity.status = 'in_progress';
      activity.startedAt = new Date();
      activity.lastActivity = new Date();
    } else {
      // Create new activity
      activity = new TestActivity({
        user: req.user._id,
        request: requestId,
        status: 'in_progress',
        startedAt: new Date()
      });
    }
    
    await activity.save();
    await activity.populate('request', 'subject equipment');
    
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update test progress
exports.updateTestProgress = async (req, res) => {
  try {
    const { progress, notes } = req.body;
    
    const activity = await TestActivity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ error: 'Test activity not found' });
    }
    
    // Check access
    if (activity.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (activity.status === 'completed' || activity.status === 'locked') {
      return res.status(400).json({ error: 'Cannot update completed or locked test' });
    }
    
    activity.progress = progress;
    activity.notes = notes;
    activity.lastActivity = new Date();
    
    await activity.save();
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Complete test activity
exports.completeTestActivity = async (req, res) => {
  try {
    const { score, feedback } = req.body;
    
    const activity = await TestActivity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ error: 'Test activity not found' });
    }
    
    // Check access
    if (activity.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (activity.status === 'completed' || activity.status === 'locked') {
      return res.status(400).json({ error: 'Test already completed or locked' });
    }
    
    activity.status = 'completed';
    activity.completedAt = new Date();
    activity.progress = 100;
    activity.results = {
      score: score || 0,
      passed: score >= 70, // 70% passing score
      feedback: feedback || ''
    };
    
    await activity.save();
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lock test activity (admin only)
exports.lockTestActivity = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const activity = await TestActivity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ error: 'Test activity not found' });
    }
    
    activity.status = 'locked';
    await activity.save();
    
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};