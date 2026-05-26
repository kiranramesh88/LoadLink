import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createDispute } from '../slice/workerSlice';

const DISPUTE_REASONS = [
  { key: 'payment_issue', label: 'Payment not received' },
  { key: 'customer_behaviour', label: 'Customer misconduct' },
  { key: 'wrong_details', label: 'Incorrect work details' },
  { key: 'safety_concern', label: 'Safety concern' },
  { key: 'other', label: 'Other' },
];

const DisputePage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { actionLoading } = useSelector((s) => s.worker);
  const { user } = useSelector((s) => s.auth);
  const lang = user?.language || 'en';

  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReason) return;
    const reason = selectedReason === 'other' ? description : `${selectedReason}: ${description}`;
    const result = await dispatch(createDispute({ requestId: id, reason }));
    if (!result.error) navigate(-1);
  };

  return (
    <div className="min-h-screen bg-surface-bright">
      <div className="bg-surface border-b border-outline-variant px-4 py-4">
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full hover:bg-surface-container flex items-center justify-center">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-lg font-bold text-on-surface">
            {lang === 'ml' ? 'തർക്കം സമർപ്പിക്കുക' : 'File a Dispute'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4" style={{ maxWidth: '600px', margin: '0 auto', boxSizing: 'border-box' }}>
        {/* Info banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex gap-2">
          <span className="material-symbols-outlined text-amber-600 text-[20px] shrink-0">info</span>
          <p className="text-sm text-amber-800">
            {lang === 'ml'
              ? 'നിങ്ങളുടെ ആശങ്ക ഞങ്ങൾ 24 മണിക്കൂറിൽ അവലോകനം ചെയ്യും.'
              : 'Your concern will be reviewed within 24 hours.'}
          </p>
        </div>

        {/* Reason Selection */}
        <div className="bg-surface rounded-2xl p-4 border border-outline-variant">
          <label className="block text-sm font-semibold text-on-surface mb-3">
            {lang === 'ml' ? 'കാരണം' : 'Reason for Dispute'}
          </label>
          <div className="space-y-2">
            {DISPUTE_REASONS.map((r) => (
              <label
                key={r.key}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                  selectedReason === r.key ? 'border-primary bg-primary/5' : 'border-outline-variant hover:bg-surface-container'
                }`}
              >
                <input
                  type="radio"
                  name="reason"
                  value={r.key}
                  checked={selectedReason === r.key}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="text-primary"
                />
                <span className={`text-sm font-medium ${selectedReason === r.key ? 'text-primary' : 'text-on-surface'}`}>
                  {r.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="bg-surface rounded-2xl p-4 border border-outline-variant">
          <label className="block text-sm font-semibold text-on-surface mb-2">
            {lang === 'ml' ? 'വിവരണം' : 'Description'} *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            required
            placeholder="Describe the issue in detail..."
            className="w-full border border-outline-variant rounded-xl p-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={!selectedReason || !description || actionLoading}
          className="w-full py-4 rounded-2xl bg-red-600 text-white font-bold text-base shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {actionLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="material-symbols-outlined">gavel</span>
          )}
          {lang === 'ml' ? 'തർക്കം ഫൈൽ ചെയ്യുക' : 'Submit Dispute'}
        </button>
      </form>
    </div>
  );
};

export default DisputePage;
