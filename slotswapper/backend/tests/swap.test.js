const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../src/models/User');
const { Event, EVENT_STATUS } = require('../src/models/Event');
const { SwapRequest, SWAP_STATUS } = require('../src/models/SwapRequest');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Event.deleteMany({});
  await SwapRequest.deleteMany({});
});

describe('Swap Flow Tests', () => {
  let user1, user2, event1, event2;

  beforeEach(async () => {
    // Create test users
    user1 = await User.create({
      name: 'User 1',
      email: 'user1@test.com',
      password: 'password123'
    });

    user2 = await User.create({
      name: 'User 2',
      email: 'user2@test.com',
      password: 'password123'
    });

    // Create events
    event1 = await Event.create({
      title: 'Event 1',
      startTime: new Date('2023-12-01T10:00:00Z'),
      endTime: new Date('2023-12-01T11:00:00Z'),
      owner: user1._id,
      status: EVENT_STATUS.SWAPPABLE
    });

    event2 = await Event.create({
      title: 'Event 2',
      startTime: new Date('2023-12-02T14:00:00Z'),
      endTime: new Date('2023-12-02T15:00:00Z'),
      owner: user2._id,
      status: EVENT_STATUS.SWAPPABLE
    });
  });

  test('Complete swap flow', async () => {
    // Create swap request
    const swapRequest = await SwapRequest.create({
      requesterSlot: event1._id,
      requestedSlot: event2._id,
      requester: user1._id,
      requestee: user2._id
    });

    // Update events to SWAP_PENDING
    event1.status = EVENT_STATUS.SWAP_PENDING;
    event2.status = EVENT_STATUS.SWAP_PENDING;
    await Promise.all([event1.save(), event2.save()]);

    // Accept swap
    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      // Swap owners
      const temp = event1.owner;
      event1.owner = event2.owner;
      event2.owner = temp;

      // Update statuses
      event1.status = EVENT_STATUS.BUSY;
      event2.status = EVENT_STATUS.BUSY;
      swapRequest.status = SWAP_STATUS.ACCEPTED;

      await Promise.all([
        event1.save({ session }),
        event2.save({ session }),
        swapRequest.save({ session })
      ]);
    });
    session.endSession();

    // Verify final state
    const finalEvent1 = await Event.findById(event1._id);
    const finalEvent2 = await Event.findById(event2._id);
    const finalRequest = await SwapRequest.findById(swapRequest._id);

    expect(finalEvent1.owner.toString()).toBe(user2._id.toString());
    expect(finalEvent2.owner.toString()).toBe(user1._id.toString());
    expect(finalEvent1.status).toBe(EVENT_STATUS.BUSY);
    expect(finalEvent2.status).toBe(EVENT_STATUS.BUSY);
    expect(finalRequest.status).toBe(SWAP_STATUS.ACCEPTED);
  });

  test('Reject swap request', async () => {
    // Create swap request
    const swapRequest = await SwapRequest.create({
      requesterSlot: event1._id,
      requestedSlot: event2._id,
      requester: user1._id,
      requestee: user2._id
    });

    // Update events to SWAP_PENDING
    event1.status = EVENT_STATUS.SWAP_PENDING;
    event2.status = EVENT_STATUS.SWAP_PENDING;
    await Promise.all([event1.save(), event2.save()]);

    // Reject swap
    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      // Revert to SWAPPABLE
      event1.status = EVENT_STATUS.SWAPPABLE;
      event2.status = EVENT_STATUS.SWAPPABLE;
      swapRequest.status = SWAP_STATUS.REJECTED;

      await Promise.all([
        event1.save({ session }),
        event2.save({ session }),
        swapRequest.save({ session })
      ]);
    });
    session.endSession();

    // Verify final state
    const finalEvent1 = await Event.findById(event1._id);
    const finalEvent2 = await Event.findById(event2._id);
    const finalRequest = await SwapRequest.findById(swapRequest._id);

    expect(finalEvent1.owner.toString()).toBe(user1._id.toString());
    expect(finalEvent2.owner.toString()).toBe(user2._id.toString());
    expect(finalEvent1.status).toBe(EVENT_STATUS.SWAPPABLE);
    expect(finalEvent2.status).toBe(EVENT_STATUS.SWAPPABLE);
    expect(finalRequest.status).toBe(SWAP_STATUS.REJECTED);
  });
});