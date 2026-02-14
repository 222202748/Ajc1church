const PrayerRequest = require('../models/PrayerRequest');

// @route   POST api/prayer-requests
// @desc    Submit a prayer request
// @access  Public
exports.submitPrayerRequest = async (req, res) => {
  try {
    const newRequest = new PrayerRequest(req.body);
    const request = await newRequest.save();

    // Trigger notification logic if needed (e.g., via a shared utility or model method)
    // For now, we return the request. The frontend can handle additional notifications if desired.
    
    res.json(request);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET api/prayer-requests
// @desc    Get all prayer requests
// @access  Private (Admin only)
exports.getPrayerRequests = async (req, res) => {
  try {
    const requests = await PrayerRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   PUT api/prayer-requests/:id
// @desc    Update prayer request status
// @access  Private (Admin only)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await PrayerRequest.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );
    res.json(request);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   DELETE api/prayer-requests/:id
// @desc    Delete a prayer request
// @access  Private (Admin only)
exports.deletePrayerRequest = async (req, res) => {
  try {
    await PrayerRequest.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Prayer request removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
