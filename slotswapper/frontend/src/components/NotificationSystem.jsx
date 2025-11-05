import React, { useState, useEffect } from 'react';
import { events } from '../api';
import { useAuth } from '../context/AuthContext';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  if (!user) return null;

  useEffect(() => {
    const checkUpcomingEvents = async () => {
      if (!user) return;
      
      try {
        const response = await events.getMyEvents();
        const now = new Date();
        const upcoming = response.data.filter(event => {
          const eventTime = new Date(event.startTime);
          const timeDiff = eventTime - now;
          return timeDiff > 0 && timeDiff <= 15 * 60 * 1000; // 15 minutes
        });

        const newNotifications = upcoming.map(event => ({
          id: event._id,
          title: event.title,
          time: new Date(event.startTime).toLocaleTimeString(),
          creator: event.owner?.name
        }));

        setNotifications(newNotifications);
      } catch (error) {
        console.error('Error checking events:', error);
      }
    };

    checkUpcomingEvents();
    const interval = setInterval(checkUpcomingEvents, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [user]);

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '80px',
      right: '20px',
      zIndex: 1001,
      maxWidth: '300px'
    }}>
      {notifications.map(notification => (
        <div
          key={notification.id}
          className="glass-card animate-slide-up"
          style={{
            marginBottom: '12px',
            padding: '16px',
            background: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '8px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600', color: '#92400e' }}>
                Event Starting Soon!
              </h4>
              <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#451a03' }}>
                {notification.title}
              </p>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#78350f' }}>
                At {notification.time}
              </p>
              {notification.creator && (
                <p style={{ margin: 0, fontSize: '11px', color: '#a16207' }}>
                  By {notification.creator}
                </p>
              )}
            </div>
            <button
              onClick={() => dismissNotification(notification.id)}
              style={{
                background: 'none',
                border: 'none',
                color: '#92400e',
                cursor: 'pointer',
                fontSize: '16px',
                padding: '0',
                marginLeft: '8px'
              }}
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationSystem;