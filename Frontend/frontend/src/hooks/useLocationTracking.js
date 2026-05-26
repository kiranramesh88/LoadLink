import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { updateLocationApi } from "../features/worker/services/workerAPI";
import { updateLocation } from "../features/worker/slice/workerSlice";

const LOCATION_INTERVAL_MS = 30000; // 30 seconds

/**
 * useLocationTracking
 * Periodically sends the worker's GPS coordinates to the backend
 * while they have an active assignment.
 *
 * @param {boolean} isActive - Whether to start tracking
 */
const useLocationTracking = (isActive) => {
  const dispatch = useDispatch();
  const intervalRef = useRef(null);

  const sendLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const lat = parseFloat(latitude.toFixed(6));
        const lng = parseFloat(longitude.toFixed(6));
        try {
          await updateLocationApi(lat, lng);
          dispatch(updateLocation({ lat, lng }));
          console.log(`[GPS] Location updated: ${lat}, ${lng}`);
        } catch (err) {
          console.error("[GPS] Failed to send location:", err);
        }
      },
      (err) => console.error("[GPS] Geolocation error:", err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    if (isActive) {
      // Send immediately on activation
      sendLocation();
      // Then every 30 seconds
      intervalRef.current = setInterval(sendLocation, LOCATION_INTERVAL_MS);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive]);
};

export default useLocationTracking;
