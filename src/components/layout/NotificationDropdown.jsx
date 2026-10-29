import React, { useState, useEffect } from 'react';
import { Bell, Check, Info, ShieldAlert, Sparkles, Activity } from 'lucide-react';
import api from '../../services/api';

export const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api.get('/activity')
      .then((res) => {
        const logs = res.data?.data || [];
        if (logs.length > 0) {
          setNotifications(logs.slice(0, 5).map((l, idx) => ({
            id: l._id || idx,
            title: l.action || 'System Event',
            text: l.details || l.description || 'System operation recorded.',
            time: l.createdAt ? new Date(l.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
            type: l.status === 'Success' ? 'info' : 'danger',
            read: false
          })));
        } else {
          setNotifications([
            {
              id: 'init-1',
              title: "System Operational",
              text: "Forecasting and inventory intelligence services ready.",
              time: "Active",
              type: "info",
              read: true
            }
          ]);
        }
      })
      .catch(() => {
        setNotifications([
          {
            id: 'init-1',
            title: "Workspace Ready",
            text: "Demand forecasting and inventory replenishment engine active.",
            time: "Just now",
            type: "info",
            read: true
          }
        ]);
      });
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        title="System Notifications & Activity"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 animate-ping" />
        )}
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-blue-400" /> Notifications & Audit
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[11px] text-blue-400 hover:underline flex items-center gap-1 font-mono"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 text-xs transition-colors ${
                  !n.read ? 'bg-slate-800/40' : 'hover:bg-slate-800/20'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`font-bold ${n.type === 'danger' ? 'text-red-400' : 'text-slate-200'}`}>
                    {n.title}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{n.time}</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">{n.text}</p>
              </div>
            ))}
          </div>

          <div className="p-2 border-t border-slate-800 text-center bg-slate-950/40">
            <span className="text-[10px] text-slate-500 font-mono">CogniStock Audit Feed</span>
          </div>
        </div>
      )}
    </div>
  );
};
