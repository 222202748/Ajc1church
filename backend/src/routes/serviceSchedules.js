const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const serviceScheduleController = require('../controllers/serviceScheduleController');

// @route   POST api/service-schedules
// @desc    Create a new service schedule
// @access  Private (Admin only)
router.post('/', auth, adminAuth, serviceScheduleController.createSchedule);

// @route   GET api/service-schedules
// @desc    Get all service schedules
// @access  Public
router.get('/', serviceScheduleController.getSchedules);

// @route   GET api/service-schedules/:id
// @desc    Get schedule by ID
// @access  Public
router.get('/:id', serviceScheduleController.getScheduleById);

// @route   PUT api/service-schedules/:id
// @desc    Update schedule
// @access  Private (Admin only)
router.put('/:id', auth, adminAuth, serviceScheduleController.updateSchedule);

// @route   DELETE api/service-schedules/:id
// @desc    Delete schedule
// @access  Private (Admin only)
router.delete('/:id', auth, adminAuth, serviceScheduleController.deleteSchedule);

module.exports = router;
