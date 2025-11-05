const express = require('express');
const { Event, EVENT_STATUS } = require('../models/Event');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get family events
router.get('/my-events', auth, async (req, res) => {
  try {
    let events;
    
    if (req.user.familyId) {
      // Get all users in the same family
      const familyUsers = await User.find({ familyId: req.user.familyId });
      const familyUserIds = familyUsers.map(user => user._id);
      
      // Get all events from family members
      events = await Event.find({ owner: { $in: familyUserIds } })
        .populate('owner', 'name')
        .sort({ startTime: 1 });
    } else {
      // Fallback to user's own events if no familyId
      events = await Event.find({ owner: req.user._id })
        .populate('owner', 'name')
        .sort({ startTime: 1 });
    }
    
    res.json(events);
  } catch (error) {
    console.error('Events fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new event
router.post('/', auth, async (req, res) => {
  try {
    const { title, startTime, endTime, description } = req.body;
    const event = new Event({
      title,
      description: description || '',
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      owner: req.user._id
    });
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update event (family members can edit)
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, startTime, endTime, description } = req.body;
    
    // Get all family members
    const familyUsers = await User.find({ familyId: req.user.familyId });
    const familyUserIds = familyUsers.map(user => user._id);
    
    const event = await Event.findOne({
      _id: req.params.id,
      owner: { $in: familyUserIds }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (title) event.title = title;
    if (startTime) event.startTime = new Date(startTime);
    if (endTime) event.endTime = new Date(endTime);
    if (description !== undefined) event.description = description;

    await event.save();
    await event.populate('owner', 'name');
    res.json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update event status (family members can update)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!Object.values(EVENT_STATUS).includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Get all family members
    const familyUsers = await User.find({ familyId: req.user.familyId });
    const familyUserIds = familyUsers.map(user => user._id);

    const event = await Event.findOne({
      _id: req.params.id,
      owner: { $in: familyUserIds }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    event.status = status;
    await event.save();
    await event.populate('owner', 'name');
    res.json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete event (family members can delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Get all family members
    const familyUsers = await User.find({ familyId: req.user.familyId });
    const familyUserIds = familyUsers.map(user => user._id);
    
    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      owner: { $in: familyUserIds }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;