const express = require('express');
const mongoose = require('mongoose');
const { Event, EVENT_STATUS } = require('../models/Event');
const { SwapRequest, SWAP_STATUS } = require('../models/SwapRequest');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all swappable slots (excluding user's own)
router.get('/swappable-slots', auth, async (req, res) => {
  try {
    let query = {
      owner: { $ne: req.user._id },
      status: EVENT_STATUS.SWAPPABLE
    };
    
    // If user has familyId, exclude family members' slots
    if (req.user.familyId) {
      const familyUsers = await User.find({ familyId: req.user.familyId });
      const familyUserIds = familyUsers.map(user => user._id);
      query.owner = { $nin: familyUserIds };
    }
    
    const slots = await Event.find(query)
      .populate('owner', 'name email')
      .sort({ startTime: 1 });
    
    res.json(slots);
  } catch (error) {
    console.error('Swappable slots error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Request a swap
router.post('/swap-request', auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { mySlotId, theirSlotId } = req.body;

    // Verify both slots exist and are SWAPPABLE
    let mySlotQuery = { _id: mySlotId };
    
    if (req.user.familyId) {
      const familyUsers = await User.find({ familyId: req.user.familyId });
      const familyUserIds = familyUsers.map(user => user._id);
      mySlotQuery.owner = { $in: familyUserIds };
    } else {
      mySlotQuery.owner = req.user._id;
    }
    
    const [mySlot, theirSlot] = await Promise.all([
      Event.findOne(mySlotQuery).session(session),
      Event.findOne({ _id: theirSlotId }).session(session)
    ]);

    if (!mySlot || !theirSlot) {
      throw new Error('One or both slots not found');
    }

    if (mySlot.status !== EVENT_STATUS.SWAPPABLE || 
        theirSlot.status !== EVENT_STATUS.SWAPPABLE) {
      throw new Error('One or both slots are not available for swapping');
    }

    // Create swap request
    const swapRequest = new SwapRequest({
      requesterSlot: mySlotId,
      requestedSlot: theirSlotId,
      requester: req.user._id,
      requestee: theirSlot.owner
    });

    // Update both slots to SWAP_PENDING
    mySlot.status = EVENT_STATUS.SWAP_PENDING;
    theirSlot.status = EVENT_STATUS.SWAP_PENDING;

    await Promise.all([
      swapRequest.save({ session }),
      mySlot.save({ session }),
      theirSlot.save({ session })
    ]);

    await session.commitTransaction();
    res.status(201).json(swapRequest);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ error: error.message });
  } finally {
    session.endSession();
  }
});

// Respond to swap request
router.post('/swap-response/:requestId', auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { accept } = req.body;
    const swapRequest = await SwapRequest.findOne({
      _id: req.params.requestId,
      requestee: req.user._id,
      status: SWAP_STATUS.PENDING
    }).session(session);

    if (!swapRequest) {
      throw new Error('Swap request not found');
    }

    const [requesterSlot, requestedSlot] = await Promise.all([
      Event.findById(swapRequest.requesterSlot).session(session),
      Event.findById(swapRequest.requestedSlot).session(session)
    ]);

    if (accept) {
      // Swap the owners
      const tempOwner = requesterSlot.owner;
      requesterSlot.owner = requestedSlot.owner;
      requestedSlot.owner = tempOwner;

      // Update status
      requesterSlot.status = EVENT_STATUS.BUSY;
      requestedSlot.status = EVENT_STATUS.BUSY;
      swapRequest.status = SWAP_STATUS.ACCEPTED;
    } else {
      // Reject: revert slots to SWAPPABLE
      requesterSlot.status = EVENT_STATUS.SWAPPABLE;
      requestedSlot.status = EVENT_STATUS.SWAPPABLE;
      swapRequest.status = SWAP_STATUS.REJECTED;
    }

    await Promise.all([
      requesterSlot.save({ session }),
      requestedSlot.save({ session }),
      swapRequest.save({ session })
    ]);

    await session.commitTransaction();
    res.json({ message: accept ? 'Swap accepted' : 'Swap rejected' });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ error: error.message });
  } finally {
    session.endSession();
  }
});

// Get user's incoming swap requests
router.get('/incoming-requests', auth, async (req, res) => {
  try {
    const requests = await SwapRequest.find({
      requestee: req.user._id,
      status: SWAP_STATUS.PENDING
    })
    .populate('requesterSlot requestedSlot requester')
    .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's outgoing swap requests
router.get('/outgoing-requests', auth, async (req, res) => {
  try {
    const requests = await SwapRequest.find({
      requester: req.user._id
    })
    .populate('requesterSlot requestedSlot requestee')
    .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;