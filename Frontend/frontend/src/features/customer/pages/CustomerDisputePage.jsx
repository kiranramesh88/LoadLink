import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchRequestDetailApi, createDisputeApi } from '../services/customerAPI';

const DISPUTE_CATEGORIES = [
  { value:'payment_issue',      label:'Payment Issue',       icon:'payments'        },
  { value:'work_quality',       label:'Poor Work Quality',   icon:'thumb_down'      },
  { value:'worker_behavior',    label:'Worker Behavior',     icon:'person_off'      },
  { value:'incomplete_work',    label:'Incomplete Work',     icon:'incomplete_circle'},
  { value:'overcharge',         label:'Overcharged',         icon:'price_change'    },
  { value:'safety_issue',       label:'Safety Issue',        icon:'warning'         },
  { value:'other',              label:'Other',               icon:'more_horiz'      },
];

export default function CustomerDisputePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [work, setWork]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetchRequestDetailApi(id);
      setWork(res.data?.data || res.data);
    } catch {
      toast.error('Failed to load work details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category) { toast.error('Please select a dispute category'); return; }
    if (description.trim().length < 20) { toast.error('Please provide more details (min 20 characters)'); return; }

    setSubmitting(true);
    try {
      await createDisputeApi(id, { category, description });
      toast.success('Dispute submitted successfully');
      navigate('/customer/quotes');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit dispute');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-[Inter,sans-serif] pb-10">

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-4 py-3 flex items-center gap-3" style={{ maxWidth: '600px', margin: '0 auto', boxSizing: 'border-box' }}>
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100">
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Report a Dispute</h1>
            <p className="text-xs text-slate-500">We'll investigate and resolve it quickly.</p>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-5" style={{ maxWidth: '600px', margin: '0 auto', boxSizing: 'border-box' }}>

        {/* Work info banner */}
        {work && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-red-500 text-[22px]">gavel</span>
            <div>
              <p className="font-semibold text-slate-900 text-sm">{work.title}</p>
              <p className="text-xs text-slate-500">{work.district} · {work.scheduled_date}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Category grid */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-bold text-slate-900 mb-4">What's the issue?</h2>
            <div className="grid grid-cols-2 gap-2.5">
              {DISPUTE_CATEGORIES.map(cat => (
                <button type="button" key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all
                    ${category === cat.value
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'}`}>
                  <span className={`material-symbols-outlined text-[20px]
                    ${category === cat.value ? 'text-red-500' : 'text-slate-400'}`}>
                    {cat.icon}
                  </span>
                  <span className="text-xs font-semibold">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-bold text-slate-900 mb-3">Describe the Issue</h2>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Please describe what happened in detail. Include timings, worker names if known, and any other relevant information..."
              rows={6}
              className="w-full text-sm text-slate-700 border border-slate-200 rounded-xl p-3.5 resize-none outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all placeholder:text-slate-400"
            />
            <div className="flex justify-between items-center mt-1.5">
              <p className="text-xs text-slate-400">Minimum 20 characters</p>
              <p className={`text-xs font-medium ${description.length >= 20 ? 'text-emerald-600' : 'text-slate-400'}`}>
                {description.length} chars
              </p>
            </div>
          </div>

          {/* Info note */}
          <div className="flex gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <span className="material-symbols-outlined text-blue-500 text-[20px] mt-0.5">info</span>
            <div>
              <p className="text-xs font-semibold text-slate-800">What happens next?</p>
              <p className="text-xs text-slate-600 mt-0.5">
                Our union admin team will review your dispute within 24 hours and contact you. 
                Payments are held until the dispute is resolved.
              </p>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={submitting || !category || description.length < 20}
            className="w-full py-4 bg-red-600 text-white rounded-xl font-bold text-base hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors shadow-md">
            {submitting
              ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <span className="material-symbols-outlined text-[20px]">gavel</span>}
            Submit Dispute
          </button>
        </form>
      </div>
    </div>
  );
}
