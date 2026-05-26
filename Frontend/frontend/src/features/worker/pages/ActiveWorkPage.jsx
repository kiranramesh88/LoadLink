import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchWorkDetail,
  markOnTheWay,
  confirmWorkStart,
  markCompleted,
  confirmCashPaid,
  confirmCashReceived,
} from '../slice/workerSlice';
import { getTranslation } from '../../../utils/translations';
import useLocationTracking from '../../../hooks/useLocationTracking';

const STATUS_STEPS = [
  { key: 'workers_notified', label: 'Notified', icon: 'notifications' },
  { key: 'accepted', label: 'Accepted', icon: 'check_circle' },
  { key: 'workers_on_the_way', label: 'On The Way', icon: 'directions_car' },
  { key: 'workers_arrived', label: 'Arrived', icon: 'location_on' },
  { key: 'in_progress', label: 'In Progress', icon: 'construction' },
  { key: 'completion_pending', label: 'Completing', icon: 'pending' },
  { key: 'payment_pending', label: 'Payment', icon: 'payments' },
  { key: 'completed', label: 'Completed', icon: 'task_alt' },
];

const stepIndex = (status) => {
  if (status === 'team_confirmed') return STATUS_STEPS.findIndex((s) => s.key === 'accepted');
  if (status === 'work_completion_pending') return STATUS_STEPS.findIndex((s) => s.key === 'completion_pending');
  return STATUS_STEPS.findIndex((s) => s.key === status);
};

const ActiveWorkPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentWork, workLoading, actionLoading } = useSelector((s) => s.worker);
  const { user } = useSelector((s) => s.auth);
  const lang = user?.language || 'en';

  // Determine if current user is the team leader for this work
  const myAssignment = currentWork?.worker_assignments?.find(
    (a) => {
        const workerUser = a.worker?.user?.id || a.worker?.user;
        const currentUserId = user?.id || user?.user_id || user?.pk;
        return workerUser && currentUserId && String(workerUser) === String(currentUserId);
    }
  );
  const isTeamLeader = myAssignment?.is_team_leader ?? false;
  const workStatus = currentWork?.status;
  const hasCompletionEvidence = currentWork?.evidences?.some(
    (e) => e.evidence_type === 'completion'
  );

  // Start location tracking when assignment is active
  const isActive = ['accepted', 'team_confirmed', 'workers_on_the_way', 'workers_arrived', 'in_progress'].includes(workStatus);
  useLocationTracking(isActive);

  useEffect(() => {
    if (id) dispatch(fetchWorkDetail(id));
  }, [dispatch, id]);

  // Polling every 15s for status updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (id) dispatch(fetchWorkDetail(id));
    }, 15000);
    return () => clearInterval(interval);
  }, [dispatch, id]);

  if (workLoading && !currentWork) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!currentWork) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
        <span className="material-symbols-outlined text-5xl text-on-surface-variant/40">error</span>
        <p className="text-on-surface-variant">Work not found</p>
        <button onClick={() => navigate('/worker/assignments')} className="px-4 py-2 bg-primary text-white rounded-lg">Back</button>
      </div>
    );
  }

  const currentStepIdx = stepIndex(workStatus);
  const payment = currentWork.payment;

  const getDirectionUrl = () => {
    if (currentWork.latitude && currentWork.longitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${currentWork.latitude},${currentWork.longitude}`;
    }
    if (currentWork.work_address) {
      return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(currentWork.work_address)}`;
    }
    return null;
  };

  const directionUrl = getDirectionUrl();

  return (
    <div className="min-h-screen bg-surface-bright pb-8">
      {/* Header */}
      <div className="bg-primary text-white pt-4 pb-6">
        <div className="mx-auto w-full px-4" style={{ maxWidth: '600px', boxSizing: 'border-box' }}>
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-white/80 text-sm mb-3">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back
          </button>
          <h1 className="text-xl font-bold leading-tight">{currentWork.title}</h1>
          <p className="text-primary-fixed/80 text-sm mt-1 capitalize">{currentWork.work_type?.replace('_', ' ')}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              workStatus === 'completed' ? 'bg-green-500' :
              workStatus === 'in_progress' ? 'bg-blue-400' :
              'bg-white/20'
            } text-white`}>
              {workStatus?.replace(/_/g, ' ')}
            </span>
            {isTeamLeader && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-400 text-amber-900">
                ⭐ Team Leader
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="w-full px-4 -mt-2 space-y-4 mx-auto" style={{ maxWidth: '600px', boxSizing: 'border-box' }}>

        {/* Status Timeline */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant shadow-sm">
          <h2 className="font-semibold text-on-surface mb-3">
            {lang === 'ml' ? 'ജോലി പുരോഗതി' : 'Work Progress'}
          </h2>
          <div className="space-y-2">
            {STATUS_STEPS.map((step, idx) => {
              const done = idx < currentStepIdx;
              const active = idx === currentStepIdx;
              return (
                <div key={step.key} className={`flex items-center gap-3 py-1.5 ${!done && !active ? 'opacity-40' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    done ? 'bg-green-100 text-green-700' :
                    active ? 'bg-primary text-white' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: done ? "'FILL' 1" : "'FILL' 0" }}>
                      {done ? 'check' : step.icon}
                    </span>
                  </div>
                  <span className={`text-sm ${active ? 'font-semibold text-primary' : done ? 'text-green-700' : 'text-on-surface-variant'}`}>
                    {step.label}
                  </span>
                  {active && (
                    <div className="ml-auto flex items-center gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      <span className="text-xs text-primary font-medium">Current</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* --- TEAM LEADER ACTIONS ONLY --- */}
        {isTeamLeader && (
          <div className="bg-surface-container-lowest rounded-2xl p-4 border border-primary/20 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-amber-600 text-[20px]">star</span>
              <h2 className="font-semibold text-on-surface">
                {lang === 'ml' ? 'ലീഡർ നടപടി' : 'Leader Actions'}
              </h2>
            </div>

            <div className="space-y-2">
              {(workStatus === 'accepted' || workStatus === 'team_confirmed') && (
                <ActionButton
                  icon="directions_car"
                  label={lang === 'ml' ? 'പോകുന്നു' : 'Mark On The Way'}
                  color="blue"
                  loading={actionLoading}
                  onClick={() => dispatch(markOnTheWay(id))}
                />
              )}
              {workStatus === 'workers_arrived' && (
                <ActionButton
                  icon="play_circle"
                  label={lang === 'ml' ? 'ജോലി ആരംഭിക്കുക' : 'Confirm Work Start'}
                  color="green"
                  loading={actionLoading}
                  onClick={() => dispatch(confirmWorkStart(id))}
                />
              )}
              {workStatus === 'in_progress' && (
                <>
                  <ActionButton
                    icon="upload"
                    label={lang === 'ml' ? 'തെളിവ് അപ്‌ലോഡ് ചെയ്യുക' : 'Upload Evidence'}
                    color="purple"
                    loading={false}
                    onClick={() => navigate(`/worker/work/${id}/evidence`)}
                  />
                  {hasCompletionEvidence && (
                    <ActionButton
                      icon="task_alt"
                      label={lang === 'ml' ? 'പൂർണ്ണമായി' : 'Mark Completed'}
                      color="green"
                      loading={actionLoading}
                      onClick={() => dispatch(markCompleted(id))}
                    />
                  )}
                </>
              )}
              {workStatus === 'work_completion_pending' && (
                <div className="bg-amber-50 text-amber-800 p-3 rounded-xl border border-amber-200 text-sm font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] animate-pulse">hourglass_empty</span>
                  <span>{lang === 'ml' ? 'കസ്റ്റമർ സ്ഥിരീകരണത്തിനായി കാത്തിരിക്കുന്നു' : 'Waiting for customer confirmation'}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Confirmation */}
        {workStatus === 'payment_pending' && payment && (
          <div className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant shadow-sm">
            <h2 className="font-semibold text-on-surface mb-1">
              {lang === 'ml' ? 'പണം' : 'Payment Confirmation'}
            </h2>
            <p className="text-2xl font-bold text-primary mb-3">
              ₹{isTeamLeader ? payment.amount : (currentWork.my_share || payment.amount)}
            </p>

            {payment.payment_method === 'cash' && (
              <div className="space-y-2">
                <div className={`flex items-center gap-2 p-3 rounded-xl border ${payment.customer_payment_confirmed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                  <span className={`material-symbols-outlined text-[20px] ${payment.customer_payment_confirmed ? 'text-green-600' : 'text-gray-400'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    {payment.customer_payment_confirmed ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <p className="text-sm font-medium">
                    {lang === 'ml' ? 'ഉപഭോക്താവ് സ്ഥിരീകരിച്ചു' : 'Customer confirmed payment'}
                  </p>
                </div>

                <div className={`flex items-center gap-2 p-3 rounded-xl border ${payment.worker_payment_confirmed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                  <span className={`material-symbols-outlined text-[20px] ${payment.worker_payment_confirmed ? 'text-green-600' : 'text-gray-400'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    {payment.worker_payment_confirmed ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <p className="text-sm font-medium">
                    {lang === 'ml' ? 'ഞങ്ങൾ സ്ഥിരീകരിച്ചു' : 'Worker confirmed receipt'}
                  </p>
                </div>

                {isTeamLeader && !payment.worker_payment_confirmed && (
                  <div className="grid grid-cols-1 gap-2 mt-3">
                    <button
                      onClick={() => dispatch(confirmCashReceived(id))}
                      disabled={actionLoading || payment.worker_payment_confirmed}
                      className="py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold disabled:opacity-50 hover:opacity-90"
                    >
                      {lang === 'ml' ? 'ലഭിച്ചു' : 'Cash Received'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Completed */}
        {workStatus === 'completed' && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
            <span className="material-symbols-outlined text-4xl text-green-600 mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
            <p className="font-bold text-green-900">
              {lang === 'ml' ? 'ജോലി പൂർത്തിയായി' : 'Work Completed!'}
            </p>
            <button
              onClick={() => navigate(`/worker/review/${id}`)}
              className="mt-3 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold"
            >
              {lang === 'ml' ? 'ഉപഭോക്താവിനെ റേറ്റ് ചെയ്യുക' : 'Rate Customer'}
            </button>
          </div>
        )}

        {/* Work Details */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant shadow-sm">
          <h2 className="font-semibold text-on-surface mb-3">
            {lang === 'ml' ? 'ജോലി വിവരങ്ങൾ' : 'Work Details'}
          </h2>
          <div className="space-y-2.5">
            <InfoRow icon="calendar_today" label={lang === 'ml' ? 'തീയതി' : 'Scheduled Date'} value={currentWork.scheduled_date} />
            <InfoRow icon="schedule" label={lang === 'ml' ? 'സമയം' : 'Time'} value={currentWork.scheduled_time} />
            <InfoRow icon="payments" label={lang === 'ml' ? 'വില' : (isTeamLeader ? 'Total Amount' : 'Your Share')} value={`₹${isTeamLeader ? (currentWork.final_price || currentWork.estimated_price || '—') : (currentWork.my_share || currentWork.final_price || currentWork.estimated_price || '—')}`} />
            <InfoRow icon="people" label={lang === 'ml' ? 'വർക്കർമാർ' : 'Workers'} value={currentWork.estimated_workers} />
          </div>
        </div>

        {/* Location - shown after acceptance */}
        {(currentWork.work_address || currentWork.latitude) && (
          <div className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant shadow-sm">
            <h2 className="font-semibold text-on-surface mb-3">
              {lang === 'ml' ? 'ഇടം' : 'Location'}
            </h2>
            <div className="flex items-start gap-2 mb-3">
              <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">location_on</span>
              <div>
                <p className="text-sm font-medium text-on-surface">{currentWork.work_address}</p>
                {currentWork.landmark && <p className="text-xs text-on-surface-variant">{currentWork.landmark}</p>}
                <p className="text-xs text-on-surface-variant">{currentWork.district}</p>
              </div>
            </div>

            {/* Directions button */}
            {directionUrl && (
              <a
                href={directionUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">directions</span>
                {lang === 'ml' ? 'ദിശകൾ നേടൂ' : 'Get Directions (Google Maps)'}
              </a>
            )}
          </div>
        )}

        {/* Customer Info - after acceptance */}
        {currentWork.customer && (
          <div className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant shadow-sm">
            <h2 className="font-semibold text-on-surface mb-3">
              {lang === 'ml' ? 'ഉപഭോക്താവ്' : 'Customer'}
            </h2>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {currentWork.customer?.user?.full_name?.charAt(0) || 'C'}
              </div>
              <div>
                <p className="font-medium text-on-surface">{currentWork.customer?.user?.full_name}</p>
                <p className="text-sm text-on-surface-variant">{currentWork.customer?.user?.phone_number}</p>
              </div>
              {currentWork.customer?.user?.phone_number && (
                <a
                  href={`tel:${currentWork.customer.user.phone_number}`}
                  className="ml-auto w-9 h-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[18px]">call</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Team Members */}
        {currentWork.worker_assignments && currentWork.worker_assignments.length > 0 && (
          <div className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant shadow-sm">
            <h2 className="font-semibold text-on-surface mb-3">
              {lang === 'ml' ? 'ടീം അംഗങ്ങൾ' : 'Team Members'}
            </h2>
            <div className="space-y-2">
              {currentWork.worker_assignments.map((wa) => (
                <div key={wa.assignment_id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {wa.worker?.user?.full_name?.charAt(0) || 'W'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-on-surface">{wa.worker?.user?.full_name}</p>
                    <p className="text-xs text-on-surface-variant capitalize">{wa.assignment_status}</p>
                  </div>
                  {wa.is_team_leader && (
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">Leader</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper components
const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-2.5">
    <span className="material-symbols-outlined text-primary text-[18px]">{icon}</span>
    <span className="text-sm text-on-surface-variant flex-1">{label}</span>
    <span className="text-sm font-semibold text-on-surface">{value || '—'}</span>
  </div>
);

const colorMap = {
  blue: 'bg-blue-600 hover:bg-blue-700',
  green: 'bg-green-600 hover:bg-green-700',
  purple: 'bg-purple-600 hover:bg-purple-700',
  red: 'bg-red-600 hover:bg-red-700',
};

const ActionButton = ({ icon, label, color, loading, onClick }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className={`w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${colorMap[color] || 'bg-primary hover:bg-primary/90'}`}
  >
    {loading ? (
      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
    ) : (
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
    )}
    {label}
  </button>
);

export default ActiveWorkPage;
