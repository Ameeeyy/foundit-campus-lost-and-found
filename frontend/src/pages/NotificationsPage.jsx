import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingRead, setMarkingRead] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.getNotifications();
        setNotifications(response.notifications || []);
      } catch (err) {
        setError(err.message || 'Unable to load notifications.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const markAllRead = async () => {
    setMarkingRead(true);
    setError('');
    try {
      await api.markNotificationsRead();
      setNotifications((current) => current.map((item) => ({ ...item, read: true })));
    } catch (err) {
      setError(err.message || 'Unable to mark notifications as read.');
    } finally {
      setMarkingRead(false);
    }
  };

  const hasUnread = notifications.some((item) => !item.read);

  return (
    <div className="page-block">
      <div className="page-header">
        <div>
          <span className="eyebrow">Updates</span>
          <h1>Notifications</h1>
        </div>
        {hasUnread && (
          <button className="button button-secondary" onClick={markAllRead} disabled={markingRead}>
            {markingRead ? 'Saving…' : 'Mark all as read'}
          </button>
        )}
      </div>

      {error && <div className="error-banner" role="alert">{error}</div>}
      {loading ? (
        <div className="loading-state">Loading notifications…</div>
      ) : notifications.length === 0 ? (
        error ? null : (
          <div className="empty-state">
            <h3>No notifications yet</h3>
            <p>When a match or claim updates, it will appear here.</p>
          </div>
        )
      ) : (
        <div className="notification-list">
          {notifications.map((item) => (
            <div key={item._id} className={`notification-item ${item.read ? '' : 'unread'}`}>
              <div className="notification-dot" />
              <div>
                <p>{item.message}</p>
                <small>{new Date(item.createdAt).toLocaleString()}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
