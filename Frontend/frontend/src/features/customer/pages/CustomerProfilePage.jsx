import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCustomerProfile, updateCustomerProfile } from '../slice/customerSlice';
import toast from 'react-hot-toast';

const BUSINESS_TYPES = [
    { value: 'textile', label: 'Textile Shop' },
    { value: 'wholesale', label: 'Wholesale Market' },
    { value: 'vegetable', label: 'Vegetable Market' },
    { value: 'hardware', label: 'Hardware' },
    { value: 'construction', label: 'Construction' },
    { value: 'household', label: 'Household' },
    { value: 'other', label: 'Other' },
];

const PAYMENT_METHODS = [
    { value: 'cash', label: 'Cash' },
    { value: 'upi', label: 'UPI' },
    { value: 'hybrid', label: 'Hybrid (Cash + Online)' },
];

const KERALA_DISTRICTS = [
    'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha',
    'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad',
    'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod',
];

const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '8px',
    border: '1px solid #c3c5d9', fontSize: '14px', color: '#111c2d',
    background: '#f9f9ff', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.15s',
};

const labelStyle = {
    fontSize: '12px', fontWeight: 700, color: '#434656',
    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', display: 'block',
};

const CustomerProfilePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { customerProfile, loading, actionLoading } = useSelector((state) => state.customer);

    const [form, setForm] = useState({
        business_name: '',
        business_type: '',
        gst_number: '',
        emergency_contact: '',
        preferred_payment_method: 'cash',
    });

    useEffect(() => {
        dispatch(fetchCustomerProfile());
    }, [dispatch]);

    useEffect(() => {
        if (customerProfile) {
            setForm({
                business_name: customerProfile.business_name || '',
                business_type: customerProfile.business_type || '',
                gst_number: customerProfile.gst_number || '',
                emergency_contact: customerProfile.emergency_contact || '',
                preferred_payment_method: customerProfile.preferred_payment_method || 'cash',
            });
        }
    }, [customerProfile]);

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await dispatch(updateCustomerProfile(form));
        if (updateCustomerProfile.fulfilled.match(result)) {
            toast.success('Profile saved successfully!');
        } else {
            toast.error(result.payload || 'Failed to save profile.');
        }
    };

    // Profile completion %
    const fields = ['business_name', 'business_type', 'gst_number', 'emergency_contact'];
    const filled = fields.filter(f => form[f] && form[f].trim() !== '').length;
    const completionPct = Math.round((filled / fields.length) * 100);

    const card = {
        background: '#fff', borderRadius: '12px',
        border: '1px solid #c3c5d9', padding: '24px',
        boxShadow: '0 2px 8px rgba(17,28,45,0.04)',
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f9f9ff', fontFamily: 'Inter, sans-serif', padding: '0 0 60px 0' }}>
            {/* Header */}
            <header style={{ background: '#fff', borderBottom: '1px solid #c3c5d9', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 2px 8px rgba(17,28,45,0.04)' }}>
                <button
                    onClick={() => navigate('/customer/dashboard')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#434656', padding: '4px' }}
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div>
                    <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111c2d' }}>My Profile</h1>
                    <p style={{ margin: 0, fontSize: '12px', color: '#434656' }}>Manage your account & business details</p>
                </div>
            </header>

            <div style={{ maxWidth: '800px', margin: '32px auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* Profile Completion Banner */}
                <div style={{ ...card, background: completionPct === 100 ? 'linear-gradient(135deg,#e7fff7,#f0fffa)' : 'linear-gradient(135deg,#e7eeff,#f0f3ff)', border: completionPct === 100 ? '1px solid #68fadd' : '1px solid #b7c4ff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div>
                            <p style={{ margin: '0 0 2px 0', fontSize: '12px', fontWeight: 700, color: completionPct === 100 ? '#006b5c' : '#003ec7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Profile Completion</p>
                            <p style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#111c2d' }}>{completionPct}%</p>
                        </div>
                        <span className="material-symbols-outlined" style={{ fontSize: '40px', color: completionPct === 100 ? '#006b5c' : '#003ec7', opacity: 0.6 }}>
                            {completionPct === 100 ? 'verified_user' : 'manage_accounts'}
                        </span>
                    </div>
                    <div style={{ height: '8px', borderRadius: '999px', background: 'rgba(0,62,199,0.15)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${completionPct}%`, borderRadius: '999px', background: completionPct === 100 ? '#006b5c' : '#003ec7', transition: 'width 0.5s ease' }}></div>
                    </div>
                    {completionPct < 100 && (
                        <p style={{ margin: '10px 0 0 0', fontSize: '13px', color: '#434656' }}>
                            Complete your profile to get better service matching and priority support.
                        </p>
                    )}
                </div>

                {/* Account Info (read-only) */}
                <div style={card}>
                    <h2 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 700, color: '#111c2d', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#003ec7' }}>person</span>
                        Account Information
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                        {[
                            { label: 'Full Name', value: user?.full_name || '—' },
                            { label: 'Phone Number', value: user?.phone_number || '—' },
                            { label: 'Email', value: user?.email || '—' },
                            { label: 'Role', value: user?.role || 'CUSTOMER' },
                            { label: 'Rating', value: customerProfile?.customer_rating ? `${customerProfile.customer_rating} ★` : '5.0 ★' },
                            { label: 'Total Jobs', value: customerProfile?.total_completed_works ?? '0' },
                        ].map(({ label, value }) => (
                            <div key={label} style={{ background: '#f9f9ff', borderRadius: '8px', padding: '12px 16px', border: '1px solid #e7eeff' }}>
                                <p style={{ margin: '0 0 4px 0', fontSize: '11px', fontWeight: 700, color: '#434656', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                                <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#111c2d' }}>{value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Business Details (editable) */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={card}>
                        <h2 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 700, color: '#111c2d', display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '16px', borderBottom: '1px solid #e7eeff' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#003ec7' }}>storefront</span>
                            Business Details
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
                            <div>
                                <label style={labelStyle}>Business Name</label>
                                <input
                                    type="text" value={form.business_name} style={inputStyle}
                                    placeholder="e.g. Sri Ganesh Wholesale"
                                    onChange={e => handleChange('business_name', e.target.value)}
                                    onFocus={e => e.target.style.borderColor = '#003ec7'}
                                    onBlur={e => e.target.style.borderColor = '#c3c5d9'}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Business Type</label>
                                <select
                                    value={form.business_type} style={{ ...inputStyle, cursor: 'pointer' }}
                                    onChange={e => handleChange('business_type', e.target.value)}
                                    onFocus={e => e.target.style.borderColor = '#003ec7'}
                                    onBlur={e => e.target.style.borderColor = '#c3c5d9'}
                                >
                                    <option value="">Select type</option>
                                    {BUSINESS_TYPES.map(b => (
                                        <option key={b.value} value={b.value}>{b.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={labelStyle}>GST Number <span style={{ fontSize: '10px', color: '#737688' }}>(Optional)</span></label>
                                <input
                                    type="text" value={form.gst_number} style={inputStyle}
                                    placeholder="e.g. 32ABCDE1234F1Z5"
                                    onChange={e => handleChange('gst_number', e.target.value)}
                                    onFocus={e => e.target.style.borderColor = '#003ec7'}
                                    onBlur={e => e.target.style.borderColor = '#c3c5d9'}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Emergency Contact</label>
                                <input
                                    type="tel" value={form.emergency_contact} style={inputStyle}
                                    placeholder="e.g. 9876543210"
                                    onChange={e => handleChange('emergency_contact', e.target.value)}
                                    onFocus={e => e.target.style.borderColor = '#003ec7'}
                                    onBlur={e => e.target.style.borderColor = '#c3c5d9'}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Payment Preference */}
                    <div style={card}>
                        <h2 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 700, color: '#111c2d', display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '16px', borderBottom: '1px solid #e7eeff' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#003ec7' }}>payments</span>
                            Payment Preference
                        </h2>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            {PAYMENT_METHODS.map(pm => {
                                const active = form.preferred_payment_method === pm.value;
                                return (
                                    <button
                                        key={pm.value}
                                        type="button"
                                        onClick={() => handleChange('preferred_payment_method', pm.value)}
                                        style={{
                                            flex: '1', minWidth: '140px', padding: '14px 16px',
                                            borderRadius: '10px', border: active ? '2px solid #003ec7' : '2px solid #e7eeff',
                                            background: active ? '#e7eeff' : '#f9f9ff',
                                            color: active ? '#003ec7' : '#434656',
                                            fontWeight: active ? 700 : 500, fontSize: '14px',
                                            cursor: 'pointer', transition: 'all 0.15s ease',
                                        }}
                                    >
                                        {pm.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Save Button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button
                            type="button"
                            onClick={() => navigate('/customer/dashboard')}
                            style={{ padding: '12px 24px', borderRadius: '8px', border: '1px solid #c3c5d9', background: '#fff', color: '#111c2d', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={actionLoading}
                            style={{
                                padding: '12px 32px', borderRadius: '8px', border: 'none',
                                background: actionLoading ? '#b7c4ff' : '#003ec7',
                                color: '#fff', fontWeight: 700, fontSize: '14px',
                                cursor: actionLoading ? 'not-allowed' : 'pointer',
                                boxShadow: '0 4px 12px rgba(0,62,199,0.25)',
                                display: 'flex', alignItems: 'center', gap: '8px',
                            }}
                        >
                            {actionLoading ? (
                                <>
                                    <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>save</span>
                                    Save Profile
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CustomerProfilePage;
