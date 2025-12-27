const mongoose = require('mongoose');

const testActivitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  request: { type: mongoose.Schema.Types.ObjectId, ref: 'MaintenanceRequest' },
  status: { 
    type: String, 
    enum: ['not_started', 'in_progress', 'completed', 'locked'], 
    default: 'not_started' 
  },
  startedAt: Date,
  completedAt: Date,
  progress: { type: Number, default: 0 },
  notes: String,
  results: {
    score: Number,
    passed: Boolean,
    feedback: String
  },
  lastActivity: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('TestActivity', testActivitySchema);