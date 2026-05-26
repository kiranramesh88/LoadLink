import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { uploadEvidence } from '../slice/workerSlice';

const EVIDENCE_TYPES = [
  { value: 'arrival', label: 'Arrival Photo', icon: 'location_on' },
  { value: 'start', label: 'Work Start', icon: 'play_circle' },
  { value: 'completion', label: 'Completion', icon: 'task_alt' },
  { value: 'damage', label: 'Damage (if any)', icon: 'warning' },
];

const WorkEvidencePage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { actionLoading } = useSelector((s) => s.worker);
  const { user } = useSelector((s) => s.auth);
  const lang = user?.language || 'en';

  const [evidenceType, setEvidenceType] = useState('completion');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [notes, setNotes] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) return;

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('evidence_type', evidenceType);
    formData.append('notes', notes);
    formData.append('work_request', id);

    // Simulate progress
    setUploadProgress(10);
    const uploadInterval = setInterval(() => {
      setUploadProgress((p) => Math.min(p + 10, 90));
    }, 200);

    const result = await dispatch(uploadEvidence({ requestId: id, formData }));
    clearInterval(uploadInterval);
    setUploadProgress(100);

    if (!result.error) {
      setTimeout(() => navigate(`/worker/work/${id}`), 800);
    } else {
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-surface-bright">
      {/* Header */}
      <div className="bg-surface border-b border-outline-variant px-4 py-4">
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full hover:bg-surface-container flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface">arrow_back</span>
          </button>
          <h1 className="text-lg font-bold text-on-surface">
            {lang === 'ml' ? 'തെളിവ് അപ്‌ലോഡ്' : 'Upload Evidence'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4" style={{ maxWidth: '600px', margin: '0 auto', boxSizing: 'border-box' }}>
        {/* Evidence Type */}
        <div className="bg-surface rounded-2xl p-4 border border-outline-variant">
          <label className="block text-sm font-semibold text-on-surface mb-3">
            {lang === 'ml' ? 'തെളിവ് തരം' : 'Evidence Type'}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {EVIDENCE_TYPES.map((type) => (
              <button
                type="button"
                key={type.value}
                onClick={() => setEvidenceType(type.value)}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                  evidenceType === type.value
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{type.icon}</span>
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Image Upload */}
        <div className="bg-surface rounded-2xl p-4 border border-outline-variant">
          <label className="block text-sm font-semibold text-on-surface mb-3">
            {lang === 'ml' ? 'ഫോട്ടോ' : 'Photo'}
          </label>

          {imagePreview ? (
            <div className="relative">
              <img src={imagePreview} alt="preview" className="w-full rounded-xl object-cover max-h-56" />
              <button
                type="button"
                onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-outline-variant rounded-xl cursor-pointer hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">add_photo_alternate</span>
              <p className="text-sm text-on-surface-variant mt-2">
                {lang === 'ml' ? 'ഫോട്ടോ തിരഞ്ഞെടുക്കുക' : 'Tap to select photo'}
              </p>
              <input type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" />
            </label>
          )}
        </div>

        {/* Notes */}
        <div className="bg-surface rounded-2xl p-4 border border-outline-variant">
          <label className="block text-sm font-semibold text-on-surface mb-2">
            {lang === 'ml' ? 'കുറിപ്പുകൾ (ഓപ്ഷണൽ)' : 'Notes (optional)'}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Any additional notes..."
            className="w-full border border-outline-variant rounded-xl p-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        {/* Upload Progress */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="bg-surface rounded-2xl p-4 border border-outline-variant">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-on-surface-variant">Uploading...</span>
              <span className="font-semibold text-primary">{uploadProgress}%</span>
            </div>
            <div className="h-2 bg-surface-container rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!imageFile || actionLoading}
          className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-base shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {actionLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="material-symbols-outlined">upload</span>
          )}
          {lang === 'ml' ? 'അപ്‌ലോഡ് ചെയ്യുക' : 'Upload Evidence'}
        </button>
      </form>
    </div>
  );
};

export default WorkEvidencePage;
