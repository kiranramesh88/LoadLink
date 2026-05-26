import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardData } from '../slice/workerSlice';
import useLocationTracking from '../../../hooks/useLocationTracking';

const LiveTrackingPage = () => {
  const dispatch = useDispatch();
  const { activeWork } = useSelector((s) => s.worker);
  const { user } = useSelector((s) => s.auth);
  const lang = user?.language || 'en';

  const [myLocation, setMyLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLocating, setIsLocating] = useState(true);

  // Push GPS to server every 30s while assignment is active
  useLocationTracking(!!activeWork);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  // Watch the device GPS continuously to show current coords
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported by this browser.');
      setIsLocating(false);
      return;
    }

    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        setMyLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy });
        setIsLocating(false);
        setLocationError(null);
      },
      (err) => {
        setLocationError('Could not get location. Please enable GPS.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, []);

  // Build the external Google Maps direction URL
  const getDirectionUrl = () => {
    if (!activeWork) return null;
    const lat = activeWork.latitude || activeWork.work_latitude;
    const lng = activeWork.longitude || activeWork.work_longitude;
    const addr = activeWork.work_address;

    if (lat && lng) {
      if (myLocation) {
        return `https://www.google.com/maps/dir/${myLocation.lat},${myLocation.lng}/${lat},${lng}`;
      }
      return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    }
    if (addr) {
      return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addr)}`;
    }
    return null;
  };

  // View work location on map (no routing)
  const getViewLocationUrl = () => {
    if (!activeWork) return null;
    const lat = activeWork.latitude || activeWork.work_latitude;
    const lng = activeWork.longitude || activeWork.work_longitude;
    const addr = activeWork.work_address;
    if (lat && lng) return `https://www.google.com/maps?q=${lat},${lng}`;
    if (addr) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;
    return null;
  };

  const directionUrl = getDirectionUrl();
  const viewUrl = getViewLocationUrl();

  return (
    <div className="min-h-screen bg-surface-bright">
      {/* Header */}
      <div className="bg-surface border-b border-outline-variant px-4 py-4">
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-on-surface">
                {lang === 'ml' ? 'ലൈവ് ട്രാക്കിംഗ്' : 'Live Tracking'}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className={`w-2 h-2 rounded-full ${activeWork ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                <p className="text-xs text-on-surface-variant">
                  {activeWork
                    ? (lang === 'ml' ? 'GPS സജീവം · 30 സെക്കൻഡ് ഇടവേളയിൽ അപ്‌ഡേറ്റ്' : 'GPS Active · Sending updates every 30s')
                    : (lang === 'ml' ? 'സജീവ ജോലി ഇല്ല' : 'No active assignment')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4" style={{ maxWidth: '600px', margin: '0 auto', boxSizing: 'border-box' }}>

        {/* Your Location Card */}
        <div className="bg-surface rounded-2xl border border-outline-variant p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>my_location</span>
            <h2 className="font-semibold text-on-surface">
              {lang === 'ml' ? 'നിങ്ങളുടെ സ്ഥാനം' : 'Your Location'}
            </h2>
          </div>

          {isLocating && (
            <div className="flex items-center gap-3 py-2">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
              <p className="text-sm text-on-surface-variant">
                {lang === 'ml' ? 'GPS തേടുന്നു...' : 'Finding your location...'}
              </p>
            </div>
          )}

          {locationError && !isLocating && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
              <span className="material-symbols-outlined text-red-500 text-[18px] shrink-0">error</span>
              <p className="text-sm text-red-700">{locationError}</p>
            </div>
          )}

          {myLocation && (
            <div className="space-y-2">
              <div className="bg-surface-container rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-on-surface-variant mb-0.5">Latitude</p>
                  <p className="text-sm font-mono font-semibold text-on-surface">{myLocation.lat.toFixed(6)}°</p>
                </div>
                <div className="w-px h-8 bg-outline-variant" />
                <div>
                  <p className="text-xs text-on-surface-variant mb-0.5">Longitude</p>
                  <p className="text-sm font-mono font-semibold text-on-surface">{myLocation.lng.toFixed(6)}°</p>
                </div>
                <div className="w-px h-8 bg-outline-variant" />
                <div>
                  <p className="text-xs text-on-surface-variant mb-0.5">Accuracy</p>
                  <p className="text-sm font-mono font-semibold text-on-surface">±{Math.round(myLocation.accuracy)}m</p>
                </div>
              </div>

              <a
                href={`https://www.google.com/maps?q=${myLocation.lat},${myLocation.lng}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-outline-variant text-on-surface-variant text-sm font-medium hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                {lang === 'ml' ? 'ഭൂപടത്തിൽ കാണുക' : 'View my location on map'}
              </a>
            </div>
          )}
        </div>

        {/* Work Destination Card */}
        {activeWork ? (
          <div className="bg-surface rounded-2xl border border-outline-variant p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-red-500 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
              <h2 className="font-semibold text-on-surface">
                {lang === 'ml' ? 'ജോലി സ്ഥലം' : 'Work Destination'}
              </h2>
            </div>

            <div className="bg-surface-container rounded-xl p-3 mb-3">
              <p className="font-semibold text-on-surface text-sm">{activeWork.work_title || 'Work'}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{activeWork.work_address || activeWork.district || '—'}</p>
              {(activeWork.latitude || activeWork.work_latitude) && (
                <p className="text-xs text-on-surface-variant/60 font-mono mt-1">
                  {parseFloat(activeWork.latitude || activeWork.work_latitude).toFixed(6)}°,{' '}
                  {parseFloat(activeWork.longitude || activeWork.work_longitude).toFixed(6)}°
                </p>
              )}
            </div>

            <div className="space-y-2">
              {/* Primary: Get Directions */}
              {directionUrl && (
                <a
                  href={directionUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors shadow-md"
                >
                  <span className="material-symbols-outlined text-[20px]">directions</span>
                  {lang === 'ml' ? 'Google Maps-ൽ ദിശ നേടൂ' : 'Get Directions in Google Maps'}
                </a>
              )}

              {/* Secondary: View location */}
              {viewUrl && (
                <a
                  href={viewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-outline-variant text-on-surface-variant text-sm font-medium hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">map</span>
                  {lang === 'ml' ? 'ഭൂപടത്തിൽ സ്ഥലം കാണുക' : 'View location on map'}
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-surface rounded-2xl border border-outline-variant p-8 text-center shadow-sm">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/30">location_off</span>
            <p className="font-semibold text-on-surface mt-3">
              {lang === 'ml' ? 'സജീവ ജോലി ഇല്ല' : 'No Active Assignment'}
            </p>
            <p className="text-sm text-on-surface-variant mt-1">
              {lang === 'ml'
                ? 'ഒരു ജോലി ഏറ്റെടുക്കുമ്പോൾ ദിശ ഇവിടെ ലഭ്യമാകും'
                : 'Directions will appear here once you accept an assignment.'}
            </p>
          </div>
        )}

        {/* GPS status info */}
        {activeWork && (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex gap-3">
            <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">info</span>
            <div>
              <p className="text-sm font-semibold text-primary">
                {lang === 'ml' ? 'ലൊക്കേഷൻ ഷെയറിംഗ്' : 'Location Sharing Active'}
              </p>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {lang === 'ml'
                  ? 'നിങ്ങളുടെ GPS ലൊക്കേഷൻ ഓരോ 30 സെക്കൻഡിലും സ്വയം അപ്‌ഡേറ്റ് ആകുന്നു.'
                  : 'Your GPS coordinates are being sent to the server automatically every 30 seconds.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveTrackingPage;
