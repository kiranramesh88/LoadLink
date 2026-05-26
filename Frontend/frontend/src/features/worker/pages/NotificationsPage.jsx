import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markNotificationRead } from '../slice/workerSlice';

const NOTIF_ICONS = {
  work_assignment: { icon: 'assignment', color: 'text-blue-600', bg: 'bg-blue-50' },
  work_status_update: { icon: 'update', color: 'text-purple-600', bg: 'bg-purple-50' },
  payment: { icon: 'payments', color: 'text-green-600', bg: 'bg-green-50' },
  dispute: { icon: 'gavel', color: 'text-red-600', bg: 'bg-red-50' },
  general: { icon: 'notifications', color: 'text-on-surface-variant', bg: 'bg-surface-container' },
};

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const { notifications } = useSelector((s) => s.worker);
  const { user } = useSelector((s) => s.auth);
  const lang = user?.language || 'en';

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const unread = notifications.filter((n) => !n.is_read).length;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="min-h-screen bg-surface-bright">
      {/* Header */}
      <div className="bg-surface border-b border-outline-variant px-4 py-4 sticky top-0 z-10">
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <h1 className="text-xl font-bold text-on-surface">
            {lang === 'ml' ? 'അറിയിപ്പുകൾ' : 'Notifications'}
          </h1>
          {unread > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-primary text-white text-xs font-bold">
              {unread} {lang === 'ml' ? 'പുതിയത്' : 'new'}
            </span>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', boxSizing: 'border-box' }}>
        {notifications.length === 0 ? (
          <div className="py-20 text-center px-8">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/30">notifications_off</span>
            <p className="text-on-surface-variant mt-3 text-sm">
              {lang === 'ml' ? 'അറിയിപ്പുകൾ ഇല്ല' : 'No notifications yet'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant">
            {notifications.map((notif) => {
              const style = NOTIF_ICONS[notif.notification_type] || NOTIF_ICONS.general;
              return (
                <div
                  key={notif.notification_id}
                  onClick={() => !notif.is_read && dispatch(markNotificationRead(notif.notification_id))}
                  className={`flex gap-3 px-4 py-4 cursor-pointer hover:bg-surface-container transition-colors ${!notif.is_read ? 'bg-primary/3' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${style.bg}`}>
                    <span className={`material-symbols-outlined text-[20px] ${style.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                      {style.icon}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm leading-snug ${notif.is_read ? 'text-on-surface-variant' : 'text-on-surface font-semibold'}`}>
                        {notif.message}
                      </p>
                      {!notif.is_read && (
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1">{formatDate(notif.created_at)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
