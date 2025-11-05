import React, { useState, useEffect } from 'react';
import { swaps, events } from '../api';
import EventList from '../components/EventList';
import SwapModal from '../components/SwapModal';

const Marketplace = () => {
  const [swappableSlots, setSwappableSlots] = useState([]);
  const [mySwappableSlots, setMySwappableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchSwappableSlots = async () => {
    try {
      const response = await swaps.getSwappableSlots();
      setSwappableSlots(response.data);
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Fetch swappable slots error:', err);
      setError('Failed to fetch swappable slots: ' + (err.response?.data?.error || err.message));
    }
  };

  const fetchMySwappableSlots = async () => {
    try {
      const response = await events.getMyEvents();
      setMySwappableSlots(
        response.data.filter((event) => event.status === 'SWAPPABLE')
      );
    } catch (err) {
      console.error('Fetch my swappable slots error:', err);
      setError('Failed to fetch your swappable slots: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSwappableSlots();
    fetchMySwappableSlots();
  }, []);

  const handleRequestSwap = async (mySlotId) => {
    try {
      await swaps.requestSwap({
        mySlotId,
        theirSlotId: selectedSlot._id
      });
      setModalOpen(false);
      setSelectedSlot(null);
      // Refresh the lists
      fetchSwappableSlots();
      fetchMySwappableSlots();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to request swap');
    }
  };

  const handleInitiateSwap = (slot) => {
    setSelectedSlot(slot);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '60vh'
      }}>
        <div className="glass-card animate-fade-in">
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
            <p className="text-primary" style={{ margin: 0 }}>Loading marketplace...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '40px 24px'
    }}>
      <div className="animate-slide-up" style={{ marginBottom: '32px' }}>
        <h1 style={{
          margin: '0 0 8px 0',
          fontSize: '36px',
          fontWeight: '700',
          color: '#111827'
        }}>
          Swap Marketplace
        </h1>
        <p className="text-secondary" style={{ margin: 0, fontSize: '18px' }}>
          Discover and request swaps with other users
        </p>
      </div>

      {error && (
        <div className="animate-fade-in" style={{
          background: 'rgba(255, 107, 107, 0.2)',
          border: '1px solid rgba(255, 107, 107, 0.3)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          color: '#ff6b6b',
          fontSize: '14px'
        }}>
          ⚠️ {error}
        </div>
      )}

      <div className="glass-card animate-slide-up">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: '600',
            color: 'white'
          }}>
            Available Slots ({swappableSlots.length})
          </h2>
          
          {swappableSlots.length > 0 && (
            <div className="glass-button" style={{
              padding: '8px 16px',
              fontSize: '14px',
              background: 'rgba(81, 207, 102, 0.2)',
              borderColor: 'rgba(81, 207, 102, 0.3)',
              color: '#51cf66'
            }}>
              {swappableSlots.length} slots available
            </div>
          )}
        </div>
        
        <EventList
          events={swappableSlots}
          showOwner
          onMakeSwappable={handleInitiateSwap}
        />
      </div>

      <SwapModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        targetSlot={selectedSlot}
        mySwappableSlots={mySwappableSlots}
        onRequestSwap={handleRequestSwap}
      />
    </div>
  );
};

export default Marketplace;