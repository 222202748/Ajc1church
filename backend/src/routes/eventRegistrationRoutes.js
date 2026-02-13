const express = require('express');
const router = express.Router();
const EventRegistration = require('../models/eventRegistration');

// GET all registrations
router.get('/', async (req, res) => {
  try {
    const registrations = await EventRegistration.find();
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Stats
router.get('/stats', async (req, res) => {
  try {
    const registrations = await EventRegistration.find({}, 'status attendeeCount confirmed attended');
    const totalRegistrations = registrations.length;
    const totalAttendees = registrations.reduce((sum, r) => sum + (r.attendeeCount || 0), 0);
    const confirmedRegistrations = registrations.filter(r => r.status === 'confirmed' || r.confirmed).length;
    const confirmedAttendees = registrations
      .filter(r => r.status === 'confirmed' || r.confirmed)
      .reduce((sum, r) => sum + (r.attendeeCount || 0), 0);
    const pendingRegistrations = registrations.filter(r => r.status === 'pending').length;
    const cancelledRegistrations = registrations.filter(r => r.status === 'cancelled').length;
    const attendedRegistrations = registrations.filter(r => r.attended).length;
    const attendedAttendees = registrations
      .filter(r => r.attended)
      .reduce((sum, r) => sum + (r.attendeeCount || 0), 0);

    res.json({
      totalRegistrations,
      totalAttendees,
      confirmedRegistrations,
      confirmedAttendees,
      pendingRegistrations,
      cancelledRegistrations,
      attendedRegistrations,
      attendedAttendees
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST new registration
router.post('/', async (req, res) => {
  try {
    const registration = new EventRegistration({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      eventType: req.body.eventType,
      registrationDate: new Date(),
      status: 'pending',
      notes: req.body.notes,
      attendeeCount: req.body.attendeeCount,
      confirmed: false,
      attended: false
    });

    await registration.save();
    res.status(201).json(registration);
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// DELETE a registration by ID
router.delete('/:id', async (req, res) => {
  try {
    await EventRegistration.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

// Confirm a registration
router.patch('/:id/confirm', async (req, res) => {
  try {
    const updated = await EventRegistration.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'confirmed', confirmed: true } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

// Mark attendance
router.patch('/:id/attend', async (req, res) => {
  try {
    const updated = await EventRegistration.findByIdAndUpdate(
      req.params.id,
      { $set: { attended: true } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

module.exports = router;
