import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import TimePicker from './TimePicker';

const EventModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete,
  selectedDate, 
  editEvent = null,
  loading = false 
}) => {
  const [eventData, setEventData] = useState({
    title: '',
    startTime: '',
    endTime: '',
    description: ''
  });

  useEffect(() => {
    if (isOpen) {
      const baseDate = selectedDate || new Date();
      setEventData({
        title: editEvent?.title || '',
        startTime: editEvent?.startTime ? format(new Date(editEvent.startTime), "yyyy-MM-dd'T'HH:mm") : format(baseDate, "yyyy-MM-dd'T'HH:mm"),
        endTime: editEvent?.endTime ? format(new Date(editEvent.endTime), "yyyy-MM-dd'T'HH:mm") : format(new Date(baseDate.getTime() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
        description: editEvent?.description || ''
      });
    }
  }, [isOpen, selectedDate, editEvent]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(eventData);
  };

  const handleChange = (field, value) => {
    setEventData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="glass-modal event-modal animate-slide-up">
        <div className="modal-header">
          <h2>{editEvent ? 'Edit Event' : 'Create New Event'}</h2>
          <button className="close-btn glass-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="text-primary">Event Title</label>
            <input
              className="glass-input"
              type="text"
              value={eventData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter event title"
              required
            />
          </div>

          <div className="form-row">
            <TimePicker
              label="Start Time"
              value={eventData.startTime}
              onChange={(value) => handleChange('startTime', value)}
              required
            />
            <TimePicker
              label="End Time"
              value={eventData.endTime}
              onChange={(value) => handleChange('endTime', value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="text-primary">Description (Optional)</label>
            <textarea
              className="glass-input"
              value={eventData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Add event description..."
              rows="3"
            />
          </div>

          <div className="modal-actions">
            {editEvent && (
              <button
                type="button"
                className="glass-button"
                onClick={() => onDelete(editEvent._id)}
                style={{
                  background: '#dc2626',
                  color: '#ffffff',
                  borderColor: '#dc2626'
                }}
              >
                Delete
              </button>
            )}
            <button
              type="button"
              className="glass-button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="glass-button-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : (editEvent ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;