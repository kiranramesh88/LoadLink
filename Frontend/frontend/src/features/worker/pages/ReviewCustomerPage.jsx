import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { submitReview } from '../slice/workerSlice';

const ReviewCustomerPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { actionLoading } = useSelector((s) => s.worker);
  const { user } = useSelector((s) => s.auth);
  const lang = user?.language || 'en';

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hovered, setHovered] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(submitReview({ requestId: id, data: { rating, comment } }));
    if (!result.error) navigate('/worker/history');
  };

  const RATING_LABELS = {
    1: 'Very Bad',
    2: 'Bad',
    3: 'Average',
    4: 'Good',
    5: 'Excellent',
  };

  return (
    <div className="min-h-screen bg-surface-bright">
      <div className="bg-surface border-b border-outline-variant px-4 py-4">
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full hover:bg-surface-container flex items-center justify-center">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-lg font-bold text-on-surface">
            {lang === 'ml' ? 'ഉപഭോക്താവിനെ വിലയിരുത്തുക' : 'Rate Customer'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6" style={{ maxWidth: '600px', margin: '0 auto', boxSizing: 'border-box' }}>
        {/* Star Rating */}
        <div className="bg-surface rounded-2xl p-6 border border-outline-variant text-center shadow-sm">
          <p className="text-sm font-semibold text-on-surface-variant mb-1">
            {lang === 'ml' ? 'ഉപഭോക്താവ് അനുഭവം' : 'How was your experience?'}
          </p>
          <p className="text-lg font-bold text-on-surface mb-5">
            {RATING_LABELS[hovered || rating]}
          </p>

          <div className="flex items-center justify-center gap-3 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110"
              >
                <span
                  className={`material-symbols-outlined text-5xl ${(hovered || rating) >= star ? 'text-amber-400' : 'text-gray-200'}`}
                  style={{ fontVariationSettings: `'FILL' ${(hovered || rating) >= star ? 1 : 0}` }}
                >
                  star
                </span>
              </button>
            ))}
          </div>

          <p className="text-3xl font-bold text-on-surface">{rating}.0</p>
        </div>

        {/* Comment */}
        <div className="bg-surface rounded-2xl p-4 border border-outline-variant shadow-sm">
          <label className="block text-sm font-semibold text-on-surface mb-2">
            {lang === 'ml' ? 'കമന്റ്' : 'Comments (optional)'}
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder={lang === 'ml' ? 'നിങ്ങളുടെ അഭിപ്രായം...' : 'Share your experience with this customer...'}
            className="w-full border border-outline-variant rounded-xl p-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="py-3 rounded-xl border-2 border-outline-variant text-on-surface-variant font-semibold text-sm"
          >
            {lang === 'ml' ? 'ഒഴിവാക്കുക' : 'Skip'}
          </button>
          <button
            type="submit"
            disabled={actionLoading}
            className="py-3 rounded-xl bg-primary text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {actionLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {lang === 'ml' ? 'സമർപ്പിക്കുക' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewCustomerPage;
