import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchWallet, fetchTransactions } from '../slice/workerSlice';

const TRANSACTION_ICONS = {
  credit:         { icon: 'arrow_downward', color: '#16a34a', bg: '#f0fdf4' },
  debit:          { icon: 'arrow_upward',   color: '#dc2626', bg: '#fef2f2' },
  withdrawal:     { icon: 'account_balance', color: '#2563eb', bg: '#eff6ff' },
  settlement:     { icon: 'handshake',       color: '#9333ea', bg: '#faf5ff' },
  auto_deduction: { icon: 'remove',          color: '#ea580c', bg: '#fff7ed' },
};

const WorkerWalletPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { wallet, transactions, walletLoading } = useSelector((s) => s.worker);
  const { user } = useSelector((s) => s.auth);
  const lang = user?.language || 'en';

  useEffect(() => {
    dispatch(fetchWallet());
    dispatch(fetchTransactions());
  }, [dispatch]);

  const fmt = (val) => `₹${parseFloat(val || 0).toFixed(2)}`;

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>

      {/* ── Header ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>arrow_back</span>
        </button>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
          {lang === 'ml' ? 'എന്റെ വാലറ്റ്' : 'My Wallet'}
        </h1>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* ── Balance Card ── */}
        <div style={{
          background: 'var(--color-primary, #1d4ed8)',
          borderRadius: 20,
          padding: '20px',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(29,78,216,0.3)',
        }}>
          <div style={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', right: 50, top: 40, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'relative' }}>
            <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 4 }}>
              {lang === 'ml' ? 'ലഭ്യമായ ബാലൻസ്' : 'Available Balance'}
            </p>
            {walletLoading ? (
              <div style={{ height: 40, width: 160, background: 'rgba(255,255,255,0.2)', borderRadius: 8 }} />
            ) : (
              <p style={{ margin: 0, fontSize: 36, fontWeight: 800 }}>{fmt(wallet?.available_balance)}</p>
            )}
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{user?.full_name}</p>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <StatCard label={lang === 'ml' ? 'ആകെ വരുമാനം' : 'Total Earned'} value={fmt(wallet?.total_earned)} />
          <StatCard label={lang === 'ml' ? 'ക്യാഷ് ദേ' : 'Cash Due'} value={fmt(wallet?.cash_in_hand_due)} valueColor="#ea580c" />
        </div>

        {/* ── Pending Banner ── */}
        {parseFloat(wallet?.pending_balance || 0) > 0 && (
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 16, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="material-symbols-outlined" style={{ color: '#d97706', fontSize: 22, flexShrink: 0 }}>pending</span>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#92400e' }}>
                {lang === 'ml' ? 'ക്ലിയറിങ്ങ് ആകുന്നത്' : 'Pending Clearance'}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 16, fontWeight: 700, color: '#78350f' }}>{fmt(wallet?.pending_balance)}</p>
            </div>
          </div>
        )}

        {/* ── Action Buttons ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <button
            onClick={() => navigate('/worker/withdraw')}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 6, padding: '16px 12px', background: '#fff',
              border: '2px solid var(--color-primary, #1d4ed8)', borderRadius: 16,
              cursor: 'pointer',
            }}
          >
            <span className="material-symbols-outlined" style={{ color: 'var(--color-primary, #1d4ed8)', fontSize: 28 }}>account_balance</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary, #1d4ed8)' }}>
              {lang === 'ml' ? 'ഡ്രോ ചെയ്യുക' : 'Withdraw'}
            </span>
          </button>
          <button
            onClick={() => navigate('/worker/settlements')}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 6, padding: '16px 12px', background: '#fff',
              border: '2px solid #e2e8f0', borderRadius: 16,
              cursor: 'pointer',
            }}
          >
            <span className="material-symbols-outlined" style={{ color: '#64748b', fontSize: 28 }}>handshake</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>
              {lang === 'ml' ? 'സെറ്റിൽമെന്റ്' : 'Settlement'}
            </span>
          </button>
        </div>

        {/* ── Transaction History ── */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>
              {lang === 'ml' ? 'ഇടപാടുകൾ' : 'Transaction History'}
            </h2>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>{transactions.length} records</span>
          </div>

          {transactions.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>
                {lang === 'ml' ? 'ഇടപാടുകൾ ഇല്ല' : 'No transactions yet'}
              </p>
            </div>
          ) : (
            transactions.map((tx) => {
              const s = TRANSACTION_ICONS[tx.transaction_type] || TRANSACTION_ICONS.credit;
              const isIncome = tx.transaction_type === 'credit' || tx.transaction_type === 'settlement';
              return (
                <div key={tx.transaction_id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ color: s.color, fontSize: 18 }}>{s.icon}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>{fmtDate(tx.created_at)}</p>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: isIncome ? '#16a34a' : '#dc2626', flexShrink: 0 }}>
                    {isIncome ? '+' : '-'}{fmt(tx.amount)}
                  </p>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};

const StatCard = ({ label, value, valueColor = '#0f172a' }) => (
  <div style={{ background: '#fff', borderRadius: 16, padding: '16px', border: '1px solid #e2e8f0' }}>
    <p style={{ margin: 0, fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>{label}</p>
    <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: valueColor }}>{value}</p>
  </div>
);

export default WorkerWalletPage;
