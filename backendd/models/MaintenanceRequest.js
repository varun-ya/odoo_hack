const mongoose = require('mongoose');

const maintenanceRequestSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['corrective', 'preventive'], 
    required: true 
  },
  equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  assignedTechnician: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { 
    type: String, 
    enum: ['new', 'in_progress', 'repaired', 'scrap'], 
    default: 'new' 
  },
  scheduledDate: Date,
  completedDate: Date,
  repairDuration: Number,
  description: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

maintenanceRequestSchema.virtual('isOverdue').get(function() {
  if (!this.scheduledDate || this.status === 'repaired' || this.status === 'scrap') {
    return false;
  }
  return new Date() > this.scheduledDate;
});

maintenanceRequestSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('MaintenanceRequest', maintenanceRequestSchema);