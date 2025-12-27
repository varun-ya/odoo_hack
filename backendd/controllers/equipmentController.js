const Equipment = require('../models/Equipment');
const MaintenanceRequest = require('../models/MaintenanceRequest');

// Get all equipment
const getEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find().populate('defaultTeam');
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get equipment by ID
const getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id).populate('defaultTeam');
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create equipment with workflow validation
const createEquipment = async (req, res) => {
  try {
    const equipment = new Equipment({
      ...req.body,
      status: 'active'
    });
    await equipment.save();
    await equipment.populate('defaultTeam');
    res.status(201).json(equipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update equipment
const updateEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('defaultTeam');
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Scrap equipment workflow
const scrapEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    // Update equipment status to scrapped
    equipment.status = 'scrapped';
    await equipment.save();
    
    // Block any future maintenance requests by updating existing ones
    await MaintenanceRequest.updateMany(
      { equipment: req.params.id, status: { $in: ['new', 'in_progress'] } },
      { status: 'scrap' }
    );
    
    res.json({ message: 'Equipment scrapped successfully', equipment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete equipment
const deleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndDelete(req.params.id);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  scrapEquipment,
  deleteEquipment
};