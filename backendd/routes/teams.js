const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam
} = require('../controllers/teamController');

router.get('/', authenticate, getTeams);
router.get('/:id', authenticate, getTeamById);
router.post('/', authenticate, createTeam);
router.put('/:id', authenticate, updateTeam);
router.delete('/:id', authenticate, deleteTeam);

module.exports = router;