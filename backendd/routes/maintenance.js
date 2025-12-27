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

module.exports = router;