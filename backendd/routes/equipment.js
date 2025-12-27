const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  scrapEquipment,
  deleteEquipment
} = require('../controllers/equipmentController');

// Get all equipment (all authenticated users)
router.get('/', authenticate, getEquipment);

// Get equipment by ID (all authenticated users)
router.get('/:id', authenticate, getEquipmentById);

// Create equipment (all authenticated users)
router.post('/', authenticate, createEquipment);

// Update equipment (all authenticated users)
router.put('/:id', authenticate, updateEquipment);

// Scrap equipment workflow (admin and managers only)
router.put('/:id/scrap', authenticate, authorize(['admin', 'manager']), scrapEquipment);

// Delete equipment (admin only)
router.delete('/:id', authenticate, authorize(['admin']), deleteEquipment);

module.exports = router;