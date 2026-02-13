const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// @route   POST api/contact
// @desc    Send contact email
// @access  Public
router.post('/', contactController.sendContactEmail);

module.exports = router;