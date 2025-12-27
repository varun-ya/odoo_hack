const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  serialNumber: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  purchaseDate: Date,
  warrantyDate: Date,
  location: String,
  department: String,
  assignedEmployee: String,
  defaultTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  status: { 
    type: String, 
    enum: ['active', 'scrapped'], 
    default: 'active' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Equipment', equipmentSchema);