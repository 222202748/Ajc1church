const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const eventController = require('../controllers/eventController');

// @route   POST api/events
// @desc    Create a new event
// @access  Private (Admin only)
router.post('/', auth, adminAuth, eventController.createEvent);

// @route   GET api/events
// @desc    Get all events
// @access  Public
router.get('/', eventController.getEvents);

// @route   GET api/events/:id
// @desc    Get event by ID
// @access  Public
router.get('/:id', eventController.getEventById);

// @route   PUT api/events/:id
// @desc    Update event
// @access  Private (Admin only)
router.put('/:id', auth, adminAuth, eventController.updateEvent);

// @route   DELETE api/events/:id
// @desc    Delete event
// @access  Private (Admin only)
router.delete('/:id', auth, adminAuth, eventController.deleteEvent);

module.exports = router;