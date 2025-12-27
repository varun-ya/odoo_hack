const MaintenanceRequest = require('../models/MaintenanceRequest');
const Equipment = require('../models/Equipment');

// Get all maintenance requests with role-based filtering
const getMaintenanceRequests = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'technician') {
      filter = { assignedTechnician: req.user.id };
    }
    
    const requests = await MaintenanceRequest.find(filter)
      .populate('equipment')
      .populate('team')
      .populate('createdBy', 'name email');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get kanban board data grouped by status
const getKanbanData = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'technician') {
      filter = { assignedTechnician: req.user.id };
    }
    
    const requests = await MaintenanceRequest.find(filter)
      .populate('equipment')
      .populate('team')
      .populate('assignedTechnician', 'name');
    
    const grouped = {
      new: requests.filter(r => r.status === 'new'),
      in_progress: requests.filter(r => r.status === 'in_progress'),
      repaired: requests.filter(r => r.status === 'repaired'),
      scrap: requests.filter(r => r.status === 'scrap')
    };
    
    res.json(grouped);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get maintenance requests for specific equipment
const getEquipmentMaintenance = async (req, res) => {
  try {
    const requests = await MaintenanceRequest.find({ equipment: req.params.equipmentId })
      .populate('team')
      .populate('assignedTechnician', 'name');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get calendar data for preventive maintenance
const getCalendarData = async (req, res) => {
  try {
    const requests = await MaintenanceRequest.find({ 
      type: 'preventive',
      scheduledDate: { $exists: true }
    })
    .populate('equipment', 'name')
    .select('subject scheduledDate equipment status');
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create maintenance request with workflow validation
const createMaintenanceRequest = async (req, res) => {
  try {
    const { equipment: equipmentId, type, scheduledDate } = req.body;
    
    // Check equipment exists and not scrapped
    const equipment = await Equipment.findById(equipmentId).populate('defaultTeam');
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    if (equipment.status === 'scrapped') {
      return res.status(400).json({ error: 'Cannot create maintenance for scrapped equipment' });
    }
    
    // Validate preventive maintenance date
    if (type === 'preventive' && scheduledDate && new Date(scheduledDate) <= new Date()) {
      return res.status(400).json({ error: 'Scheduled date must be in the future' });
    }
    
    const request = new MaintenanceRequest({
      ...req.body,
      equipment: equipmentId,
      team: equipment.defaultTeam._id,
      createdBy: req.user.id,
      status: 'new'
    });
    
    await request.save();
    await request.populate(['equipment', 'team', 'createdBy']);
    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update maintenance request status with validation
const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await MaintenanceRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Maintenance request not found' });
    }
    
    // Validate status transitions
    const validTransitions = {
      new: ['in_progress', 'scrap'],
      in_progress: ['repaired', 'scrap'],
      repaired: ['scrap'],
      scrap: []
    };
    
    if (!validTransitions[request.status].includes(status)) {
      return res.status(400).json({ error: 'Invalid status transition' });
    }
    
    // Handle scrap workflow
    if (status === 'scrap') {
      await Equipment.findByIdAndUpdate(request.equipment, { status: 'scrapped' });
    }
    
    // Update completion date for repaired status
    const updateData = { status };
    if (status === 'repaired') {
      updateData.completedDate = new Date();
    }
    
    const updatedRequest = await MaintenanceRequest.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    ).populate(['equipment', 'team', 'assignedTechnician']);
    
    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Assign technician to maintenance request
const assignTechnician = async (req, res) => {
  try {
    const { technicianId } = req.body;
    const request = await MaintenanceRequest.findById(req.params.id).populate('team');
    
    if (!request) {
      return res.status(404).json({ error: 'Maintenance request not found' });
    }
    
    // Verify technician belongs to assigned team
    const User = require('../models/User');
    const technician = await User.findById(technicianId);
    if (!technician || !request.team.members.includes(technicianId)) {
      return res.status(400).json({ error: 'Technician not in assigned team' });
    }
    
    const updatedRequest = await MaintenanceRequest.findByIdAndUpdate(
      req.params.id,
      { assignedTechnician: technicianId },
      { new: true }
    ).populate(['equipment', 'team', 'assignedTechnician']);
    
    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update repair duration
const updateRepairDuration = async (req, res) => {
  try {
    const { duration } = req.body;
    const updatedRequest = await MaintenanceRequest.findByIdAndUpdate(
      req.params.id,
      { repairDuration: duration },
      { new: true }
    ).populate(['equipment', 'team', 'assignedTechnician']);
    
    if (!updatedRequest) {
      return res.status(404).json({ error: 'Maintenance request not found' });
    }
    
    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getMaintenanceRequests,
  getKanbanData,
  getEquipmentMaintenance,
  getCalendarData,
  createMaintenanceRequest,
  updateRequestStatus,
  assignTechnician,
  updateRepairDuration
};