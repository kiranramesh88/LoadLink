import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchRequests } from '../slice/customerSlice';

const STATUS_CONFIG = {
    completed:        { label: 'Completed',        color: '#006b5c', bg: 'rgba(104,250,221,0.15)', icon: 'check_circle' },
    cancelled:        { label: 'Cancelled',         color: '#ba1a1a', bg: 'rgba(186,26,26,0.08)',  icon: 'cancel'       },
    disputed:         { label: 'Disputed',          color: '#930013', bg: 'rgba(147,0,19,0.08)',   icon: 'gavel'        },
    payment_pending:  { label: 'Payment Pending',   color: '#b06000', bg: 'rgba(176,96,0,0.1)',    icon: 'pending'      },
};

const WORK_TYPE_LABELS = {
    shop_unloading:    'Shop / Textile Unloading',
    market_loading:    'Vegetable Market Loading',
    household_shifting:'Household Shifting',
    construction:      'Construction Material',
    warehouse:         'Wholesale / Warehouse',
    other:             'Other Labor',
};

const CustomerHistoryPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { requests, loading } = useSelector((state) => state.customer);

    useEffect(() => {
        dispatch(fetchRequests());
    }, [dispatch]);

    const historyRequests = requests.filter(r =>
        ['completed', 'cancelled', 'disputed', 'payment_pending'].includes(r.status)
    );

    const totalSpent = historyRequests
        .filter(r => r.status === 'completed')
        .reduce((acc, r) => acc + parseFloat(r.estimated_price || 0), 0);

    const card = {
        background: '#fff', borderRadius: '12px',
        border: '1px solid #c3c5d9', padding: '24px',
        boxShadow: '0 2px 8px rgba(17,28,45,0.04)',
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f9f9ff', fontFamily: 'Inter, sans-serif', paddingBottom: '60px' }}>
            {/* Header */}
            <header style={{ background: '#fff', borderBottom: '1px solid #c3c5d9', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 2px 8px rgba(17,28,45,0.04)' }}>
                <button
                    onClick={() => navigate('/customer/dashboard')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#434656', padding: '4px' }}
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div>
                    <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111c2d' }}>Work History</h1>
                    <p style={{ margin: 0, fontSize: '12px', color: '#434656' }}>All your past and completed operations</p>
                </div>
            </header>

            <div style={{ maxWidth: '900px', margin: '32px auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* Summary Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                    {[
                        { label: 'Total Jobs', value: historyRequests.length, icon: 'list_alt', color: '#003ec7', bg: '#e7eeff' },
                        { label: 'Completed', value: historyRequests.filter(r => r.status === 'completed').length, icon: 'check_circle', color: '#006b5c', bg: 'rgba(104,250,221,0.2)' },
                        { label: 'Cancelled', value: historyRequests.filter(r => r.status === 'cancelled').length, icon: 'cancel', color: '#ba1a1a', bg: 'rgba(186,26,26,0.08)' },
                        { label: 'Total Spent', value: `₹${totalSpent.toFixed(0)}`, icon: 'payments', color: '#003ec7', bg: '#e7eeff' },
                    ].map(stat => (
                        <div key={stat.label} style={{ ...card, display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '22px', color: stat.color }}>{stat.icon}</span>
                            </div>
                            <div>
                                <p style={{ margin: '0 0 2px 0', fontSize: '11px', color: '#434656', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>{stat.label}</p>
                                <p style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#111c2d' }}>{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* History List */}
                <div style={card}>
                    <h2 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 700, color: '#111c2d', paddingBottom: '16px', borderBottom: '1px solid #e7eeff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#003ec7' }}>history</span>
                        All Records
                    </h2>

                    {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[1, 2, 3].map(i => (
                                <div key={i} style={{ height: '80px', borderRadius: '8px', background: '#f0f3ff', animation: 'pulse 1.5s ease infinite' }}></div>
                            ))}
                        </div>
                    ) : historyRequests.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '56px', color: '#c3c5d9', marginBottom: '16px', display: 'block' }}>history_toggle_off</span>
                            <p style={{ fontSize: '16px', fontWeight: 600, color: '#111c2d', margin: '0 0 8px 0' }}>No history yet</p>
                            <p style={{ fontSize: '14px', color: '#434656', margin: '0 0 24px 0' }}>Once you complete your first job, it will appear here.</p>
                            <button
                                onClick={() => navigate('/customer/booking/category')}
                                style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#003ec7', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
                            >
                                Book Your First Job
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                            {historyRequests.map((req, idx) => {
                                const cfg = STATUS_CONFIG[req.status] || { label: req.status, color: '#434656', bg: '#f0f3ff', icon: 'info' };
                                return (
                                    <div
                                        key={req.request_id}
                                        onClick={() => req.status === 'payment_pending' ? navigate(`/customer/payment/${req.request_id}`) : null}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '16px',
                                            padding: '16px 0',
                                            borderBottom: idx < historyRequests.length - 1 ? '1px solid #e7eeff' : 'none',
                                            cursor: req.status === 'payment_pending' ? 'pointer' : 'default',
                                            transition: 'background 0.15s',
                                        }}
                                        onMouseEnter={e => req.status === 'payment_pending' && (e.currentTarget.style.background = '#f9f9ff')}
                                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        {/* Status Icon */}
                                        <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '22px', color: cfg.color }}>{cfg.icon}</span>
                                        </div>

                                        {/* Info */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ margin: '0 0 2px 0', fontSize: '15px', fontWeight: 700, color: '#111c2d', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {WORK_TYPE_LABELS[req.work_type] || req.work_type}
                                            </p>
                                            <p style={{ margin: 0, fontSize: '12px', color: '#434656', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                                <span>📍 {req.work_address || req.district || 'N/A'}</span>
                                                <span>📅 {req.scheduled_date ? new Date(req.scheduled_date).toLocaleDateString('en-IN') : new Date(req.created_at).toLocaleDateString('en-IN')}</span>
                                                <span>👷 {req.estimated_workers} workers</span>
                                            </p>
                                        </div>

                                        {/* Right: price + status badge */}
                                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                            <p style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 800, color: '#111c2d' }}>
                                                ₹{parseFloat(req.estimated_price || 0).toFixed(0)}
                                            </p>
                                            <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, color: cfg.color, background: cfg.bg }}>
                                                {cfg.label}
                                            </span>
                                        </div>

                                        {req.status === 'payment_pending' && (
                                            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#003ec7' }}>chevron_right</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerHistoryPage;
