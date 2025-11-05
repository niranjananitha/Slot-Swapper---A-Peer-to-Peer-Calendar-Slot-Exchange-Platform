import React from 'react';
import { format } from 'date-fns';

const SwapModal = ({
  open,
  onClose,
  targetSlot,
  mySwappableSlots,
  onRequestSwap
}) => {
  const formatDateTime = (date) => {
    return format(new Date(date), 'MMM d, yyyy h:mm a');
  };

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div 
        className="glass-modal animate-slide-up" 
        style={{
          width: '100%',
          maxWidth: '500px',
          maxHeight: '80vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{
          padding: '24px 24px 16px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h2 style={{
            margin: '0 0 12px 0',
            fontSize: '24px',
            fontWeight: '600',
            color: 'white'
          }}>
            🔄 Choose Your Slot to Swap
          </h2>
          
          {targetSlot && (
            <div style={{
              background: 'rgba(120, 119, 198, 0.2)',
              border: '1px solid rgba(120, 119, 198, 0.3)',
              borderRadius: '12px',
              padding: '12px 16px'
            }}>
              <p className="text-primary" style={{
                margin: '0 0 4px 0',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                🎯 Requesting to swap for:
              </p>
              <p style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: '600',
                color: 'white'
              }}>
                {targetSlot.title}
              </p>
              <p className="text-secondary" style={{
                margin: '4px 0 0 0',
                fontSize: '14px'
              }}>
                🕰️ {formatDateTime(targetSlot.startTime)}
              </p>
            </div>
          )}
        </div>

        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '16px 24px'
        }}>
          {mySwappableSlots.length > 0 ? (
            <div>
              <p className="text-secondary" style={{
                margin: '0 0 16px 0',
                fontSize: '14px'
              }}>
                Select one of your swappable slots:
              </p>
              
              {mySwappableSlots.map((slot, index) => (
                <div
                  key={slot._id}
                  className="glass-list-item"
                  onClick={() => onRequestSwap(slot._id)}
                  style={{
                    cursor: 'pointer',
                    animationDelay: `${index * 0.1}s`,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <h3 style={{
                    margin: '0 0 8px 0',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: 'white'
                  }}>
                    {slot.title}
                  </h3>
                  <p className="text-secondary" style={{
                    margin: 0,
                    fontSize: '14px'
                  }}>
                    🕰️ {formatDateTime(slot.startTime)} - {formatDateTime(slot.endTime)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
              <p className="text-secondary" style={{
                margin: 0,
                fontSize: '16px',
                lineHeight: '1.5'
              }}>
                You don't have any swappable slots.<br />
                Mark some of your events as swappable first.
              </p>
            </div>
          )}
        </div>

        <div style={{
          padding: '16px 24px 24px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <button
            className="glass-button"
            onClick={onClose}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            ❌ Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SwapModal;