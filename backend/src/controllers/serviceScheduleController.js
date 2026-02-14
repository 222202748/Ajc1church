const ServiceSchedule = require('../models/ServiceSchedule');

// @route   POST api/service-schedules
// @desc    Create a service schedule
// @access  Private (Admin)
exports.createSchedule = async (req, res) => {
  try {
    const newSchedule = new ServiceSchedule(req.body);
    const schedule = await newSchedule.save();
    res.json(schedule);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET api/service-schedules
// @desc    Get all service schedules
// @access  Public
exports.getSchedules = async (req, res) => {
  try {
    const schedules = await ServiceSchedule.find().sort({ createdAt: -1 });
    res.json(schedules);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET api/service-schedules/:id
// @desc    Get schedule by ID
// @access  Public
exports.getScheduleById = async (req, res) => {
  try {
    const schedule = await ServiceSchedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({ msg: 'Schedule not found' });
    }
    res.json(schedule);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Schedule not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @route   PUT api/service-schedules/:id
// @desc    Update a service schedule
// @access  Private (Admin)
exports.updateSchedule = async (req, res) => {
  try {
    let schedule = await ServiceSchedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({ msg: 'Schedule not found' });
    }

    schedule = await ServiceSchedule.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(schedule);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   DELETE api/service-schedules/:id
// @desc    Delete a service schedule
// @access  Private (Admin)
exports.deleteSchedule = async (req, res) => {
  try {
    const schedule = await ServiceSchedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({ msg: 'Schedule not found' });
    }

    await ServiceSchedule.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Schedule removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
