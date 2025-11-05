import React from 'react';
import { format } from 'date-fns';

const statusConfig = {
  BUSY: { class: 'status-busy', label: 'Busy' },
  SWAPPABLE: { class: 'status-swappable', label: 'Swappable' },
  SWAP_PENDING: { class: 'status-pending', label: 'Pending' }
};

const EventList = ({
  events,
  onDelete,
  onMakeSwappable,
  showOwner = false
}) => {
  const formatDateTime = (date) => {
    return format(new Date(date), 'MMM d, yyyy h:mm a');
  };

  if (events.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px 20px',
        color: 'rgba(255, 255, 255, 0.6)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px', color: '#d1d5db' }}>📅</div>
        <p style={{ margin: 0, fontSize: '16px' }}>
          {showOwner ? 'No swappable slots available' : 'No events yet. Create your first event!'}
        </p>
      </div>
    );
  }

  return (
    <div>
      {events.map((event, index) => {
        const statusInfo = statusConfig[event.status] || statusConfig.BUSY;
        
        return (
          <div
            key={event._id}
            className="glass-list-item animate-fade-in"
            style={{
              animationDelay: `${index * 0.1}s`
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '16px'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '8px'
                }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: '600',
                    color: 'white'
                  }}>
                    {event.title}
                  </h3>
                  <span className={`status-chip ${statusInfo.class}`}>
                    {statusInfo.label}
                  </span>
                </div>
                
                <p className="text-secondary" style={{
                  margin: '0 0 4px 0',
                  fontSize: '14px'
                }}>
                  {formatDateTime(event.startTime)} - {formatDateTime(event.endTime)}
                </p>
                
                {event.owner && (
                  <p className="text-muted" style={{
                    margin: '0 0 4px 0',
                    fontSize: '12px'
                  }}>
                    Created by {event.owner.name}
                  </p>
                )}
                
                {showOwner && event.owner && (
                  <p className="text-muted" style={{
                    margin: 0,
                    fontSize: '13px'
                  }}>
                    by {event.owner.name}
                  </p>
                )}
              </div>

              {!showOwner && (
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center'
                }}>
                  {event.status === 'BUSY' && (
                    <button
                      className="glass-button"
                      onClick={() => onMakeSwappable(event._id)}
                      style={{
                        padding: '8px 16px',
                        fontSize: '14px'
                      }}
                    >
                      Make Swappable
                    </button>
                  )}
                  <button
                    className="glass-button"
                    onClick={() => onDelete(event._id)}
                    style={{
                      padding: '8px 12px',
                      fontSize: '14px',
                      background: 'rgba(255, 107, 107, 0.2)',
                      borderColor: 'rgba(255, 107, 107, 0.3)'
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}

              {showOwner && onMakeSwappable && (
                <button
                  className="glass-button-primary"
                  onClick={() => onMakeSwappable(event)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px'
                  }}
                >
                  Request Swap
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EventList;