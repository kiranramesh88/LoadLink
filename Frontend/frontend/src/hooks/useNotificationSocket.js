import { useEffect, useRef, useCallback } from 'react';

const WS_BASE = import.meta.env.VITE_WS_URL;

/**
 * useNotificationSocket
 *
 * Connects to ws/notifications/?token=<JWT> and calls
 * onMessage(parsedEvent) whenever the backend pushes a notification.
 *
 * The socket reconnects automatically with exponential back-off.
 */
export default function useNotificationSocket(onMessage) {
  const wsRef      = useRef(null);
  const retryRef   = useRef(null);
  const retryDelay = useRef(1000);

  const getToken = () => localStorage.getItem('token') || null;

  const connect = useCallback(() => {
    const token = getToken();
    if (!token) return;

    const url = `${WS_BASE}/ws/notifications/?token=${token}`;
    const ws  = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[WS] Notification socket connected');
      retryDelay.current = 1000; // reset on successful connection
    };

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        onMessage?.(data);
      } catch {/* ignore parse errors */}
    };

    ws.onclose = (e) => {
      console.warn(`[WS] Notification socket closed (${e.code}), retrying in ${retryDelay.current}ms`);
      if (e.code !== 1000) { // 1000 = intentional close
        retryRef.current = setTimeout(() => {
          retryDelay.current = Math.min(retryDelay.current * 2, 30000);
          connect();
        }, retryDelay.current);
      }
    };

    ws.onerror = (err) => {
      console.error('[WS] Notification socket error', err);
      ws.close();
    };
  }, [onMessage]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(retryRef.current);
      if (wsRef.current) {
        wsRef.current.close(1000); // intentional
      }
    };
  }, [connect]);
}
