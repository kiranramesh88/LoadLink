import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../auth/slice/authSlice';
import { updateProfile } from '../slice/workerSlice';

const WorkerProfilePage = () => {
  const { user } = useSelector((s) => s.auth);
  const { profile, actionLoading } = useSelector((s) => s.worker);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const lang = user?.language || 'en';

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    address: user?.address || '',
    district: user?.district || '',
    language: user?.language || 'en',
    gender: user?.gender || '',
    notification_enabled: user?.notification_enabled ?? true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async () => {
    const result = await dispatch(updateProfile(form));
    if (!result.error) setEditing(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const avatarLetter = user?.full_name?.charAt(0)?.toUpperCase() || 'W';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', paddingBottom: 80 }}>

      {/* ── Blue Header ── */}
      <div style={{
        background: 'var(--color-primary, #1d4ed8)',
        padding: '24px 16px 32px',
        color: '#fff',
      }}>
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
            {lang === 'ml' ? 'എന്റെ പ്രൊഫൈൽ' : 'My Profile'}
          </h1>
          <button
            onClick={() => setEditing((e) => !e)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 20,
              background: 'rgba(255,255,255,0.2)', border: 'none',
              color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{editing ? 'close' : 'edit'}</span>
            {editing ? (lang === 'ml' ? 'റദ്ദ്' : 'Cancel') : (lang === 'ml' ? 'എഡിറ്റ്' : 'Edit')}
          </button>
        </div>

        {/* Avatar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)', border: '3px solid rgba(255,255,255,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, fontWeight: 700, color: '#fff', overflow: 'hidden',
          }}>
            {user?.profile_image
              ? <img src={user.profile_image} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : avatarLetter}
          </div>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{user?.full_name}</p>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{user?.phone_number}</p>
          {profile?.worker_id && (
            <span style={{
              padding: '2px 12px', borderRadius: 12,
              background: 'rgba(255,255,255,0.15)', fontSize: 11,
              fontFamily: 'monospace', color: 'rgba(255,255,255,0.85)',
            }}>
              ID: {profile.worker_id}
            </span>
          )}
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* ── Stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          {[
            { label: lang === 'ml' ? 'ജോലികൾ' : 'Works',   value: profile?.total_completed_works || 0, icon: 'assignment_turned_in' },
            { label: lang === 'ml' ? 'റേറ്റിംഗ്' : 'Rating', value: `${profile?.average_rating || '5.0'}★`, icon: 'star' },
            { label: lang === 'ml' ? 'വർഷം' : 'Exp.',      value: `${profile?.experience_years || 0}y`,    icon: 'military_tech' },
          ].map((s) => (
            <div key={s.label} style={{
              background: '#fff', borderRadius: 14, padding: '14px 8px',
              border: '1px solid #e2e8f0', textAlign: 'center',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-primary,#1d4ed8)', fontSize: 22, fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{s.value}</p>
              <p style={{ margin: 0, fontSize: 10, color: '#94a3b8' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Union Info ── */}
        {profile?.union_name && (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(29,78,216,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-primary,#1d4ed8)', fontSize: 20 }}>group</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>{lang === 'ml' ? 'യൂണിയൻ' : 'Union'}</p>
                <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{profile.union_name}</p>
              </div>
              <span style={{
                padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                background: profile.verification_status === 'verified' ? '#dcfce7' : '#fef9c3',
                color: profile.verification_status === 'verified' ? '#15803d' : '#854d0e',
              }}>
                {profile.verification_status}
              </span>
            </div>
          </div>
        )}

        {/* ── Personal Details ── */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '16px' }}>
          <p style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600, color: '#0f172a' }}>
            {lang === 'ml' ? 'വ്യക്തിഗത വിവരം' : 'Personal Details'}
          </p>

          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: lang === 'ml' ? 'പൂർണ്ണ നാമം' : 'Full Name', name: 'full_name' },
                { label: 'Email', name: 'email', type: 'email' },
                { label: lang === 'ml' ? 'ജില്ല' : 'District', name: 'district' },
                { label: lang === 'ml' ? 'വിലാസം' : 'Address', name: 'address' },
              ].map(({ label, name, type = 'text' }) => (
                <div key={name}>
                  <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 }}>{label}</label>
                  <input
                    type={type} name={name} value={form[name]} onChange={handleChange}
                    style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 12px', fontSize: 14, boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>
              ))}

              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 }}>
                  {lang === 'ml' ? 'ഭാഷ' : 'Language'}
                </label>
                <select name="language" value={form.language} onChange={handleChange}
                  style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 12px', fontSize: 14, boxSizing: 'border-box' }}>
                  <option value="en">English</option>
                  <option value="ml">Malayalam (മലയാളം)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 }}>
                  {lang === 'ml' ? 'ലിംഗം' : 'Gender'}
                </label>
                <select name="gender" value={form.gender} onChange={handleChange}
                  style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 12px', fontSize: 14, boxSizing: 'border-box' }}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#0f172a' }}>
                  {lang === 'ml' ? 'അറിയിപ്പ്' : 'Notifications'}
                </span>
                <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input type="checkbox" name="notification_enabled" checked={form.notification_enabled} onChange={handleChange} style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} />
                  <div style={{
                    width: 44, height: 24, borderRadius: 12, background: form.notification_enabled ? 'var(--color-primary,#1d4ed8)' : '#e2e8f0',
                    position: 'relative', transition: 'background 0.2s',
                  }}>
                    <div style={{
                      position: 'absolute', top: 2, left: form.notification_enabled ? 22 : 2,
                      width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s',
                    }} />
                  </div>
                </label>
              </div>

              <button
                onClick={handleSave} disabled={actionLoading}
                style={{
                  width: '100%', padding: '12px', borderRadius: 12,
                  background: 'var(--color-primary,#1d4ed8)', color: '#fff',
                  border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  opacity: actionLoading ? 0.7 : 1,
                }}
              >
                {actionLoading && <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />}
                {lang === 'ml' ? 'സംരക്ഷിക്കുക' : 'Save Changes'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { icon: 'person',        label: lang === 'ml' ? 'പേര്'    : 'Name',     value: user?.full_name },
                { icon: 'call',          label: lang === 'ml' ? 'ഫോൺ'    : 'Phone',    value: user?.phone_number },
                { icon: 'email',         label: 'Email',                                value: user?.email || '—' },
                { icon: 'location_city', label: lang === 'ml' ? 'ജില്ല'  : 'District', value: user?.district || '—' },
                { icon: 'home',          label: lang === 'ml' ? 'വിലാസം' : 'Address',  value: user?.address || '—' },
                { icon: 'language',      label: lang === 'ml' ? 'ഭാഷ'    : 'Language', value: user?.language === 'ml' ? 'Malayalam' : 'English' },
              ].map(({ icon, label, value }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--color-primary,#1d4ed8)', fontSize: 18, marginTop: 2, flexShrink: 0 }}>{icon}</span>
                  <div>
                    <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>{label}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 500, color: '#0f172a' }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Logout ── */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%', padding: '14px', borderRadius: 16,
            background: '#fff', border: '2px solid #fee2e2',
            color: '#dc2626', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 8, boxSizing: 'border-box',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>logout</span>
          {lang === 'ml' ? 'ലോഗ് ഔട്ട്' : 'Log Out'}
        </button>

      </div>
    </div>
  );
};

export default WorkerProfilePage;
