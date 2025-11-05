const mongoose = require('mongoose');

const SWAP_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED'
};

const swapRequestSchema = new mongoose.Schema({
  requesterSlot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  requestedSlot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: Object.values(SWAP_STATUS),
    default: SWAP_STATUS.PENDING
  }
}, {
  timestamps: true
});

// Ensure the same slot isn't involved in multiple pending swaps
swapRequestSchema.index({ requesterSlot: 1, status: 1 });
swapRequestSchema.index({ requestedSlot: 1, status: 1 });

const SwapRequest = mongoose.model('SwapRequest', swapRequestSchema);

module.exports = {
  SwapRequest,
  SWAP_STATUS
};