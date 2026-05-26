import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setIncomingAssignment, fetchAssignments } from "../features/worker/slice/workerSlice";
import { WS_BASE } from "../features/worker/services/workerAPI";

const RECONNECT_DELAY = 5000;
const MAX_RETRIES = 3;

const useWorkerSocket = () => {
  const dispatch = useDispatch();
  const token = useSelector((s) => s.auth.token);
  const retryCount = useRef(0);

  useEffect(() => {
    if (!token) return;

    // Local flag — reset every time the effect runs (StrictMode safe)
    let active = true;
    let ws = null;
    let retryTimer = null;

    const connect = () => {
      if (!active) return;
      if (retryCount.current >= MAX_RETRIES) {
        console.warn("[WS] Stopped retrying — run backend with daphne for real-time features.");
        return;
      }

      ws = new WebSocket(`${WS_BASE}/ws/notifications/?token=${token}`);

      ws.onopen = () => {
        if (!active) { ws.close(1000); return; }
        retryCount.current = 0;
        console.log("[WS] Connected");
      };

      ws.onmessage = (e) => {
        if (!active) return;
        try {
          const data = JSON.parse(e.data);
          if (data.type === "work_assignment") {
            dispatch(setIncomingAssignment(data.data));
            dispatch(fetchAssignments());
          }
          if (data.type === "work_status_update") {
            dispatch(fetchAssignments());
          }
        } catch { /* ignore */ }
      };

      ws.onerror = () => {
        retryCount.current += 1;
        if (retryCount.current === 1) {
          console.warn("[WS] WebSocket unavailable — real-time needs daphne. REST API still works.");
        }
      };

      ws.onclose = (e) => {
        if (!active || e.code === 1000 || e.code === 4001) return;
        retryTimer = setTimeout(connect, RECONNECT_DELAY);
      };
    };

    connect();

    return () => {
      active = false;
      clearTimeout(retryTimer);
      // Only close if not in CONNECTING state (avoids Chrome "closed before established" error)
      if (ws && ws.readyState !== WebSocket.CONNECTING) {
        ws.close(1000);
      }
    };
  }, [token, dispatch]);
};

export default useWorkerSocket;
