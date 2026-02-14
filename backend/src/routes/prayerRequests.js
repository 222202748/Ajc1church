const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const prayerRequestController = require('../controllers/prayerRequestController');

// @route   POST api/prayer-requests
// @desc    Submit a prayer request
// @access  Public
router.post('/', prayerRequestController.submitPrayerRequest);

// @route   GET api/prayer-requests
// @desc    Get all prayer requests
// @access  Private (Admin only)
router.get('/', auth, adminAuth, prayerRequestController.getPrayerRequests);

// @route   PUT api/prayer-requests/:id
// @desc    Update prayer request status
// @access  Private (Admin only)
router.put('/:id', auth, adminAuth, prayerRequestController.updateRequestStatus);

// @route   DELETE api/prayer-requests/:id
// @desc    Delete a prayer request
// @access  Private (Admin only)
router.delete('/:id', auth, adminAuth, prayerRequestController.deletePrayerRequest);

module.exports = router;
