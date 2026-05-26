import React, { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { acceptAssignment, rejectAssignment, setIncomingAssignment } from "../slice/workerSlice";

const TIMEOUT_SECONDS = 60;

/**
 * AssignmentPopup
 * Shown when a new work assignment arrives via WebSocket.
 * Has a 60-second countdown. Auto-rejects on timeout.
 */
const AssignmentPopup = ({ assignment }) => {
  const dispatch = useDispatch();
  const [timeLeft, setTimeLeft] = useState(TIMEOUT_SECONDS);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  const handleAutoReject = useCallback(() => {
    dispatch(rejectAssignment(assignment.assignment_id));
    dispatch(setIncomingAssignment(null));
  }, [dispatch, assignment.assignment_id]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleAutoReject();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [handleAutoReject]);

  const handleAccept = async () => {
    setLoading(true);
    clearInterval(timerRef.current);
    await dispatch(acceptAssignment(assignment.assignment_id));
    setLoading(false);
  };

  const handleReject = async () => {
    setLoading(true);
    clearInterval(timerRef.current);
    await dispatch(rejectAssignment(assignment.assignment_id));
    setLoading(false);
  };

  const progress = ((TIMEOUT_SECONDS - timeLeft) / TIMEOUT_SECONDS) * 100;
  const circumference = 2 * Math.PI * 28;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const workTypeLabels = {
    shop_unloading: "Shop Unloading",
    market_loading: "Market Loading",
    household_shifting: "Household Shifting",
    construction: "Construction",
    warehouse: "Warehouse",
    other: "Other",
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full overflow-hidden animate-in slide-in-from-bottom-4" style={{ maxWidth: "400px", boxSizing: "border-box" }}>
        {/* Header */}
        <div className="bg-primary p-4 flex items-center justify-between">
          <div>
            <p className="text-primary-fixed/80 text-xs font-medium uppercase tracking-wider">New Assignment</p>
            <h2 className="text-white font-bold text-lg leading-tight mt-0.5">
              {assignment.title || "Work Request"}
            </h2>
          </div>
          {/* Countdown Circle */}
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
              <circle
                cx="32" cy="32" r="28" fill="none"
                stroke={timeLeft < 15 ? "#ef4444" : "white"}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.3s" }}
              />
            </svg>
            <span className={`absolute text-xl font-bold ${timeLeft < 15 ? "text-red-300" : "text-white"}`}>
              {timeLeft}
            </span>
          </div>
        </div>

        {/* Work Details */}
        <div className="p-4 space-y-3">
          {/* Work Type Badge */}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-[14px]">work</span>
            {workTypeLabels[assignment.work_type] || assignment.work_type}
          </span>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 rounded-lg p-2.5">
              <p className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">Date</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{assignment.scheduled_date || "—"}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2.5">
              <p className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">Time</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{assignment.scheduled_time || "—"}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-2.5 flex gap-2">
            <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">location_on</span>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">Location</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{assignment.district || "—"}</p>
              <p className="text-xs text-gray-500">{assignment.work_address || ""}</p>
            </div>
          </div>

          {assignment.estimated_price && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-2.5 flex items-center justify-between">
              <p className="text-sm text-gray-700 font-medium">Estimated Earnings</p>
              <p className="text-lg font-bold text-primary">₹{assignment.estimated_price}</p>
            </div>
          )}

          {assignment.is_team_leader && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <span className="material-symbols-outlined text-amber-600 text-[18px]">star</span>
              <p className="text-sm text-amber-800 font-medium">You are the Team Leader</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-4 pb-4 grid grid-cols-2 gap-3">
          <button
            onClick={handleReject}
            disabled={loading}
            className="py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {loading ? "..." : "Decline"}
          </button>
          <button
            onClick={handleAccept}
            disabled={loading}
            className="py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-lg"
          >
            {loading ? "Accepting..." : "Accept Work"}
          </button>
        </div>

        {/* Timeout warning */}
        {timeLeft < 15 && (
          <div className="px-4 pb-3 text-center">
            <p className="text-xs text-red-500 font-medium">⚠ Auto-declining in {timeLeft}s</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentPopup;
