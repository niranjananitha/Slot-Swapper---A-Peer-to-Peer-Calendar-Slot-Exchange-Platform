import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { swaps } from '../api';

const statusConfig = {
  PENDING: { emoji: '⏳', color: '#ffd43b', bg: 'rgba(255, 212, 59, 0.2)', border: 'rgba(255, 212, 59, 0.3)' },
  ACCEPTED: { emoji: '✅', color: '#51cf66', bg: 'rgba(81, 207, 102, 0.2)', border: 'rgba(81, 207, 102, 0.3)' },
  REJECTED: { emoji: '❌', color: '#ff6b6b', bg: 'rgba(255, 107, 107, 0.2)', border: 'rgba(255, 107, 107, 0.3)' }
};

const Requests = () => {
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const [incomingRes, outgoingRes] = await Promise.all([
        swaps.getIncomingRequests(),
        swaps.getOutgoingRequests()
      ]);
      setIncomingRequests(incomingRes.data);
      setOutgoingRequests(outgoingRes.data);
    } catch (err) {
      setError('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSwapResponse = async (requestId, accept) => {
    try {
      await swaps.respondToSwap(requestId, accept);
      fetchRequests();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to respond to swap request');
    }
  };

  const formatDateTime = (date) => {
    return format(new Date(date), 'MMM d, yyyy h:mm a');
  };

  const renderRequest = (request, type, index) => {
    const mySlot = type === 'outgoing' ? request.requesterSlot : request.requestedSlot;
    const theirSlot = type === 'outgoing' ? request.requestedSlot : request.requesterSlot;
    const otherUser = type === 'outgoing' ? request.requestee : request.requester;
    const statusInfo = statusConfig[request.status] || statusConfig.PENDING;

    return (
      <div
        key={request._id}
        className="glass-list-item animate-fade-in"
        style={{
          animationDelay: `${index * 0.1}s`
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '16px'
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827'
          }}>
            {type === 'outgoing'
              ? `You offered to swap with ${otherUser.name}`
              : `${otherUser.name} wants to swap with you`}
          </h3>
          
          <div 
            className="status-chip"
            style={{
              background: statusInfo.bg,
              color: statusInfo.color,
              border: `1px solid ${statusInfo.border}`
            }}
          >
            {statusInfo.emoji} {request.status}
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '16px'
        }}>
          <div style={{
            background: 'rgba(120, 119, 198, 0.15)',
            border: '1px solid rgba(120, 119, 198, 0.25)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <p style={{
              margin: '0 0 8px 0',
              fontSize: '14px',
              fontWeight: '500',
              color: 'rgba(255, 255, 255, 0.8)'
            }}>
              Your Slot
            </p>
            <h4 style={{
              margin: '0 0 8px 0',
              fontSize: '16px',
              fontWeight: '600',
              color: 'white'
            }}>
              {mySlot.title}
            </h4>
            <p className="text-secondary" style={{
              margin: 0,
              fontSize: '13px'
            }}>
              {formatDateTime(mySlot.startTime)}<br />
              {formatDateTime(mySlot.endTime)}
            </p>
          </div>

          <div style={{
            background: 'rgba(255, 119, 198, 0.15)',
            border: '1px solid rgba(255, 119, 198, 0.25)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <p style={{
              margin: '0 0 8px 0',
              fontSize: '14px',
              fontWeight: '500',
              color: 'rgba(255, 255, 255, 0.8)'
            }}>
              Their Slot
            </p>
            <h4 style={{
              margin: '0 0 8px 0',
              fontSize: '16px',
              fontWeight: '600',
              color: 'white'
            }}>
              {theirSlot.title}
            </h4>
            <p className="text-secondary" style={{
              margin: 0,
              fontSize: '13px'
            }}>
              {formatDateTime(theirSlot.startTime)}<br />
              {formatDateTime(theirSlot.endTime)}
            </p>
          </div>
        </div>

        {type === 'incoming' && request.status === 'PENDING' && (
          <div style={{
            display: 'flex',
            gap: '12px'
          }}>
            <button
              className="glass-button-primary"
              onClick={() => handleSwapResponse(request._id, true)}
              style={{
                flex: 1,
                padding: '12px',
                fontSize: '14px',
                fontWeight: '600',
                background: 'linear-gradient(135deg, rgba(81, 207, 102, 0.8), rgba(81, 207, 102, 0.6))'
              }}
            >
              Accept Swap
            </button>
            <button
              className="glass-button"
              onClick={() => handleSwapResponse(request._id, false)}
              style={{
                flex: 1,
                padding: '12px',
                fontSize: '14px',
                fontWeight: '600',
                background: 'rgba(255, 107, 107, 0.2)',
                borderColor: 'rgba(255, 107, 107, 0.3)'
              }}
            >
              Reject
            </button>
          </div>
        )}
      </div>
    );
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
            <p className="text-primary" style={{ margin: 0 }}>Loading requests...</p>
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
          Swap Requests
        </h1>
        <p className="text-secondary" style={{ margin: 0, fontSize: '18px' }}>
          Manage your incoming and outgoing swap requests
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

      <div className="glass-card animate-slide-up" style={{ marginBottom: '24px' }}>
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
            Incoming Requests
          </h2>
          
          {incomingRequests.length > 0 && (
            <div className="glass-button" style={{
              padding: '8px 16px',
              fontSize: '14px',
              background: 'rgba(255, 212, 59, 0.2)',
              borderColor: 'rgba(255, 212, 59, 0.3)',
              color: '#ffd43b'
            }}>
              {incomingRequests.filter(r => r.status === 'PENDING').length} pending
            </div>
          )}
        </div>
        
        {incomingRequests.length > 0 ? (
          incomingRequests.map((request, index) => renderRequest(request, 'incoming', index))
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'rgba(255, 255, 255, 0.6)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📨</div>
            <p style={{ margin: 0, fontSize: '16px' }}>
              No incoming requests yet
            </p>
          </div>
        )}
      </div>

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
            Outgoing Requests
          </h2>
          
          {outgoingRequests.length > 0 && (
            <div className="glass-button" style={{
              padding: '8px 16px',
              fontSize: '14px',
              background: 'rgba(120, 219, 255, 0.2)',
              borderColor: 'rgba(120, 219, 255, 0.3)',
              color: '#78dbff'
            }}>
              {outgoingRequests.length} sent
            </div>
          )}
        </div>
        
        {outgoingRequests.length > 0 ? (
          outgoingRequests.map((request, index) => renderRequest(request, 'outgoing', index))
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'rgba(255, 255, 255, 0.6)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📤</div>
            <p style={{ margin: 0, fontSize: '16px' }}>
              No outgoing requests yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Requests;