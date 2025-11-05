import React, { useState, useEffect } from 'react';
import { events } from '../api';
import Calendar from '../components/Calendar';
import EventModal from '../components/EventModal';
import EventList from '../components/EventList';

const Dashboard = () => {
  const [userEvents, setUserEvents] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'

  const fetchEvents = async () => {
    try {
      const response = await events.getMyEvents();
      setUserEvents(response.data);
    } catch (err) {
      setError('Failed to fetch events');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSaveEvent = async (eventData) => {
    setError('');
    setLoading(true);

    try {
      if (editEvent) {
        await events.update(editEvent._id, eventData);
      } else {
        await events.create(eventData);
      }
      setModalOpen(false);
      setEditEvent(null);
      fetchEvents();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setEditEvent(null);
    setModalOpen(true);
  };

  const handleEventClick = (event) => {
    setEditEvent(event);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditEvent(null);
  };

  const handleMakeSwappable = async (eventId) => {
    try {
      await events.updateStatus(eventId, 'SWAPPABLE');
      fetchEvents();
    } catch (err) {
      setError('Failed to update event status');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await events.delete(eventId);
      fetchEvents();
    } catch (err) {
      setError('Failed to delete event');
    }
  };

  return (
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '40px 24px'
    }}>
      <div className="animate-slide-up" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h1 style={{
              margin: '0 0 8px 0',
              fontSize: '36px',
              fontWeight: '700',
              color: '#111827'
            }}>
              My Calendar
            </h1>
            <p className="text-secondary" style={{ margin: 0, fontSize: '18px' }}>
              Manage your events and make them available for swapping
            </p>
          </div>
          
          <button
            className="glass-button-primary"
            onClick={() => {
              setEditEvent(null);
              setModalOpen(true);
            }}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
+ Add Event
          </button>
        </div>
        
        <div className="view-toggle">
          <button
            className={`glass-button ${viewMode === 'calendar' ? 'active' : ''}`}
            onClick={() => setViewMode('calendar')}
          >
Calendar View
          </button>
          <button
            className={`glass-button ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
List View
          </button>
        </div>
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

      {viewMode === 'calendar' ? (
        <Calendar
          events={userEvents}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
          selectedDate={selectedDate}
        />
      ) : (
        <div className="glass-card animate-slide-up">
          <h2 style={{
            margin: '0 0 20px 0',
            fontSize: '24px',
            fontWeight: '600',
            color: 'white'
          }}>
Your Events
          </h2>
          <EventList
            events={userEvents}
            onDelete={handleDeleteEvent}
            onMakeSwappable={handleMakeSwappable}
          />
        </div>
      )}

      <EventModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        selectedDate={selectedDate}
        editEvent={editEvent}
        loading={loading}
      />
    </div>
  );
};

export default Dashboard;